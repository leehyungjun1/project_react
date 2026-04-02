import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/admin/PageHeader'
import * as LC from '@/components/admin/ListComponents'
import { showAlert, showConfirm } from '@/utils/modal'
import { FaImage } from 'react-icons/fa6'
import api from '@/api/axios'

function GallerySkin({ board, list, total, lastPage, loading, filter, setFilter, fetchList, boardCode }) {
    const navigate = useNavigate()

    const handleFilterChange = (e) => setFilter({ ...filter, [e.target.name]: e.target.value })

    const handleSearch = () => {
        const newFilter = { ...filter, page: 1 }
        setFilter(newFilter)
        fetchList(newFilter)
    }

    const handleReset = () => {
        const newFilter = { keyword: '', search_type: 'title', is_use: '', is_notice: '', page: 1, per_page: 20 }
        setFilter(newFilter)
        fetchList(newFilter)
    }

    const handlePageChange = (page) => {
        const newFilter = { ...filter, page }
        setFilter(newFilter)
        fetchList(newFilter)
    }

    const handleDelete = (id, title) => {
        showConfirm('삭제', `"${title}" 을 삭제하시겠습니까?`, async () => {
            try {
                await api.delete(`/admin/boards/${boardCode}/posts/${id}`)
                showAlert('success', '삭제 완료', '삭제되었습니다.', () => fetchList())
            } catch (err) {
                showAlert('error', '오류', '삭제 실패')
            }
        })
    }

    return (
        <div>
            <PageHeader
                title={`${board?.board_name ?? ''} 갤러리 관리`}
                breadcrumbs={[
                    { label: '게시판 관리', path: '/admin/boards' },
                    { label: board?.board_name ?? '' },
                ]}
                actions={
                    <button
                        onClick={() => navigate(`/admin/boards/${boardCode}/posts/create`)}
                        className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600"
                    >
                        + 글 작성
                    </button>
                }
            />

            {/* 검색 필터 */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex gap-2">
                    <select name="search_type" value={filter.search_type} onChange={handleFilterChange} className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
                        <option value="title">제목</option>
                        <option value="writer">작성자</option>
                    </select>
                    <input
                        type="text"
                        name="keyword"
                        placeholder="검색어 입력"
                        value={filter.keyword}
                        onChange={handleFilterChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                    />
                    <button onClick={handleSearch} className="shrink-0 bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600">검색</button>
                    <button onClick={handleReset} className="shrink-0 bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded hover:bg-gray-300">초기화</button>
                </div>
            </div>

            {/* 총 건수 */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">총 <span className="font-bold text-gray-800">{total}</span> 건</span>
                <button
                    onClick={() => navigate(`/admin/boards/${boardCode}/posts/create`)}
                    className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600"
                >
                    + 글 작성
                </button>
            </div>

            {/* 갤러리 그리드 */}
            {loading ? (
                <div className="flex items-center justify-center p-20 text-gray-400">로딩 중...</div>
            ) : list.length === 0 ? (
                <div className="flex items-center justify-center p-20 text-gray-400">게시글이 없습니다.</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
                    {list.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden group">
                            {/* 썸네일 */}
                            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                {item.thumbnail ? (
                                    <img
                                        src={`http://localhost:8080/${item.thumbnail}`}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <FaImage size={40} />
                                    </div>
                                )}
                                {/* 배지 */}
                                <div className="absolute top-2 left-2 flex gap-1">
                                    {item.is_notice === '1' && (
                                        <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">공지</span>
                                    )}
                                    {item.is_use !== '1' && (
                                        <span className="text-xs bg-gray-500 text-white px-1.5 py-0.5 rounded">미사용</span>
                                    )}
                                </div>
                            </div>

                            {/* 정보 */}
                            <div className="p-3">
                                <p
                                    className="text-sm font-medium text-gray-800 truncate cursor-pointer hover:text-orange-500"
                                    onClick={() => navigate(`/admin/boards/${boardCode}/posts/${item.id}/view`)}
                                >
                                    {item.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{item.writer} · {item.created_at?.slice(0, 10)}</p>
                                <p className="text-xs text-gray-400">조회 {item.hit}</p>

                                {/* 관리 버튼 */}
                                <div className="flex gap-1 mt-2">
                                    <button onClick={() => navigate(`/admin/boards/${boardCode}/posts/${item.id}/view`)} className="flex-1 text-xs bg-gray-100 text-gray-600 py-1 rounded hover:bg-gray-200">보기</button>
                                    <button onClick={() => navigate(`/admin/boards/${boardCode}/posts/${item.id}`)} className="flex-1 text-xs bg-blue-100 text-blue-600 py-1 rounded hover:bg-blue-200">수정</button>
                                    <button onClick={() => handleDelete(item.id, item.title)} className="flex-1 text-xs bg-red-100 text-red-600 py-1 rounded hover:bg-red-200">삭제</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 페이지네이션 */}
            <div className="bg-white rounded-lg shadow">
                <LC.Pagination page={filter.page} lastPage={lastPage} total={total} onPageChange={handlePageChange} />
            </div>
        </div>
    )
}

export default GallerySkin