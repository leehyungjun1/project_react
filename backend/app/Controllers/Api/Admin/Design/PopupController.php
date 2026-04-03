<?php

namespace App\Controllers\Api\Admin\Design;

use App\Models\Admin\PopupModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class PopupController extends ResourceController
{
    protected $format = 'json';

    public function index()
    {
        $model = new PopupModel();
        $list  = $model->where('deleted_at', null)->orderBy('order_no', 'ASC')->findAll();
        return $this->respond(['status' => true, 'data' => $list]);
    }

    public function show($id = null)
    {
        $model = new PopupModel();
        $popup = $model->find($id);
        if (!$popup) {
            return $this->respond(['status' => false, 'message' => '팝업을 찾을 수 없습니다.'], ResponseInterface::HTTP_NOT_FOUND);
        }
        return $this->respond(['status' => true, 'data' => $popup]);
    }

    public function store()
    {
        $json  = $this->request->getJSON(true);
        $model = new PopupModel();

        if (empty($json['title'])) {
            return $this->respond(['status' => false, 'message' => '팝업 제목을 입력해 주세요.'], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $model->insert([
            'popup_code'   => $json['popup_code']   ?? null,
            'title'        => $json['title'],
            'content'      => $json['content']      ?? null,
            'popup_type'   => $json['popup_type']   ?? 'fixed',
            'width'        => $json['width']         ?? 400,
            'height'       => $json['height']        ?? 500,
            'pos_type'     => $json['pos_type']      ?? 'center',
            'pos_top'      => $json['pos_top']       ?? 0,
            'pos_left'     => $json['pos_left']      ?? 0,
            'display_type' => $json['display_type']  ?? 'always',
            'start_at'     => $json['start_at']      ?? null,
            'end_at'       => $json['end_at']        ?? null,
            'hide_today'   => $json['hide_today']    ?? 1,
            'is_active'    => $json['is_active']     ?? 1,
            'order_no'     => $json['order_no']      ?? 0,
        ]);

        return $this->respond(['status' => true, 'message' => '등록되었습니다.'], ResponseInterface::HTTP_CREATED);
    }

    public function update($id = null)
    {
        $json  = $this->request->getJSON(true);
        $model = new PopupModel();
        $popup = $model->find($id);

        if (!$popup) {
            return $this->respond(['status' => false, 'message' => '팝업을 찾을 수 없습니다.'], ResponseInterface::HTTP_NOT_FOUND);
        }

        $model->update($id, [
            'title'        => $json['title']        ?? $popup['title'],
            'content'      => $json['content']      ?? $popup['content'],
            'popup_type'   => $json['popup_type']   ?? $popup['popup_type'],
            'width'        => $json['width']         ?? $popup['width'],
            'height'       => $json['height']        ?? $popup['height'],
            'pos_type'     => $json['pos_type']      ?? $popup['pos_type'],
            'pos_top'      => $json['pos_top']       ?? $popup['pos_top'],
            'pos_left'     => $json['pos_left']      ?? $popup['pos_left'],
            'display_type' => $json['display_type']  ?? $popup['display_type'],
            'start_at'     => $json['start_at']      ?? $popup['start_at'],
            'end_at'       => $json['end_at']        ?? $popup['end_at'],
            'hide_today'   => $json['hide_today']    ?? $popup['hide_today'],
            'is_active'    => $json['is_active']     ?? $popup['is_active'],
            'order_no'     => $json['order_no']      ?? $popup['order_no'],
        ]);

        return $this->respond(['status' => true, 'message' => '수정되었습니다.']);
    }

    public function delete($id = null)
    {
        $model = new PopupModel();
        $popup = $model->find($id);
        if (!$popup) {
            return $this->respond(['status' => false, 'message' => '팝업을 찾을 수 없습니다.'], ResponseInterface::HTTP_NOT_FOUND);
        }
        $model->delete($id);
        return $this->respond(['status' => true, 'message' => '삭제되었습니다.']);
    }
}