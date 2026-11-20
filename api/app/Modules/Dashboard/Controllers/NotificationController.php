<?php

namespace App\Modules\Dashboard\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use App\Models\Vehicle;
use App\Modules\Authentication\Enums\AdminPermission;
use App\Modules\Vehicles\Enums\VehicleStatus;
use App\Support\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Header bell: new enquiries and listings awaiting review, filtered by the user's permissions. */
class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $items = collect();

        if ($user->can(AdminPermission::ManageEnquiries->value)) {
            $items = $items->merge(Enquiry::where('status', 'new')->latest()->limit(5)->get()->map(fn ($e) => [
                'id' => "enquiry-{$e->id}", 'title' => "New enquiry from {$e->customer_name}", 'description' => mb_strimwidth($e->message, 0, 90, '…'),
                'to' => "/admin/enquiries/{$e->id}", 'at' => $e->created_at?->toIso8601String(),
            ]));
        }
        if ($user->can(AdminPermission::ReviewVehicleListings->value)) {
            $items = $items->merge(Vehicle::where('status', VehicleStatus::PendingApproval)->oldest('submitted_at')->limit(5)->get()->map(fn ($v) => [
                'id' => "review-{$v->id}", 'title' => 'Listing awaiting review', 'description' => $v->title,
                'to' => "/admin/reviews/{$v->id}", 'at' => $v->submitted_at?->toIso8601String(),
            ]));
        }

        return ApiResponse::success($items->sortByDesc('at')->values());
    }
}
