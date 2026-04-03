<?php

namespace App\Models\Board;

use CodeIgniter\Model;

class BoardModel extends Model
{
    protected $table      = 'boards';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'board_code',
        'board_name',
        'skin_type',
        'description',
        'use_comment',
        'use_rating',
        'use_file',
        'use_secret',
        'file_count',
        'file_size',
        'list_count',
        'new_days',
        'best_count',
        'order_no',
        'is_active',
    ];

    protected $useTimestamps  = true;
    protected $useSoftDeletes = true;

    // board_code로 찾기
    public function findByCode(string $boardCode): array|null
    {
        return $this->where('board_code', $boardCode)->first();
    }
}