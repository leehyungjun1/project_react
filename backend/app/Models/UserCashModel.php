<?php
// app/Models/UserCashModel.php

namespace App\Models;

use CodeIgniter\Model;

class UserCashModel extends Model
{
    protected $table      = 'user_cash';
    protected $primaryKey = 'id';
    protected $useTimestamps  = false;
    protected $createdField   = 'created_at';

    protected $allowedFields = [
        'user_id', 'type', 'amount', 'balance',
        'reason', 'ref_type', 'ref_id', 'created_at',
    ];

    public function addCash(int $userId, int $amount, string $type, string $reason = '', ?string $refType = null, ?int $refId = null): bool
    {
        $userModel = new UserModel();
        $user      = $userModel->find($userId);
        if (!$user) return false;

        $balance = $user['cash'] + $amount;
        if ($balance < 0) return false;

        $userModel->update($userId, ['cash' => $balance]);

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