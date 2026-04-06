<?php
// app/Models/UserBusinessModel.php

namespace App\Models;

use CodeIgniter\Model;

class UserBusinessModel extends Model
{
    protected $table      = 'user_business';
    protected $primaryKey = 'id';
    protected $useTimestamps = true;

    protected $allowedFields = [
        'user_id', 'biz_name', 'biz_number', 'biz_ceo',
        'biz_type', 'biz_item',
        'biz_postcode', 'biz_address1', 'biz_address2',
        'biz_reg_file',
    ];

    public function getByUserId(int $userId): ?array
    {
        return $this->where('user_id', $userId)->first();
    }

    public function saveBusiness(int $userId, array $data): void
    {
        $existing = $this->where('user_id', $userId)->first();
        if ($existing) {
            $this->update($existing['id'], $data);
        } else {
            $this->insert(array_merge($data, ['user_id' => $userId]));
        }
    }
}