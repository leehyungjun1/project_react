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
        $parentId   = $this->request->getGet('parent_id');
        $depth      = $this->request->getGet('depth');
        $page       = (int)($this->request->getGet('page')     ?? 1);
        $perPage    = (int)($this->request->getGet('per_page') ?? 20);

        $postModel->where('deleted_at', null);

        if ($board['skin_type'] === 'qna' && ($parentId === null || $parentId === '')) {
            $postModel->where('depth', 0);
        } else if ($parentId !== null && $parentId !== '') {
            $postModel->where('parent_id', $parentId);
            if ($depth !== null && $depth !== '') {
                $postModel->where('depth', $depth);
            }
        }


        if ($keyword) {
            $postModel->groupStart()->like($searchType, $keyword)->groupEnd();
        }
        if ($isUse !== null && $isUse !== '')     $postModel->where('is_use', $isUse);
        if ($isNotice !== null && $isNotice !== '') $postModel->where('is_notice', $isNotice);

        $total = $postModel->countAllResults(false);
        $list  = $postModel->orderBy('is_notice', 'DESC')
            ->orderBy('group_id', 'DESC')
            ->orderBy('order_no', 'ASC')
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
        $db        = \Config\Database::connect();

        $decoded = \App\Libraries\JwtHelper::decodeToken(
            str_replace('Bearer ', '', $this->request->getHeaderLine('Authorization'))
        );

        $parentId = $json['parent_id'] ?? null;

        if ($parentId) {
            // ===== 답글 =====
            $parent  = $postModel->find($parentId);

            if (!$parent) {
                return $this->respond([
                    'status'  => false,
                    'message' => '원글을 찾을 수 없습니다.',
                ], ResponseInterface::HTTP_NOT_FOUND);
            }

            $groupId = $parent['group_id'];
            $depth   = $parent['depth'] + 1;

            // ✅ 같은 parent_id 자식 중 마지막 order_no 찾기
            $lastChild = $db->table("board_{$boardCode}")
                ->where('group_id', $groupId)
                ->where('parent_id', $parentId)
                ->where('deleted_at IS NULL', null, false)
                ->orderBy('order_no', 'DESC')
                ->limit(1)
                ->get()
                ->getRowArray();

            if ($lastChild) {
                // 마지막 자식의 하위 트리 끝 order_no 찾기
                $lastOrderNo = $db->table("board_{$boardCode}")
                    ->where('group_id', $groupId)
                    ->where('order_no >=', $lastChild['order_no'])
                    ->where('deleted_at IS NULL', null, false)
                    ->orderBy('order_no', 'DESC')
                    ->limit(1)
                    ->get()
                    ->getRowArray()['order_no'] ?? $lastChild['order_no'];
            } else {
                // 자식 없으면 parent order_no 기준
                $lastOrderNo = $parent['order_no'];
            }

            $newOrderNo = $lastOrderNo + 1;

            // 새 답글 위치 이후 order_no 모두 +1
            $db->query(
                "UPDATE board_{$boardCode} SET order_no = order_no + 1 WHERE group_id = ? AND order_no >= ?",
                [$groupId, $newOrderNo]
            );

            $postId = $postModel->insert([
                'board_id'    => $board['id'],
                'group_id'    => $groupId,
                'parent_id'   => $parentId,
                'depth'       => $depth,
                'order_no'    => $newOrderNo,
                'writer_type' => 'admin',
                'writer_id'   => $decoded?->id ?? null,
                'writer'      => $decoded?->name ?? '관리자',
                'title'       => $json['title'],
                'content'     => $json['content'],
                'is_notice'   => 0,
                'is_secret'   => $json['is_secret'] ?? 0,
                'is_main'     => 0,
                'is_use'      => $json['is_use']     ?? 1,
                'status'      => 'normal',
                'thumbnail'   => null,
                'ip'          => $this->request->getIPAddress(),
            ], true);

            // 원글 comment_count 증가
            $db->query(
                "UPDATE board_{$boardCode} SET comment_count = comment_count + 1 WHERE id = ?",
                [$groupId]
            );

        } else {
            // ===== 원글 =====
            $postId = $postModel->insert([
                'board_id'    => $board['id'],
                'writer_type' => 'admin',
                'writer_id'   => $decoded?->id ?? null,
                'writer'      => $decoded?->name ?? '관리자',
                'title'       => $json['title'],
                'content'     => $json['content'],
                'is_notice'   => $json['is_notice']      ?? 0,
                'is_secret'   => $json['is_secret']      ?? 0,
                'is_main'     => $json['is_main']         ?? 0,
                'is_use'      => $json['is_use']          ?? 1,
                'status'      => $json['status']          ?? 'normal',
                'category_id' => $json['category_id']     ?? null,
                'thumbnail'   => $json['thumbnail']       ?? null,
                'event_start_at' => $json['event_start_at'] ?? null,
                'event_end_at'   => $json['event_end_at']   ?? null,
                'ip'          => $this->request->getIPAddress(),
            ], true);

            // group_id = 자신의 id, order_no = 0
            $postModel->update($postId, [
                'group_id' => $postId,
                'order_no' => 0,
                'depth'    => 0,
            ]);
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