<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Append-only approval history entry. */
class ListingReview extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['vehicle_id', 'action', 'reason', 'actor_id', 'actor_name'];
}
