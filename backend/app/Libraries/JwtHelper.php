<?php

namespace App\Libraries;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtHelper
{
    private static string $algo   = 'HS256';
    private static int    $expire = 60 * 60 * 24; // 24시간

    // .env에서 키 가져오기
    private static function getKey(): string
    {
        return env('jwt.secretKey', 'fallback_secret_key_must_be_32chars!!');
    }

    // 토큰 생성
    public static function generateToken(array $payload): string
    {
        $payload['iat'] = time();                    // 발급 시간
        $payload['exp'] = time() + self::$expire;    // 만료 시간

        return JWT::encode($payload, self::getKey(), self::$algo);
    }

    // 토큰 검증
    public static function validateToken(string $token): object|null
    {
        try {
            return JWT::decode($token, new Key(self::getKey(), self::$algo));
        } catch (\Exception $e) {
            return null;
        }
    }
}