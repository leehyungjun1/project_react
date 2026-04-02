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

        더 보기
오후 6:17
author_password, thumbnail, event_start_at, event_end_at, rating_count, comment_count, file_count 필드들이 빠져 있네요!

    BoardTableService.php 수정:

php
$this->forge->addField([
    'id'              => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
    'board_id'        => ['type' => 'INT', 'unsigned' => true],
    'group_id'        => ['type' => 'INT', 'unsigned' => true, 'null' => true],
    'parent_id'       => ['type' => 'INT', 'unsigned' => true, 'null' => true],
    'depth'           => ['type' => 'TINYINT', 'default' => 0],
    'order_no'        => ['type' => 'INT', 'default' => 0],
    'header_id'       => ['type' => 'INT', 'unsigned' => true, 'null' => true],
    'writer_type'     => ['type' => 'ENUM', 'constraint' => ['guest', 'user', 'admin'], 'default' => 'guest'],
    'writer_id'       => ['type' => 'INT', 'unsigned' => true, 'null' => true],
    'writer'          => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
    'author_password' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
    'title'           => ['type' => 'VARCHAR', 'constraint' => 255],
    'content'         => ['type' => 'LONGTEXT', 'null' => true],
    'category_id'     => ['type' => 'INT', 'unsigned' => true, 'null' => true],
    'is_notice'       => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
    'is_secret'       => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
    'is_main'         => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
    'is_use'          => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
    'status'          => ['type' => 'VARCHAR', 'constraint' => 20, 'default' => 'normal'],
    'rating'          => ['type' => 'DECIMAL', 'constraint' => '3,1', 'default' => 0],
    'rating_count'    => ['type' => 'INT', 'default' => 0],
    'comment_count'   => ['type' => 'INT', 'default' => 0],
    'file_count'      => ['type' => 'INT', 'default' => 0],
    'hit'             => ['type' => 'INT', 'default' => 0],
    'thumbnail'       => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
    'event_start_at'  => ['type' => 'DATETIME', 'null' => true],
    'event_end_at'    => ['type' => 'DATETIME', 'null' => true],
    'ip'              => ['type' => 'VARCHAR', 'constraint' => 45, 'null' => true],
    'created_at'      => ['type' => 'DATETIME', 'null' => true],
    'updated_at'      => ['type' => 'DATETIME', 'null' => true],
    'deleted_at'      => ['type' => 'DATETIME', 'null' => true],
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
