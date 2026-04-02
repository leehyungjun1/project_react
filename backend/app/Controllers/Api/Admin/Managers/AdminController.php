<?php

namespace App\Controllers\Api\Admin\Managers;

use App\Models\Admin\AdminModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class AdminController extends ResourceController
{
    protected $format = 'json';

    // 관리자 목록
    public function index()
    {
        $adminModel = new AdminModel();

        // 필터 파라미터
        $keyword    = $this->request->getGet('keyword');
        $searchType = $this->request->getGet('search_type') ?? 'name';
        $isActive   = $this->request->getGet('is_active');
        $startDate = $this->request->getGet('start_date');
        $endDate   = $this->request->getGet('end_date');
        $dateType  = $this->request->getGet('date_type') ?? 'created_at';
        $adminLevel = $this->request->getGet('admin_level');
        $empType    = $this->request->getGet('emp_type');
        $page       = (int)($this->request->getGet('page') ?? 1);
        $perPage    = (int)($this->request->getGet('per_page') ?? 20);

        $adminModel->where('deleted_at', null);

        $allowed = ['created_at', 'last_login_at'];
        if (!in_array($dateType, $allowed)) {
            $dateType = 'created_at';
        }

        // 키워드 검색
        if ($keyword) {
            $adminModel->groupStart()->like($searchType, $keyword)->groupEnd();
        }

        // 필터
        if ($startDate && $endDate) {
            $adminModel->where("$dateType >=", $startDate . ' 00:00:00')
                ->where("$dateType <=", $endDate . ' 23:59:59');
        } else if ($startDate && !$endDate) {
            $adminModel->where("$dateType >=", $startDate . ' 00:00:00');
        } else if (!$startDate && $endDate) {
            $adminModel->where("$dateType <=", $endDate . ' 23:59:59');
        }

        if ($isActive)   $adminModel->where('is_active', $isActive);
        if ($adminLevel) $adminModel->where('admin_level', $adminLevel);
        if ($empType)    $adminModel->where('emp_type', $empType);

        // 전체 수
        $total = $adminModel->countAllResults(false);

        // 목록
        $list = $adminModel->select('id, admin_id, name, nickname, mobile, email, admin_level, is_active, emp_type, last_login_at, created_at')
            ->orderBy('id', 'DESC')
            ->findAll($perPage, ($page - 1) * $perPage);

        return $this->respond([
            'status' => true,
            'data'   => [
                'list'      => $list,
                'total'     => $total,
                'page'      => $page,
                'per_page'  => $perPage,
                'last_page' => ceil($total / $perPage),
            ],
        ]);
    }

    // 관리자 승인/상태 변경
    public function updateStatus($id)
    {
        $adminModel = new AdminModel();
        $json       = $this->request->getJSON(true);

        $adminModel->update($id, [
            'is_active' => $json['is_active'],
        ]);

        return $this->respond([
            'status'  => true,
            'message' => '상태가 변경되었습니다.',
        ]);
    }

    // 관리자 삭제 (소프트)
    public function delete($id = null)
    {
        $adminModel = new AdminModel();

        $admin = $adminModel->find($id);
        if (!$admin) {
            return $this->respond([
                'status'  => false,
                'message' => '관리자를 찾을 수 없습니다.',
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $adminModel->delete($id);

        return $this->respond([
            'status'  => true,
            'message' => '삭제되었습니다.',
        ]);
    }

    // 관리자 상세 조회
    public function show($id = null)
    {
        $adminModel = new AdminModel();
        $admin      = $adminModel->find($id);

        if (!$admin) {
            return $this->respond([
                'status'  => false,
                'message' => '관리자를 찾을 수 없습니다.',
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        return $this->respond([
            'status' => true,
            'data'   => $admin,
        ]);
    }

    public function store($id = null)
    {
        $json       = $this->request->getJSON(true);
        $adminModel = new AdminModel();

        // ===== 수정 =====
        if ($id) {
            $admin = $adminModel->find($id);
            if (!$admin) {
                return $this->respond([
                    'status'  => false,
                    'message' => '관리자를 찾을 수 없습니다.',
                ], ResponseInterface::HTTP_NOT_FOUND);
            }

            $updateData = [
                'name'        => $json['name']        ?? $admin['name'],
                'nickname'    => $json['nickname']    ?? $admin['nickname'],
                'postcode'    => $json['postcode']    ?? $admin['postcode'],
                'address1'    => $json['address1']    ?? $admin['address1'],
                'address2'    => $json['address2']    ?? $admin['address2'],
                'emp_type'    => $json['emp_type']    ?? $admin['emp_type'],
                'department'  => $json['department']  ?? $admin['department'],
                'position'    => $json['position']    ?? $admin['position'],
                'job_title'   => $json['job_title']   ?? $admin['job_title'],
                'phone'       => $json['phone']       ?? $admin['phone'],
                'phone_ext'   => $json['phone_ext']   ?? $admin['phone_ext'],
                'admin_level' => $json['admin_level'] ?? $admin['admin_level'],
                'is_active'   => $json['is_active']   ?? $admin['is_active'],
            ];

            if (!empty($json['mobile'])) {
                $updateData['mobile'] = $json['mobile'];
            }
            if (!empty($json['email'])) {
                $updateData['email'] = $json['email'];
            }
            // 비밀번호 변경 시
            if (!empty($json['password'])) {
                $updateData['password'] = password_hash($json['password'], PASSWORD_BCRYPT);
            }

            $adminModel->update($id, $updateData);

            return $this->respond([
                'status'  => true,
                'message' => '수정되었습니다.',
            ]);
        }

        // ===== 등록 =====
        $rules = [
            'admin_id' => 'required|min_length[4]|is_unique[admins.admin_id]',
            'password' => 'required|min_length[6]',
            'name'     => 'required|min_length[2]',
            'mobile'   => 'required',
            'email'    => 'required|valid_email',
        ];

        if (!$this->validate($rules, $json)) {
            return $this->respond([
                'status'  => false,
                'message' => $this->validator->getErrors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        if ($adminModel->findByEmailHash($json['email'])) {
            return $this->respond([
                'status'  => false,
                'message' => ['email' => '이미 사용중인 이메일입니다.'],
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        if ($adminModel->findByMobileHash($json['mobile'])) {
            return $this->respond([
                'status'  => false,
                'message' => ['mobile' => '이미 사용중인 연락처입니다.'],
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $adminModel->insert([
            'admin_id'    => $json['admin_id'],
            'password'    => password_hash($json['password'], PASSWORD_BCRYPT),
            'name'        => $json['name'],
            'nickname'    => $json['nickname']   ?? null,
            'mobile'      => $json['mobile'],
            'email'       => $json['email'],
            'postcode'    => $json['postcode']   ?? null,
            'address1'    => $json['address1']   ?? null,
            'address2'    => $json['address2']   ?? null,
            'emp_type'    => $json['emp_type']   ?? null,
            'department'  => $json['department'] ?? null,
            'position'    => $json['position']   ?? null,
            'job_title'   => $json['job_title']  ?? null,
            'phone'       => $json['phone']      ?? null,
            'phone_ext'   => $json['phone_ext']  ?? null,
            'admin_level' => $json['admin_level'] ?? '30',
            'is_active'   => $json['is_active']   ?? '1002',
        ]);

        return $this->respond([
            'status'  => true,
            'message' => '관리자가 등록되었습니다.',
        ], ResponseInterface::HTTP_CREATED);
    }
}