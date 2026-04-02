<?php

namespace App\Models\Board;

use CodeIgniter\Model;

class DynamicBoardModel extends Model
{
    protected $primaryKey  = 'id';
    protected $useTimestamps  = true;
    protected $useSoftDeletes = true;

    protected $allowedFields = [
        'board_id',
        'group_id',
        'parent_id',
        'depth',
        'order_no',
        'header_id',
        'writer_type',
        'writer_id',
        'writer',
        'author_password',
        'title',
        'content',
        'category_id',
        'is_notice',
        'is_secret',
        'is_main',
        'is_use',
        'status',
        'rating',
        'rating_count',
        'comment_count',
        'file_count',
        'hit',
        'thumbnail',
        'event_start_at',
        'event_end_at',
        'ip',
    ];

    // 동적으로 테이블 설정
    public function __construct(string $boardCode)
    {
        $this->table = 'board_' . $boardCode;
        parent::__construct();
    }

    // 조회수 증가
    public function increaseViewCount(int $id): void
    {
        $this->db->query("UPDATE {$this->table} SET view_count = view_count + 1 WHERE id = ?", [$id]);
    }
}