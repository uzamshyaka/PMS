<?php

namespace App\Modules\Vehicles\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use App\Models\Vehicle;
use App\Modules\Vehicles\Requests\VehicleRequest;
use App\Modules\Vehicles\Resources\PublicVehicleResource;
use App\Support\Http\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Public, unauthenticated vehicle catalogue. Only published listings are
 * ever returned, through PublicVehicleResource (no owner or internal data).
 */
class PublicVehicleController extends Controller
{
    private const WITH = ['make:id,name', 'model:id,name', 'images', 'inspections', 'features:id,name'];

    private const SORTS = [
        'newest' => ['published_at', 'desc'],
        'oldest' => ['published_at', 'asc'],
        'price-asc' => ['price_kes', 'asc'],
        'price-desc' => ['price_kes', 'desc'],
        'mileage-asc' => ['mileage_km', 'asc'],
        'year-desc' => ['year', 'desc'],
    ];

    public function index(Request $request): JsonResponse
    {
        $q = $request->validate([
            'type' => ['nullable', Rule::in(['new', 'used'])],
            'payment' => ['nullable', Rule::in(VehicleRequest::PAYMENTS)],
            'location' => ['nullable', 'string', 'max:60'],
            'make' => ['nullable', 'string', 'max:80'],
            'model' => ['nullable', 'string', 'max:80'],
            'q' => ['nullable', 'string', 'max:100'],
            'minPrice' => ['nullable', 'integer', 'min:0'],
            'maxPrice' => ['nullable', 'integer', 'min:0'],
            'minYear' => ['nullable', 'integer', 'min:1900'],
            'maxMileage' => ['nullable', 'integer', 'min:0'],
            'fuel' => ['nullable', Rule::in(VehicleRequest::FUELS)],
            'transmission' => ['nullable', Rule::in(VehicleRequest::TRANSMISSIONS)],
            'body' => ['nullable', Rule::in(VehicleRequest::BODY_STYLES)],
            'featured' => ['nullable', 'boolean'],
            'sort' => ['nullable', Rule::in(array_keys(self::SORTS))],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ]);

        $featuredIds = $this->featuredIds();
        $query = Vehicle::query()->published()->with(self::WITH)
            ->when($q['type'] ?? null, fn (Builder $b, $v) => $b->where('listing_type', $v))
            ->when($q['payment'] ?? null, fn (Builder $b, $v) => $b->where('payment', $v))
            ->when($q['location'] ?? null, fn (Builder $b, $v) => $b->where('location', $v))
            ->when($q['make'] ?? null, fn (Builder $b, $v) => $b->whereHas('make', fn ($m) => $m->where('name', $v)))
            ->when($q['model'] ?? null, fn (Builder $b, $v) => $b->whereHas('model', fn ($m) => $m->where('name', $v)))
            ->when($q['minPrice'] ?? null, fn (Builder $b, $v) => $b->where('price_kes', '>=', $v))
            ->when($q['maxPrice'] ?? null, fn (Builder $b, $v) => $b->where('price_kes', '<=', $v))
            ->when($q['minYear'] ?? null, fn (Builder $b, $v) => $b->where('year', '>=', $v))
            ->when($q['maxMileage'] ?? null, fn (Builder $b, $v) => $b->where('mileage_km', '<=', $v))
            ->when($q['fuel'] ?? null, fn (Builder $b, $v) => $b->where('fuel', $v))
            ->when($q['transmission'] ?? null, fn (Builder $b, $v) => $b->where('transmission', $v))
            ->when($q['body'] ?? null, fn (Builder $b, $v) => $b->where('body_style', $v))
            // Homepage rows: the vehicles chosen under Website → Homepage, or the newest if none are chosen.
            ->when(! empty($q['featured']) && $featuredIds, fn (Builder $b) => $b->whereIn('id', $featuredIds));

        if (! empty($q['q'])) {
            $term = '%'.addcslashes($q['q'], '%_\\').'%';
            $query->where(fn (Builder $b) => $b->where('title', 'like', $term)
                ->orWhereHas('make', fn ($m) => $m->where('name', 'like', $term))
                ->orWhereHas('model', fn ($m) => $m->where('name', 'like', $term)));
        }

        [$column, $direction] = self::SORTS[$q['sort'] ?? 'newest'];
        $paginator = $query->orderBy($column, $direction)->orderBy('published_at', 'desc')->orderBy('id', 'desc')
            ->paginate((int) ($q['per_page'] ?? 9));

        PublicVehicleResource::$featuredIds = $featuredIds;

        return ApiResponse::paginated($paginator, PublicVehicleResource::class);
    }

    public function show(string $slug): JsonResponse
    {
        $vehicle = Vehicle::query()->published()->with(self::WITH)->where('slug', $slug)->firstOrFail();
        PublicVehicleResource::$featuredIds = $this->featuredIds();

        return ApiResponse::success(new PublicVehicleResource($vehicle));
    }

    /** Filter options built from what is actually published. */
    public function facets(): JsonResponse
    {
        $rows = Vehicle::query()->published()
            ->join('vehicle_makes', 'vehicle_makes.id', '=', 'vehicles.make_id')
            ->join('vehicle_models', 'vehicle_models.id', '=', 'vehicles.model_id')
            ->get(['vehicle_makes.name as make', 'vehicle_models.name as model', 'vehicles.location']);

        return ApiResponse::success([
            'makes' => $rows->pluck('make')->unique()->sort()->values(),
            'modelsByMake' => $rows->groupBy('make')->map(fn ($r) => $r->pluck('model')->unique()->sort()->values()),
            'locations' => $rows->pluck('location')->filter()->unique()->sort()->values(),
        ]);
    }

    /** @return list<int> */
    private function featuredIds(): array
    {
        $ids = SiteContent::where('section', 'homepage')->value('values')['featuredVehicleIds'] ?? [];

        return array_values(array_map('intval', is_array($ids) ? $ids : []));
    }
}
