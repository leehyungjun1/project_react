<?php

namespace App\Controllers\Api\Admin\Settings;

use App\Models\Admin\SiteSettingModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class SiteSettingController extends ResourceController
{
    protected $format = 'json';

    // 설정 조회
    public function index()
    {
        $model    = new SiteSettingModel();
        $settings = $model->getAll();

        return $this->respond([
            'status' => true,
            'data'   => $settings,
        ]);
    }

    // 설정 저장
    public function store()
    {
        $json  = $this->request->getJSON(true);
        $model = new SiteSettingModel();

        $fields = [
            // 홈페이지 기본 정보
            'site_name', 'site_name_en', 'site_title', 'site_favicon',
            // 회사 정보
            'company_name', 'company_reg_no', 'company_ceo',
            'company_business_type', 'company_business_item',
            'company_email', 'company_address', 'company_tel', 'company_fax',
            // 고객센터
            'cs_tel1', 'cs_tel2', 'cs_fax', 'cs_email', 'cs_hours',
        ];

        foreach ($fields as $field) {
            if (array_key_exists($field, $json)) {
                $model->saveSetting($field, $json[$field] ?? null);
            }
        }

        return $this->respond([
            'status'  => true,
            'message' => '저장되었습니다.',
        ]);
    }

    // 파일 업로드 (로고, 파비콘)
    public function uploadFile()
    {
        $file     = $this->request->getFile('file');
        $type     = $this->request->getPost('type');

        if (!$file || !$file->isValid()) {
            return $this->respond([
                'status'  => false,
                'message' => '파일이 없습니다.',
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $uploadPath = FCPATH . 'uploads/site/';
        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        // 기존 파일 삭제
        $model    = new SiteSettingModel();
        $settings = $model->getAll();
        $oldFile  = $settings[$type] ?? null;
        if ($oldFile && file_exists(FCPATH . ltrim($oldFile, '/'))) {
            unlink(FCPATH . ltrim($oldFile, '/'));
        }

        $savedName = $type . '.' . $file->getClientExtension();
        $file->move($uploadPath, $savedName, true);

        $filePath = 'uploads/site/' . $savedName;
        $model->saveSetting($type, $filePath);

        return $this->respond([
            'status' => true,
            'data'   => ['path' => $filePath],
        ]);
    }


}