<?php

namespace App\Models;

use App\Modules\Vehicles\Services\VehicleImageService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class VehicleImage extends Model
{
    protected $fillable = ['vehicle_id', 'path', 'original_name', 'size', 'width', 'height', 'sort_order', 'is_primary', 'uploaded_by'];

    protected function casts(): array
    {
        return ['is_primary' => 'boolean'];
    }

    public function url(): string
    {
        return Storage::disk(VehicleImageService::disk())->url($this->path);
    }

    /** @return BelongsTo<Vehicle, $this> */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
