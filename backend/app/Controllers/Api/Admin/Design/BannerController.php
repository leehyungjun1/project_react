<?php

namespace App\Controllers\Api\Admin\Design;

use App\Models\Admin\BannerModel;
use App\Models\Admin\BannerItemModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class BannerController extends ResourceController
{
    protected $format = 'json';

    // 목록
    public function index()
    {
        $bannerModel = new BannerModel();
        //필터 파라미터
        $keyword    = $this->request->getGet('keyword') ?? '';
        $searchType = $this->request->getGet('search_type') ?? 'title';
        $isActive   = $this->request->getGet('is_active');
        $startDate = $this->request->getGet('start_date');
        $endDate   = $this->request->getGet('end_date');
        $dateType  = $this->request->getGet('date_type') ?? 'dated';
        $effect     = $this->request->getGet('effect');
        $page       = (int)($this->request->getGet('page') ?? 1);
        $perPage    = (int)($this->request->getGet('per_page') ?? 20);

        $allowedSearch = ['title'];
        if (!in_array($searchType, $allowedSearch)) {
            $searchType = 'title';
        }

        $allowed = ['dated','created_at'];
        if (!in_array($dateType, $allowed)) {
            $dateType = 'dated';
        }

        $bannerModel->where('deleted_at', null);


        // 필터
        if($dateType == 'dated') {
            if ($startDate && $endDate) {
                // 시작일, 종료일 둘 다 있을 때
                $bannerModel->groupStart()
                    ->groupStart()
                    ->where('start_at <=', $endDate . ' 23:59:59')
                    ->where('end_at >=', $startDate . ' 00:00:00')
                    ->groupEnd()
                    ->orWhere('display_type', 'always')
                    ->groupEnd();
            } else if ($startDate && !$endDate) {
                // 시작일만 있을 때
                $bannerModel->groupStart()
                    ->where('start_at >=', $startDate . ' 00:00:00')
                    ->orWhere('display_type', 'always')
                    ->groupEnd();
            } else if (!$startDate && $endDate) {
                // 종료일만 있을 때
                $bannerModel->groupStart()
                    ->where('end_at <=', $endDate . ' 23:59:59')
                    ->orWhere('display_type', 'always')
                    ->groupEnd();
            }
            // 날짜 없으면 필터 없이 전체
        } else {
            if ($startDate && $endDate) {
                $bannerModel->groupStart()->where("$dateType >=", $startDate . ' 00:00:00')
                    ->where("$dateType <=", $endDate . ' 23:59:59')->groupEnd();
            } else if ($startDate && !$endDate) {
                $bannerModel->where("$dateType >=", $startDate . ' 00:00:00');
            } else if (!$startDate && $endDate) {
                $bannerModel->where("$dateType <=", $endDate . ' 23:59:59');
            }
        }

        if($keyword) {
            $bannerModel->groupStart()->like($searchType, $keyword)->groupEnd();
        }

        if($isActive !== null && $isActive !== '') $bannerModel->where('is_active', $isActive);
        if($effect) $bannerModel->where('effect', $effect);

        $total = $bannerModel->countAllResults(false);
        $list = $bannerModel->orderBy('created_at', 'DESC')->findAll($perPage, ($page-1) * $perPage);

        log_message('debug', (string)$bannerModel->getLastQuery());

        return $this->respond([
            'status' => true,
            'data' => [
                'list' => $list,
                'total' => $total,
                'page' => $page,
                'perPage' => $perPage,
                'lastPage' => ceil($total / $perPage),
            ],
        ]);
    }

    // 상세
    public function show($id = null)
    {
        $model      = new BannerModel();
        $itemModel  = new BannerItemModel();
        $banner     = $model->find($id);

        if (!$banner) {
            return $this->respond(['status' => false, 'message' => '배너를 찾을 수 없습니다.'], ResponseInterface::HTTP_NOT_FOUND);
        }

        $banner['items'] = $itemModel->getByBannerId($id);

        return $this->respond(['status' => true, 'data' => $banner]);
    }

    // 등록
    public function store()
    {
        $json  = $this->request->getJSON(true);
        $model = new BannerModel();

        if (empty($json['title'])) {
            return $this->respond(['status' => false, 'message' => '배너 제목을 입력해 주세요.'], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $bannerId = $model->insert([
            'title'              => $json['title'],
            'banner_code'        => $json['banner_code'] ?? null,
            'device_type'        => $json['device_type']        ?? 'both',
            'effect'             => $json['effect']             ?? 'slide',
            'speed'              => $json['speed']              ?? 'normal',
            'interval'           => $json['interval']           ?? 3,
            'show_arrow'         => $json['show_arrow']         ?? 1,
            'arrow_color'        => $json['arrow_color']        ?? '#ffffff',
            'arrow_size'         => $json['arrow_size'] ?? 40,
            'show_nav'           => $json['show_nav']           ?? 1,
            'nav_type'           => $json['nav_type']           ?? 'dot',
            'nav_active_color'   => $json['nav_active_color']   ?? '#ffffff',
            'nav_inactive_color' => $json['nav_inactive_color'] ?? '#ffffff',
            'nav_size'           => $json['nav_size']           ?? 'sm',
            'banner_width'       => $json['banner_width']       ?? 600,
            'banner_height'      => $json['banner_height']      ?? 384,
            'width_unit'         => $json['width_unit']         ?? 'px',
            'display_type'       => $json['display_type']       ?? 'always',
            'start_at'           => $json['start_at']           ?? null,
            'end_at'             => $json['end_at']             ?? null,
            'is_active'          => $json['is_active']          ?? 1,
        ], true);

        // 배너 아이템 저장
        if (!empty($json['items'])) {
            $this->saveItems($bannerId, $json['items']);
        }

        return $this->respond(['status' => true, 'message' => '등록되었습니다.'], ResponseInterface::HTTP_CREATED);
    }

    // 수정
    public function update($id = null)
    {
        $json  = $this->request->getJSON(true);
        $model = new BannerModel();

        $banner = $model->find($id);
        if (!$banner) {
            return $this->respond(['status' => false, 'message' => '배너를 찾을 수 없습니다.'], ResponseInterface::HTTP_NOT_FOUND);
        }

        $model->update($id, [
            'title'              => $json['title']              ?? $banner['title'],
            'banner_code'        => $json['banner_code']        ?? $banner['banner_code'],
            'device_type'        => $json['device_type']        ?? $banner['device_type'],
            'effect'             => $json['effect']             ?? $banner['effect'],
            'speed'              => $json['speed']              ?? $banner['speed'],
            'interval'           => $json['interval']           ?? $banner['interval'],
            'show_arrow'         => $json['show_arrow']         ?? $banner['show_arrow'],
            'arrow_color'        => $json['arrow_color']        ?? $banner['arrow_color'],
            'arrow_size'         => $json['arrow_size'] ?? 40,
            'show_nav'           => $json['show_nav']           ?? $banner['show_nav'],
            'nav_type'           => $json['nav_type']           ?? $banner['nav_type'],
            'nav_active_color'   => $json['nav_active_color']   ?? $banner['nav_active_color'],
            'nav_inactive_color' => $json['nav_inactive_color'] ?? $banner['nav_inactive_color'],
            'nav_size'           => $json['nav_size']           ?? $banner['nav_size'],
            'banner_width'       => $json['banner_width']       ?? $banner['banner_width'],
            'banner_height'      => $json['banner_height']      ?? $banner['banner_height'],
            'width_unit'         => $json['width_unit']         ?? $banner['width_unit'],
            'display_type'       => $json['display_type']       ?? $banner['display_type'],
            'start_at'           => $json['start_at']           ?? $banner['start_at'],
            'end_at'             => $json['end_at']             ?? $banner['end_at'],
            'is_active'          => $json['is_active']          ?? $banner['is_active'],
        ]);

        // 배너 아이템 저장
        if (isset($json['items'])) {
            $this->saveItems($id, $json['items']);
        }

        return $this->respond(['status' => true, 'message' => '수정되었습니다.']);
    }

    // 삭제
    public function delete($id = null)
    {
        $model  = new BannerModel();
        $banner = $model->find($id);

        if (!$banner) {
            return $this->respond(['status' => false, 'message' => '배너를 찾을 수 없습니다.'], ResponseInterface::HTTP_NOT_FOUND);
        }

        $model->delete($id);

        return $this->respond(['status' => true, 'message' => '삭제되었습니다.']);
    }

    // 이미지 업로드
    public function uploadImage($id = null)
    {
        $file       = $this->request->getFile('image');
        $uploadPath = FCPATH . 'uploads/banners/';

        if (!is_dir($uploadPath)) mkdir($uploadPath, 0755, true);

        if (!$file || !$file->isValid()) {
            return $this->respond(['status' => false, 'message' => '파일이 없습니다.'], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $savedName = $file->getRandomName();
        $file->move($uploadPath, $savedName);

        return $this->respond([
            'status' => true,
            'data'   => ['path' => 'uploads/banners/' . $savedName],
        ]);
    }

    // 아이템 저장 (공통)
    private function saveItems(int $bannerId, array $items): void
    {
        $itemModel = new BannerItemModel();
        $db        = \Config\Database::connect();

        // 기존 아이템 삭제
        $db->table('banner_items')->where('banner_id', $bannerId)->delete();

        foreach ($items as $index => $item) {
            $itemModel->insert([
                'banner_id'    => $bannerId,
                'image_path'   => $item['image_path']  ?? null,
                'link_url'     => $item['link_url']     ?? null,
                'link_target'  => $item['link_target']  ?? '_self',
                'description'  => $item['description']  ?? null,
                'display_type' => $item['display_type'] ?? 'always',
                'start_at'     => $item['start_at']     ?? null,
                'end_at'       => $item['end_at']       ?? null,
                'is_active'    => $item['is_active']    ?? 1,
                'order_no'     => $index,
            ]);
        }
    }
}