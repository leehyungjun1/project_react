import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import * as FC from '@/components/admin/FormComponents'
import * as LC from '@/components/admin/ListComponents'
import { showAlert, showConfirm } from '@/utils/modal'

function PostList() {
    const navigate            = useNavigate()
    const { boardCode }       = useParams()
    const [board, setBoard]   = useState(null)
    const [list, setList]     = useState([])
    const [total, setTotal]   = useState(0)
    const [lastPage, setLastPage] = useState(1)
    const [loading, setLoading]   = useState(false)

    const [filter, setFilter] = useState({
        keyword     : '',
        search_type : 'title',
        is_use      : '',
        is_notice   : '',
        page        : 1,
        per_page    : 20,
    })

    const fetchList = async (params = filter) => {
        setLoading(true)
        try {
            const res = await api.get(`/admin/boards/${boardCode}/posts`, { params })
            setBoard(res.data.data.board)
            setList(res.data.data.list)
            setTotal(res.data.data.total)
            setLastPage(res.data.data.last_page)
        } catch (err) {
            showAlert('error', '오류', '목록을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchList()
    }, [boardCode])

    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value })
    }

    const handleSearch = () => {
        const newFilter = { ...filter, page: 1 }
        setFilter(newFilter)
        fetchList(newFilter)
    }

    const handleReset = () => {
        const newFilter = {
            keyword     : '',
            search_type : 'title',
            is_use      : '',
            is_notice   : '',
            page        : 1,
            per_page    : 20,
        }
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
                title={`${board?.board_name ?? ''} 게시글 관리`}
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">사용여부</label>
                        <select name="is_use" value={filter.is_use} onChange={handleFilterChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
                            <option value="">전체</option>
                            <option value="1">사용</option>
                            <option value="0">미사용</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">공지여부</label>
                        <select name="is_notice" value={filter.is_notice} onChange={handleFilterChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
                            <option value="">전체</option>
                            <option value="1">공지</option>
                            <option value="0">일반</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <select name="search_type" value={filter.search_type} onChange={handleFilterChange} className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
                        <option value="title">제목</option>
                        <option value="content">내용</option>
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

            {/* 목록 */}
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">제목</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">작성자</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">조회수</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">공지</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">사용</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">작성일</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">관리</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">로딩 중...</td></tr>
                        ) : list.length === 0 ? (
                            <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">게시글이 없습니다.</td></tr>
                        ) : (
                            list.map((item, index) => (
                                <tr key={item.id} className={`hover:bg-gray-50 ${item.is_notice === '1' ? 'bg-yellow-50' : ''}`}>
                                    <td className="px-4 py-3 text-gray-500">
                                        {item.is_notice === '1'
                                            ? <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">공지</span>
                                            : total - ((filter.page - 1) * filter.per_page) - index
                                        }
                                    </td>
                                    <td className="px-4 py-3">
                                            <span
                                                onClick={() => navigate(`/admin/boards/${boardCode}/posts/${item.id}/view`)}
                                                className="cursor-pointer hover:text-orange-500 font-medium"
                                            >
                                                {item.title}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{item.writer}</td>
                                    <td className="px-4 py-3 text-gray-500">{item.hit}</td>
                                    <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded ${item.is_notice === '1' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {item.is_notice === '1' ? '공지' : '일반'}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded ${item.is_use === '1' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {item.is_use === '1' ? '사용' : '미사용'}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{item.created_at?.slice(0, 10)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/boards/${boardCode}/posts/${item.id}`)}
                                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.title)}
                                                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

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

export default PostList