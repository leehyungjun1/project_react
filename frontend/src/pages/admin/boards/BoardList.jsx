import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import * as LC from '@/components/admin/ListComponents'
import { showAlert, showConfirm } from '@/utils/modal'

// 스킨 뱃지
const SkinBadge = ({ value }) => {
    const map = {
        'normal'  : { label: '일반형',    class: 'bg-blue-100 text-blue-700' },
        'gallery' : { label: '갤러리형',  class: 'bg-purple-100 text-purple-700' },
        'qna'     : { label: '1:1문의형', class: 'bg-yellow-100 text-yellow-700' },
        'event'   : { label: '이벤트형',  class: 'bg-red-100 text-red-700' },
    }
    const skin = map[value] || { label: value, class: 'bg-gray-100 text-gray-700' }
    return (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${skin.class}`}>
            {skin.label}
        </span>
    )
}

function BoardList() {
    const navigate            = useNavigate()
    const [list, setList]             = useState([])
    const [loading, setLoading]     = useState(false)

    const [filter, setFilter] = useState({
        keyword    : '',
        skin_type  : '',
        is_active  : '',
        page       : 1,
        per_page   : 20,
    })

    const [total, setTotal]         = useState(0)
    const [lastPage, setLastPage]   = useState(1)

    // 목록 조회
    const fetchList = async (params = filter) => {
        setLoading(true)
        try {
            const res = await api.get('/admin/boards', { params })
            setList(res.data.data.list)
            setTotal(res.data.data.total)
            setLastPage(res.data.data.lastPage)
        } catch (err) {
            showAlert('error', '오류', '목록을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchList()
    }, [])

    // 필터 변경
    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value })
    }

    // 검색
    const handleSearch = () => {
        const newFilter = { ...filter, page: 1 }
        setFilter(newFilter)
        fetchList(newFilter)
    }

    // 초기화
    const handleReset = () => {
        const newFilter = {
            keyword     : '',
            search_type : 'name',
            is_active   : '',
            skin_type   : '',
            page        : 1,
            per_page    : 20,
        }
        setFilter(newFilter)
        fetchList(newFilter)
    }

    // 페이지 변경
    const handlePageChange = (page) => {
        const newFilter = { ...filter, page }
        setFilter(newFilter)
        fetchList(newFilter)
    }

    const handleDelete = (id, name) => {
        showConfirm('삭제', `"${name}" 게시판을 삭제하시겠습니까?`, async () => {
            try {
                await api.delete(`/admin/boards/${id}`)
                showAlert('success', '삭제 완료', '삭제되었습니다.', () => fetchList())
            } catch (err) {
                showAlert('error', '오류', '삭제 실패')
            }
        })
    }

    return (
        <div>
            <PageHeader
                title="게시판 관리"
                breadcrumbs={[
                    { label: '게시판 관리', path: '/admin/boards' },
                    { label: '게시판 목록' },
                ]}
                actions={
                    <button
                        onClick={() => navigate('/admin/boards/create')}
                        className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600"
                    >
                        + 게시판 추가
                    </button>
                }
            />

            {/* ===== 검색 필터 ===== */}
            <div className="bg-white rounded-lg shadow p-4 mb-4 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-end gap-2">
                    {/* 키워드 검색 */}
                    <div className="flex items-center gap-2 w-full">
                        <input
                            type="text"
                            name="keyword"
                            placeholder="게시판명 또는 코드 검색"
                            value={filter.keyword}
                            onChange={handleFilterChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                        />
                        <button onClick={handleSearch} className="shrink-0 bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600">
                            검색
                        </button>
                        <button onClick={handleReset} className="shrink-0 bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded hover:bg-gray-300">
                            초기화
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* 좌측 */}
                    <div className="space-y-3">
                        {/* 스킨 */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">스킨</label>
                            <select name="skin_type" value={filter.skin_type} onChange={handleFilterChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
                                <option value="">전체</option>
                                <option value="normal">일반형</option>
                                <option value="gallery">갤러리형</option>
                                <option value="qna">1:1문의형</option>
                                <option value="event">이벤트형</option>
                            </select>
                        </div>
                    </div>
                    {/* 우측 */}
                    <div className="space-y-3">
                        {/* 사용여부 */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">사용여부</label>
                            <select name="is_active" value={filter.is_active} onChange={handleFilterChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
                                <option value="">전체</option>
                                <option value="1">사용</option>
                                <option value="0">미사용</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <LC.ListHeader
                    total={total}
                    keyword={filter.keyword}
                    perPage={filter.per_page}
                    onPerPageChange={(value) => {
                        const newFilter = { ...filter, per_page: value, page: 1 }
                        setFilter(newFilter)
                        fetchList(newFilter)
                    }}
                />

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">게시판 코드</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">게시판명</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">스킨</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">댓글</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">별점</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">파일</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">사용여부</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">관리</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="px-4 py-8 text-center text-gray-400">로딩 중...</td>
                            </tr>
                        ) : list.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-4 py-8 text-center text-gray-400">게시판이 없습니다.</td>
                            </tr>
                        ) : (
                            list.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-3 font-mono text-sm text-blue-600">{item.board_code}</td>
                                    <td className="px-4 py-3 font-medium">{item.board_name}</td>
                                    <td className="px-4 py-3"><SkinBadge value={item.skin_type} /></td>
                                    <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded ${item.use_comment === '1' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {item.use_comment === '1' ? '사용' : '미사용'}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded ${item.use_rating === '1' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {item.use_rating === '1' ? '사용' : '미사용'}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded ${item.use_file === '1' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {item.use_file === '1' ? '사용' : '미사용'}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded ${item.is_active === '1' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {item.is_active === '1' ? '사용' : '미사용'}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/boards/${item.id}`)}
                                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.board_name)}
                                                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                            >
                                                삭제
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/boards/${item.board_code}/posts`)}
                                                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                            >
                                                게시글
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 */}
                <LC.Pagination
                    page={filter.page}
                    lastPage={lastPage}
                    total={total}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    )
}

export default BoardList