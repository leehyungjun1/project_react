<?php
// app/Models/DeliveryGroupModel.php

namespace App\Models;

use CodeIgniter\Model;

class DeliveryGroupModel extends Model
{
    protected $table         = 'delivery_groups';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;

    protected $allowedFields = [
        'name', 'type', 'base_fee', 'free_threshold',
        'jejudo_fee', 'island_fee', 'is_active',
    ];

    public function getList(array $params): array
    {
        $perPage = (int)($params['per_page'] ?? 20);
        $page    = (int)($params['page']     ?? 1);
        $offset  = ($page - 1) * $perPage;

        $builder = $this->db->table('delivery_groups');

        if (!empty($params['keyword'])) {
            $builder->like('name', $params['keyword']);
        }

        if (isset($params['type']) && $params['type'] !== '') {
            $builder->where('type', $params['type']);
        }

        if (isset($params['is_active']) && $params['is_active'] !== '') {
            $builder->where('is_active', $params['is_active']);
        }

        $total = $builder->countAllResults(false);
        $list  = $builder->orderBy('id', 'DESC')
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
        $group = $this->find($id);
        if (!$group) return null;

        // 구간별 배송비 조회 (range 타입)
        $group['ranges'] = $this->db->table('delivery_ranges')
            ->where('delivery_group_id', $id)
            ->orderBy('min_amount', 'ASC')
            ->get()
            ->getResultArray();

        return $group;
    }

    public function saveRanges(int $groupId, array $ranges): void
    {
        // 기존 구간 삭제 후 재등록
        $this->db->table('delivery_ranges')
            ->where('delivery_group_id', $groupId)
            ->delete();

        foreach ($ranges as $range) {
            $this->db->table('delivery_ranges')->insert([
                'delivery_group_id' => $groupId,
                'min_amount'        => $range['min_amount'] ?? 0,
                'max_amount'        => $range['max_amount'] ?? 0,
                'fee'               => $range['fee']        ?? 0,
            ]);
        }
    }
}