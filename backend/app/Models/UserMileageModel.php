<?php
// app/Models/UserMileageModel.php

namespace App\Models;

use CodeIgniter\Model;

class UserMileageModel extends Model
{
    protected $table      = 'user_mileage';
    protected $primaryKey = 'id';
    protected $useTimestamps  = false;
    protected $createdField   = 'created_at';

    protected $allowedFields = [
        'user_id', 'type', 'amount', 'balance',
        'reason', 'ref_type', 'ref_id', 'expired_at', 'created_at',
    ];

    /**
     * 마일리지 적립/차감
     * amount: 양수=적립, 음수=차감
     */
    public function addMileage(int $userId, int $amount, string $type, string $reason = '', ?string $refType = null, ?int $refId = null): bool
    {
        $userModel = new UserModel();
        $user      = $userModel->find($userId);
        if (!$user) return false;

        $balance = $user['mileage'] + $amount;
        if ($balance < 0) return false;

        // users 테이블 잔액 업데이트
        $userModel->update($userId, ['mileage' => $balance]);

        // 이력 저장
        $this->insert([
            'user_id'    => $userId,
            'type'       => $type,
            'amount'     => $amount,
            'balance'    => $balance,
            'reason'     => $reason,
            'ref_type'   => $refType,
            'ref_id'     => $refId,
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        return true;
    }

    public function getHistory(int $userId, int $page = 1, int $perPage = 20): array
    {
        $offset = ($page - 1) * $perPage;
        $total  = $this->where('user_id', $userId)->countAllResults(false);
        $list   = $this->where('user_id', $userId)
            ->orderBy('id', 'DESC')
            ->limit($perPage, $offset)
            ->findAll();

        return [
            'list'     => $list,
            'total'    => $total,
            'lastPage' => (int)ceil($total / $perPage),
        ];
    }
}