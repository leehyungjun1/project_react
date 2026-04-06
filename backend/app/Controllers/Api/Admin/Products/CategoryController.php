<?php
// app/Controllers/Api/Admin/Products/CategoryController.php

namespace App\Controllers\Api\Admin\Products;

use App\Models\CategoryModel;
use App\Models\Product\CategoryThemeModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class CategoryController extends ResourceController
{
    protected $modelName = CategoryModel::class;
    protected $format    = 'json';
    protected $db;

    public function __construct()
    {
        $this->db = \Config\Database::connect();
    }

    public function index(): ResponseInterface
    {
        return $this->respond(['status' => true, 'data' => $this->model->getList($this->request->getGet())]);
    }

    public function tree(): ResponseInterface
    {
        return $this->respond(['status' => true, 'data' => $this->model->getTree()]);
    }

    public function flat(): ResponseInterface
    {
        return $this->respond(['status' => true, 'data' => $this->model->getFlatList()]);
    }

    public function show($id = null): ResponseInterface
    {
        $category = $this->model->getDetail((int)$id);
        if (!$category) return $this->failNotFound('카테고리를 찾을 수 없습니다.');
        return $this->respond(['status' => true, 'data' => $category]);
    }

    public function create(): ResponseInterface
    {
        $json = $this->request->getJSON(true);
        if (empty($json['name'])) return $this->fail('카테고리명을 입력해주세요.');

        $depth = 0;
        if (!empty($json['parent_id'])) {
            $parent = $this->model->find((int)$json['parent_id']);
            if (!$parent) return $this->fail('상위 카테고리를 찾을 수 없습니다.');
            $depth = ($parent['depth'] ?? 0) + 1;
        }

        $lastOrder = $this->db->table('categories')
            ->where('parent_id', $json['parent_id'] ?? null)
            ->where('deleted_at IS NULL')
            ->orderBy('sort_order', 'DESC')
            ->get()->getRowArray();

        $data = [
            'parent_id'         => !empty($json['parent_id']) ? (int)$json['parent_id'] : null,
            'name'              => $json['name'],
            'slug'              => $this->model->generateSlug($json['name']),
            'description'       => $json['description']       ?? null,
            'depth'             => $depth,
            'sort_order'        => $lastOrder ? $lastOrder['sort_order'] + 1 : 1,
            'category_type'     => $json['category_type']     ?? 'normal',
            'is_pc_show'        => $json['is_pc_show']        ?? 1,
            'is_mobile_show'    => $json['is_mobile_show']    ?? 1,
            'is_active'         => $json['is_active']         ?? 1,
            'pc_image'          => $json['pc_image']          ?? null,
            'mobile_image'      => $json['mobile_image']      ?? null,
            'hover_image'       => $json['hover_image']       ?? null,
            'is_adult'          => $json['is_adult']          ?? 0,
            'access_type'       => $json['access_type']       ?? 'all',
            'access_grade_code' => $json['access_grade_code'] ?? null,
            'display_type'      => $json['display_type']      ?? 'auto',
            'pc_theme_id'       => $json['pc_theme_id']       ?? null,
            'mobile_theme_id'   => $json['mobile_theme_id']   ?? null,
        ];

        $this->model->insert($data);
        $categoryId = $this->model->getInsertID();

        // 추천상품 테마 저장
        if (!empty($json['recommended_themes'])) {
            $this->saveRecommendedThemes($categoryId, $json['recommended_themes']);
        }

        return $this->respondCreated(['status' => true, 'message' => '등록되었습니다.', 'data' => ['id' => $categoryId]]);
    }

    public function update($id = null): ResponseInterface
    {
        $category = $this->model->find((int)$id);
        if (!$category) return $this->failNotFound('카테고리를 찾을 수 없습니다.');

        $json = $this->request->getJSON(true);
        if (empty($json['name'])) return $this->fail('카테고리명을 입력해주세요.');

        $updateFields = [
            'name', 'slug', 'description', 'category_type',
            'is_pc_show', 'is_mobile_show', 'is_active',
            'pc_image', 'mobile_image', 'hover_image',
            'is_adult', 'access_type', 'access_grade_code',
            'display_type', 'pc_theme_id', 'mobile_theme_id', 'sort_order',
        ];

        $data = ['slug' => $this->model->generateSlug($json['name'], (int)$id)];
        foreach ($updateFields as $field) {
            if (isset($json[$field])) $data[$field] = $json[$field];
        }

        $this->model->update((int)$id, $data);

        // 추천상품 테마 저장
        if (isset($json['recommended_themes'])) {
            $this->saveRecommendedThemes((int)$id, $json['recommended_themes']);
        }

        return $this->respond(['status' => true, 'message' => '수정되었습니다.']);
    }

    public function delete($id = null): ResponseInterface
    {
        if (!$this->model->find((int)$id)) return $this->failNotFound('카테고리를 찾을 수 없습니다.');

        $hasChildren = $this->model->where('parent_id', $id)->where('deleted_at IS NULL')->countAllResults() > 0;
        if ($hasChildren) return $this->fail('하위 카테고리가 존재합니다. 먼저 삭제해주세요.');

        $this->model->delete((int)$id);
        return $this->respond(['status' => true, 'message' => '삭제되었습니다.']);
    }

    public function toggle($id = null): ResponseInterface
    {
        $category = $this->model->find((int)$id);
        if (!$category) return $this->failNotFound('카테고리를 찾을 수 없습니다.');
        $this->model->update((int)$id, ['is_active' => $category['is_active'] == 1 ? 0 : 1]);
        return $this->respond(['status' => true, 'message' => '상태가 변경되었습니다.']);
    }

    public function reorder(): ResponseInterface
    {
        $json = $this->request->getJSON(true);
        foreach ($json['items'] as $item) {
            $this->model->update((int)$item['id'], ['sort_order' => $item['sort_order']]);
        }
        return $this->respond(['status' => true, 'message' => '순서가 변경되었습니다.']);
    }

    // 테마 목록
    public function themes(): ResponseInterface
    {
        $deviceType = $this->request->getGet('device_type');
        $list = (new CategoryThemeModel())->getAll($deviceType);
        return $this->respond(['status' => true, 'data' => $list]);
    }

    private function saveRecommendedThemes(int $categoryId, array $themes): void
    {
        $this->db->table('recommended_themes')->where('category_id', $categoryId)->delete();
        foreach ($themes as $theme) {
            $this->db->table('recommended_themes')->insert([
                'category_id'   => $categoryId,
                'device_type'   => $theme['device_type']   ?? 'pc',
                'image'         => $theme['image']         ?? null,
                'product_count' => $theme['product_count'] ?? 10,
                'show_soldout'  => $theme['show_soldout']  ?? 1,
                'show_icon'     => $theme['show_icon']     ?? 1,
                'display_items' => json_encode($theme['display_items'] ?? ['image','name','price']),
                'layout_type'   => $theme['layout_type']  ?? 'gallery',
                'created_at'    => date('Y-m-d H:i:s'),
                'updated_at'    => date('Y-m-d H:i:s'),
            ]);
        }
    }
}