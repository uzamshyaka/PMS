<?php

/*
| Admin routes for the business modules, mounted under /api/v1/admin with
| auth:sanctum + active. Each group declares the permission it needs; the
| frontend's navigation rules mirror these but are not relied on.
*/

use App\Modules\AuditLogs\Controllers\AuditLogController;
use App\Modules\Authentication\Enums\AdminPermission as P;
use App\Modules\Catalogue\Controllers\CatalogueController;
use App\Modules\Dashboard\Controllers\NotificationController;
use App\Modules\Enquiries\Controllers\EnquiryController;
use App\Modules\Owners\Controllers\OwnerController;
use App\Modules\Users\Controllers\UserController;
use App\Modules\WebsiteContent\Controllers\SiteContentController;
use Illuminate\Support\Facades\Route;

require __DIR__.'/Vehicles/routes.php';

Route::get('notifications', [NotificationController::class, 'index'])->middleware('permission:'.P::AccessAdminDashboard->value);

Route::middleware('permission:'.P::ManageVehicles->value)->group(function () {
    Route::get('owners', [OwnerController::class, 'index']);
    Route::get('owners/options', [OwnerController::class, 'options']);
    Route::post('owners', [OwnerController::class, 'store']);
    Route::get('owners/{owner}', [OwnerController::class, 'show']);
    Route::put('owners/{owner}', [OwnerController::class, 'update']);
    Route::patch('owners/{owner}/status', [OwnerController::class, 'setStatus']);
    Route::get('owners/{owner}/vehicles', [OwnerController::class, 'vehicles']);
    Route::get('owners/{owner}/activity', [OwnerController::class, 'activity']);

    Route::post('catalogue/{kind}', [CatalogueController::class, 'save'])->whereIn('kind', ['makes', 'models', 'features']);
    Route::put('catalogue/{kind}/{id}', [CatalogueController::class, 'save'])->whereIn('kind', ['makes', 'models', 'features'])->whereNumber('id');
    Route::patch('catalogue/{kind}/{id}/active', [CatalogueController::class, 'setActive'])->whereIn('kind', ['makes', 'models', 'features'])->whereNumber('id');
});

// Catalogue lists are read by the vehicle form and the review screens.
Route::middleware('permission:'.P::ManageVehicles->value.'|'.P::ReviewVehicleListings->value)->group(function () {
    Route::get('catalogue/makes', [CatalogueController::class, 'makes']);
    Route::get('catalogue/models', [CatalogueController::class, 'models']);
    Route::get('catalogue/features', [CatalogueController::class, 'features']);
});

Route::middleware('permission:'.P::ManageEnquiries->value)->group(function () {
    Route::get('enquiries', [EnquiryController::class, 'index']);
    Route::get('enquiries/status-counts', [EnquiryController::class, 'statusCounts']);
    Route::get('enquiries/recent', [EnquiryController::class, 'recent']);
    Route::get('enquiries/assignees', [EnquiryController::class, 'assignees']);
    Route::get('enquiries/{enquiry}', [EnquiryController::class, 'show']);
    Route::patch('enquiries/{enquiry}/status', [EnquiryController::class, 'updateStatus']);
    Route::patch('enquiries/{enquiry}/assignee', [EnquiryController::class, 'assign']);
    Route::post('enquiries/{enquiry}/notes', [EnquiryController::class, 'addNote']);
});

Route::middleware('permission:'.P::ManageUsers->value)->group(function () {
    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::put('users/{user}', [UserController::class, 'update']);
    Route::get('users/{user}/activity', [UserController::class, 'activity']);
});
Route::get('roles', [UserController::class, 'roles'])->middleware('permission:'.P::ManageRoles->value.'|'.P::ManageUsers->value);

// Section-level permission (website content vs settings) is checked in the controller.
Route::get('content/{section}', [SiteContentController::class, 'show']);
Route::put('content/{section}', [SiteContentController::class, 'update']);
Route::post('content-images', [SiteContentController::class, 'uploadImage'])->middleware(['permission:'.P::ManageWebsiteContent->value, 'throttle:30,1']);

Route::middleware('permission:'.P::ViewAuditLogs->value)->group(function () {
    Route::get('audit-logs', [AuditLogController::class, 'index']);
    Route::get('audit-logs/facets', [AuditLogController::class, 'facets']);
});
