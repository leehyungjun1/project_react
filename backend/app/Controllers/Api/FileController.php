<?php

namespace App\Controllers\Api;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class FileController extends ResourceController
{
    protected $format = 'json';

    public function upload()
    {
        $file     = $this->request->getFile('file');
        $folder   = $this->request->getPost('folder') ?? 'common'; // 저장 폴더

        if (!$file || !$file->isValid()) {
            return $this->respond([
                'status'  => false,
                'message' => '파일이 없습니다.',
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $originalName = $file->getClientName();
        $fileSize     = $file->getSize();
        $fileType     = $file->getMimeType();
        $savedName    = $file->getRandomName();

        $uploadPath = FCPATH . 'uploads/' . $folder . '/';
        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        $file->move($uploadPath, $savedName);
        $filePath = 'uploads/' . $folder . '/' . $savedName;

        return $this->respond([
            'status' => true,
            'data'   => [
                'path'          => $filePath,
                'original_name' => $originalName,
                'file_size'     => $fileSize,
                'file_type'     => $fileType,
            ],
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