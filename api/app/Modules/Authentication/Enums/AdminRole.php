<?php

namespace App\Modules\Authentication\Enums;

enum AdminRole: string
{
    case SuperAdmin = 'super-admin';
    case VehicleManager = 'vehicle-manager';
    case Reviewer = 'reviewer';
    case EnquiryManager = 'enquiry-manager';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::VehicleManager => 'Vehicle Manager',
            self::Reviewer => 'Reviewer',
            self::EnquiryManager => 'Enquiry Manager',
        };
    }

    /**
     * @return list<AdminPermission>
     */
    public function permissions(): array
    {
        return match ($this) {
            self::SuperAdmin => AdminPermission::cases(),
            self::VehicleManager => [AdminPermission::AccessAdminDashboard, AdminPermission::ManageVehicles],
            self::Reviewer => [AdminPermission::AccessAdminDashboard, AdminPermission::ReviewVehicleListings],
            self::EnquiryManager => [AdminPermission::AccessAdminDashboard, AdminPermission::ManageEnquiries],
        };
    }
}
