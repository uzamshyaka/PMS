<?php

namespace App\Modules\AuditLogs\Resources;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin AuditLog */
class AuditLogResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'at' => $this->created_at?->toIso8601String(),
            'userName' => $this->user_name,
            'action' => $this->action,
            'module' => $this->module,
            'entity' => $this->entity,
            'details' => $this->details,
        ];
    }
}
