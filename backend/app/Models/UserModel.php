<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table      = 'users';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'email',
        'password',
        'nickname',
        'profile_img',
        'role',
    ];

    protected $useTimestamps = true; // created_at, updated_at 자동 관리

    // 이메일로 사용자 찾기
    public function findByEmail(string $email): array|null
    {
        return $this->where('email', $email)->first();
    }
}