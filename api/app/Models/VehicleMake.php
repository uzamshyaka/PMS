<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleMake extends Model
{
    protected $fillable = ['name', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    /** @return HasMany<VehicleModel, $this> */
    public function models(): HasMany
    {
        return $this->hasMany(VehicleModel::class, 'make_id');
    }
}
