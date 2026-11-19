<?php

use Illuminate\Support\Facades\Route;

/*
| Version 1 of the API. Each module owns a routes.php file that is mounted
| here. Admin routes live under /api/v1/admin; public routes will live
| under /api/v1/public once public modules exist.
*/
Route::prefix('v1')->name('v1.')->group(function () {
    Route::prefix('admin')->name('admin.')->group(function () {
        require app_path('Modules/Authentication/routes.php');
    });
});
