<?php

namespace App\Models\Board;

use CodeIgniter\Model;

class BoardHeaderModel extends Model
{
    protected $table      = 'board_headers';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'board_id',
        'name',
        'color',
        'order_no',
        'is_use',
    ];

    protected $useTimestamps = true;

    public function getByBoardId(int $boardId): array
    {
        return $this->where('board_id', $boardId)
            ->where('is_use', 1)
            ->orderBy('order_no', 'ASC')
            ->findAll();
    }
}