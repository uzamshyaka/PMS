<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Append-only. Written only through AuditLogger. */
class AuditLog extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['user_id', 'user_name', 'action', 'module', 'entity', 'details', 'ip_address'];
}
