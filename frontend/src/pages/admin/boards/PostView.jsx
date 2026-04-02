import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import { showAlert, showConfirm } from '@/utils/modal'
import { FaFile, FaDownload, FaPen, FaTrash } from 'react-icons/fa6'

function PostView() {
    const navigate          = useNavigate()
    const { boardCode, id } = useParams()

    const [board, setBoard]           = useState(null)
    const [post, setPost]             = useState(null)
    const [loading, setLoading]       = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/admin/boards/${boardCode}/posts/${id}`)
                setBoard(res.data.data.board)
                setPost(res.data.data.post)
            } catch (err) {
                showAlert('error', '오류', '데이터를 불러오는데 실패했습니다.')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [boardCode, id])

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

    const formatFileSize = (bytes) => {
        if (bytes < 1024)        return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    if (loading) {
        return <div className="flex items-center justify-center p-20 text-gray-400">로딩 중...</div>
    }

    return (
        <div>
            <PageHeader
                title="게시글 상세"
                breadcrumbs={[
                    { label: '게시판 관리',           path: '/admin/boards' },
                    { label: board?.board_name ?? '', path: `/admin/boards/${boardCode}/posts` },
                    { label: '게시글 상세' },
                ]}
                actions={
                    <>
                        <button
                            onClick={() => navigate(`/admin/boards/${boardCode}/posts`)}
                            className="border border-gray-300 text-sm px-4 py-1.5 rounded hover:bg-gray-50"
                        >
                            목록
                        </button>
                        <button
                            onClick={() => navigate(`/admin/boards/${boardCode}/posts/${id}`)}
                            className="flex items-center gap-1.5 bg-blue-500 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-600"
                        >
                            <FaPen size={11} />
                            수정
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-1.5 bg-red-500 text-white text-sm px-4 py-1.5 rounded hover:bg-red-600"
                        >
                            <FaTrash size={11} />
                            삭제
                        </button>
                    </>
                }
            />

            <div className="bg-white rounded-lg shadow">

                {/* 제목 */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        {post?.is_notice === '1' && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">공지</span>
                        )}
                        {post?.is_secret === '1' && (
                            <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded">비밀</span>
                        )}
                        {post?.is_main === '1' && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">메인</span>
                        )}
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">{post?.title}</h2>
                </div>

                {/* 메타 정보 */}
                <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500 bg-gray-50">
                    <span>작성자: <span className="font-medium text-gray-700">{post?.writer}</span></span>
                    <span>조회수: <span className="font-medium text-gray-700">{post?.hit}</span></span>
                    <span>작성일: <span className="font-medium text-gray-700">{post?.created_at?.slice(0, 16)}</span></span>
                    {post?.updated_at !== post?.created_at && (
                        <span>수정일: <span className="font-medium text-gray-700">{post?.updated_at?.slice(0, 16)}</span></span>
                    )}
                    {board?.skin_type === 'qna' && (
                        <span>답변상태: <span className={`font-medium ${post?.status === 'answered' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {post?.status === 'answered' ? '답변완료' : '답변대기'}
                        </span></span>
                    )}
                    {board?.skin_type === 'event' && post?.event_start_at && (
                        <span>이벤트 기간: <span className="font-medium text-gray-700">
                            {post?.event_start_at?.slice(0, 10)} ~ {post?.event_end_at?.slice(0, 10)}
                        </span></span>
                    )}
                </div>

                {/* 내용 */}
                <div
                    className="px-6 py-6 min-h-64 text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post?.content ?? '' }}
                />

                {/* 첨부파일 */}
                {post?.files?.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">첨부파일</h3>
                        <div className="flex flex-col gap-1.5">
                            {post.files.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2 text-sm">
                                    <FaFile size={12} className="text-gray-400 shrink-0" />
                                    <span className="flex-1 text-gray-700">{file.original_name}</span>
                                    <span className="text-gray-400 text-xs">{formatFileSize(file.file_size)}</span>

                                    <a href={`http://localhost:8080/${file.file_path}`}
                                    download={file.original_name}
                                    className="text-blue-500 hover:text-blue-600"
                                    >
                                    <FaDownload size={12} />
                                </a>
                                </div>
                                ))}
                        </div>
                    </div>
                    )}

            </div>
        </div>
    )
}

export default PostView