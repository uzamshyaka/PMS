<?php

namespace App\Modules\Vehicles\Resources;

use App\Models\VehicleInspection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Inspection claim, always with its source. Shared by admin and public resources. @mixin VehicleInspection */
class InspectionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'source' => $this->source,
            'title' => $this->title,
            'date' => $this->inspected_on->toDateString(),
            'summary' => $this->summary,
            'inspector' => $this->inspector,
            'hasEvidence' => $this->has_evidence,
        ];
    }
}
