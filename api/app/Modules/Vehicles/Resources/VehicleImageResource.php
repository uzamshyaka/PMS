<?php

namespace App\Modules\Vehicles\Resources;

use App\Models\VehicleImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin VehicleImage */
class VehicleImageResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'url' => $this->url(),
            'name' => $this->original_name,
            'isPrimary' => $this->is_primary,
        ];
    }
}
