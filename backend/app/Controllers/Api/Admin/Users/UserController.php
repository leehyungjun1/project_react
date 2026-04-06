<?php
// app/Controllers/Api/Admin/Users/UserController.php

namespace App\Controllers\Api\Admin\Users;

use App\Models\UserModel;
use App\Models\UserProfileModel;
use App\Models\UserBusinessModel;
use App\Models\UserCashModel;
use App\Models\UserMileageModel;
use App\Models\SettingModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class UserController extends ResourceController
{
    protected $modelName = UserModel::class;
    protected $format    = 'json';

    // users 테이블 필드
    private array $userFields = [
        'member_type', 'is_approved', 'grade_code',
        'user_id', 'password', 'name', 'nickname',
        'email', 'email_agree', 'mobile', 'sms_agree',
        'postcode', 'address1', 'address2', 'tel',
        'referrer_id',
    ];

    // user_profiles 테이블 필드
    private array $profileFields = [
        'fax', 'job', 'gender', 'birth_type', 'birthday',
        'marry_yn', 'anniversary', 'interests',
        'privacy_period', 'memo',
    ];

    // user_business 테이블 필드
    private array $bizFields = [
        'biz_name', 'biz_number', 'biz_ceo',
        'biz_type', 'biz_item',
        'biz_postcode', 'biz_address1', 'biz_address2',
        'biz_reg_file',
    ];

    public function index(): ResponseInterface
    {
        $params = $this->request->getGet();
        $result = $this->model->getList($params);

        return $this->respond(['status' => true, 'data' => $result]);
    }

    public function show($id = null): ResponseInterface
    {
        $user = $this->model->getDetail((int)$id);
        if (!$user) return $this->failNotFound('회원을 찾을 수 없습니다.');

        return $this->respond(['status' => true, 'data' => $user]);
    }

    public function create(): ResponseInterface
    {
        $json = $this->request->getJSON(true);

        if ($this->model->existsById($json['user_id'] ?? '')) {
            return $this->fail('이미 사용 중인 아이디입니다.');
        }

        // users 데이터 추출
        $userData = array_intersect_key($json, array_flip($this->userFields));
        $userData['password'] = password_hash($userData['password'], PASSWORD_BCRYPT);
        unset($json['password_confirm']);

        $this->model->insert($userData);
        $userId = $this->model->getInsertID();

        // user_profiles 저장
        $profileData = array_intersect_key($json, array_flip($this->profileFields));
        if (!empty($profileData)) {
            (new UserProfileModel())->saveProfile($userId, $profileData);
        }

        // user_business 저장 (사업자회원만)
        if (($json['member_type'] ?? '') === 'business') {
            $bizData = array_intersect_key($json, array_flip($this->bizFields));
            if (!empty($bizData)) {
                (new UserBusinessModel())->saveBusiness($userId, $bizData);
            }
        }

        return $this->respondCreated([
            'status'  => true,
            'message' => '회원이 등록되었습니다.',
            'data'    => ['id' => $userId],
        ]);
    }

    public function update($id = null): ResponseInterface
    {
        $user = $this->model->find((int)$id);
        if (!$user) return $this->failNotFound('회원을 찾을 수 없습니다.');

        $json = $this->request->getJSON(true);
        unset($json['password_confirm']);

        // users 데이터
        $userData = array_intersect_key($json, array_flip($this->userFields));
        if (!empty($userData['password'])) {
            $userData['password'] = password_hash($userData['password'], PASSWORD_BCRYPT);
        } else {
            unset($userData['password']);
        }
        $this->model->update((int)$id, $userData);

        // user_profiles 저장
        $profileData = array_intersect_key($json, array_flip($this->profileFields));
        if (!empty($profileData)) {
            (new UserProfileModel())->saveProfile((int)$id, $profileData);
        }

        // user_business 저장
        if (($json['member_type'] ?? $user['member_type']) === 'business') {
            $bizData = array_intersect_key($json, array_flip($this->bizFields));
            if (!empty($bizData)) {
                (new UserBusinessModel())->saveBusiness((int)$id, $bizData);
            }
        }

        return $this->respond(['status' => true, 'message' => '수정되었습니다.']);
    }

    public function delete($id = null): ResponseInterface
    {
        if (!$this->model->find((int)$id)) {
            return $this->failNotFound('회원을 찾을 수 없습니다.');
        }
        $this->model->delete((int)$id);

        return $this->respond(['status' => true, 'message' => '삭제되었습니다.']);
    }

    public function checkId(): ResponseInterface
    {
        $userId = $this->request->getGet('user_id');
        if (empty($userId)) return $this->fail('아이디를 입력해주세요.');

        return $this->respond([
            'status' => true,
            'data'   => ['exists' => $this->model->existsById($userId)],
        ]);
    }

    public function checkBizNumber(): ResponseInterface
    {
        $number = $this->request->getGet('number');
        if (empty($number)) return $this->fail('사업자번호를 입력해주세요.');

        $exists = (new UserBusinessModel())->where('biz_number', $number)->countAllResults() > 0;

        return $this->respond(['status' => true, 'data' => ['exists' => $exists]]);
    }

    public function checkReferrer(): ResponseInterface
    {
        $userId = $this->request->getGet('user_id');
        if (empty($userId)) return $this->fail('추천인 아이디를 입력해주세요.');

        return $this->respond([
            'status' => true,
            'data'   => ['exists' => $this->model->where('user_id', $userId)->countAllResults() > 0],
        ]);
    }

    public function grades(): ResponseInterface
    {
        $model = new SettingModel();
        $list  = $model->getByCodePrefix('101001', 9);

        return $this->respond(['status' => true, 'data' => $list]);
    }

    public function interests(): ResponseInterface
    {
        $model = new SettingModel();
        $list  = $model->getByCodePrefix('101002', 9);

        return $this->respond(['status' => true, 'data' => $list]);
    }

    /**
     * 마일리지 이력 조회
     * GET /api/admin/users/:id/mileage
     */
    public function mileageHistory($id = null): ResponseInterface
    {
        $page    = (int)($this->request->getGet('page')     ?? 1);
        $perPage = (int)($this->request->getGet('per_page') ?? 20);

        $result = (new UserMileageModel())->getHistory((int)$id, $page, $perPage);

        return $this->respond(['status' => true, 'data' => $result]);
    }

    /**
     * 마일리지 지급/차감
     * POST /api/admin/users/:id/mileage
     */
    public function mileageAdd($id = null): ResponseInterface
    {
        $json   = $this->request->getJSON(true);
        $amount = (int)($json['amount'] ?? 0);

        if ($amount === 0) return $this->fail('금액을 입력해주세요.');

        $type   = $json['type']   ?? 'admin';
        $reason = $json['reason'] ?? '';

        // 차감 타입이면 음수로
        if (in_array($type, ['use', 'expire']) && $amount > 0) {
            $amount = -$amount;
        }

        $result = (new UserMileageModel())->addMileage((int)$id, $amount, $type, $reason);
        if (!$result) return $this->fail('마일리지가 부족하거나 처리에 실패했습니다.');

        return $this->respond(['status' => true, 'message' => '처리되었습니다.']);
    }

    /**
     * 캐시 이력 조회
     * GET /api/admin/users/:id/cash
     */
    public function cashHistory($id = null): ResponseInterface
    {
        $page    = (int)($this->request->getGet('page')     ?? 1);
        $perPage = (int)($this->request->getGet('per_page') ?? 20);

        $result = (new UserCashModel())->getHistory((int)$id, $page, $perPage);

        return $this->respond(['status' => true, 'data' => $result]);
    }

    /**
     * 캐시 충전/차감
     * POST /api/admin/users/:id/cash
     */
    public function cashAdd($id = null): ResponseInterface
    {
        $json   = $this->request->getJSON(true);
        $amount = (int)($json['amount'] ?? 0);

        if ($amount === 0) return $this->fail('금액을 입력해주세요.');

        $type   = $json['type']   ?? 'admin';
        $reason = $json['reason'] ?? '';

        // 차감 타입이면 음수로
        if (in_array($type, ['use']) && $amount > 0) {
            $amount = -$amount;
        }

        $result = (new UserCashModel())->addCash((int)$id, $amount, $type, $reason);
        if (!$result) return $this->fail('캐시가 부족하거나 처리에 실패했습니다.');

        return $this->respond(['status' => true, 'message' => '처리되었습니다.']);
    }
}