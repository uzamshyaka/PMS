<?php

namespace App\Modules\Vehicles\Resources;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public website view of a published vehicle (matches web/app/types/vehicle.ts PublicVehicle).
 * Never includes owner details, internal notes, reference numbers or staff names.
 *
 * @mixin Vehicle
 */
class PublicVehicleResource extends JsonResource
{
    /** @param list<int> $featuredIds */
    public static array $featuredIds = [];

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $make = $this->make?->name ?? '';
        $model = $this->model?->name ?? '';
        $prefix = trim("{$this->year} {$make} {$model}");
        $variant = str_starts_with(mb_strtolower($this->title), mb_strtolower($prefix)) ? trim(mb_substr($this->title, mb_strlen($prefix))) : $this->title;
        $images = $this->images->sortByDesc('is_primary')->values();

        return [
            'slug' => $this->slug,
            'listingType' => $this->listing_type,
            'payment' => $this->payment,
            'location' => $this->location,
            'make' => $make,
            'model' => $model,
            'variant' => $variant,
            'year' => $this->year,
            'mileageKm' => (int) $this->mileage_km,
            'transmission' => $this->transmission,
            'fuel' => $this->fuel,
            'bodyStyle' => $this->body_style,
            'engine' => $this->engine_cc ? sprintf('%.1fL', $this->engine_cc / 1000) : '',
            'colour' => $this->exterior_colour,
            'priceKes' => (int) $this->price_kes,
            'images' => $images->map(fn ($i) => $i->url())->all(),
            'description' => $this->description ?? '',
            'features' => $this->features->pluck('name')->values()->all(),
            'condition' => [
                'summary' => $this->condition_grade ?? '',
                'notes' => array_values(array_filter(array_map('trim', preg_split('/\r?\n/', (string) $this->condition_notes) ?: []))),
            ],
            'inspections' => InspectionResource::collection($this->inspections)->resolve(),
            'featured' => in_array($this->id, self::$featuredIds, true),
            'listedAt' => $this->published_at?->toIso8601String(),
        ];
    }
}
