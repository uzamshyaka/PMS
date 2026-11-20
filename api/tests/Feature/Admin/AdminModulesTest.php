<?php

namespace Tests\Feature\Admin;

use App\Models\Enquiry;
use App\Models\User;
use App\Modules\Authentication\Enums\AdminRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\Concerns\BuildsShowroom;
use Tests\TestCase;

/** Owners, enquiries, catalogue, users, content and audit endpoints. */
class AdminModulesTest extends TestCase
{
    use BuildsShowroom, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpShowroom();
    }

    #[Test]
    public function owners_phone_numbers_are_normalised_and_duplicates_refused(): void
    {
        $this->as($this->staff(AdminRole::VehicleManager));
        $owner = ['type' => 'business', 'name' => 'Coast Motors', 'contactPerson' => 'Amina', 'phone' => '0722 110 220', 'location' => 'Mombasa', 'status' => 'active'];

        $this->postJson('/api/v1/admin/owners', $owner)->assertCreated()->assertJsonPath('data.phone', '+254722110220');
        $this->postJson('/api/v1/admin/owners', [...$owner, 'phone' => '+254 722 110 220'])->assertUnprocessable()->assertJsonValidationErrors(['phone'], 'errors');
        $this->postJson('/api/v1/admin/owners', [...$owner, 'phone' => '12345'])->assertUnprocessable();
        $this->postJson('/api/v1/admin/owners', [...$owner, 'phone' => '0733 000 111', 'contactPerson' => null])->assertJsonValidationErrors(['contactPerson'], 'errors');
        $this->getJson('/api/v1/admin/owners?type=business')->assertJsonPath('meta.pagination.total', 1);
    }

    #[Test]
    public function website_visitors_can_send_enquiries_which_staff_then_handle(): void
    {
        $this->postJson('/api/v1/public/enquiries', ['name' => 'Peter', 'phone' => '0712 000 111', 'message' => 'Is it available?'])
            ->assertCreated();
        $this->postJson('/api/v1/public/enquiries', ['name' => 'Bot', 'phone' => '0712 000 111', 'message' => 'Spam!', 'website' => 'http://spam'])
            ->assertUnprocessable();

        $enquiry = Enquiry::firstOrFail();
        $this->assertSame('+254712000111', $enquiry->phone);

        $staff = $this->staff(AdminRole::EnquiryManager);
        $this->as($staff);
        $this->patchJson("/api/v1/admin/enquiries/{$enquiry->id}/status", ['status' => 'contacted', 'note' => 'Called'])
            ->assertOk()->assertJsonPath('data.status', 'contacted')->assertJsonPath('data.history.1.note', 'Called');
        $this->patchJson("/api/v1/admin/enquiries/{$enquiry->id}/status", ['status' => 'contacted'])->assertUnprocessable();
        $this->patchJson("/api/v1/admin/enquiries/{$enquiry->id}/assignee", ['userId' => $staff->id])->assertJsonPath('data.assignedToName', $staff->name);
        $this->postJson("/api/v1/admin/enquiries/{$enquiry->id}/notes", ['body' => 'Prefers WhatsApp'])->assertJsonPath('data.notes.0.body', 'Prefers WhatsApp');
        $this->getJson('/api/v1/admin/enquiries/assignees')->assertJsonPath('data.0.id', $staff->id);

        $this->as($this->staff(AdminRole::VehicleManager));
        $this->getJson('/api/v1/admin/enquiries')->assertForbidden();
    }

    #[Test]
    public function the_public_enquiry_form_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/public/enquiries', ['name' => 'P', 'phone' => '0712000111', 'message' => "Message {$i}"])->assertCreated();
        }
        $this->postJson('/api/v1/public/enquiries', ['name' => 'P', 'phone' => '0712000111', 'message' => 'Again'])->assertTooManyRequests();
    }

    #[Test]
    public function catalogue_names_are_unique_and_models_need_a_make(): void
    {
        $this->as($this->staff(AdminRole::VehicleManager));
        $this->postJson('/api/v1/admin/catalogue/makes', ['name' => 'Toyota'])->assertUnprocessable();
        $this->postJson('/api/v1/admin/catalogue/models', ['name' => 'Rush'])->assertJsonValidationErrors(['makeId'], 'errors');
        $this->postJson('/api/v1/admin/catalogue/models', ['name' => 'Rush', 'makeId' => $this->make->id])->assertCreated();
        $this->patchJson("/api/v1/admin/catalogue/makes/{$this->make->id}/active", ['isActive' => false])->assertOk();
        $this->getJson('/api/v1/admin/catalogue/makes')->assertJsonPath('data.0.isActive', false);
    }

    #[Test]
    public function super_admins_manage_users_but_cannot_lock_themselves_out(): void
    {
        $admin = $this->staff(AdminRole::SuperAdmin);
        $this->as($admin);

        $this->postJson('/api/v1/admin/users', ['name' => 'New', 'email' => 'new@example.com', 'roles' => [], 'isActive' => true])
            ->assertJsonValidationErrors(['roles', 'password'], 'errors');
        $id = $this->postJson('/api/v1/admin/users', ['name' => 'New', 'email' => 'new@example.com', 'roles' => ['reviewer'], 'isActive' => true, 'password' => 'correct-horse-battery'])
            ->assertCreated()->assertJsonPath('data.roles', ['reviewer'])->assertJsonMissingPath('data.password')->json('data.id');
        $this->assertTrue(User::find($id)->hasRole('reviewer'));

        // The new user can sign in with the password the admin set.
        $this->app['auth']->forgetGuards();
        $this->fromFrontend()->postJson('/api/v1/admin/auth/login', ['email' => 'new@example.com', 'password' => 'correct-horse-battery'])->assertOk();
        $this->as($admin);

        $this->putJson("/api/v1/admin/users/{$admin->id}", ['name' => $admin->name, 'email' => $admin->email, 'roles' => ['super-admin'], 'isActive' => false])
            ->assertJsonValidationErrors(['isActive'], 'errors');
        $this->getJson('/api/v1/admin/roles')->assertJsonPath('data.2.name', 'reviewer')->assertJsonPath('data.2.userCount', 1);

        $this->as($this->staff(AdminRole::Reviewer));
        $this->getJson('/api/v1/admin/users')->assertForbidden();
    }

    #[Test]
    public function website_content_and_settings_have_separate_permissions(): void
    {
        $this->as($this->staff(AdminRole::VehicleManager));
        $this->getJson('/api/v1/admin/content/about')->assertForbidden();

        $this->as($this->staff(AdminRole::SuperAdmin));
        $this->getJson('/api/v1/admin/content/settings')->assertOk()->assertJsonPath('data.currency', 'KES');
        $this->putJson('/api/v1/admin/content/contact', ['phone' => '+254 711 000 000', 'whatsapp' => '254711000000', 'email' => 'x@example.com', 'address' => 'Nairobi', 'hours' => '9–5'])->assertOk();
        $this->putJson('/api/v1/admin/content/contact', ['phone' => '1', 'whatsapp' => 'abc', 'email' => 'nope', 'address' => 'x', 'hours' => 'x'])->assertUnprocessable();
        $this->getJson('/api/v1/admin/content/unknown')->assertNotFound();

        $this->app['auth']->forgetGuards();
        $this->getJson('/api/v1/public/site')->assertJsonPath('data.contact.whatsapp', '254711000000');
    }

    #[Test]
    public function audit_logs_are_filterable_and_restricted(): void
    {
        $this->as($this->staff(AdminRole::VehicleManager));
        $this->postJson('/api/v1/admin/catalogue/makes', ['name' => 'Lexus'])->assertCreated();
        $this->getJson('/api/v1/admin/audit-logs')->assertForbidden();

        $this->as($this->staff(AdminRole::SuperAdmin));
        $this->getJson('/api/v1/admin/audit-logs?module=Catalogue')->assertJsonPath('meta.pagination.total', 1)->assertJsonPath('data.0.details', 'Added');
        $this->getJson('/api/v1/admin/audit-logs/facets')->assertJsonPath('data.modules', ['Catalogue']);
    }

    #[Test]
    public function notifications_follow_permissions(): void
    {
        Enquiry::create(['customer_name' => 'A', 'phone' => '+254712000000', 'message' => 'Hi', 'status' => 'new']);

        $this->as($this->staff(AdminRole::Reviewer));
        $this->getJson('/api/v1/admin/notifications')->assertOk()->assertJsonCount(0, 'data');
        $this->as($this->staff(AdminRole::EnquiryManager));
        $this->getJson('/api/v1/admin/notifications')->assertJsonCount(1, 'data');
    }
}
