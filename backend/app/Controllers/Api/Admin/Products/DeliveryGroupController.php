<?php
// app/Controllers/Api/Admin/Products/DeliveryGroupController.php

namespace App\Controllers\Api\Admin\Products;

use App\Models\DeliveryGroupModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class DeliveryGroupController extends ResourceController
{
    protected $modelName = DeliveryGroupModel::class;
    protected $format    = 'json';

    /**
     * 목록 조회
     * GET /api/admin/delivery-groups
     */
    public function index(): ResponseInterface
    {
        $result = $this->model->getList($this->request->getGet());
        return $this->respond(['status' => true, 'data' => $result]);
    }

    /**
     * 셀렉트 옵션용 전체 목록
     * GET /api/admin/delivery-groups/all
     */
    public function all(): ResponseInterface
    {
        $list = $this->model->where('is_active', 1)
            ->orderBy('id', 'ASC')
            ->findAll();
        return $this->respond(['status' => true, 'data' => $list]);
    }

    /**
     * 단건 조회
     * GET /api/admin/delivery-groups/:id
     */
    public function show($id = null): ResponseInterface
    {
        $group = $this->model->getDetail((int)$id);
        if (!$group) return $this->failNotFound('배송비 그룹을 찾을 수 없습니다.');
        return $this->respond(['status' => true, 'data' => $group]);
    }

    /**
     * 등록
     * POST /api/admin/delivery-groups
     */
    public function create(): ResponseInterface
    {
        $json = $this->request->getJSON(true);

        if (empty($json['name'])) {
            return $this->fail('배송비 그룹명을 입력해주세요.');
        }

        $data = [
            'name'           => $json['name'],
            'type'           => $json['type']           ?? 'fixed',
            'base_fee'       => $json['base_fee']       ?? 0,
            'free_threshold' => $json['free_threshold'] ?? 0,
            'jejudo_fee'     => $json['jejudo_fee']     ?? 0,
            'island_fee'     => $json['island_fee']     ?? 0,
            'is_active'      => $json['is_active']      ?? 1,
        ];

        $this->model->insert($data);
        $groupId = $this->model->getInsertID();

        // 구간별 배송비 저장 (range 타입일 때)
        if ($json['type'] === 'range' && !empty($json['ranges'])) {
            $this->model->saveRanges($groupId, $json['ranges']);
        }

        return $this->respondCreated([
            'status'  => true,
            'message' => '배송비 그룹이 등록되었습니다.',
            'data'    => ['id' => $groupId],
        ]);
    }

    /**
     * 수정
     * PUT /api/admin/delivery-groups/:id
     */
    public function update($id = null): ResponseInterface
    {
        $group = $this->model->find((int)$id);
        if (!$group) return $this->failNotFound('배송비 그룹을 찾을 수 없습니다.');

        $json = $this->request->getJSON(true);

        $data = [
            'name'           => $json['name']           ?? $group['name'],
            'type'           => $json['type']           ?? $group['type'],
            'base_fee'       => $json['base_fee']       ?? $group['base_fee'],
            'free_threshold' => $json['free_threshold'] ?? $group['free_threshold'],
            'jejudo_fee'     => $json['jejudo_fee']     ?? $group['jejudo_fee'],
            'island_fee'     => $json['island_fee']     ?? $group['island_fee'],
            'is_active'      => $json['is_active']      ?? $group['is_active'],
        ];

        $this->model->update((int)$id, $data);

        // 구간별 배송비 저장
        if (isset($json['ranges'])) {
            $this->model->saveRanges((int)$id, $json['ranges']);
        }

        return $this->respond(['status' => true, 'message' => '수정되었습니다.']);
    }

    /**
     * 삭제
     * DELETE /api/admin/delivery-groups/:id
     */
    public function delete($id = null): ResponseInterface
    {
        if (!$this->model->find((int)$id)) {
            return $this->failNotFound('배송비 그룹을 찾을 수 없습니다.');
        }

        // 상품에서 사용 중인지 체크
        $inUse = $this->db->table('products')
                ->where('delivery_group_id', $id)
                ->where('deleted_at IS NULL')
                ->countAllResults() > 0;

        if ($inUse) {
            return $this->fail('해당 배송비 그룹을 사용 중인 상품이 있습니다.');
        }

        $this->model->delete((int)$id);
        return $this->respond(['status' => true, 'message' => '삭제되었습니다.']);
    }
}