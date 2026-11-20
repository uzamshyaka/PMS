<?php

namespace Tests\Concerns;

use App\Models\Feature;
use App\Models\Owner;
use App\Models\User;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use App\Modules\Authentication\Enums\AdminRole;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;

/** Test helpers: staff users by role, catalogue rows, owners and vehicle payloads. */
trait BuildsShowroom
{
    protected VehicleMake $make;

    protected VehicleModel $model;

    protected Owner $owner;

    protected Feature $feature;

    protected function setUpShowroom(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        Storage::fake(config('filesystems.vehicle_images_disk'));

        $this->make = VehicleMake::create(['name' => 'Toyota']);
        $this->model = VehicleModel::create(['make_id' => $this->make->id, 'name' => 'Harrier']);
        $this->feature = Feature::create(['name' => 'Sunroof', 'category' => 'Comfort']);
        $this->owner = Owner::create(['type' => 'individual', 'name' => 'Jane Owner', 'phone' => '+254712345678', 'location' => 'Nairobi', 'status' => 'active']);
    }

    protected function staff(AdminRole $role): User
    {
        return User::factory()->create()->assignRole($role->value);
    }

    /** Act as a user, resetting cached guards so several users can be used in one test. */
    protected function as(User $user): static
    {
        $this->app['auth']->forgetGuards();

        return $this->actingAs($user, 'web');
    }

    /** @return list<array{id: string, isPrimary: bool}> */
    protected function uploadPhotos(int $count = 1): array
    {
        $files = array_map(fn ($i) => UploadedFile::fake()->image("photo{$i}.jpg", 1200, 800), range(1, $count));
        $response = $this->postJson('/api/v1/admin/vehicle-images', ['files' => $files])->assertCreated();

        return array_map(fn ($img) => ['id' => $img['id'], 'isPrimary' => false], $response->json('data'));
    }

    /** @return array<string, mixed> */
    protected function vehiclePayload(array $overrides = []): array
    {
        return array_replace([
            'intent' => 'submit',
            'ownerId' => $this->owner->id,
            'makeId' => $this->make->id,
            'modelId' => $this->model->id,
            'year' => 2021,
            'title' => '2021 Toyota Harrier 2.0 Premium',
            'description' => 'Clean, one-owner Harrier with full service history.',
            'listingType' => 'used',
            'mileageKm' => 52000,
            'priceKes' => 4300000,
            'currency' => 'KES',
            'fuel' => 'Petrol',
            'transmission' => 'Automatic',
            'bodyStyle' => 'SUV',
            'engineCc' => 1986,
            'exteriorColour' => 'Pearl White',
            'interiorColour' => 'Black leather',
            'drivetrain' => 'AWD',
            'doors' => 4,
            'seats' => 5,
            'conditionGrade' => 'Very good',
            'payment' => 'lipa-mdogo-mdogo',
            'location' => 'Nairobi',
            'conditionNotes' => "Minor scratch on rear bumper\nTyres 70%",
            'featureIds' => [$this->feature->id],
            'images' => [],
            'inspections' => [
                ['source' => 'independently_verified', 'title' => 'Pre-sale inspection', 'date' => now()->subDay()->toDateString(), 'summary' => 'No major findings.', 'inspector' => 'AA Kenya', 'hasEvidence' => true],
            ],
        ], $overrides);
    }

    /** Create a submitted (pending) vehicle as `$manager`; returns its id. */
    protected function submittedVehicle(User $manager, array $overrides = []): int
    {
        $this->as($manager);
        $photos = $this->uploadPhotos();

        return $this->postJson('/api/v1/admin/vehicles', $this->vehiclePayload(['images' => $photos, ...$overrides]))->assertCreated()->json('data.id');
    }

    protected function transition(int $id, string $action, ?string $reason = null): TestResponse
    {
        return $this->postJson("/api/v1/admin/vehicles/{$id}/transitions", array_filter(['action' => $action, 'reason' => $reason]));
    }
}
