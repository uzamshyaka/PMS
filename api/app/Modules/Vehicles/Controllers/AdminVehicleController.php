<?php

namespace App\Modules\Vehicles\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Enquiry;
use App\Models\Vehicle;
use App\Modules\AuditLogs\Resources\AuditLogResource;
use App\Modules\Vehicles\Enums\VehicleAction;
use App\Modules\Vehicles\Enums\VehicleStatus;
use App\Modules\Vehicles\Requests\VehicleRequest;
use App\Modules\Vehicles\Resources\AdminVehicleResource;
use App\Modules\Vehicles\Services\VehicleImageService;
use App\Modules\Vehicles\Services\VehicleService;
use App\Support\Http\ApiResponse;
use App\Support\Http\ListQuery;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminVehicleController extends Controller
{
    private const WITH = ['owner:id,name', 'make:id,name', 'model:id,name', 'creator:id,name', 'images', 'inspections', 'features:id'];

    public function __construct(private readonly VehicleService $vehicles) {}

    public function index(Request $request): JsonResponse
    {
        $list = ListQuery::from($request, [
            'createdAt' => 'created_at', 'price' => 'price_kes', 'year' => 'year', 'mileage' => 'mileage_km', 'title' => 'title',
        ], '-createdAt');

        $query = Vehicle::query()->with(self::WITH)
            ->when($request->query('status'), fn (Builder $q, $s) => $q->where('status', $s))
            ->when($request->query('make'), fn (Builder $q, $v) => $q->where('make_id', (int) $v))
            ->when($request->query('type'), fn (Builder $q, $v) => $q->where('listing_type', $v))
            ->when($request->query('location'), fn (Builder $q, $v) => $q->where('location', $v))
            ->when($request->query('owner'), fn (Builder $q, $v) => $q->where('owner_id', (int) $v));

        if ($list->search !== null) {
            $term = '%'.addcslashes($list->search, '%_\\').'%';
            $query->where(fn (Builder $q) => $q->where('reference', 'like', $term)->orWhere('title', 'like', $term)->orWhere('location', 'like', $term)
                ->orWhereHas('owner', fn (Builder $o) => $o->where('name', 'like', $term))
                ->orWhereHas('make', fn (Builder $o) => $o->where('name', 'like', $term))
                ->orWhereHas('model', fn (Builder $o) => $o->where('name', 'like', $term)));
        }

        return ApiResponse::paginated($list->paginate($query), AdminVehicleResource::class);
    }

    public function show(Vehicle $vehicle): JsonResponse
    {
        return ApiResponse::success(new AdminVehicleResource($vehicle->load(self::WITH)));
    }

    public function store(VehicleRequest $request): JsonResponse
    {
        $vehicle = $this->vehicles->create($request->validated());

        return ApiResponse::created(new AdminVehicleResource($vehicle->load(self::WITH)), $request->submitting() ? 'Vehicle submitted for approval.' : 'Vehicle saved as draft.');
    }

    public function update(VehicleRequest $request, Vehicle $vehicle): JsonResponse
    {
        $vehicle = $this->vehicles->update($vehicle, $request->validated());

        return ApiResponse::success(new AdminVehicleResource($vehicle->load(self::WITH)), 'Vehicle updated.');
    }

    public function transition(Request $request, Vehicle $vehicle): JsonResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::enum(VehicleAction::class)->except([VehicleAction::Edit])],
            'reason' => ['nullable', 'string', 'max:2000'],
        ]);
        $action = VehicleAction::from($data['action']);

        // Approve/reject need the reviewer permission; everything else needs vehicle management.
        if (! $request->user()->can($action->permission()->value)) {
            throw new AuthorizationException("You are not allowed to {$action->label()} listings.");
        }

        $vehicle = $this->vehicles->transition($vehicle, $action, $data['reason'] ?? null);

        return ApiResponse::success(new AdminVehicleResource($vehicle->load(self::WITH)), 'Listing updated.');
    }

    public function statusCounts(): JsonResponse
    {
        $counts = Vehicle::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        return ApiResponse::success(collect(VehicleStatus::cases())->mapWithKeys(fn ($s) => [$s->value => (int) ($counts[$s->value] ?? 0)]));
    }

    public function stats(): JsonResponse
    {
        $counts = Vehicle::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');
        $byStatus = collect(VehicleStatus::cases())->mapWithKeys(fn ($s) => [$s->value => (int) ($counts[$s->value] ?? 0)]);

        return ApiResponse::success([
            'byStatus' => $byStatus,
            'total' => $byStatus->sum(),
            'newEnquiries' => Enquiry::where('status', 'new')->count(),
        ]);
    }

    public function recent(Request $request): JsonResponse
    {
        $limit = max(1, min(20, (int) $request->query('limit', 6)));

        return ApiResponse::success(AdminVehicleResource::collection(Vehicle::with(self::WITH)->latest('updated_at')->latest('id')->limit($limit)->get())->resolve());
    }

    public function reviews(Vehicle $vehicle): JsonResponse
    {
        return ApiResponse::success($vehicle->reviews()->get()->map(fn ($r) => [
            'id' => $r->id,
            'vehicleId' => $r->vehicle_id,
            'action' => $r->action,
            'reason' => $r->reason,
            'actorName' => $r->actor_name,
            'createdAt' => $r->created_at?->toIso8601String(),
        ]));
    }

    public function activity(Vehicle $vehicle): JsonResponse
    {
        return ApiResponse::success(AuditLogResource::collection(AuditLog::where('entity', "Vehicle {$vehicle->reference}")->latest('id')->limit(100)->get())->resolve());
    }

    public function uploadImages(Request $request, VehicleImageService $images): JsonResponse
    {
        $request->validate([
            'files' => ['required', 'array', 'min:1', 'max:20'],
            'files.*' => ['file', 'mimetypes:image/jpeg,image/png,image/webp', 'max:8192', 'dimensions:min_width=320,min_height=240,max_width=10000,max_height=10000'],
        ], [
            'files.*.mimetypes' => 'Only JPEG, PNG or WebP images are allowed.',
            'files.*.max' => 'Each photo must be 8 MB or smaller.',
            'files.*.dimensions' => 'Photos must be at least 320×240 pixels.',
        ]);

        $stored = collect($request->file('files'))->map(fn ($file) => [
            'id' => (string) ($image = $images->store($file))->id,
            'url' => $image->url(),
            'name' => $image->original_name,
            'isPrimary' => false,
        ]);

        return ApiResponse::created($stored->values(), 'Photos uploaded.');
    }
}
