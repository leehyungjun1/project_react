<?php

namespace App\Controllers\Api\Admin\Settings;

use App\Models\SettingsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class CodeController extends ResourceController
{
    protected $format = 'json';

    // 트리 목록 조회
    public function index()
    {
        $db   = \Config\Database::connect();
        $list = $db->table('settings')
            ->orderBy('parent_id', 'ASC')
            ->orderBy('order_no', 'ASC')
            ->get()
            ->getResultArray();

        // 트리 구조로 변환
        $tree = $this->buildTree($list);

        return $this->respond([
            'status' => true,
            'data'   => $tree,
        ]);
    }

    // 트리 구조 변환
    private function buildTree(array $list, $parentId = null): array
    {
        $tree = [];
        foreach ($list as $item) {
            $itemParentId = $item['parent_id'] === null ? null : (int)$item['parent_id'];
            if ($itemParentId === $parentId) {
                $children = $this->buildTree($list, (int)$item['id']);
                if ($children) {
                    $item['children'] = $children;
                } else {
                    $item['children'] = [];
                }
                $tree[] = $item;
            }
        }
        return $tree;
    }

    // 코드 추가
    public function store()
    {
        $json = $this->request->getJSON(true);
        $db   = \Config\Database::connect();

        $parentId = $json['parent_id'] ?? null;
        $depth    = 0;

        // depth 계산
        if ($parentId) {
            $parent = $db->table('settings')->where('id', $parentId)->get()->getRowArray();
            $depth  = ($parent['depth'] ?? 0) + 1;
        }

        // order_no 계산 (같은 parent 중 마지막)
        $lastOrder = $db->table('settings')
            ->where('parent_id', $parentId)
            ->orderBy('order_no', 'DESC')
            ->get()
            ->getRowArray();
        $orderNo = $lastOrder ? $lastOrder['order_no'] + 1 : 1;

        // 코드값 자동 생성
        $code = $this->generateCode($parentId, $depth);

        $db->table('settings')->insert([
            'parent_id'  => $parentId,
            'group_code' => $json['group_code'] ?? '',
            'code'       => $code,
            'name'       => $json['name'],
            'value'      => $json['value'] ?? null,
            'depth'      => $depth,
            'order_no'   => $orderNo,
            'is_active'  => $json['is_active'] ?? 1,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        return $this->respond([
            'status'  => true,
            'message' => '코드가 추가되었습니다.',
        ], ResponseInterface::HTTP_CREATED);
    }

    // 코드값 자동 생성
    private function generateCode($parentId, $depth): string
    {
        $db = \Config\Database::connect();

        if ($depth === 0) {
            // 최상위: 100, 101, 102 ...
            $last = $db->table('settings')
                ->where('depth', 0)
                ->orderBy('code', 'DESC')
                ->get()
                ->getRowArray();
            return $last ? (string)((int)$last['code'] + 1) : '100';
        }

        // 자식: 부모코드 + 001, 002 ...
        $parent = $db->table('settings')->where('id', $parentId)->get()->getRowArray();
        $siblings = $db->table('settings')
            ->where('parent_id', $parentId)
            ->orderBy('code', 'DESC')
            ->get()
            ->getRowArray();

        if ($siblings) {
            return (string)((int)$siblings['code'] + 1);
        }

        return $parent['code'] . '001';
    }

    // 코드 수정
    public function update($id = null)
    {
        $json = $this->request->getJSON(true);
        $db   = \Config\Database::connect();

        $db->table('settings')->where('id', $id)->update([
            'name'       => $json['name'],
            'value'      => $json['value'] ?? null,
            'is_active'  => $json['is_active'] ?? 1,
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        return $this->respond([
            'status'  => true,
            'message' => '수정되었습니다.',
        ]);
    }

    // 코드 삭제
    public function delete($id = null)
    {
        $db = \Config\Database::connect();

        // 자식 코드도 함께 삭제
        $this->deleteChildren($db, $id);

        $db->table('settings')->where('id', $id)->delete();

        return $this->respond([
            'status'  => true,
            'message' => '삭제되었습니다.',
        ]);
    }

    // 자식 코드 재귀 삭제
    private function deleteChildren($db, $parentId)
    {
        $children = $db->table('settings')->where('parent_id', $parentId)->get()->getResultArray();
        foreach ($children as $child) {
            $this->deleteChildren($db, $child['id']);
            $db->table('settings')->where('id', $child['id'])->delete();
        }
    }

    // 순서 변경
    public function reorder()
    {
        $json = $this->request->getJSON(true);
        $db   = \Config\Database::connect();

        // items: [{id: 1, order_no: 1}, {id: 2, order_no: 2}, ...]
        foreach ($json['items'] as $item) {
            $db->table('settings')->where('id', $item['id'])->update([
                'order_no'   => $item['order_no'],
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
        }

        return $this->respond([
            'status'  => true,
            'message' => '순서가 변경되었습니다.',
        ]);
    }

    // 특정 코드로 시작하는 자식 코드 목록
    public function getByCode($code)
    {
        $db   = \Config\Database::connect();
        $list = $db->table('settings')
            ->like('code', $code, 'after')
            ->where('is_active', 1)
            ->orderBy('order_no', 'ASC')
            ->get()
            ->getResultArray();

        return $this->respond([
            'status' => true,
            'data'   => $list,
        ]);
    }
}