<?php
// app/Models/UserModel.php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table         = 'users';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $useSoftDeletes = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $allowedFields = [
        'member_type', 'is_approved', 'grade_code',
        'user_id', 'password', 'name', 'nickname',
        'email', 'email_agree', 'mobile', 'sms_agree',
        'postcode', 'address1', 'address2', 'tel',
        'referrer_id', 'referrer_count',
        'mileage', 'cash',
        'login_count', 'last_login_at', 'last_login_ip',
        'is_withdrawn', 'withdrawn_at',
    ];

    public function getList(array $params): array
    {
        $perPage = (int)($params['per_page'] ?? 20);
        $page    = (int)($params['page']     ?? 1);
        $offset  = ($page - 1) * $perPage;

        $builder = $this->db->table('users u')
            ->select('u.*, s.name as grade_name')
            ->join('settings s', 's.code = u.grade_code AND s.is_active = 1', 'left')
            ->where('u.deleted_at IS NULL')
            ->where('u.is_withdrawn', 0);

        if (!empty($params['keyword'])) {
            $allowed = ['name', 'user_id', 'email', 'mobile'];
            $field   = in_array($params['search_type'] ?? '', $allowed) ? $params['search_type'] : 'name';
            $builder->like('u.' . $field, $params['keyword']);
        }

        if (!empty($params['member_type'])) {
            $builder->where('u.member_type', $params['member_type']);
        }

        if (isset($params['is_approved']) && $params['is_approved'] !== '') {
            $builder->where('u.is_approved', $params['is_approved']);
        }

        if (!empty($params['grade_code'])) {
            $builder->where('u.grade_code', $params['grade_code']);
        }

        if (!empty($params['start_date']) && !empty($params['end_date'])) {
            $field = ($params['date_type'] ?? '') === 'last_login_at' ? 'last_login_at' : 'created_at';
            $builder->where("DATE(u.{$field}) >=", $params['start_date'])
                ->where("DATE(u.{$field}) <=", $params['end_date']);
        }

        $total = $builder->countAllResults(false);
        $list  = $builder->orderBy('u.id', 'DESC')
            ->limit($perPage, $offset)
            ->get()
            ->getResultArray();

        return [
            'list'     => $list,
            'total'    => $total,
            'lastPage' => (int)ceil($total / $perPage),
            'page'     => $page,
            'per_page' => $perPage,
        ];
    }

    public function getDetail(int $id): ?array
    {
        $user = $this->db->table('users u')
            ->select('u.*, s.name as grade_name')
            ->join('settings s', 's.code = u.grade_code AND s.is_active = 1', 'left')
            ->where('u.id', $id)
            ->where('u.deleted_at IS NULL')
            ->get()
            ->getRowArray();

        if (!$user) return null;

        // 프로필 정보 합치기
        $profile = (new UserProfileModel())->getByUserId($id);
        if ($profile) {
            if (!empty($profile['interests'])) {
                $profile['interests'] = json_decode($profile['interests'], true) ?? [];
            }
            $user = array_merge($user, $profile);
        }

        // 사업자 정보 합치기
        if ($user['member_type'] === 'business') {
            $business = (new UserBusinessModel())->getByUserId($id);
            if ($business) {
                $user = array_merge($user, $business);
            }
        }

        return $user;
    }

    public function existsById(string $userId, ?int $excludeId = null): bool
    {
        $builder = $this->where('user_id', $userId);
        if ($excludeId) $builder->where('id !=', $excludeId);
        return $builder->countAllResults() > 0;
    }
}