<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Enquiry extends Model
{
    public const STATUSES = ['new', 'contacted', 'follow_up', 'closed'];

    protected $fillable = ['vehicle_id', 'customer_name', 'phone', 'email', 'message', 'status', 'assigned_to', 'ip_address'];

    /** @return BelongsTo<Vehicle, $this> */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /** @return BelongsTo<User, $this> */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /** @return HasMany<EnquiryStatusHistory, $this> */
    public function history(): HasMany
    {
        return $this->hasMany(EnquiryStatusHistory::class)->orderBy('created_at')->orderBy('id');
    }

    /** @return HasMany<EnquiryNote, $this> */
    public function notes(): HasMany
    {
        return $this->hasMany(EnquiryNote::class)->orderBy('created_at')->orderBy('id');
    }
}
