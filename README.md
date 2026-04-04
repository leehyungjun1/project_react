## React 라우팅 구조

React Router v6의 **중첩 라우트(Nested Routes)** 패턴을 적용했습니다.

### 적용 방식

\`\`\`jsx
<Route path="/admin" element={
  <AdminProtectedRoute>
    <AdminLayout />   {/* 내부에서 <Outlet />으로 자식 렌더링 */}
  </AdminProtectedRoute>
}>
<Route path="dashboard"         element={<AdminDashboard />} />
<Route path="managers"          element={<AdminList />} />
<Route path="managers/register" element={<AdminRegister />} />
<Route path="managers/:id"      element={<AdminDetail />} />
<Route path="settings/codes"    element={<CodeManage />} />
</Route>
\`\`\`

### 설계 의도

- **레이아웃 분리** — `AdminLayout`을 부모 라우트로 두고 `<Outlet />`으로 자식을 주입해,
  레이아웃 코드와 페이지 코드를 완전히 분리
- **인증 일괄 적용** — `AdminProtectedRoute`를 라우트 트리 상단에 배치해
  관리자 하위 페이지 전체에 인증을 한 번에 적용
- **가독성** — 수동으로 `<Routes>`를 중첩하는 구 방식 대신,
  라우트 트리만 봐도 전체 페이지 구조가 한눈에 파악되도록 구성

---

## CI 동적 게시판 시스템

하나의 게시판 모델(`DynamicBoardModel`)로 **4가지 게시판 타입**을 지원합니다.

### 지원 타입

| 타입      | 설명                                    |
|---------|-----------------------------------------|
| Default | 일반 텍스트 게시판                          |
| Gallery | 이미지 중심 갤러리형                        |
| Event   | 기간·상태 관리가 포함된 이벤트 게시판          |
| QA      | 질문/답변 구조의 문의 게시판                  |

### 주요 구현 내용

- **타입별 분기 렌더링** — 게시판 `type` 컬럼 하나로 목록/상세 뷰를 동적으로 분기 처리
- **커스텀 필드** — 타입마다 다른 추가 데이터를 `extra_fields` JSON 컬럼에 저장해
  테이블 구조 변경 없이 필드를 유연하게 확장
- **계층형 댓글** — 댓글·대댓글 구조를 `parent_id` 기반으로 구현
- **파일 첨부 / 이미지 업로드** — 게시글당 다중 파일 업로드 지원
- **권한별 접근 제어** — `jy_board_permissions` 테이블의 `mode`/`grades` 컬럼으로
  읽기·쓰기·댓글 등 액션별 등급 제한을 DB에서 관리
- **페이지네이션** — 목록 페이지 공통 페이지네이션 처리

- **배너 기능** - 관리자 페이지 배너 생성으로 인해서 프론트단에서 코드로 입력 가능
- **팝업 기능** - 관리자 페이지 팝업 생성으로 인해서 메인 페이지 노출 가능
