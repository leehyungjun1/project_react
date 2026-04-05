<?php

namespace App\Controllers\Api\Admin\Users;

use App\Models\UserModel;
use App\Models\SettingModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class UserController extends ResourceController
{
    protected $format    = 'json';
    protected $modelName = UserModel::class;

    /**
     * 목록 조회
     * GET /api/admin/users
     */
    public function index(): \CodeIgniter\HTTP\ResponseInterface
    {
        $params = $this->request->getGet();
        $result = $this->model->getList($params);

        return $this->respond([
            'status' => true,
            'data'   => $result,
        ]);
    }

    /**
     * 단건 조회
     * GET /api/admin/users/:id
     */
    public function show($id = null): ResponseInterface
    {
        $user = $this->model->getDetail($id);
        if (!$user) {
            return $this->failNotFound('회원을 찾을 수 없습니다.');
        }

        if (!empty($user['interests'])) {
            $user['interests'] = json_decode($user['interests'], true) ?? [];
        }

        return $this->respond([
            'status' => true,
            'data'   => $user,
        ]);
    }

    /**
     * 회원 등록
     * POST /api/admin/users/create
     */
    public function create(): \CodeIgniter\HTTP\ResponseInterface
    {
        $json = $this->request->getJSON(true);

        if ($this->model->existsById($json['user_id'] ?? '')) {
            return $this->fail('이미 사용 중인 아이디입니다.');
        }

        if (!empty($json['biz_number']) && $this->model->existsByBizNumber($json['biz_number'])) {
            return $this->fail('이미 등록된 사업자번호입니다.');
        }

        $json['password'] = password_hash($json['password'], PASSWORD_BCRYPT);

        if (isset($json['interests']) && is_array($json['interests'])) {
            $json['interests'] = json_encode($json['interests']);
        }

        unset($json['password_confirm']);

        $this->model->insert($json);

        return $this->respondCreated([
            'status'  => true,
            'message' => '회원이 등록되었습니다.',
            'data'    => ['id' => $this->model->getInsertID()],
        ]);
    }

    /**
     * 회원 수정
     * PUT /api/admin/users/:id
     */
    public function update($id = null): ResponseInterface
    {
        $user = $this->model->find($id);
        if (!$user) {
            return $this->failNotFound('회원을 찾을 수 없습니다.');
        }

        $json = $this->request->getJSON(true);

        if (!empty($json['user_id']) && $this->model->existsById($json['user_id'], $id)) {
            return $this->fail('이미 사용 중인 아이디입니다.');
        }

        if (!empty($json['biz_number']) && $this->model->existsByBizNumber($json['biz_number'], $id)) {
            return $this->fail('이미 등록된 사업자번호입니다.');
        }

        if (!empty($json['password'])) {
            $json['password'] = password_hash($json['password'], PASSWORD_BCRYPT);
        } else {
            unset($json['password']);
        }

        if (isset($json['interests']) && is_array($json['interests'])) {
            $json['interests'] = json_encode($json['interests']);
        }

        unset($json['password_confirm']);

        $this->model->update($id, $json);

        return $this->respond([
            'status'  => true,
            'message' => '수정되었습니다.',
        ]);
    }

    /**
     * 회원 삭제
     * DELETE /api/admin/users/:id
     */
    public function delete($id = null): ResponseInterface
    {
        if (!$this->model->find($id)) {
            return $this->failNotFound('회원을 찾을 수 없습니다.');
        }

        $this->model->delete($id);

        return $this->respond([
            'status'  => true,
            'message' => '삭제되었습니다.',
        ]);
    }

    /**
     * 아이디 중복 확인
     * GET /api/admin/users/check-id?user_id=
     */
    public function checkId(): \CodeIgniter\HTTP\ResponseInterface
    {
        $userId = $this->request->getGet('user_id');
        if (empty($userId)) {
            return $this->fail('아이디를 입력해주세요.');
        }

        return $this->respond([
            'status' => true,
            'data'   => ['exists' => $this->model->existsById($userId)],
        ]);
    }

    /**
     * 사업자번호 중복 확인
     * GET /api/admin/users/check-business-number?number=
     */
    public function checkBizNumber(): \CodeIgniter\HTTP\ResponseInterface
    {
        $number = $this->request->getGet('number');
        if (empty($number)) {
            return $this->fail('사업자번호를 입력해주세요.');
        }

        return $this->respond([
            'status' => true,
            'data'   => ['exists' => $this->model->existsByBizNumber($number)],
        ]);
    }

    /**
     * 추천인 존재 확인
     * GET /api/admin/users/check-referrer?user_id=
     */
    public function checkReferrer(): \CodeIgniter\HTTP\ResponseInterface
    {
        $userId = $this->request->getGet('user_id');
        if (empty($userId)) {
            return $this->fail('추천인 아이디를 입력해주세요.');
        }

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
}