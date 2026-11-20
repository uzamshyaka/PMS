<?php

namespace App\Modules\Enquiries\Resources;

use App\Models\Enquiry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Enquiry */
class EnquiryResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customerName' => $this->customer_name,
            'phone' => $this->phone,
            'email' => $this->email ?? '',
            'vehicleId' => $this->vehicle_id,
            'vehicleTitle' => $this->vehicle?->title,
            'message' => $this->message,
            'status' => $this->status,
            'assignedToId' => $this->assigned_to,
            'assignedToName' => $this->assignee?->name,
            'createdAt' => $this->created_at?->toIso8601String(),
            'history' => $this->whenLoaded('history', fn () => $this->history->map(fn ($h) => ['status' => $h->status, 'at' => $h->created_at?->toIso8601String(), 'by' => $h->changed_by, 'note' => $h->note])->all(), []),
            'notes' => $this->whenLoaded('notes', fn () => $this->notes->map(fn ($n) => ['id' => $n->id, 'body' => $n->body, 'author' => $n->author, 'at' => $n->created_at?->toIso8601String()])->all(), []),
        ];
    }
}
