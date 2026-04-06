<?php
// app/Models/UserProfileModel.php

namespace App\Models;

use CodeIgniter\Model;

class UserProfileModel extends Model
{
    protected $table      = 'user_profiles';
    protected $primaryKey = 'id';
    protected $useTimestamps = true;

    protected $allowedFields = [
        'user_id', 'fax', 'job', 'gender',
        'birth_type', 'birthday',
        'marry_yn', 'anniversary',
        'interests', 'privacy_period', 'memo',
    ];

    public function getByUserId(int $userId): ?array
    {
        return $this->where('user_id', $userId)->first();
    }

    public function saveProfile(int $userId, array $data): void
    {
        $existing = $this->where('user_id', $userId)->first();
        if (isset($data['interests']) && is_array($data['interests'])) {
            $data['interests'] = json_encode($data['interests']);
        }
        if ($existing) {
            $this->update($existing['id'], $data);
        } else {
            $this->insert(array_merge($data, ['user_id' => $userId]));
        }
    }
}