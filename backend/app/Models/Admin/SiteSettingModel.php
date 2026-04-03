<?php

namespace App\Models\Admin;

use CodeIgniter\Model;

class SiteSettingModel extends Model
{
    protected $table      = 'site_settings';
    protected $primaryKey = 'id';

    protected $allowedFields = ['code', 'value'];

    protected $useTimestamps = true;

    // 전체 설정 가져오기 (code => value 형태)
    public function getAll(): array
    {
        $rows = $this->findAll();
        $result = [];
        foreach ($rows as $row) {
            $result[$row['code']] = $row['value'];
        }
        return $result;
    }

    // 설정 저장 (upsert)
    public function saveSetting(string $code, ?string $value): void
    {
        $existing = $this->where('code', $code)->first();
        if ($existing) {
            $this->update($existing['id'], ['value' => $value]);
        } else {
            $this->insert(['code' => $code, 'value' => $value]);
        }
    }
}