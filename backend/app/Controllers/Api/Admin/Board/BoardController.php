<?php

namespace App\Controllers\Api\Admin\Board;

use App\Models\Board\BoardModel;
use App\Models\Board\BoardPermissionModel;
use App\Services\BoardTableService;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class BoardController extends ResourceController
{
    protected $format = 'json';

    // 게시판 목록
    public function index()
    {
        $boardModel = new BoardModel();

        //필터 파라미터
        $keyword    = $this->request->getGet('keyword') ?? '';
        $searchType = $this->request->getGet('search_type') ?? 'name';
        $isActive   = $this->request->getGet('is_active');
        $skin_type  = $this->request->getGet('skin_type');
        $page       = (int)($this->request->getGet('page') ?? 1);
        $perPage    = (int)($this->request->getGet('per_page') ?? 20);

        // 허용된 검색 컬럼 검증
        $allowedSearch = ['name', 'title', 'content'];
        if (!in_array($searchType, $allowedSearch)) {
            $searchType = 'name';
        }

        $boardModel->where('deleted_at', null);

        if ($keyword) {
            $boardModel->groupStart()->like($searchType, $keyword)->groupEnd();
        }

        if ($isActive !== null && $isActive !== '') $boardModel->where('is_active', $isActive);
        if ($skin_type)  $boardModel->where('skin_type', $skin_type);

        // 전체 수
        $total = $boardModel->countAllResults(false);
        // 목록
        $list  = $boardModel->orderBy('order_no', 'ASC')->findAll($perPage, ($page - 1) * $perPage);

        return $this->respond([
            'status' => true,
            'data'    => [
                'list'      => $list,
                'total'     => $total,
                'page'      => $page,
                'per_page'  => $perPage,
                'last_page' => ceil($total / $perPage),
            ],
        ]);
    }

    // 게시판 상세
    public function show($id = null)
    {
        $boardModel = new BoardModel();
        $board      = $boardModel->find($id);

        if (!$board) {
            return $this->respond([
                'status'  => false,
                'message' => '게시판을 찾을 수 없습니다.',
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        // 권한 정보도 같이
        $db          = \Config\Database::connect();
        $permissions = $db->table('board_permissions')
            ->where('board_id', $id)
            ->get()
            ->getResultArray();

        $board['permissions'] = $permissions;

        return $this->respond([
            'status' => true,
            'data'   => $board,
        ]);
    }

    // 게시판 등록
    public function store()
    {
        $json       = $this->request->getJSON(true);
        $boardModel = new BoardModel();

        // 유효성 검사
        $rules = [
            'board_code' => 'required|alpha_numeric|is_unique[boards.board_code]',
            'board_name' => 'required',
            'skin_type'  => 'required|in_list[normal,gallery,qna,event]',
        ];

        if (!$this->validate($rules, $json)) {
            return $this->respond([
                'status'  => false,
                'message' => $this->validator->getErrors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        // 게시판 저장
        $boardId = $boardModel->insert([
            'board_code'  => $json['board_code'],
            'board_name'  => $json['board_name'],
            'skin_type'   => $json['skin_type'],
            'description' => $json['description'] ?? null,
            'use_comment' => $json['use_comment']  ?? 1,
            'use_rating'  => $json['use_rating']   ?? 0,
            'use_file'    => $json['use_file']      ?? 0,
            'use_secret'  => $json['use_secret']    ?? 0,
            'file_count'  => $json['file_count']    ?? 3,
            'file_size'   => $json['file_size']     ?? 10,
            'list_count'  => $json['list_count']    ?? 20,
            'order_no'    => $json['order_no']      ?? 0,
            'is_active'   => $json['is_active']     ?? 1,
        ], true);

        // 게시판 테이블 자동 생성
        $tableService = new BoardTableService();
        $tableService->createTable($json['board_code']);

        // 기본 권한 생성
        $db = \Config\Database::connect();
        $defaultPermissions = [
            ['board_id' => $boardId, 'target_type' => 'guest', 'can_list' => 1, 'can_read' => 1, 'can_write' => 0, 'can_comment' => 0, 'can_file' => 0],
            ['board_id' => $boardId, 'target_type' => 'user',  'can_list' => 1, 'can_read' => 1, 'can_write' => 1, 'can_comment' => 1, 'can_file' => 1],
            ['board_id' => $boardId, 'target_type' => 'admin', 'can_list' => 1, 'can_read' => 1, 'can_write' => 1, 'can_comment' => 1, 'can_file' => 1],
        ];
        $db->table('board_permissions')->insertBatch($defaultPermissions);

        return $this->respond([
            'status'  => true,
            'message' => '게시판이 생성되었습니다.',
        ], ResponseInterface::HTTP_CREATED);
    }

    // 게시판 수정
    public function update($id = null)
    {
        $json       = $this->request->getJSON(true);
        $boardModel = new BoardModel();

        $board = $boardModel->find($id);
        if (!$board) {
            return $this->respond([
                'status'  => false,
                'message' => '게시판을 찾을 수 없습니다.',
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $boardModel->update($id, [
            'board_name'  => $json['board_name']  ?? $board['board_name'],
            'skin_type'   => $json['skin_type']   ?? $board['skin_type'],
            'description' => $json['description'] ?? $board['description'],
            'use_comment' => $json['use_comment'] ?? $board['use_comment'],
            'use_rating'  => $json['use_rating']  ?? $board['use_rating'],
            'use_file'    => $json['use_file']    ?? $board['use_file'],
            'use_secret'  => $json['use_secret']  ?? $board['use_secret'],
            'file_count'  => $json['file_count']  ?? $board['file_count'],
            'file_size'   => $json['file_size']   ?? $board['file_size'],
            'list_count'  => $json['list_count']  ?? $board['list_count'],
            'order_no'    => $json['order_no']    ?? $board['order_no'],
            'is_active'   => $json['is_active']   ?? $board['is_active'],
        ]);

        // 권한 업데이트
        if (!empty($json['permissions'])) {
            $db = \Config\Database::connect();
            foreach ($json['permissions'] as $perm) {
                $db->table('board_permissions')
                    ->where('board_id', $id)
                    ->where('target_type', $perm['target_type'])
                    ->update([
                        'can_list'    => $perm['can_list'],
                        'can_read'    => $perm['can_read'],
                        'can_write'   => $perm['can_write'],
                        'can_comment' => $perm['can_comment'],
                        'can_file'    => $perm['can_file'],
                    ]);
            }
        }

        return $this->respond([
            'status'  => true,
            'message' => '수정되었습니다.',
        ]);
    }

    // 게시판 삭제
    public function delete($id = null)
    {
        $boardModel = new BoardModel();
        $board      = $boardModel->find($id);

        if (!$board) {
            return $this->respond([
                'status'  => false,
                'message' => '게시판을 찾을 수 없습니다.',
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        // 소프트 딜리트
        $boardModel->delete($id);

        return $this->respond([
            'status'  => true,
            'message' => '삭제되었습니다.',
        ]);
    }
}