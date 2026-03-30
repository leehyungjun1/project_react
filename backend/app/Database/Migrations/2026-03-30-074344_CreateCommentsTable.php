<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateCommentsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'         => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'user_id'    => ['type' => 'INT', 'unsigned' => true],                           // 작성자 ID
            'post_id'    => ['type' => 'INT', 'unsigned' => true, 'null' => true],           // 게시글 댓글인 경우
            'product_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],           // 상품 댓글인 경우
            'content'    => ['type' => 'TEXT'],                                              // 댓글 내용
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('comments');
    }

    public function down()
    {
        $this->forge->dropTable('comments');
    }
}
