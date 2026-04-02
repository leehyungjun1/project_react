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
        'user_id',
        'admin_id',
        'author_name',
        'author_password',
        'title',
        'content',
        'is_secret',
        'is_notice',
        'is_active',
        'view_count',
        'rating_avg',
        'rating_count',
        'comment_count',
        'file_count',
        'thumbnail',
        'event_start_at',
        'event_end_at',
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