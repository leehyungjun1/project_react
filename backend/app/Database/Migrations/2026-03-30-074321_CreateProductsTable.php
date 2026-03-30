<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateProductsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'          => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'user_id'     => ['type' => 'INT', 'unsigned' => true],                          // 판매자 ID
            'category_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],          // 카테고리 ID
            'title'       => ['type' => 'VARCHAR', 'constraint' => 200],                     // 상품명
            'content'     => ['type' => 'TEXT'],                                             // 상품 설명
            'price'       => ['type' => 'INT', 'unsigned' => true],                          // 가격
            'status'      => ['type' => 'ENUM', 'constraint' => ['sale', 'reserved', 'sold'], 'default' => 'sale'], // 판매상태
            'view_count'  => ['type' => 'INT', 'unsigned' => true, 'default' => 0],          // 조회수
            'created_at'  => ['type' => 'DATETIME', 'null' => true],
            'updated_at'  => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('products');
    }

    public function down()
    {
        $this->forge->dropTable('products');
    }
}
