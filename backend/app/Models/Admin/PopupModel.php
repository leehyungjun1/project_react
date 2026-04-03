<?php

namespace App\Models\Admin;

use CodeIgniter\Model;

class PopupModel extends Model
{
    protected $table      = 'popups';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'popup_code', 'title', 'content', 'popup_type',
        'width', 'height', 'pos_type', 'pos_top', 'pos_left',
        'display_type', 'start_at', 'end_at',
        'hide_today', 'is_active', 'order_no',
    ];

    protected $useTimestamps  = true;
    protected $useSoftDeletes = true;
}