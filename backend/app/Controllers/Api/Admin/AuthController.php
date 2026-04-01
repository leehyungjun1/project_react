<?php

namespace App\Controllers\Api\Admin;

use App\Libraries\JwtHelper;
use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class AuthController extends ResourceController
{
    protected $format = 'json'; // 항상 JSON 응답

    // 회원가입
    public function register()
    {
        $json = $this->request->getJSON(true); // 배열로 받기

        $rules = [
            'email'    => 'required|valid_email|is_unique[users.email]',
            'password' => 'required|min_length[6]',
            'nickname' => 'required|min_length[2]',
        ];

        // 유효성 검사 실패
        if (!$this->validate($rules, $json)) {
            return $this->respond([
                'status'  => false,
                'message' => $this->validator->getErrors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $userModel = new UserModel();

        // 비밀번호 암호화 후 저장 (위에서 받은 $json 그대로 사용)
        $userModel->insert([
            'email'    => $json['email'],
            'password' => password_hash($json['password'], PASSWORD_BCRYPT),
            'nickname' => $json['nickname'],
        ]);

        return $this->respond([
            'status'  => true,
            'message' => '회원가입이 완료되었습니다.',
        ], ResponseInterface::HTTP_CREATED);
    }

    // 로그인
    public function login()
    {
        $rules = [
            'email'    => 'required|valid_email',
            'password' => 'required',
        ];

        $json = $this->request->getJSON(true);

        // 유효성 검사 실패
        if (!$this->validate($rules, $json)) {
            return $this->respond([
                'status'  => false,
                'message' => $this->validator->getErrors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $userModel  = new UserModel();
        $user       = $userModel->findByEmail($json['email']);

        // 이메일 없거나 비밀번호 불일치
        if (!$user || !password_verify($json['password'], $user['password'])) {
            return $this->respond([
                'status'  => false,
                'message' => '이메일 또는 비밀번호가 올바르지 않습니다.',
            ], ResponseInterface::HTTP_UNAUTHORIZED);
        }

        // JWT 토큰 생성
        $token = JwtHelper::generateToken([
            'id'       => $user['id'],
            'email'    => $user['email'],
            'nickname' => $user['nickname'],
            'role'     => $user['role'],
        ]);

        return $this->respond([
            'status'  => true,
            'message' => '로그인 성공',
            'token'   => $token,
            'user'    => [
                'id'       => $user['id'],
                'email'    => $user['email'],
                'nickname' => $user['nickname'],
                'role'     => $user['role'],
            ],
        ]);
    }

    // 로그아웃 (프론트에서 토큰 삭제로 처리)
    public function logout()
    {
        return $this->respond([
            'status'  => true,
            'message' => '로그아웃 되었습니다.',
        ]);
    }
}
