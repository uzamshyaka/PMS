<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Modules\Authentication\Enums\AdminRole;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Covers the authenticated-session endpoints: /me and /logout.
 */
class SessionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    #[Test]
    public function me_returns_the_current_admin_without_sensitive_fields(): void
    {
        $user = User::factory()->create(['name' => 'Ada', 'email' => 'ada@example.com']);
        $user->assignRole(AdminRole::VehicleManager->value);

        $this->actingAs($user, 'web')->getJson('/api/v1/admin/auth/me')
            ->assertOk()
            ->assertExactJsonStructure([
                'success', 'message', 'meta', 'errors',
                'data' => ['id', 'name', 'email', 'last_login_at', 'roles', 'permissions'],
            ])
            ->assertJsonPath('data.name', 'Ada')
            ->assertJsonPath('data.roles', ['vehicle-manager'])
            ->assertJsonPath('data.permissions', ['access-admin-dashboard', 'manage-vehicles']);
    }

    #[Test]
    public function guests_cannot_access_protected_endpoints(): void
    {
        $this->getJson('/api/v1/admin/auth/me')
            ->assertUnauthorized()
            ->assertExactJson([
                'success' => false,
                'message' => 'Unauthenticated.',
                'data' => null,
                'meta' => null,
                'errors' => null,
            ]);

        $this->postJson('/api/v1/admin/auth/logout')->assertUnauthorized();
    }

    #[Test]
    public function a_deactivated_account_is_logged_out_on_its_next_request(): void
    {
        $user = User::factory()->create();
        $user->forceFill(['is_active' => false])->save();

        $this->actingAs($user, 'web')->getJson('/api/v1/admin/auth/me')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'This account has been deactivated.');

        $this->assertGuest('web');
    }

    #[Test]
    public function an_admin_can_log_out(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')->fromFrontend()->postJson('/api/v1/admin/auth/logout')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Logged out successfully.');

        $this->assertGuest('web');
    }

    #[Test]
    public function full_cookie_flow_login_me_logout(): void
    {
        User::factory()->create(['email' => 'admin@example.com']);

        $this->fromFrontend()->get('/sanctum/csrf-cookie')->assertNoContent()->assertCookie('XSRF-TOKEN');

        $this->fromFrontend()->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ])->assertOk();

        $this->fromFrontend()->getJson('/api/v1/admin/auth/me')->assertOk()
            ->assertJsonPath('data.email', 'admin@example.com');

        $this->fromFrontend()->postJson('/api/v1/admin/auth/logout')->assertOk();
        $this->assertGuest('web');
    }
}
