<?php

namespace App\Modules\Users\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Modules\AuditLogs\Resources\AuditLogResource;
use App\Modules\AuditLogs\Services\AuditLogger;
use App\Modules\Authentication\Enums\AdminRole;
use App\Support\Http\ApiResponse;
use App\Support\Http\ListQuery;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/** Staff accounts and their roles (Phase 0 RBAC, no new authorization system). */
class UserController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $list = ListQuery::from($request, ['name' => 'name', 'createdAt' => 'created_at', 'lastLogin' => 'last_login_at'], 'name');
        $query = User::query()->with('roles:id,name')
            ->when($request->query('status'), fn (Builder $q, $v) => $q->where('is_active', $v === 'active'))
            ->when($request->query('role'), fn (Builder $q, $v) => $q->role($v));
        $list->search($query, ['name', 'email']);
        $page = $list->paginate($query);

        return ApiResponse::success(collect($page->items())->map(fn ($u) => $this->present($u)), meta: ['pagination' => [
            'current_page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(),
            'last_page' => $page->lastPage(), 'from' => $page->firstItem(), 'to' => $page->lastItem(),
        ]]);
    }

    public function show(User $user): JsonResponse
    {
        return ApiResponse::success($this->present($user->load('roles:id,name')));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $user = DB::transaction(function () use ($data) {
            $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password']]);
            $user->forceFill(['is_active' => $data['isActive']])->save();
            $user->syncRoles($data['roles']);
            $this->audit->log('created', 'Users & Roles', "User #{$user->id}", 'Created with roles: '.implode(', ', $data['roles']));

            return $user;
        });

        return ApiResponse::created($this->present($user->load('roles:id,name')), 'User added.');
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $this->validated($request, $user);
        if ($user->is($request->user()) && ! $data['isActive']) {
            throw ValidationException::withMessages(['isActive' => ['You cannot deactivate your own account.']]);
        }
        if ($user->is($request->user()) && ! in_array(AdminRole::SuperAdmin->value, $data['roles'], true) && $user->hasRole(AdminRole::SuperAdmin->value)) {
            throw ValidationException::withMessages(['roles' => ['You cannot remove your own Super Admin role.']]);
        }

        DB::transaction(function () use ($user, $data) {
            $user->update(array_filter(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password'] ?? null]));
            $user->forceFill(['is_active' => $data['isActive']])->save();
            $user->syncRoles($data['roles']);
            $this->audit->log('updated', 'Users & Roles', "User #{$user->id}", 'Roles: '.implode(', ', $data['roles']).'; '.($data['isActive'] ? 'active' : 'inactive'));
        });

        return ApiResponse::success($this->present($user->load('roles:id,name')), 'User updated.');
    }

    public function roles(): JsonResponse
    {
        return ApiResponse::success(collect(AdminRole::cases())->map(fn (AdminRole $r) => [
            'name' => $r->value,
            'label' => $r->label(),
            'permissions' => array_map(fn ($p) => $p->value, $r->permissions()),
            'userCount' => User::role($r->value)->count(),
        ]));
    }

    public function activity(User $user): JsonResponse
    {
        return ApiResponse::success(AuditLogResource::collection(AuditLog::where('entity', "User #{$user->id}")->latest('id')->limit(100)->get())->resolve());
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?User $user = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => [Rule::in(array_map(fn ($r) => $r->value, AdminRole::cases()))],
            'isActive' => ['required', 'boolean'],
            // Required on create; optional on update (blank keeps the current password).
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:12', 'max:255'],
        ], ['roles.required' => 'Assign at least one role.', 'roles.min' => 'Assign at least one role.', 'email.unique' => 'This email is already in use.']);
    }

    /** @return array<string, mixed> */
    private function present(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name')->values()->all(),
            'isActive' => (bool) $user->is_active,
            'lastLoginAt' => $user->last_login_at?->toIso8601String(),
            'createdAt' => $user->created_at?->toIso8601String(),
        ];
    }
}
