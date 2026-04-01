<?php

namespace App\Libraries;

class CryptoHelper
{
    private static string $algo   = 'AES-256-CBC';
    private static string $envKey = 'encryption.key';

    // 암호화 키 가져오기
    private static function getKey(): string
    {
        $key = env(self::$envKey);
        if (!$key) {
            throw new \RuntimeException('암호화 키가 설정되지 않았습니다.');
        }
        // hex2bin 처리
        if (strpos($key, 'hex2bin:') === 0) {
            $key = hex2bin(substr($key, 8));
        }
        return $key;
    }

    // IV 생성
    private static function getIv(): string
    {
        return substr(self::getKey(), 0, 16);
    }

    // 암호화
    public static function encrypt(string $value): string
    {
        // openssl_encrypt가 이미 base64로 반환하므로 추가 인코딩 불필요
        return openssl_encrypt(
            $value,
            self::$algo,
            self::getKey(),
            0,
            self::getIv()
        );
    }

// 복호화
    public static function decrypt(string $value): string
    {
        $result = openssl_decrypt(
            $value,
            self::$algo,
            self::getKey(),
            0,
            self::getIv()
        );

        return $result !== false ? $result : '';
    }

    // 해시 (중복체크용)
    public static function hash(string $value): string
    {
        return hash('sha256', $value . env(self::$envKey));
    }
}