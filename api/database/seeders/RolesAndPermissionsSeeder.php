<?php

namespace Database\Seeders;

use App\Modules\Authentication\Enums\AdminPermission;
use App\Modules\Authentication\Enums\AdminRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Idempotent: safe to run repeatedly in every environment. Creates missing
 * roles/permissions and syncs each role to exactly the permissions defined
 * in AdminRole::permissions().
 */
class RolesAndPermissionsSeeder extends Seeder
{
    private const GUARD = 'web';

    public function run(): void
    {
        $registrar = app(PermissionRegistrar::class);
        $registrar->forgetCachedPermissions();

        DB::transaction(function () {
            // Keep the models and sync by model, not by name: DatabaseSeeder runs
            // WithoutModelEvents, so Spatie's cache is not refreshed after creating
            // permissions and a name lookup would hit the stale (empty) cache.
            $permissions = [];
            foreach (AdminPermission::cases() as $permission) {
                $permissions[$permission->value] = Permission::query()->firstOrCreate(
                    ['name' => $permission->value, 'guard_name' => self::GUARD],
                );
            }

            foreach (AdminRole::cases() as $role) {
                Role::query()->firstOrCreate(['name' => $role->value, 'guard_name' => self::GUARD])->syncPermissions(
                    array_map(fn (AdminPermission $p) => $permissions[$p->value], $role->permissions()),
                );
            }
        });

        $registrar->forgetCachedPermissions();
    }
}
