<?php

namespace App\Modules\Enquiries\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use App\Models\User;
use App\Models\Vehicle;
use App\Modules\AuditLogs\Services\AuditLogger;
use App\Modules\Authentication\Enums\AdminPermission;
use App\Modules\Enquiries\Resources\EnquiryResource;
use App\Modules\Owners\Requests\OwnerRequest;
use App\Support\Http\ApiResponse;
use App\Support\Http\ListQuery;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class EnquiryController extends Controller
{
    private const WITH = ['vehicle:id,title', 'assignee:id,name'];

    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        $list = ListQuery::from($request, ['createdAt' => 'created_at', 'customer' => 'customer_name'], '-createdAt');
        $query = Enquiry::query()->with(self::WITH)
            ->when($request->query('status'), fn (Builder $q, $v) => $q->where('status', $v))
            ->when($request->query('assigned'), fn (Builder $q, $v) => $v === 'unassigned' ? $q->whereNull('assigned_to') : $q->where('assigned_to', (int) $v));
        $list->search($query, ['customer_name', 'phone', 'email', 'message']);

        return ApiResponse::paginated($list->paginate($query), EnquiryResource::class);
    }

    public function show(Enquiry $enquiry): JsonResponse
    {
        return ApiResponse::success(new EnquiryResource($enquiry->load([...self::WITH, 'history', 'notes'])));
    }

    public function statusCounts(): JsonResponse
    {
        return ApiResponse::success(Enquiry::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status')->map(fn ($n) => (int) $n));
    }

    public function recent(Request $request): JsonResponse
    {
        $limit = max(1, min(20, (int) $request->query('limit', 5)));

        return ApiResponse::success(EnquiryResource::collection(Enquiry::with(self::WITH)->latest()->latest('id')->limit($limit)->get())->resolve());
    }

    /** Staff who can be assigned enquiries. */
    public function assignees(): JsonResponse
    {
        $users = User::permission(AdminPermission::ManageEnquiries->value)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'email']);

        return ApiResponse::success($users->map(fn ($u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email]));
    }

    public function updateStatus(Request $request, Enquiry $enquiry): JsonResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(Enquiry::STATUSES)], 'note' => ['nullable', 'string', 'max:500']]);
        if ($data['status'] === $enquiry->status) {
            throw ValidationException::withMessages(['status' => ['The enquiry already has this status.']]);
        }

        DB::transaction(function () use ($enquiry, $data, $request) {
            $from = $enquiry->status;
            $enquiry->update(['status' => $data['status']]);
            $enquiry->history()->create(['status' => $data['status'], 'note' => $data['note'] ?? null, 'changed_by' => $request->user()->name]);
            $this->audit->log('status_changed', 'Enquiries', "Enquiry #{$enquiry->id}", "{$from} → {$data['status']}");
        });

        return $this->show($enquiry->refresh());
    }

    public function assign(Request $request, Enquiry $enquiry): JsonResponse
    {
        $userId = $request->validate(['userId' => ['nullable', 'integer', Rule::exists('users', 'id')]])['userId'] ?? null;
        DB::transaction(function () use ($enquiry, $userId) {
            $enquiry->update(['assigned_to' => $userId]);
            $this->audit->log('assigned', 'Enquiries', "Enquiry #{$enquiry->id}", 'Assigned to '.($userId ? User::find($userId)->name : 'nobody'));
        });

        return $this->show($enquiry->refresh());
    }

    public function addNote(Request $request, Enquiry $enquiry): JsonResponse
    {
        $body = $request->validate(['body' => ['required', 'string', 'max:2000']], ['body.required' => 'Write a note first.'])['body'];
        $enquiry->notes()->create(['body' => trim($body), 'author' => $request->user()->name]);

        return $this->show($enquiry->refresh());
    }

    /** Public website form. Rate-limited; a hidden "website" field traps bots. */
    public function submit(Request $request): JsonResponse
    {
        $request->merge(['phone' => OwnerRequest::normalisePhone($request->input('phone'))]);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'regex:/^\+254[17]\d{8}$/'],
            'email' => ['nullable', 'email', 'max:255'],
            'message' => ['required', 'string', 'min:5', 'max:2000'],
            'vehicleSlug' => ['nullable', 'string', 'max:160'],
            'website' => ['prohibited'],
        ], ['phone.regex' => 'Enter a Kenyan mobile number, e.g. 0712 345 678.', 'website.prohibited' => 'Invalid submission.']);

        $vehicleId = isset($data['vehicleSlug']) ? Vehicle::published()->where('slug', $data['vehicleSlug'])->value('id') : null;

        DB::transaction(function () use ($data, $vehicleId, $request) {
            $enquiry = Enquiry::create([
                'vehicle_id' => $vehicleId,
                'customer_name' => trim($data['name']),
                'phone' => $data['phone'],
                'email' => $data['email'] ?? null,
                'message' => trim($data['message']),
                'status' => 'new',
                'ip_address' => $request->ip(),
            ]);
            $enquiry->history()->create(['status' => 'new', 'changed_by' => 'Website form']);
        });

        return ApiResponse::created(null, 'Thank you. Our team will contact you shortly.');
    }
}
