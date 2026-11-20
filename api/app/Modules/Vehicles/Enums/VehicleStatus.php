<?php

namespace App\Modules\Vehicles\Enums;

enum VehicleStatus: string
{
    case Draft = 'draft';
    case PendingApproval = 'pending_approval';
    case Published = 'published';
    case Rejected = 'rejected';
    case Sold = 'sold';
    case Unavailable = 'unavailable';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::PendingApproval => 'Pending Approval',
            self::Published => 'Published',
            self::Rejected => 'Rejected',
            self::Sold => 'Sold',
            self::Unavailable => 'Unavailable',
            self::Archived => 'Archived',
        };
    }
}
