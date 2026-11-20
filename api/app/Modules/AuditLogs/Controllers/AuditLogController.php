<?php

namespace App\Modules\AuditLogs\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Modules\AuditLogs\Resources\AuditLogResource;
use App\Support\Http\ApiResponse;
use App\Support\Http\ListQuery;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Read-only: audit entries are written by AuditLogger and never edited. */
class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['from' => ['nullable', 'date'], 'to' => ['nullable', 'date']]);
        $list = ListQuery::from($request, ['at' => 'created_at'], '-at', 15);

        $query = AuditLog::query()
            ->when($request->query('user'), fn (Builder $q, $v) => $q->where('user_name', $v))
            ->when($request->query('action'), fn (Builder $q, $v) => $q->where('action', $v))
            ->when($request->query('module'), fn (Builder $q, $v) => $q->where('module', $v))
            ->when($request->query('from'), fn (Builder $q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->query('to'), fn (Builder $q, $v) => $q->whereDate('created_at', '<=', $v));
        $list->search($query, ['user_name', 'action', 'module', 'entity', 'details']);

        return ApiResponse::paginated($list->paginate($query), AuditLogResource::class);
    }

    public function facets(): JsonResponse
    {
        $distinct = fn (string $column) => AuditLog::query()->distinct()->orderBy($column)->pluck($column)->values();

        return ApiResponse::success(['users' => $distinct('user_name'), 'actions' => $distinct('action'), 'modules' => $distinct('module')]);
    }
}
