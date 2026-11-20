<?php

namespace App\Modules\Catalogue\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use App\Modules\AuditLogs\Services\AuditLogger;
use App\Support\Http\ApiResponse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Makes, models and features. Items are activated/deactivated, never
 * deleted, so existing vehicles keep their references.
 */
class CatalogueController extends Controller
{
    private const KINDS = ['makes' => VehicleMake::class, 'models' => VehicleModel::class, 'features' => Feature::class];

    public function __construct(private readonly AuditLogger $audit) {}

    public function makes(): JsonResponse
    {
        return ApiResponse::success(VehicleMake::orderBy('name')->get()->map(fn ($m) => ['id' => $m->id, 'name' => $m->name, 'isActive' => $m->is_active]));
    }

    public function models(): JsonResponse
    {
        return ApiResponse::success(VehicleModel::orderBy('name')->get()->map(fn ($m) => ['id' => $m->id, 'makeId' => $m->make_id, 'name' => $m->name, 'isActive' => $m->is_active]));
    }

    public function features(): JsonResponse
    {
        return ApiResponse::success(Feature::orderBy('category')->orderBy('name')->get()->map(fn ($f) => ['id' => $f->id, 'name' => $f->name, 'category' => $f->category, 'isActive' => $f->is_active]));
    }

    public function save(Request $request, string $kind, ?int $id = null): JsonResponse
    {
        abort_unless(isset(self::KINDS[$kind]), 404);
        $data = $request->validate($this->rules($kind, $id), ['name.unique' => 'This name already exists.']);

        $item = DB::transaction(function () use ($kind, $id, $data) {
            /** @var Model $item */
            $item = $id ? self::KINDS[$kind]::findOrFail($id) : new (self::KINDS[$kind]);
            $item->fill(array_filter([
                'name' => trim($data['name']),
                'make_id' => $data['makeId'] ?? null,
                'category' => $data['category'] ?? null,
            ], fn ($v) => $v !== null));
            $item->save();
            $this->audit->log($id ? 'updated' : 'created', 'Catalogue', rtrim($kind, 's')." {$item->name}", $id ? 'Updated' : 'Added');

            return $item;
        });

        return ApiResponse::success(['id' => $item->id, 'name' => $item->name, 'isActive' => (bool) ($item->is_active ?? true), 'makeId' => $item->make_id ?? null, 'category' => $item->category ?? null], $id ? 'Updated.' : 'Added.', $id ? 200 : 201);
    }

    public function setActive(Request $request, string $kind, int $id): JsonResponse
    {
        abort_unless(isset(self::KINDS[$kind]), 404);
        $active = $request->validate(['isActive' => ['required', 'boolean']])['isActive'];
        $item = self::KINDS[$kind]::findOrFail($id);

        DB::transaction(function () use ($item, $kind, $active) {
            $item->update(['is_active' => $active]);
            $this->audit->log($active ? 'activated' : 'deactivated', 'Catalogue', rtrim($kind, 's')." {$item->name}", $active ? 'Activated' : 'Deactivated');
        });

        return ApiResponse::success(null, $active ? 'Activated.' : 'Deactivated.');
    }

    /** @return array<string, mixed> */
    private function rules(string $kind, ?int $id): array
    {
        return match ($kind) {
            'makes' => ['name' => ['required', 'string', 'max:80', Rule::unique('vehicle_makes', 'name')->ignore($id)]],
            'models' => [
                'makeId' => ['required', 'integer', Rule::exists('vehicle_makes', 'id')],
                'name' => ['required', 'string', 'max:80', Rule::unique('vehicle_models', 'name')->ignore($id)->where('make_id', request()->integer('makeId'))],
            ],
            'features' => [
                'name' => ['required', 'string', 'max:80', Rule::unique('features', 'name')->ignore($id)],
                'category' => ['required', Rule::in(Feature::CATEGORIES)],
            ],
        };
    }
}
