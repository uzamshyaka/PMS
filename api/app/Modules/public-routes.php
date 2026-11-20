<?php

/* Public website API, mounted under /api/v1/public. No authentication; rate-limited. */

use App\Modules\Enquiries\Controllers\EnquiryController;
use App\Modules\Vehicles\Controllers\PublicVehicleController;
use App\Modules\WebsiteContent\Controllers\SiteContentController;
use Illuminate\Support\Facades\Route;

Route::get('vehicles', [PublicVehicleController::class, 'index'])->name('vehicles.index');
Route::get('vehicles/facets', [PublicVehicleController::class, 'facets'])->name('vehicles.facets');
Route::get('vehicles/{slug}', [PublicVehicleController::class, 'show'])->name('vehicles.show');
Route::get('site', [SiteContentController::class, 'publicContent'])->name('site');
Route::post('enquiries', [EnquiryController::class, 'submit'])->middleware('throttle:enquiries')->name('enquiries.store');
