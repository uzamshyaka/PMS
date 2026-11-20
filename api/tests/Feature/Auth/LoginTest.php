<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Modules\Authentication\Enums\AdminRole;
use App\Modules\Authentication\Services\AuthService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    private const URL = '/api/v1/admin/auth/login';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    #[Test]
    public function an_active_admin_can_log_in(): void
    {
        $user = User::factory()->create(['email' => 'admin@example.com']);
        $user->assignRole(AdminRole::Reviewer->value);

        $response = $this->fromFrontend()->postJson(self::URL, [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'admin@example.com')
            ->assertJsonPath('data.roles', ['reviewer'])
            ->assertJsonPath('errors', null)
            ->assertJsonMissingPath('data.password')
            ->assertJsonMissingPath('data.remember_token');

        $this->assertAuthenticatedAs($user, 'web');
        $this->assertNotNull($user->fresh()->last_login_at);
    }

    #[Test]
    public function wrong_password_and_unknown_email_get_the_same_generic_error(): void
    {
        User::factory()->create(['email' => 'admin@example.com']);

        $wrongPassword = $this->fromFrontend()->postJson(self::URL, [
            'email' => 'admin@example.com',
            'password' => 'not-the-password',
        ]);
        $unknownEmail = $this->fromFrontend()->postJson(self::URL, [
            'email' => 'nobody@example.com',
            'password' => 'not-the-password',
        ]);

        foreach ([$wrongPassword, $unknownEmail] as $response) {
            $response->assertUnprocessable()
                ->assertJsonPath('success', false)
                ->assertJsonPath('errors.email.0', __('auth.failed'));
        }

        $this->assertGuest('web');
    }

    #[Test]
    public function login_validates_input(): void
    {
        $this->fromFrontend()->postJson(self::URL, ['email' => 'not-an-email'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password'], 'errors');
    }

    #[Test]
    public function an_inactive_account_is_rejected(): void
    {
        $user = User::factory()->inactive()->create(['email' => 'old@example.com']);

        $this->fromFrontend()->postJson(self::URL, [
            'email' => 'old@example.com',
            'password' => 'password',
        ])->assertForbidden()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'This account has been deactivated. Contact a Super Admin.');

        $this->assertGuest('web');
        $this->assertNull($user->fresh()->last_login_at);
    }

    #[Test]
    public function login_is_throttled_after_five_failed_attempts_per_email_and_ip(): void
    {
        User::factory()->create(['email' => 'admin@example.com']);
        $bad = ['email' => 'admin@example.com', 'password' => 'wrong'];

        for ($i = 0; $i < AuthService::MAX_ATTEMPTS; $i++) {
            $this->fromFrontend()->postJson(self::URL, $bad)->assertUnprocessable();
        }

        // Even the correct password is refused while locked out.
        $this->fromFrontend()->postJson(self::URL, ['email' => 'admin@example.com', 'password' => 'password'])
            ->assertTooManyRequests()
            ->assertHeader('Retry-After')
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Too many requests. Please try again later.');

        // A different email from the same IP has its own bucket.
        User::factory()->create(['email' => 'other@example.com']);
        $this->fromFrontend()->postJson(self::URL, ['email' => 'other@example.com', 'password' => 'password'])
            ->assertOk();
    }

    #[Test]
    public function a_successful_login_resets_the_failed_attempt_counter(): void
    {
        User::factory()->create(['email' => 'admin@example.com']);

        for ($i = 0; $i < AuthService::MAX_ATTEMPTS - 1; $i++) {
            $this->fromFrontend()->postJson(self::URL, ['email' => 'admin@example.com', 'password' => 'wrong']);
        }

        $this->fromFrontend()->postJson(self::URL, ['email' => 'admin@example.com', 'password' => 'password'])->assertOk();
        $this->fromFrontend()->postJson(self::URL, ['email' => 'admin@example.com', 'password' => 'wrong'])->assertUnprocessable();
    }
}
