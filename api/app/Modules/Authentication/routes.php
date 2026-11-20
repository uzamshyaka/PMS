<?php

use App\Modules\Authentication\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// Mounted under /api/v1/admin by routes/api.php.
Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->name('login');

    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('me', [AuthController::class, 'me'])->name('me');
    });
});
