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
            foreach (AdminPermission::cases() as $permission) {
                Permission::findOrCreate($permission->value, self::GUARD);
            }

            foreach (AdminRole::cases() as $role) {
                Role::findOrCreate($role->value, self::GUARD)->syncPermissions(
                    array_map(fn (AdminPermission $p) => $p->value, $role->permissions()),
                );
            }
        });

        $registrar->forgetCachedPermissions();
    }
}
