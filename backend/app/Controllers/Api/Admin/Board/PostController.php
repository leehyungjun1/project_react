<?php

namespace App\Controllers\Api\Admin\Board;

use App\Models\Board\BoardModel;
use App\Models\Board\DynamicBoardModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class PostController extends ResourceController
{
    protected $format = 'json';

    // 게시글 목록
    public function index($boardCode = null)
    {
        $boardModel = new BoardModel();
        $board      = $boardModel->findByCode($boardCode);

        if (!$board) {
            return $this->respond([
                'status'  => false,
                'message' => '게시판을 찾을 수 없습니다.',
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $postModel  = new DynamicBoardModel($boardCode);

        // 필터
        $keyword    = $this->request->getGet('keyword')     ?? '';
        $searchType = $this->request->getGet('search_type') ?? 'title';
        $isUse      = $this->request->getGet('is_use');
        $isNotice   = $this->request->getGet('is_notice');
        $page       = (int)($this->request->getGet('page')     ?? 1);
        $perPage    = (int)($this->request->getGet('per_page') ?? 20);

        $postModel->where('deleted_at', null);

        if ($keyword) {
            $postModel->groupStart()->like($searchType, $keyword)->groupEnd();
        }
        if ($isUse !== null && $isUse !== '')     $postModel->where('is_use', $isUse);
        if ($isNotice !== null && $isNotice !== '') $postModel->where('is_notice', $isNotice);

        $total = $postModel->countAllResults(false);
        $list  = $postModel->orderBy('is_notice', 'DESC')
            ->orderBy('id', 'DESC')
            ->findAll($perPage, ($page - 1) * $perPage);

        return $this->respond([
            'status' => true,
            'data'   => [
                'board'     => $board,
                'list'      => $list,
                'total'     => $total,
                'page'      => $page,
                'per_page'  => $perPage,
                'last_page' => ceil($total / $perPage),
            ],
        ]);
    }

    // 게시글 상세
    public function show($boardCode = null, $id = null)
    {
        $boardModel = new BoardModel();
        $board      = $boardModel->findByCode($boardCode);

        if (!$board) {
            return $this->respond([
                'status'  => false,
                'message' => '게시판을 찾을 수 없습니다.',
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $postModel = new DynamicBoardModel($boardCode);
        $post      = $postModel->find($id);

        if (!$post) {
            return $this->respond([
                'status'  => false,
                'message' => '게시글을 찾을 수 없습니다.',
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        return $this->respond([
            'status' => true,
            'data'   => [
                'board' => $board,
                'post'  => $post,
            ],
        ]);
    }

    // 게시글 등록
    public function store($boardCode = null)
    {
        $boardModel = new BoardModel();
        $board      = $boardModel->findByCode($boardCode);

        if (!$board) {
            return $this->respond([
                'status'  => false,
                'message' => '게시판을 찾을 수 없습니다.',
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $json = $this->request->getJSON(true);

        $rules = [
            'title'   => 'required',
            'content' => 'required',
        ];

        if (!$this->validate($rules, $json)) {
            return $this->respond([
                'status'  => false,
                'message' => $this->validator->getErrors(),
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $postModel = new DynamicBoardModel($boardCode);

        // JWT에서 관리자 정보 가져오기
        $decoded = \App\Libraries\JwtHelper::decodeToken(
            str_replace('Bearer ', '', $this->request->getHeaderLine('Authorization'))
        );

        $postId = $postModel->insert([
            'board_id'    => $board['id'],
            'writer_type' => 'admin',
            'writer_id'   => $decoded?->id ?? null,
            'writer'      => $decoded?->name ?? '관리자',
            'title'       => $json['title'],
            'content'     => $json['content'],
            'is_notice'   => $json['is_notice']  ?? 0,
            'is_secret'   => $json['is_secret']  ?? 0,
            'is_main'     => $json['is_main']     ?? 0,
            'is_use'      => $json['is_use']      ?? 1,
            'status'      => $json['status']      ?? 'normal',
            'category_id' => $json['category_id'] ?? null,
            'thumbnail'      => $json['thumbnail']       ?? null,
            'event_start_at' => $json['event_start_at'] ?? null,
            'event_end_at'   => $json['event_end_at']   ?? null,
            'ip'          => $this->request->getIPAddress(),
        ], true);

        // 답글인 경우 group_id, parent_id 설정
        if (!empty($json['parent_id'])) {
            $parent = $postModel->find($json['parent_id']);
            $postModel->update($postId, [
                'group_id'  => $parent['group_id'] ?? $json['parent_id'],
                'parent_id' => $json['parent_id'],
                'depth'     => ($parent['depth'] ?? 0) + 1,
                'order_no'  => ($parent['order_no'] ?? 0) + 1,
            ]);
        } else {
            // 원글이면 group_id = 자신의 id
            $postModel->update($postId, ['group_id' => $postId]);
        }

        return $this->respond([
            'status'  => true,
            'message' => '등록되었습니다.',
            'id'      => $postId,
        ], ResponseInterface::HTTP_CREATED);
    }

    // 게시글 수정
    public function update($boardCode = null, $id = null)
    {
        $boardModel = new BoardModel();
        $board      = $boardModel->findByCode($boardCode);

        if (!$board) {
            return $this->respond([
                'status'  => false,
                'message' => '게시판을 찾을 수 없습니다.',
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $postModel = new DynamicBoardModel($boardCode);
        $post      = $postModel->find($id);

        if (!$post) {
            return $this->respond([
                'status'  => false,
                'message' => '게시글을 찾을 수 없습니다.',
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $json = $this->request->getJSON(true);

        $postModel->update($id, [
            'title'       => $json['title']       ?? $post['title'],
            'content'     => $json['content']      ?? $post['content'],
            'is_notice'   => $json['is_notice']    ?? $post['is_notice'],
            'is_secret'   => $json['is_secret']    ?? $post['is_secret'],
            'is_main'     => $json['is_main']      ?? $post['is_main'],
            'is_use'      => $json['is_use']       ?? $post['is_use'],
            'status'      => $json['status']       ?? $post['status'],
            'category_id' => $json['category_id']  ?? $post['category_id'],
            'thumbnail'      => $json['thumbnail']   ?? $post['thumbnail'],
            'event_start_at' => $json['event_start_at'] ?? $post['event_start_at'],
            'event_end_at'   => $json['event_end_at']   ?? $post['event_end_at'],
        ]);

        return $this->respond([
            'status'  => true,
            'message' => '수정되었습니다.',
        ]);
    }

    // 게시글 삭제
    public function delete($boardCode = null, $id = null)
    {
        $boardModel = new BoardModel();
        $board      = $boardModel->findByCode($boardCode);

        if (!$board) {
            return $this->respond([
                'status'  => false,
                'message' => '게시판을 찾을 수 없습니다.',
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $postModel = new DynamicBoardModel($boardCode);
        $post      = $postModel->find($id);

        if (!$post) {
            return $this->respond([
                'status'  => false,
                'message' => '게시글을 찾을 수 없습니다.',
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $postModel->delete($id);

        return $this->respond([
            'status'  => true,
            'message' => '삭제되었습니다.',
        ]);
    }
}