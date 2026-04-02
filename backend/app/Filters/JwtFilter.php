<?php

namespace App\Filters;

use App\Libraries\JwtHelper;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class JwtFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Authorization 헤더에서 토큰 추출
        $header = $request->getHeaderLine('Authorization');

        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return response()->setJSON([
                'status'  => false,
                'message' => '토큰이 없습니다.',
            ])->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
        }

        $token   = substr($header, 7); // "Bearer " 제거
        $decoded = JwtHelper::validateToken($token);

        if (!$decoded) {
            return response()->setJSON([
                'status'  => false,
                'message' => '유효하지 않은 토큰입니다.',
            ])->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
        }

        // 다음 컨트롤러에서 사용할 수 있도록 저장
//        $request->withAttribute('user', $decoded);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // 후처리 없음
    }
}