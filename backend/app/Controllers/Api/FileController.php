<?php

namespace App\Controllers\Api;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class FileController extends ResourceController
{
    protected $format = 'json';

    public function upload()
    {
        $file       = $this->request->getFile('file');
        $folder     = $this->request->getPost('folder')     ?? 'common';
        $imageType  = $this->request->getPost('image_type') ?? null;
        $autoResize = $this->request->getPost('auto_resize') ?? 0;

        if (!$file || !$file->isValid()) {
            return $this->respond([
                'status'  => false,
                'message' => '파일이 없습니다.',
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $fileType  = $file->getMimeType();
        $savedName = $file->getRandomName();
        $uploadPath = FCPATH . 'uploads/' . $folder . '/';

        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        $file->move($uploadPath, $savedName);
        $originalPath = 'uploads/' . $folder . '/' . $savedName;

        $result = [
            'path'          => $originalPath,
            'original_name' => $file->getClientName(),
            'file_size'     => $file->getSize(),
            'file_type'     => $fileType,
        ];

        // ── 자동 리사이즈 처리 ─────────────────────────────
        if ($autoResize && str_starts_with($fileType, 'image/')) {
            $sizeMap   = (new \App\Models\Product\ProductImageSizesModel())->getSizeMap();
            $resized   = [];

            foreach ($sizeMap as $type => $size) {
                if ($type === 'original') continue; // 원본은 스킵

                $width  = (int)$size['width'];
                $height = (int)$size['height'];

                // 둘 다 0이면 리사이즈 안 함
                if ($width === 0 && $height === 0) continue;

                // 타입별 파일명 생성
                $resizedName = pathinfo($savedName, PATHINFO_FILENAME) . "_{$type}." . pathinfo($savedName, PATHINFO_EXTENSION);
                $resizedPath = $uploadPath . $resizedName;

                try {
                    $image = \Config\Services::image()
                        ->withFile($uploadPath . $savedName);

                    $origW = $image->getWidth();
                    $origH = $image->getHeight();

                    // 0이면 비율에 맞게 계산
                    if ($width === 0)  $width  = (int)round($origW * $height / $origH);
                    if ($height === 0) $height = (int)round($origH * $width  / $origW);

                    $image->resize($width, $height, true)
                        ->save($resizedPath);

                    $resized[$type] = 'uploads/' . $folder . '/' . $resizedName;
                } catch (\Throwable $e) {
                    log_message('error', "이미지 리사이즈 실패 [{$type}]: " . $e->getMessage());
                }
            }

            $result['resized'] = $resized;
        }

        return $this->respond([
            'status' => true,
            'data'   => $result,
        ]);
    }

    public function delete($id = null)
    {
        $json     = $this->request->getJSON(true);
        $filePath = $json['path'] ?? null;

        if (!$filePath) {
            return $this->respond(['status' => false, 'message' => '파일 경로가 없습니다.'], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $fullPath = FCPATH . ltrim($filePath, '/');
        if (file_exists($fullPath)) {
            unlink($fullPath);
        }

        return $this->respond(['status' => true, 'message' => '삭제되었습니다.']);
    }
}