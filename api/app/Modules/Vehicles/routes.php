<?php

use App\Modules\Authentication\Enums\AdminPermission;
use App\Modules\Vehicles\Controllers\AdminVehicleController;
use Illuminate\Support\Facades\Route;

// Mounted under /api/v1/admin (auth:sanctum + active).
$manage = AdminPermission::ManageVehicles->value;
$review = AdminPermission::ReviewVehicleListings->value;

// Reading vehicles is needed by managers and reviewers.
Route::middleware("permission:{$manage}|{$review}")->group(function () {
    Route::get('vehicles', [AdminVehicleController::class, 'index'])->name('vehicles.index');
    Route::get('vehicles/status-counts', [AdminVehicleController::class, 'statusCounts'])->name('vehicles.status-counts');
    Route::get('vehicles/recent', [AdminVehicleController::class, 'recent'])->name('vehicles.recent');
    Route::get('vehicles/{vehicle}', [AdminVehicleController::class, 'show'])->name('vehicles.show');
    Route::get('vehicles/{vehicle}/reviews', [AdminVehicleController::class, 'reviews'])->name('vehicles.reviews');
    // Per-action permission is checked in the controller (approve/reject vs management).
    Route::post('vehicles/{vehicle}/transitions', [AdminVehicleController::class, 'transition'])->name('vehicles.transition');
});

Route::middleware("permission:{$manage}")->group(function () {
    Route::post('vehicles', [AdminVehicleController::class, 'store'])->name('vehicles.store');
    Route::put('vehicles/{vehicle}', [AdminVehicleController::class, 'update'])->name('vehicles.update');
    Route::get('vehicles/{vehicle}/activity', [AdminVehicleController::class, 'activity'])->name('vehicles.activity');
    Route::post('vehicle-images', [AdminVehicleController::class, 'uploadImages'])->middleware('throttle:30,1')->name('vehicle-images.store');
});

Route::get('dashboard/stats', [AdminVehicleController::class, 'stats'])
    ->middleware('permission:'.AdminPermission::AccessAdminDashboard->value)->name('dashboard.stats');
