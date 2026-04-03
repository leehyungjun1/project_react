import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Editor } from '@toast-ui/react-editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import api from '@/api/axios'
import * as FC from '@/components/admin/FormComponents'
import PageHeader from '@/components/admin/PageHeader'
import { showAlert, showConfirm } from '@/utils/modal'
import { FaTrash, FaFile } from 'react-icons/fa6'

function PostForm() {
    const navigate          = useNavigate()
    const { boardCode, id }   = useParams()
    const [searchParams]    = useSearchParams()
    const isEdit                  = !!id
    const editorRef         = useRef(null)
    const fileInputRef      = useRef(null)

    const [board, setBoard]                         = useState(null)
    const [loading, setLoading]             = useState(false)
    const [pageLoading, setPageLoading]     = useState(true)
    const [files, setFiles]                   = useState([])
    const [thumbnail, setThumbnail] = useState(null)
    const [uploading, setUploading]     = useState(false)

    const [form, setForm] = useState({
        title          : '',
        parent_id      : '',
        header_id      : '',
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
                    // 수정 시 - 기존 코드 그대로
                    const res = await api.get(`/admin/boards/${boardCode}/posts/${id}`)
                    const boardRes = await api.get(`/admin/boards/code/${boardCode}`)  // ✅ headers 포함
                    setBoard(boardRes.data.data)
                    const post = res.data.data.post
                    setForm({
                        title          : post.title          ?? '',
                        header_id      : post.header_id      ?? '',  // ✅ 추가
                        is_notice      : post.is_notice      ?? '0',
                        is_secret      : post.is_secret      ?? '0',
                        is_main        : post.is_main        ?? '0',
                        is_use         : post.is_use         ?? '1',
                        status         : post.status         ?? 'normal',
                        category_id    : post.category_id    ?? '',
                        event_start_at : post.event_start_at ?? '',
                        event_end_at   : post.event_end_at   ?? '',
                    })
                    setTimeout(() => {
                        editorRef.current?.getInstance().setHTML(post.content ?? '')
                    }, 100)

                } else {
                    // ✅ 등록 시 - 게시판 상세로 변경 (headers 포함)
                    const boardRes = await api.get(`/admin/boards/code/${boardCode}`)
                    setBoard(boardRes.data.data)

                    const parentId = searchParams.get('parent_id')
                    if (parentId) {
                        const parentRes  = await api.get(`/admin/boards/${boardCode}/posts/${parentId}`)
                        const parentPost = parentRes.data.data.post

                        setForm(prev => ({
                            ...prev,
                            parent_id : parentId,
                            title     : `RE: ${parentPost.title}`,
                        }))

                        setTimeout(() => {
                            const instance = editorRef.current?.getInstance()
                            if (instance) {
                                const originalContent = `
                                <p><br></p><p><br></p>
                                <hr>
                                <p style="color:#888; font-size:12px;">원본글 - ${parentPost.writer} (${parentPost.created_at?.slice(0, 16)})</p>
                                <div style="color:#888; font-size:12px;">${parentPost.content ?? ''}</div>
                            `
                                instance.setHTML(originalContent)

                                setTimeout(() => {
                                    const editorEl = document.querySelector('[contenteditable=true]')
                                    if (editorEl) {
                                        editorEl.focus()
                                        document.execCommand('selectAll', false, null)
                                        document.getSelection()?.collapseToStart()
                                        editorEl.scrollTop = 0
                                    }
                                    const editorWrapper = document.querySelector('.toastui-editor-ww-container')
                                    if (editorWrapper) editorWrapper.scrollTop = 0
                                }, 200)
                            }
                        }, 100)
                    }
                }
            } catch (err) {
                showAlert('error', '오류', '데이터를 불러오는데 실패했습니다.')
            } finally {
                setPageLoading(false)
            }
        }
        fetchData()
    }, [boardCode, id])

    // 파일 업로드
    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files)
        if (!selectedFiles.length) return

        // 파일 개수 체크
        const maxCount = parseInt(board?.file_count ?? 10)
        if (files.length + selectedFiles.length > maxCount) {
            showAlert('warning', '파일 초과', `파일은 최대 ${maxCount}개까지 첨부 가능합니다.`)
            return
        }

        // 파일 크기 체크
        const maxSize  = parseInt(board?.file_size ?? 10) * 1024 * 1024
        for (const file of selectedFiles) {
            if (file.size > maxSize) {
                showAlert('warning', '파일 크기 초과', `파일 크기는 최대 ${board?.file_size ?? 10}MB까지 가능합니다.`)
                return
            }
        }

        setUploading(true)
        try {
            const formData = new FormData()
            selectedFiles.forEach(file => formData.append('files[]', file))

            const res = await api.post(`/admin/boards/${boardCode}/files`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            console.log('파일 업로드 응답:', res.data)

            setFiles(prev => [...prev, ...res.data.data.files])

            if (!thumbnail && res.data.data.thumbnail) {
                setThumbnail(res.data.data.thumbnail)
            }
        } catch (err) {
            showAlert('error', '오류', '파일 업로드 실패')
        } finally {
            setUploading(false)
            fileInputRef.current.value = ''
        }
    }

    // 파일 삭제
    const handleFileDelete = async (index, savedName) => {
        try {
            await api.delete(`/admin/boards/${boardCode}/files/${savedName}`)
            setFiles(prev => prev.filter((_, i) => i !== index))
        } catch (err) {
            showAlert('error', '오류', '파일 삭제 실패')
        }
    }

    // 파일 크기 포맷
    const formatFileSize = (bytes) => {
        if (bytes < 1024)        return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    // 저장
    const handleSubmit = async () => {
        if (!form.title) return showAlert('warning', '입력 오류', '제목을 입력해 주세요.')

        const content = editorRef.current?.getInstance().getHTML()

        if (!content || content === '<p><br></p>') return showAlert('warning', '입력 오류', '내용을 입력해 주세요.')

        console.log('thumbnail:', thumbnail)  // ✅ 추가
        console.log('payload:', { ...form, content, files, thumbnail })

        setLoading(true)
        try {
            const payload = { ...form, content, files, thumbnail }

            if (isEdit) {
                await api.put(`/admin/boards/${boardCode}/posts/${id}`, payload)
                showAlert('success', '수정 완료', '수정되었습니다.', () => {
                    navigate(`/admin/boards/${boardCode}/posts`)
                })
            } else {
                await api.post(`/admin/boards/${boardCode}/posts`, payload)
                showAlert('success', '등록 완료', '등록되었습니다.', () => {
                    navigate(`/admin/boards/${boardCode}/posts`)
                })
            }
        } catch (err) {
            const msg = err.response?.data?.message
            showAlert('error', '오류', typeof msg === 'object' ? Object.values(msg)[0] : msg || '저장 실패')
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
                    { label: '게시판 관리',           path: '/admin/boards' },
                    { label: board?.board_name ?? '', path: `/admin/boards/${boardCode}/posts` },
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

            <div className="bg-white rounded-lg shadow">

                {/* 게시판 */}
                <div className="flex items-start border-b border-gray-100 px-4 py-3">
                    <div className="w-32 shrink-0 text-sm font-medium text-gray-600 py-1">게시판</div>
                    <div className="flex-1 py-1 text-sm text-gray-700 font-medium">
                        {board?.board_name} <span className="text-gray-400">({boardCode})</span>
                    </div>
                </div>

                {/* 머리말 */}
                {board?.headers?.length > 0 && (
                    <div className="flex items-start border-b border-gray-100 px-4 py-3">
                        <div className="w-32 shrink-0 text-sm font-medium text-gray-600 py-1.5">머리말</div>
                        <div className="flex-1 flex flex-wrap gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, header_id: '' })}
                                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                                    form.header_id === ''
                                        ? 'bg-gray-700 text-white border-gray-700'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                전체
                            </button>
                            {board.headers.map(header => (
                                <button
                                    key={header.id}
                                    type="button"
                                    onClick={() => setForm({ ...form, header_id: header.id })}
                                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                                        form.header_id === header.id || form.header_id === String(header.id)
                                            ? 'text-white border-transparent'
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    }`}
                                    style={
                                        form.header_id === header.id || form.header_id === String(header.id)
                                            ? { backgroundColor: header.color, borderColor: header.color }
                                            : {}
                                    }
                                >
                                    {header.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 제목 */}
                <div className="flex items-start border-b border-gray-100 px-4 py-3">
                    <div className="w-32 shrink-0 text-sm font-medium text-gray-600 py-1.5">
                        <span className="text-red-500 mr-1">*</span>제목
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            name="title"
                            placeholder="제목을 입력해 주세요"
                            value={form.title}
                            onChange={handleChange}
                            className={FC.inputClass}
                        />
                    </div>
                </div>

                {/* 파일 첨부 */}
                {board?.use_file === '1' && (
                    <div className="flex items-start border-b border-gray-100 px-4 py-3">
                        <div className="w-32 shrink-0 text-sm font-medium text-gray-600 py-1.5">파일첨부</div>
                        <div className="flex-1">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="flex items-center gap-2 border border-gray-300 text-sm px-3 py-1.5 rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                <FaFile size={12} />
                                {uploading ? '업로드 중...' : '파일 찾기'}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="mt-2 text-xs text-gray-400 flex flex-col gap-0.5">
                                <span>파일은 최대 {board?.file_count ?? 10}개까지 다중업로드가 가능합니다.</span>
                                <span>파일 업로드 최대 사이즈는 {board?.file_size ?? 10}MB 입니다.</span>
                            </div>

                            {/* 갤러리형 썸네일 미리보기 */}
                            {board?.skin_type === 'gallery' && thumbnail && (
                                <div className="mt-3">
                                    <p className="text-xs text-gray-500 mb-1">썸네일 미리보기</p>
                                    <div className="relative w-32 h-32 rounded overflow-hidden border border-gray-200">
                                        <img
                                            src={`http://localhost:8080/${thumbnail}`}
                                            alt="썸네일"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setThumbnail(null)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 첨부된 파일 목록 */}
                            {files.length > 0 && (
                                <div className="mt-3 flex flex-col gap-1.5">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2 text-sm">
                                            <FaFile size={12} className="text-gray-400 shrink-0" />
                                            <span className="flex-1 text-gray-700">{file.original_name}</span>
                                            <span className="text-gray-400 text-xs">{formatFileSize(file.file_size)}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleFileDelete(index, file.saved_name)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <FaTrash size={11} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 게시글 옵션 */}
                <div className="flex items-start border-b border-gray-100 px-4 py-3">
                    <div className="w-32 shrink-0 text-sm font-medium text-gray-600 py-1.5">게시글 옵션 설정</div>
                    <div className="flex-1 flex items-center gap-5 pt-1.5">
                        <label className={`flex items-center gap-1.5 text-sm ${form.parent_id ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input
                                type="checkbox"
                                checked={form.is_notice === '1'}
                                onChange={(e) => setForm({ ...form, is_notice: e.target.checked ? '1' : '0' })}
                                disabled={!!form.parent_id}  // ✅ 답글이면 비활성화
                                className="accent-orange-500 w-4 h-4"
                            />
                            공지사항
                            {form.parent_id && <span className="text-xs text-gray-400">(답글 불가)</span>}
                        </label>
                        {board?.use_secret === '1' && (
                            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.is_secret === '1'}
                                    onChange={(e) => setForm({ ...form, is_secret: e.target.checked ? '1' : '0' })}
                                    className="accent-orange-500 w-4 h-4"
                                />
                                비밀글
                            </label>
                        )}
                        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.is_main === '1'}
                                onChange={(e) => setForm({ ...form, is_main: e.target.checked ? '1' : '0' })}
                                className="accent-orange-500 w-4 h-4"
                            />
                            메인 노출
                        </label>
                    </div>
                </div>

                {/* 이벤트형 날짜 */}
                {board?.skin_type === 'event' && (
                    <>
                        <div className="flex items-start border-b border-gray-100 px-4 py-3">
                            <div className="w-32 shrink-0 text-sm font-medium text-gray-600 py-1.5">이벤트 시작일</div>
                            <div className="flex-1">
                                <input type="datetime-local" name="event_start_at" value={form.event_start_at} onChange={handleChange} className={FC.inputClass} />
                            </div>
                        </div>
                        <div className="flex items-start border-b border-gray-100 px-4 py-3">
                            <div className="w-32 shrink-0 text-sm font-medium text-gray-600 py-1.5">이벤트 종료일</div>
                            <div className="flex-1">
                                <input type="datetime-local" name="event_end_at" value={form.event_end_at} onChange={handleChange} className={FC.inputClass} />
                            </div>
                        </div>
                    </>
                )}

                {/* 1:1문의 상태 */}
                {board?.skin_type === 'qna' && (
                    <div className="flex items-start border-b border-gray-100 px-4 py-3">
                        <div className="w-32 shrink-0 text-sm font-medium text-gray-600 py-1.5">답변상태</div>
                        <div className="flex-1">
                            <select name="status" value={form.status} onChange={handleChange} className={FC.selectClass}>
                                <option value="pending">답변대기</option>
                                <option value="answered">답변완료</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* 에디터 */}
                <div className="flex items-start border-b border-gray-100 px-4 py-3">
                    <div className="w-32 shrink-0 text-sm font-medium text-gray-600 py-1.5">
                        <span className="text-red-500 mr-1">*</span>내용
                    </div>
                    <div className="flex-1">
                        <Editor
                            ref={editorRef}
                            initialValue=" "
                            previewStyle="vertical"
                            height="500px"
                            initialEditType="wysiwyg"
                            useCommandShortcut={true}
                            language="ko-KR"
                            autofocus={false}
                            usageStatistics={false}
                        />
                    </div>
                </div>

                {/* 사용여부 */}
                <div className="flex items-start px-4 py-3">
                    <div className="w-32 shrink-0 text-sm font-medium text-gray-600 py-1.5">사용여부</div>
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
                </div>

            </div>
        </div>
    )
}

export default PostForm