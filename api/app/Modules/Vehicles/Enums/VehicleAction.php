<?php

namespace App\Modules\Vehicles\Enums;

use App\Modules\Authentication\Enums\AdminPermission;

/**
 * The listing lifecycle. Mirrors web/app/utils/vehicle-status.ts.
 * Approval publishes automatically. There is no delete: archive instead.
 */
enum VehicleAction: string
{
    case Edit = 'edit';
    case Submit = 'submit';
    case Approve = 'approve';
    case Reject = 'reject';
    case MarkSold = 'mark_sold';
    case MarkUnavailable = 'mark_unavailable';
    case MarkAvailable = 'mark_available';
    case Archive = 'archive';

    /** @return list<VehicleStatus> */
    public function fromStatuses(): array
    {
        return match ($this) {
            self::Edit => [VehicleStatus::Draft, VehicleStatus::Rejected, VehicleStatus::Published, VehicleStatus::Unavailable],
            self::Submit => [VehicleStatus::Draft, VehicleStatus::Rejected],
            self::Approve, self::Reject => [VehicleStatus::PendingApproval],
            self::MarkSold => [VehicleStatus::Published, VehicleStatus::Unavailable],
            self::MarkUnavailable => [VehicleStatus::Published],
            self::MarkAvailable => [VehicleStatus::Unavailable],
            self::Archive => [VehicleStatus::Draft, VehicleStatus::Rejected, VehicleStatus::Published, VehicleStatus::Unavailable, VehicleStatus::Sold],
        };
    }

    public function to(): ?VehicleStatus
    {
        return match ($this) {
            self::Edit => null,
            self::Submit => VehicleStatus::PendingApproval,
            self::Approve, self::MarkAvailable => VehicleStatus::Published,
            self::Reject => VehicleStatus::Rejected,
            self::MarkSold => VehicleStatus::Sold,
            self::MarkUnavailable => VehicleStatus::Unavailable,
            self::Archive => VehicleStatus::Archived,
        };
    }

    public function permission(): AdminPermission
    {
        return match ($this) {
            self::Approve, self::Reject => AdminPermission::ReviewVehicleListings,
            default => AdminPermission::ManageVehicles,
        };
    }

    public function allowedFrom(VehicleStatus $status): bool
    {
        return in_array($status, $this->fromStatuses(), true);
    }

    public function label(): string
    {
        return match ($this) {
            self::Edit => 'edit',
            self::Submit => 'submit for review',
            self::Approve => 'approve',
            self::Reject => 'reject',
            self::MarkSold => 'mark as sold',
            self::MarkUnavailable => 'mark as unavailable',
            self::MarkAvailable => 'make available',
            self::Archive => 'archive',
        };
    }
}
