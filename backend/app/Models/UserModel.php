<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table      = 'users';
    protected $primaryKey = 'id';
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    protected $allowedFields = [
        'member_type', 'is_approved', 'grade_code',
        'user_id', 'nickname', 'name', 'password',
        'email', 'email_agree', 'mobile', 'sms_agree',
        'postcode', 'address1', 'address2', 'tel',
        'biz_name', 'biz_number', 'biz_ceo',
        'biz_type', 'biz_item',
        'biz_postcode', 'biz_address1', 'biz_address2', 'biz_reg_file',
        'fax', 'job', 'gender',
        'birth_type', 'birthday',
        'marry_yn', 'anniversary',
        'referrer_id', 'referrer_count',
        'interests', 'privacy_period', 'memo',
        'last_login_at',
    ];

    public function getList(array $params): array
    {
        $perPage = (int)($params['per_page'] ?? 20);
        $page    = (int)($params['page']     ?? 1);
        $offset  = ($page - 1) * $perPage;

        $builder = $this->db->table('users u')
            ->select('u.*, s.name as grade_name')
            ->join('settings s', 's.code = u.grade_code', 'left');

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
        return $this->db->table('users u')
            ->select('u.*, s.name as grade_name')
            ->join('settings s', 's.code = u.grade_code', 'left')
            ->where('u.id', $id)
            ->get()
            ->getRowArray();
    }

    public function existsById(string $userId, ?int $excludeId = null): bool
    {
        $builder = $this->where('user_id', $userId);
        if ($excludeId) $builder->where('id !=', $excludeId);
        return $builder->countAllResults() > 0;
    }

    public function existsByBizNumber(string $bizNumber, ?int $excludeId = null): bool
    {
        $builder = $this->where('biz_number', $bizNumber);
        if ($excludeId) $builder->where('id !=', $excludeId);
        return $builder->countAllResults() > 0;
    }
}