<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnquiryStatusHistory extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'enquiry_status_history';

    protected $fillable = ['status', 'note', 'changed_by'];
}
