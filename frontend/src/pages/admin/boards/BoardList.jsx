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
    const [list, setList]     = useState([])
    const [loading, setLoading] = useState(false)

    const fetchList = async () => {
        setLoading(true)
        try {
            const res = await api.get('/admin/boards')
            setList(res.data.data)
        } catch (err) {
            showAlert('error', '오류', '목록을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchList()
    }, [])

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

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
                    총 <span className="font-bold text-gray-800">{list.length}</span> 건
                </div>

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
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default BoardList