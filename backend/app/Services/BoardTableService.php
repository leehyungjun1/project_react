<?php

namespace App\Services;

class BoardTableService
{
    private $forge;
    private $db;

    public function __construct()
    {
        $this->db = \Config\Database::connect();
        $this->forge = \Config\Database::forge();
    }

    public function createTable(string $boardCode): bool
    {
        $tableName = 'board_' . $boardCode;

        if ($this->db->tableExists($tableName)) {
            return true;
        }

        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'board_id' => ['type' => 'INT', 'unsigned' => true],                              // boards.id
            'group_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],              // 그룹 ID (묶음글)
            'parent_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],              // 부모글 ID (답글)
            'depth' => ['type' => 'TINYINT', 'default' => 0],                              // 깊이 (0=원글, 1=답글)
            'order_no' => ['type' => 'INT', 'default' => 0],                                  // 정렬순서
            'header_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],              // 말머리 ID
            'title' => ['type' => 'VARCHAR', 'constraint' => 255],                         // 제목
            'content' => ['type' => 'LONGTEXT', 'null' => true],                             // 내용
            'rating' => ['type' => 'DECIMAL', 'constraint' => '3,1', 'default' => 0],      // 별점
            'writer_type' => ['type' => 'ENUM', 'constraint' => ['guest', 'user', 'admin'], 'default' => 'guest'], // 작성자 타입
            'writer_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],              // 작성자 ID (user_id or admin_id)
            'writer' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],          // 작성자명
            'is_notice' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],           // 공지 여부
            'is_secret' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],           // 비밀글 여부
            'category_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],              // 카테고리 ID
            'is_use' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],           // 사용여부
            'status' => ['type' => 'VARCHAR', 'constraint' => 20, 'default' => 'pending'],  // 상태 (1:1문의: pending/answered)
            'hit' => ['type' => 'INT', 'default' => 0],                                  // 조회수
            'is_main' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],           // 메인 노출 여부
            'ip' => ['type' => 'VARCHAR', 'constraint' => 45, 'null' => true],          // 작성자 IP
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->addKey('board_id');   // 인덱스
        $this->forge->addKey('group_id');   // 인덱스
        $this->forge->addKey('parent_id');  // 인덱스
        $this->forge->createTable($tableName);

        return true;
    }

    // 게시판 테이블 삭제
    public function dropTable(string $boardCode): bool
    {
        $tableName = 'board_' . $boardCode;
        if ($this->db->tableExists($tableName)) {
            $this->forge->dropTable($tableName, true);
        }
        return true;
    }
}
