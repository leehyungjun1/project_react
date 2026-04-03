<?php

namespace App\Models\Admin;

use CodeIgniter\Model;

class BannerItemModel extends Model
{
    protected $table      = 'banner_items';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'banner_id', 'image_path', 'link_url', 'link_target',
        'description', 'display_type', 'start_at', 'end_at',
        'is_active', 'order_no',
    ];

    protected $useTimestamps = true;

    public function getByBannerId(int $bannerId): array
    {
        return $this->where('banner_id', $bannerId)
            ->orderBy('order_no', 'ASC')
            ->findAll();
    }
}