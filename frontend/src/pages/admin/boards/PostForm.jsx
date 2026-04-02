import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/api/axios'
import * as FC from '@/components/admin/FormComponents'
import PageHeader from '@/components/admin/PageHeader'
import { showAlert, showConfirm } from '@/utils/modal'

function PostForm() {
    const navigate          = useNavigate()
    const { boardCode, id } = useParams()
    const isEdit            = !!id

    const [board, setBoard]             = useState(null)
    const [loading, setLoading]         = useState(false)
    const [pageLoading, setPageLoading] = useState(true)

    const [form, setForm] = useState({
        title          : '',
        content        : '',
        is_notice      : '0',
        is_secret      : '0',
        is_main        : '0',
        is_use         : '1',
        status         : 'normal',
        category_id    : '',
        event_start_at : '',
        event_end_at   : '',
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // 게시판 정보 + 게시글 상세 조회
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isEdit) {
                    const res = await api.get(`/admin/boards/${boardCode}/posts/${id}`)
                    setBoard(res.data.data.board)
                    const post = res.data.data.post
                    setForm({
                        title          : post.title          ?? '',
                        content        : post.content        ?? '',
                        is_notice      : post.is_notice      ?? '0',
                        is_secret      : post.is_secret      ?? '0',
                        is_main        : post.is_main        ?? '0',
                        is_use         : post.is_use         ?? '1',
                        status         : post.status         ?? 'normal',
                        category_id    : post.category_id    ?? '',
                        event_start_at : post.event_start_at ?? '',
                        event_end_at   : post.event_end_at   ?? '',
                    })
                } else {
                    // 등록 시 게시판 정보만 가져오기
                    const res = await api.get(`/admin/boards/${boardCode}/posts`, { params: { per_page: 1 } })
                    setBoard(res.data.data.board)
                }
            } catch (err) {
                showAlert('error', '오류', '데이터를 불러오는데 실패했습니다.')
            } finally {
                setPageLoading(false)
            }
        }
        fetchData()
    }, [boardCode, id])

    // 저장
    const handleSubmit = async () => {
        if (!form.title)   return showAlert('warning', '입력 오류', '제목을 입력해 주세요.')
        if (!form.content) return showAlert('warning', '입력 오류', '내용을 입력해 주세요.')

        setLoading(true)
        try {
            if (isEdit) {
                await api.put(`/admin/boards/${boardCode}/posts/${id}`, form)
                showAlert('success', '수정 완료', '수정되었습니다.', () => {
                    navigate(`/admin/boards/${boardCode}/posts`)
                })
            } else {
                await api.post(`/admin/boards/${boardCode}/posts`, form)
                showAlert('success', '등록 완료', '등록되었습니다.', () => {
                    navigate(`/admin/boards/${boardCode}/posts`)
                })
            }
        } catch (err) {
            const msg = err.response?.data?.message
            if (typeof msg === 'object') {
                showAlert('error', '오류', Object.values(msg)[0])
            } else {
                showAlert('error', '오류', msg || '저장 실패')
            }
        } finally {
            setLoading(false)
        }
    }

    // 삭제
    const handleDelete = () => {
        showConfirm('삭제', '정말 삭제하시겠습니까?', async () => {
            try {
                await api.delete(`/admin/boards/${boardCode}/posts/${id}`)
                showAlert('success', '삭제 완료', '삭제되었습니다.', () => {
                    navigate(`/admin/boards/${boardCode}/posts`)
                })
            } catch (err) {
                showAlert('error', '오류', '삭제 실패')
            }
        })
    }

    if (pageLoading) {
        return <div className="flex items-center justify-center p-20 text-gray-400">로딩 중...</div>
    }

    return (
        <div>
            <PageHeader
                title={isEdit ? '게시글 수정' : '게시글 작성'}
                breadcrumbs={[
                    { label: '게시판 관리',              path: '/admin/boards' },
                    { label: board?.board_name ?? '',    path: `/admin/boards/${boardCode}/posts` },
                    { label: isEdit ? '게시글 수정' : '게시글 작성' },
                ]}
                actions={
                    <>
                        <button
                            onClick={() => navigate(`/admin/boards/${boardCode}/posts`)}
                            className="border border-gray-300 text-sm px-4 py-1.5 rounded hover:bg-gray-50"
                        >
                            목록
                        </button>
                        {isEdit && (
                            <button
                                onClick={handleDelete}
                                className="bg-gray-500 text-white text-sm px-4 py-1.5 rounded hover:bg-gray-600"
                            >
                                삭제
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-red-500 text-white text-sm px-4 py-1.5 rounded hover:bg-red-600 disabled:opacity-50"
                        >
                            {loading ? '처리 중...' : '저장'}
                        </button>
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* ===== 본문 ===== */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
                    <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-3">게시글 내용</h2>

                    {/* 제목 */}
                    <FC.Row label="제목" required>
                        <input
                            type="text"
                            name="title"
                            placeholder="제목을 입력해 주세요"
                            value={form.title}
                            onChange={handleChange}
                            className={FC.inputClass}
                        />
                    </FC.Row>

                    {/* 내용 */}
                    <FC.Row label="내용" required>
                        <textarea
                            name="content"
                            placeholder="내용을 입력해 주세요"
                            value={form.content}
                            onChange={handleChange}
                            rows={15}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-y"
                        />
                    </FC.Row>

                    {/* 이벤트형일 때만 표시 */}
                    {board?.skin_type === 'event' && (
                        <>
                            <FC.Row label="이벤트 시작일">
                                <input
                                    type="datetime-local"
                                    name="event_start_at"
                                    value={form.event_start_at}
                                    onChange={handleChange}
                                    className={FC.inputClass}
                                />
                            </FC.Row>
                            <FC.Row label="이벤트 종료일">
                                <input
                                    type="datetime-local"
                                    name="event_end_at"
                                    value={form.event_end_at}
                                    onChange={handleChange}
                                    className={FC.inputClass}
                                />
                            </FC.Row>
                        </>
                    )}
                </div>

                {/* ===== 설정 ===== */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-3">게시글 설정</h2>

                        {/* 공지여부 */}
                        <FC.Row label="공지여부">
                            <div className="flex items-center gap-4 pt-1.5">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="is_notice" value="1" checked={form.is_notice === '1'} onChange={handleChange} className="accent-orange-500" />
                                    공지
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="is_notice" value="0" checked={form.is_notice === '0'} onChange={handleChange} className="accent-orange-500" />
                                    일반
                                </label>
                            </div>
                        </FC.Row>

                        {/* 비밀글 */}
                        {board?.use_secret === '1' && (
                            <FC.Row label="비밀글">
                                <div className="flex items-center gap-4 pt-1.5">
                                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input type="radio" name="is_secret" value="1" checked={form.is_secret === '1'} onChange={handleChange} className="accent-orange-500" />
                                        비밀
                                    </label>
                                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input type="radio" name="is_secret" value="0" checked={form.is_secret === '0'} onChange={handleChange} className="accent-orange-500" />
                                        공개
                                    </label>
                                </div>
                            </FC.Row>
                        )}

                        {/* 메인 노출 */}
                        <FC.Row label="메인노출">
                            <div className="flex items-center gap-4 pt-1.5">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="is_main" value="1" checked={form.is_main === '1'} onChange={handleChange} className="accent-orange-500" />
                                    노출
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="is_main" value="0" checked={form.is_main === '0'} onChange={handleChange} className="accent-orange-500" />
                                    미노출
                                </label>
                            </div>
                        </FC.Row>

                        {/* 사용여부 */}
                        <FC.Row label="사용여부">
                            <div className="flex items-center gap-4 pt-1.5">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="is_use" value="1" checked={form.is_use === '1'} onChange={handleChange} className="accent-orange-500" />
                                    사용
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="is_use" value="0" checked={form.is_use === '0'} onChange={handleChange} className="accent-orange-500" />
                                    미사용
                                </label>
                            </div>
                        </FC.Row>

                        {/* 1:1문의형일 때 상태 */}
                        {board?.skin_type === 'qna' && (
                            <FC.Row label="답변상태">
                                <select name="status" value={form.status} onChange={handleChange} className={FC.selectClass + ' w-full'}>
                                    <option value="pending">답변대기</option>
                                    <option value="answered">답변완료</option>
                                </select>
                            </FC.Row>
                        )}
                    </div>

                    {/* 작성자 정보 (수정 시) */}
                    {isEdit && (
                        <div className="bg-white rounded-lg shadow p-4">
                            <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-3">작성자 정보</h2>
                            <FC.Row label="작성일">
                                <span className="text-sm text-gray-500">{form.created_at?.slice(0, 10)}</span>
                            </FC.Row>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PostForm