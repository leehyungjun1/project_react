<?php

namespace App\Controllers\Api;

use App\Models\Admin\BannerModel;
use App\Models\Admin\BannerItemModel;
use CodeIgniter\RESTful\ResourceController;

class BannerController extends ResourceController
{
    protected $format = 'json';

    public function showByCode($code = null)
    {
        $model     = new BannerModel();
        $itemModel = new BannerItemModel();

        // 숫자면 ID로, 문자면 코드로 조회
        $banner = is_numeric($code)
            ? $model->where('is_active', 1)->find($code)
            : $model->where('is_active', 1)->where('banner_code', $code)->first();

        if (!$banner) {
            return $this->respond([
                'status'  => false,
                'message' => '배너를 찾을 수 없습니다.',
            ], 404);
        }

        // 노출 기간 체크
        if ($banner['display_type'] === 'period') {
            $now = date('Y-m-d H:i:s');
            if ($now < $banner['start_at'] || $now > $banner['end_at']) {
                return $this->respond([
                    'status'  => false,
                    'message' => '노출 기간이 아닙니다.',
                ], 404);
            }
        }

        $banner['items'] = $itemModel->getByBannerId($banner['id']);

        return $this->respond([
            'status' => true,
            'data'   => $banner,
        ]);
    }
}