<?php

namespace App\Modules\AuditLogs\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

/**
 * Single write path for the append-only audit trail. Call inside the same
 * transaction as the change it records so both commit or neither does.
 */
class AuditLogger
{
    public function log(string $action, string $module, string $entity, string $details): void
    {
        $user = Auth::user();

        AuditLog::create([
            'user_id' => $user?->getAuthIdentifier(),
            'user_name' => $user->name ?? 'System',
            'action' => $action,
            'module' => $module,
            'entity' => mb_substr($entity, 0, 120),
            'details' => mb_substr($details, 0, 500),
            'ip_address' => request()?->ip(),
        ]);
    }
}
