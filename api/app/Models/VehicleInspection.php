<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleInspection extends Model
{
    protected $fillable = ['source', 'title', 'inspected_on', 'summary', 'inspector', 'has_evidence'];

    protected function casts(): array
    {
        return ['inspected_on' => 'date', 'has_evidence' => 'boolean'];
    }
}
