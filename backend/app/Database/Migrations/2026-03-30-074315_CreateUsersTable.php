<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUsersTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'          => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'email'       => ['type' => 'VARCHAR', 'constraint' => 100, 'unique' => true],  // 로그인 이메일
            'password'    => ['type' => 'VARCHAR', 'constraint' => 255],                    // bcrypt 암호화
            'nickname'    => ['type' => 'VARCHAR', 'constraint' => 50],                     // 표시 이름
            'profile_img' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],    // 프로필 이미지 경로
            'role'        => ['type' => 'ENUM', 'constraint' => ['user', 'admin'], 'default' => 'user'], // 권한
            'created_at'  => ['type' => 'DATETIME', 'null' => true],
            'updated_at'  => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->createTable('users');
    }

    public function down()
    {
        $this->forge->dropTable('users');
    }
}
