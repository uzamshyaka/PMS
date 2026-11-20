<?php

namespace App\Modules\Owners\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Owner;
use App\Modules\AuditLogs\Resources\AuditLogResource;
use App\Modules\AuditLogs\Services\AuditLogger;
use App\Modules\Owners\Requests\OwnerRequest;
use App\Modules\Owners\Resources\OwnerResource;
use App\Modules\Vehicles\Resources\AdminVehicleResource;
use App\Support\Http\ApiResponse;
use App\Support\Http\ListQuery;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OwnerController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $list = ListQuery::from($request, ['createdAt' => 'created_at', 'name' => 'name', 'vehicles' => 'vehicles_count'], '-createdAt');
        $query = Owner::query()->withCount('vehicles')
            ->when($request->query('status'), fn (Builder $q, $v) => $q->where('status', $v))
            ->when($request->query('type'), fn (Builder $q, $v) => $q->where('type', $v));
        $list->search($query, ['name', 'contact_person', 'phone', 'email', 'location']);

        return ApiResponse::paginated($list->paginate($query), OwnerResource::class);
    }

    /** Active owners for the vehicle form's owner picker. */
    public function options(): JsonResponse
    {
        return ApiResponse::success(OwnerResource::collection(Owner::where('status', 'active')->orderBy('name')->get())->resolve());
    }

    public function show(Owner $owner): JsonResponse
    {
        return ApiResponse::success(new OwnerResource($owner->loadCount('vehicles')));
    }

    public function store(OwnerRequest $request): JsonResponse
    {
        $owner = DB::transaction(function () use ($request) {
            $owner = Owner::create([...$request->attributesForModel(), 'created_by' => $request->user()->id]);
            $this->audit->log('created', 'Owners', "Owner #{$owner->id}", 'Owner created');

            return $owner;
        });

        return ApiResponse::created(new OwnerResource($owner->loadCount('vehicles')), 'Owner added.');
    }

    public function update(OwnerRequest $request, Owner $owner): JsonResponse
    {
        DB::transaction(function () use ($request, $owner) {
            $owner->update($request->attributesForModel());
            $this->audit->log('updated', 'Owners', "Owner #{$owner->id}", 'Owner updated');
        });

        return ApiResponse::success(new OwnerResource($owner->loadCount('vehicles')), 'Owner updated.');
    }

    public function setStatus(Request $request, Owner $owner): JsonResponse
    {
        $status = $request->validate(['status' => ['required', Rule::in(['active', 'inactive'])]])['status'];
        DB::transaction(function () use ($owner, $status) {
            $owner->update(['status' => $status]);
            $this->audit->log($status === 'active' ? 'activated' : 'deactivated', 'Owners', "Owner #{$owner->id}", 'Owner '.($status === 'active' ? 'activated' : 'deactivated'));
        });

        return ApiResponse::success(new OwnerResource($owner->loadCount('vehicles')), 'Owner updated.');
    }

    public function vehicles(Owner $owner): JsonResponse
    {
        $vehicles = $owner->vehicles()->with(['owner:id,name', 'make:id,name', 'model:id,name', 'creator:id,name', 'images'])->latest()->get();

        return ApiResponse::success(AdminVehicleResource::collection($vehicles)->resolve());
    }

    public function activity(Owner $owner): JsonResponse
    {
        return ApiResponse::success(AuditLogResource::collection(AuditLog::where('entity', "Owner #{$owner->id}")->latest('id')->limit(100)->get())->resolve());
    }
}
