<?php

namespace App\Controllers\Api;

use App\Models\Admin\PopupModel;
use CodeIgniter\RESTful\ResourceController;

class PopupController extends ResourceController
{
    protected $format = 'json';

    // 활성 팝업 목록
    public function index()
    {
        $model = new PopupModel();
        $now   = date('Y-m-d H:i:s');

        $list = $model->where('is_active', 1)
            ->where('deleted_at', null)
            ->orderBy('order_no', 'ASC')
            ->findAll();

        // 기간 필터링
        $list = array_filter($list, function($popup) use ($now) {
            if ($popup['display_type'] === 'always') return true;
            if ($popup['display_type'] === 'period' || $popup['display_type'] === 'period_time') {
                return $now >= $popup['start_at'] && $now <= $popup['end_at'];
            }
            return true;
        });

        return $this->respond(['status' => true, 'data' => array_values($list)]);
    }

    // 코드로 조회
    public function showByCode($code = null)
    {
        $model = new PopupModel();
        $popup = is_numeric($code)
            ? $model->where('is_active', 1)->find($code)
            : $model->where('is_active', 1)->where('popup_code', $code)->first();

        if (!$popup) {
            return $this->respond(['status' => false, 'message' => '팝업을 찾을 수 없습니다.'], 404);
        }

        return $this->respond(['status' => true, 'data' => $popup]);
    }
}