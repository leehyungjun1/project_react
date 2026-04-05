<?php
namespace App\Models;

use CodeIgniter\Model;

class SettingModel extends Model
{
    protected $table      = 'settings';
    protected $primaryKey = 'id';
    protected $useTimestamps = true;

    protected $allowedFields = [
        'parent_id', 'group_code', 'code', 'name',
        'value', 'depth', 'order_no', 'is_active',
    ];

    /**
     * 특정 code로 시작하는 하위 목록
     * ex) getByCodePrefix('101001', 9) → 등급 목록
     */
    public function getByCodePrefix(string $codePrefix, int $length = 9): array
    {
        return $this->like('code', $codePrefix, 'after')
            ->where('LENGTH(code)', $length)
            ->where('is_active', 1)
            ->orderBy('order_no', 'ASC')
            ->findAll();
    }

    /**
     * 트리 구조 전체 조회
     */
    public function getTree(): array
    {
        $list = $this->orderBy('parent_id', 'ASC')
            ->orderBy('order_no', 'ASC')
            ->findAll();
        return $this->buildTree($list);
    }

    private function buildTree(array $list, $parentId = null): array
    {
        $tree = [];
        foreach ($list as $item) {
            $itemParentId = $item['parent_id'] === null ? null : (int)$item['parent_id'];
            if ($itemParentId === $parentId) {
                $item['children'] = $this->buildTree($list, (int)$item['id']);
                $tree[] = $item;
            }
        }
        return $tree;
    }
}