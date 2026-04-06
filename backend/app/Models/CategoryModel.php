<?php
// app/Models/CategoryModel.php

namespace App\Models;

use CodeIgniter\Model;

class CategoryModel extends Model
{
    protected $table          = 'categories';
    protected $primaryKey     = 'id';
    protected $useTimestamps  = true;
    protected $useSoftDeletes = true;
    protected $deletedField   = 'deleted_at';

    protected $allowedFields = [
        'parent_id', 'name', 'slug', 'description',
        'depth', 'sort_order', 'category_type',
        'is_pc_show', 'is_mobile_show', 'is_active',
        'pc_image', 'mobile_image', 'hover_image',
        'is_adult', 'access_type', 'access_grade_code',
        'display_type', 'pc_theme_id', 'mobile_theme_id',
    ];

    public function getTree(): array
    {
        $list = $this->db->table('categories c')
            ->select('c.*, t1.name as pc_theme_name, t2.name as mobile_theme_name')
            ->join('category_themes t1', 't1.id = c.pc_theme_id',     'left')
            ->join('category_themes t2', 't2.id = c.mobile_theme_id', 'left')
            ->where('c.deleted_at IS NULL')
            ->orderBy('c.sort_order', 'ASC')
            ->get()
            ->getResultArray();

        return $this->buildTree($list);
    }

    public function getFlatList(): array
    {
        $list = $this->where('is_active', 1)
            ->where('deleted_at IS NULL')
            ->orderBy('depth',      'ASC')
            ->orderBy('sort_order', 'ASC')
            ->findAll();

        return array_map(function($item) {
            return [
                'id'    => $item['id'],
                'name'  => str_repeat('ㄴ ', $item['depth']) . $item['name'],
                'depth' => $item['depth'],
            ];
        }, $list);
    }

    public function getList(array $params): array
    {
        $perPage = (int)($params['per_page'] ?? 20);
        $page    = (int)($params['page']     ?? 1);
        $offset  = ($page - 1) * $perPage;

        $builder = $this->db->table('categories c')
            ->select('c.*, p.name as parent_name, t1.name as pc_theme_name, t2.name as mobile_theme_name')
            ->join('categories c2',     'c2.id = c.parent_id',      'left')
            ->join('category_themes t1','t1.id = c.pc_theme_id',    'left')
            ->join('category_themes t2','t2.id = c.mobile_theme_id','left')
            ->join('categories p',      'p.id = c.parent_id',       'left')
            ->where('c.deleted_at IS NULL');

        if (!empty($params['keyword'])) {
            $builder->like('c.name', $params['keyword']);
        }
        if (isset($params['is_active']) && $params['is_active'] !== '') {
            $builder->where('c.is_active', $params['is_active']);
        }
        if (isset($params['depth']) && $params['depth'] !== '') {
            $builder->where('c.depth', $params['depth']);
        }
        if (!empty($params['category_type'])) {
            $builder->where('c.category_type', $params['category_type']);
        }

        $total = $builder->countAllResults(false);
        $list  = $builder->orderBy('c.depth',      'ASC')
            ->orderBy('c.sort_order', 'ASC')
            ->limit($perPage, $offset)
            ->get()
            ->getResultArray();

        return [
            'list'     => $list,
            'total'    => $total,
            'lastPage' => (int)ceil($total / $perPage),
            'page'     => $page,
            'per_page' => $perPage,
        ];
    }

    public function getDetail(int $id): ?array
    {
        $category = $this->db->table('categories c')
            ->select('c.*, t1.name as pc_theme_name, t2.name as mobile_theme_name')
            ->join('category_themes t1', 't1.id = c.pc_theme_id',     'left')
            ->join('category_themes t2', 't2.id = c.mobile_theme_id', 'left')
            ->where('c.id', $id)
            ->where('c.deleted_at IS NULL')
            ->get()
            ->getRowArray();

        if (!$category) return null;

        // 추천상품 테마 조회
        $category['recommended_themes'] = $this->db->table('recommended_themes')
            ->where('category_id', $id)
            ->get()
            ->getResultArray();

        // display_items JSON 디코딩
        foreach ($category['recommended_themes'] as &$theme) {
            if (!empty($theme['display_items'])) {
                $theme['display_items'] = json_decode($theme['display_items'], true) ?? [];
            }
        }

        return $category;
    }

    public function generateSlug(string $name, ?int $excludeId = null): string
    {
        $slug    = strtolower(preg_replace('/[^a-zA-Z0-9]/', '-', $name));
        $slug    = preg_replace('/-+/', '-', trim($slug, '-'));
        $builder = $this->where('slug', $slug);
        if ($excludeId) $builder->where('id !=', $excludeId);
        return $builder->countAllResults() > 0 ? $slug . '-' . time() : $slug;
    }

    private function buildTree(array $list, $parentId = null): array
    {
        $tree = [];
        foreach ($list as $item) {
            $itemParentId = (empty($item['parent_id']) || $item['parent_id'] == 0)
                ? null
                : (int)$item['parent_id'];

            if ($itemParentId === $parentId) {
                $item['children'] = $this->buildTree($list, (int)$item['id']);
                $tree[] = $item;
            }
        }
        return $tree;
    }
}