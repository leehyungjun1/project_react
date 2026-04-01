<?php

namespace App\Models\Admin;

use App\Libraries\CryptoHelper;
use CodeIgniter\Model;

class AdminModel extends Model
{
    protected $table      = 'admins';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'admin_id',
        'password',
        'name',
        'nickname',
        'mobile',
        'mobile_hash',
        'email',
        'email_hash',
        'postcode',
        'address1',
        'address2',
        'login_restrict',
        'emp_type',
        'department',
        'position',
        'job_title',
        'phone',
        'phone_ext',
        'profile_img',
        'admin_level',
        'is_active',
        'last_login_at',
        'last_login_ip',
        'is_ip_check',
    ];

    protected $useTimestamps  = true;
    protected $useSoftDeletes = true;

    // ✅ 이벤트 콜백 등록
    protected $beforeInsert = ['encryptFields'];
    protected $beforeUpdate = ['encryptFields'];
    protected $afterFind    = ['decryptFields'];

    // ===== 저장 전 암호화 =====
    protected function encryptFields(array $data): array
    {
        // email이 있고 암호화된 값이 아닐 때만 암호화
        if (isset($data['data']['email']) && !$this->isEncrypted($data['data']['email'])) {
            $data['data']['email_hash'] = CryptoHelper::hash($data['data']['email']);
        $data['data']['email']      = CryptoHelper::encrypt($data['data']['email']);
    }

        if (isset($data['data']['mobile']) && !$this->isEncrypted($data['data']['mobile'])) {
            $data['data']['mobile_hash'] = CryptoHelper::hash($data['data']['mobile']);
            $data['data']['mobile']      = CryptoHelper::encrypt($data['data']['mobile']);
        }

        return $data;
    }

    // ===== 조회 후 복호화 =====
    protected function decryptFields(array $data): array
    {
        // 단일 조회
        if (isset($data['data']) && !is_array(reset($data['data']))) {
            $data['data'] = $this->decryptRow($data['data']);
            return $data;
        }

        // 목록 조회
        if (isset($data['data']) && is_array($data['data'])) {
            $data['data'] = array_map([$this, 'decryptRow'], $data['data']);
        }

        return $data;
    }

    // 단일 행 복호화
    private function decryptRow(?array $row): ?array
    {
        if (!$row) return $row;

        if (!empty($row['email'])) {
            $row['email'] = CryptoHelper::decrypt($row['email']);
        }
        if (!empty($row['mobile'])) {
            $row['mobile'] = CryptoHelper::decrypt($row['mobile']);
        }

        return $row;
    }

    // ===== 커스텀 메서드 =====

    // admin_id로 찾기
    public function findByAdminId(string $adminId): array|null
    {
        return $this->where('admin_id', $adminId)->first();
    }

    // 이메일 해시로 중복 체크
    public function findByEmailHash(string $email): array|null
    {
        $hash = CryptoHelper::hash($email); // 해시로 변환해서 검색
        return $this->where('email_hash', $hash)->first();
    }

    // 연락처 해시로 중복 체크
    public function findByMobileHash(string $mobile): array|null
    {
        $hash = CryptoHelper::hash($mobile); // 해시로 변환해서 검색
        return $this->where('mobile_hash', $hash)->first();
    }

    private function isEncrypted(string $value): bool
    {
        return base64_decode($value, true) !== false && base64_encode(base64_decode($value)) === $value;
    }
}