<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Authentication\Enums\AdminRole;
use Illuminate\Database\Seeder;

/**
 * Creates a local development Super Admin. Never runs outside the local environment.
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local')) {
            $this->command?->warn('UserSeeder skipped: the development admin is only seeded in the local environment.');

            return;
        }

        $password = env('DEV_ADMIN_PASSWORD') ?: 'password';

        if ($password === 'password') {
            $this->command?->warn('UserSeeder: using the default password "password". Set DEV_ADMIN_PASSWORD to change it.');
        }

        $user = User::updateOrCreate(
            ['email' => env('DEV_ADMIN_EMAIL') ?: 'admin@example.com'],
            [
                'name' => 'Development Admin',
                'password' => $password,
            ],
        );

        $user->forceFill(['is_active' => true])->save();
        $user->syncRoles([AdminRole::SuperAdmin->value]);
    }
}
