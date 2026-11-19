<?php

namespace Tests\Feature\Rbac;

use App\Models\User;
use App\Modules\Authentication\Enums\AdminPermission;
use App\Modules\Authentication\Enums\AdminRole;
use App\Support\Http\ApiResponse;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolesAndPermissionsTest extends TestCase
{
    use RefreshDatabase;

    /** Route registered only inside this test to exercise permission middleware. */
    private const PROBE = '/api/v1/admin/__rbac-probe';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        Route::middleware(['api', 'auth:sanctum', 'active', AdminPermission::ManageVehicles->middleware()])
            ->get(self::PROBE, fn () => ApiResponse::success(message: 'Allowed.'));
    }

    #[Test]
    public function the_four_roles_exist_with_their_permissions(): void
    {
        $expected = [
            'super-admin' => array_map(fn ($p) => $p->value, AdminPermission::cases()),
            'vehicle-manager' => ['access-admin-dashboard', 'manage-vehicles'],
            'reviewer' => ['access-admin-dashboard', 'review-vehicle-listings'],
            'enquiry-manager' => ['access-admin-dashboard', 'manage-enquiries'],
        ];

        $this->assertSame(4, Role::count());
        $this->assertSame(10, Permission::count());

        foreach ($expected as $role => $permissions) {
            $actual = Role::findByName($role, 'web')->permissions->pluck('name')->sort()->values()->all();
            sort($permissions);
            $this->assertSame($permissions, $actual, "Permissions for {$role}");
        }
    }

    #[Test]
    public function the_seeder_is_idempotent(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->assertSame(4, Role::count());
        $this->assertSame(10, Permission::count());
        $this->assertSame(2, Role::findByName('reviewer', 'web')->permissions()->count());
    }

    #[Test]
    public function roles_can_be_assigned_and_grant_their_permissions(): void
    {
        $user = User::factory()->create();
        $user->assignRole(AdminRole::Reviewer->value);

        $this->assertTrue($user->hasRole('reviewer'));
        $this->assertTrue($user->can(AdminPermission::ReviewVehicleListings->value));
        $this->assertFalse($user->can(AdminPermission::ManageVehicles->value));
        $this->assertFalse($user->can(AdminPermission::ManageUsers->value));
    }

    #[Test]
    public function permission_middleware_allows_holders_and_rejects_others(): void
    {
        $manager = User::factory()->create()->assignRole(AdminRole::VehicleManager->value);
        $reviewer = User::factory()->create()->assignRole(AdminRole::Reviewer->value);
        $superAdmin = User::factory()->create()->assignRole(AdminRole::SuperAdmin->value);
        $noRole = User::factory()->create();

        $this->asUser($manager)->getJson(self::PROBE)->assertOk()->assertJsonPath('message', 'Allowed.');
        $this->asUser($superAdmin)->getJson(self::PROBE)->assertOk();

        foreach ([$reviewer, $noRole] as $user) {
            $this->asUser($user)->getJson(self::PROBE)
                ->assertForbidden()
                ->assertJsonPath('success', false)
                ->assertJsonPath('data', null);
        }
    }

    /**
     * Several users hit the API inside one test: drop guards that cached the previous user.
     */
    private function asUser(User $user): static
    {
        $this->app['auth']->forgetGuards();

        return $this->actingAs($user, 'web');
    }

    #[Test]
    public function permission_middleware_requires_authentication(): void
    {
        $this->getJson(self::PROBE)->assertUnauthorized()->assertJsonPath('success', false);
    }
}
