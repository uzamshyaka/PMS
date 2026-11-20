<?php

namespace App\Modules\Vehicles\Resources;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin view of a vehicle (camelCase, matches web/app/types/admin.ts AdminVehicleRow).
 * Expects owner, make, model, creator, images, inspections and features loaded.
 *
 * @mixin Vehicle
 */
class AdminVehicleResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'slug' => $this->slug,
            'ownerId' => $this->owner_id,
            'ownerName' => $this->owner?->name ?? '—',
            'makeId' => $this->make_id,
            'makeName' => $this->make?->name ?? '—',
            'modelId' => $this->model_id,
            'modelName' => $this->model?->name ?? '—',
            'year' => $this->year,
            'title' => $this->title,
            'description' => $this->description ?? '',
            'listingType' => $this->listing_type,
            'mileageKm' => $this->mileage_km,
            'priceKes' => $this->price_kes,
            'currency' => $this->currency,
            'fuel' => $this->fuel ?? '',
            'transmission' => $this->transmission ?? '',
            'bodyStyle' => $this->body_style ?? '',
            'engineCc' => $this->engine_cc,
            'exteriorColour' => $this->exterior_colour ?? '',
            'interiorColour' => $this->interior_colour ?? '',
            'drivetrain' => $this->drivetrain ?? '',
            'doors' => $this->doors,
            'seats' => $this->seats,
            'conditionGrade' => $this->condition_grade ?? '',
            'payment' => $this->payment ?? '',
            'location' => $this->location ?? '',
            'conditionNotes' => $this->condition_notes ?? '',
            'featureIds' => $this->whenLoaded('features', fn () => $this->features->pluck('id')->values()->all(), []),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => VehicleImageResource::make($image)->resolve())->all(), []),
            'inspections' => $this->whenLoaded('inspections', fn () => InspectionResource::collection($this->inspections)->resolve(), []),
            'status' => $this->status->value,
            'createdBy' => $this->creator?->name ?? '—',
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'submittedAt' => $this->submitted_at?->toIso8601String(),
            'publishedAt' => $this->published_at?->toIso8601String(),
        ];
    }
}
