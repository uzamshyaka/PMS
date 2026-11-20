<?php

namespace App\Modules\Owners\Resources;

use App\Models\Owner;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Admin-only owner view. Never used by public endpoints. @mixin Owner */
class OwnerResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'name' => $this->name,
            'contactPerson' => $this->contact_person ?? '',
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp ?? '',
            'email' => $this->email ?? '',
            'location' => $this->location,
            'status' => $this->status,
            'notes' => $this->notes ?? '',
            'createdAt' => $this->created_at?->toIso8601String(),
            'vehicleCount' => (int) ($this->vehicles_count ?? 0),
        ];
    }
}
