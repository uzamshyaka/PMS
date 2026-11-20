<?php

use Illuminate\Support\Facades\Route;

/*
| Version 1 of the API.
|   /api/v1/admin/*   staff only (Sanctum session + active account + permissions)
|   /api/v1/public/*  public website (no auth, rate-limited, published data only)
*/
Route::prefix('v1')->name('v1.')->group(function () {
    Route::prefix('admin')->name('admin.')->group(function () {
        require app_path('Modules/Authentication/routes.php');

        Route::middleware(['auth:sanctum', 'active'])->group(app_path('Modules/routes.php'));
    });

    Route::prefix('public')->name('public.')->group(app_path('Modules/public-routes.php'));
});
