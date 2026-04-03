<?php

namespace App\Models\Admin;

use CodeIgniter\Model;

class BannerModel extends Model
{
    protected $table      = 'banners';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'title', 'banner_code', 'device_type', 'effect', 'speed', 'interval',
        'show_arrow', 'arrow_color','arrow_size', 'show_nav', 'nav_type',
        'nav_active_color', 'nav_inactive_color', 'nav_size',
        'banner_width', 'banner_height', 'width_unit',
        'display_type', 'start_at', 'end_at', 'is_active',
    ];

    protected $useTimestamps  = true;
    protected $useSoftDeletes = true;
}