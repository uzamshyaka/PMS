<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Vehicle owner. Internal only: never exposed through the public API. */
class Owner extends Model
{
    protected $fillable = ['type', 'name', 'contact_person', 'phone', 'whatsapp', 'email', 'location', 'status', 'notes', 'created_by'];

    /** @return HasMany<Vehicle, $this> */
    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }
}
