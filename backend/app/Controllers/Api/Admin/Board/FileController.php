<?php

namespace App\Controllers\Api\Admin\Board;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class FileController extends ResourceController
{
    protected $format = 'json';

    // 파일 업로드
    public function upload($boardCode = null)
    {
        $files = $this->request->getFiles();

        if (empty($files['files'])) {
            return $this->respond([
                'status'  => false,
                'message' => '파일이 없습니다.',
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $uploadedFiles = [];
        $uploadPath    = FCPATH . 'uploads/boards/' . $boardCode . '/';

        // 업로드 폴더 생성
        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        foreach ($files['files'] as $file) {
            if (!$file->isValid()) continue;

            $originalName = $file->getClientName();
            $savedName    = $file->getRandomName();;
            $fileSize     = $file->getSize();
            $fileType     = $file->getMimeType();

            $file->move($uploadPath, $savedName);

            $uploadedFiles[] = [
                'original_name' => $originalName,
                'saved_name'    => $savedName,
                'file_path'     => 'uploads/boards/' . $boardCode . '/' . $savedName,
                'file_size'     => $fileSize,
                'file_type'     => $fileType,
            ];
        }

        return $this->respond([
            'status' => true,
            'data'   => $uploadedFiles,
        ], ResponseInterface::HTTP_CREATED);
    }

    // 파일 삭제
    public function delete($boardCode = null, $savedName = null)
    {
        $filePath = FCPATH . 'uploads/boards/' . $boardCode . '/' . $savedName;

        if (file_exists($filePath)) {
            unlink($filePath);
        }

        return $this->respond([
            'status'  => true,
            'message' => '삭제되었습니다.',
        ]);
    }
}