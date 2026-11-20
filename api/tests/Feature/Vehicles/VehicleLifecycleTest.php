<?php

namespace Tests\Feature\Vehicles;

use App\Models\AuditLog;
use App\Models\Vehicle;
use App\Models\VehicleImage;
use App\Models\VehicleMake;
use App\Modules\Authentication\Enums\AdminRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;
use Tests\Concerns\BuildsShowroom;
use Tests\TestCase;

class VehicleLifecycleTest extends TestCase
{
    use BuildsShowroom, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpShowroom();
    }

    #[Test]
    public function photos_are_re_encoded_as_webp_and_stored_on_the_s3_disk(): void
    {
        $this->as($this->staff(AdminRole::VehicleManager));
        [$photo] = $this->uploadPhotos();

        $image = VehicleImage::findOrFail($photo['id']);
        $disk = Storage::disk(config('filesystems.vehicle_images_disk'));
        $this->assertSame('s3', config('filesystems.vehicle_images_disk'));
        $disk->assertExists($image->path);
        $this->assertStringEndsWith('.webp', $image->path);
        $this->assertSame('image/webp', (new \finfo(FILEINFO_MIME_TYPE))->buffer($disk->get($image->path)));
        $this->assertNull($image->vehicle_id);
    }

    #[Test]
    public function uploads_reject_non_images_and_disguised_files(): void
    {
        $this->as($this->staff(AdminRole::VehicleManager));

        $this->postJson('/api/v1/admin/vehicle-images', ['files' => [UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf')]])
            ->assertUnprocessable()->assertJsonValidationErrors(['files.0'], 'errors');

        $fake = UploadedFile::fake()->createWithContent('photo.jpg', '<?php echo "not an image";');
        $this->postJson('/api/v1/admin/vehicle-images', ['files' => [$fake]])->assertUnprocessable();
    }

    #[Test]
    public function a_draft_needs_only_owner_make_model_and_year(): void
    {
        $this->as($this->staff(AdminRole::VehicleManager));

        $response = $this->postJson('/api/v1/admin/vehicles', [
            'intent' => 'draft', 'ownerId' => $this->owner->id, 'makeId' => $this->make->id, 'modelId' => $this->model->id,
            'year' => 2020, 'listingType' => 'used', 'images' => [],
        ])->assertCreated()
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.title', '2020 Toyota Harrier')
            ->assertJsonPath('data.reference', 'CS-'.(1000 + Vehicle::max('id')))
            ->assertJsonPath('data.slug', '2020-toyota-harrier-cs-'.(1000 + Vehicle::max('id')));

        $this->postJson('/api/v1/admin/vehicles', ['intent' => 'draft', 'images' => []])
            ->assertUnprocessable()->assertJsonValidationErrors(['ownerId', 'makeId', 'modelId', 'year'], 'errors');
        $this->assertNotNull($response->json('data.id'));
    }

    #[Test]
    public function submitting_requires_complete_details_and_a_photo(): void
    {
        $this->as($this->staff(AdminRole::VehicleManager));

        $this->postJson('/api/v1/admin/vehicles', $this->vehiclePayload(['images' => [], 'priceKes' => null]))
            ->assertUnprocessable()->assertJsonValidationErrors(['images', 'priceKes'], 'errors');
    }

    #[Test]
    public function model_must_belong_to_the_make(): void
    {
        $this->as($this->staff(AdminRole::VehicleManager));
        $other = VehicleMake::create(['name' => 'BMW']);

        $this->postJson('/api/v1/admin/vehicles', $this->vehiclePayload(['makeId' => $other->id, 'intent' => 'draft']))
            ->assertUnprocessable()->assertJsonValidationErrors(['modelId'], 'errors');
    }

    #[Test]
    public function submit_review_approve_publishes_with_history_and_audit(): void
    {
        $manager = $this->staff(AdminRole::VehicleManager);
        $reviewer = $this->staff(AdminRole::Reviewer);
        $id = $this->submittedVehicle($manager);

        $vehicle = Vehicle::findOrFail($id);
        $this->assertSame('pending_approval', $vehicle->status->value);
        $this->assertSame(1, $vehicle->images()->count());
        $this->assertTrue($vehicle->images()->first()->is_primary);

        // Managers cannot approve their own submissions.
        $this->as($manager);
        $this->transition($id, 'approve')->assertForbidden();

        $this->as($reviewer);
        $this->transition($id, 'approve')->assertOk()->assertJsonPath('data.status', 'published');
        $this->assertNotNull($vehicle->fresh()->published_at);

        $this->getJson("/api/v1/admin/vehicles/{$id}/reviews")->assertOk()
            ->assertJsonPath('data.0.action', 'approved')
            ->assertJsonPath('data.0.actorName', $reviewer->name)
            ->assertJsonPath('data.1.action', 'submitted');

        $this->assertDatabaseHas('audit_logs', ['action' => 'approved', 'module' => 'Listing Reviews', 'user_id' => $reviewer->id]);
    }

    #[Test]
    public function rejecting_requires_a_reason_and_the_listing_can_be_corrected_and_resubmitted(): void
    {
        $manager = $this->staff(AdminRole::VehicleManager);
        $id = $this->submittedVehicle($manager);

        $this->as($this->staff(AdminRole::Reviewer));
        $this->transition($id, 'reject', 'Too short')->assertUnprocessable()->assertJsonValidationErrors(['reason'], 'errors');
        $this->transition($id, 'reject', 'Please upload a clear photo of the odometer reading.')->assertOk()->assertJsonPath('data.status', 'rejected');

        $this->as($manager);
        $this->transition($id, 'submit')->assertOk()->assertJsonPath('data.status', 'pending_approval');
        $this->getJson("/api/v1/admin/vehicles/{$id}/reviews")->assertJsonPath('data.1.reason', 'Please upload a clear photo of the odometer reading.');
    }

    #[Test]
    public function editing_a_live_listing_sends_it_back_to_review(): void
    {
        $manager = $this->staff(AdminRole::VehicleManager);
        $id = $this->submittedVehicle($manager);
        $this->as($this->staff(AdminRole::Reviewer));
        $this->transition($id, 'approve');

        $this->as($manager);
        $images = Vehicle::find($id)->images->map(fn ($i) => ['id' => (string) $i->id, 'isPrimary' => $i->is_primary])->all();
        $this->putJson("/api/v1/admin/vehicles/{$id}", $this->vehiclePayload(['intent' => 'save', 'priceKes' => 4100000, 'images' => $images]))
            ->assertOk()->assertJsonPath('data.status', 'pending_approval')->assertJsonPath('data.priceKes', 4100000);

        $this->getJson('/api/v1/public/vehicles')->assertJsonPath('meta.pagination.total', 0);
    }

    #[Test]
    public function invalid_transitions_are_refused(): void
    {
        $manager = $this->staff(AdminRole::VehicleManager);
        $id = $this->submittedVehicle($manager);

        $this->transition($id, 'mark_sold')->assertUnprocessable();
        $this->transition($id, 'edit')->assertUnprocessable();
        $this->as($this->staff(AdminRole::Reviewer));
        $this->transition($id, 'archive')->assertForbidden();
    }

    #[Test]
    public function removed_photos_are_deleted_from_the_bucket_and_others_photos_cannot_be_attached(): void
    {
        $manager = $this->staff(AdminRole::VehicleManager);
        $this->as($manager);
        [$a, $b] = $this->uploadPhotos(2);
        $id = $this->postJson('/api/v1/admin/vehicles', $this->vehiclePayload(['intent' => 'draft', 'images' => [$a, ['id' => $b['id'], 'isPrimary' => true]]]))
            ->assertCreated()->assertJsonPath('data.images.1.isPrimary', true)->json('data.id');

        $removedPath = VehicleImage::find($a['id'])->path;
        $this->putJson("/api/v1/admin/vehicles/{$id}", $this->vehiclePayload(['intent' => 'save', 'images' => [$b]]))->assertOk();
        Storage::disk(config('filesystems.vehicle_images_disk'))->assertMissing($removedPath);

        $otherUsersPhoto = $this->as($this->staff(AdminRole::VehicleManager))->uploadPhotos();
        $this->as($manager);
        $this->putJson("/api/v1/admin/vehicles/{$id}", $this->vehiclePayload(['intent' => 'save', 'images' => [$b, ...$otherUsersPhoto]]))
            ->assertUnprocessable()->assertJsonValidationErrors(['images'], 'errors');
    }

    #[Test]
    public function the_list_filters_searches_sorts_and_paginates(): void
    {
        $manager = $this->staff(AdminRole::VehicleManager);
        $this->submittedVehicle($manager);
        $this->as($manager);
        $this->postJson('/api/v1/admin/vehicles', $this->vehiclePayload(['intent' => 'draft', 'title' => 'Second car draft', 'priceKes' => 900000]))->assertCreated();

        $this->getJson('/api/v1/admin/vehicles?status=draft')->assertJsonPath('meta.pagination.total', 1)->assertJsonPath('data.0.title', 'Second car draft');
        $this->getJson('/api/v1/admin/vehicles?search=Jane')->assertJsonPath('meta.pagination.total', 2);
        $this->getJson('/api/v1/admin/vehicles?sort=price')->assertJsonPath('data.0.priceKes', 900000);
        $this->getJson('/api/v1/admin/vehicles?sort=drop%20table')->assertOk();
        $this->getJson('/api/v1/admin/vehicles?per_page=1')->assertJsonPath('meta.pagination.last_page', 2);
        $this->getJson('/api/v1/admin/vehicles/status-counts')->assertJsonPath('data.pending_approval', 1)->assertJsonPath('data.draft', 1);
    }

    #[Test]
    public function permissions_are_enforced_per_role(): void
    {
        $this->as($this->staff(AdminRole::EnquiryManager));
        $this->getJson('/api/v1/admin/vehicles')->assertForbidden();

        $this->as($this->staff(AdminRole::Reviewer));
        $this->getJson('/api/v1/admin/vehicles')->assertOk();
        $this->postJson('/api/v1/admin/vehicles', $this->vehiclePayload())->assertForbidden();
        $this->getJson('/api/v1/admin/owners')->assertForbidden();

        $this->app['auth']->forgetGuards();
        $this->getJson('/api/v1/admin/vehicles')->assertUnauthorized();
    }

    #[Test]
    public function every_change_is_audited(): void
    {
        $id = $this->submittedVehicle($this->staff(AdminRole::VehicleManager));
        $ref = Vehicle::find($id)->reference;

        $this->assertSame(['created', 'submitted'], AuditLog::where('entity', "Vehicle {$ref}")->orderBy('id')->pluck('action')->all());
    }
}
