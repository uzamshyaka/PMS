<?php

namespace App\Modules\Authentication\Enums;

/**
 * Canonical list of admin permissions. Policies, route middleware and the
 * seeder all reference these cases so names are never duplicated as strings.
 */
enum AdminPermission: string
{
    case AccessAdminDashboard = 'access-admin-dashboard';
    case ManageUsers = 'manage-users';
    case ManageRoles = 'manage-roles';
    case ManagePermissions = 'manage-permissions';
    case ManageVehicles = 'manage-vehicles';
    case ReviewVehicleListings = 'review-vehicle-listings';
    case ManageEnquiries = 'manage-enquiries';
    case ManageWebsiteContent = 'manage-website-content';
    case ManageSystemSettings = 'manage-system-settings';
    case ViewAuditLogs = 'view-audit-logs';

    /**
     * Route middleware string, e.g. "permission:manage-vehicles".
     */
    public function middleware(): string
    {
        return 'permission:'.$this->value;
    }
}
