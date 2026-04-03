import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import { showAlert, showConfirm } from '@/utils/modal'

function PopupList() {
    const navigate          = useNavigate()
    const [list, setList]   = useState([])
    const [loading, setLoading] = useState(false)

    const fetchList = async () => {
        setLoading(true)
        try {
            const res = await api.get('/admin/design/popups')
            setList(res.data.data)
        } catch (err) {
            showAlert('error', '오류', '목록을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchList() }, [])

    const handleDelete = (id, title) => {
        showConfirm('삭제', `"${title}" 팝업을 삭제하시겠습니까?`, async () => {
            try {
                await api.delete(`/admin/design/popups/${id}`)
                showAlert('success', '삭제 완료', '삭제되었습니다.', () => fetchList())
            } catch (err) {
                showAlert('error', '오류', '삭제 실패')
            }
        })
    }

    const typeMap = {
        'fixed'  : { label: '고정 레이어', class: 'bg-blue-100 text-blue-700' },
        'move'   : { label: '이동 레이어', class: 'bg-green-100 text-green-700' },
        'window' : { label: '윈도우',      class: 'bg-purple-100 text-purple-700' },
    }

    const displayMap = {
        'always'      : '항상',
        'period'      : '기간',
        'period_time' : '기간+시간',
    }

    return (
        <div>
            <PageHeader
                title="팝업 관리"
                breadcrumbs={[
                    { label: '디자인' },
                    { label: '팝업 관리' },
                ]}
                actions={
                    <button
                        onClick={() => navigate('/admin/design/popups/create')}
                        className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600"
                    >
                        + 팝업 추가
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">팝업 제목</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">창 종류</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">크기</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">노출방식</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">오늘하루</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">노출</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">등록일</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">관리</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">로딩 중...</td></tr>
                        ) : list.length === 0 ? (
                            <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">팝업이 없습니다.</td></tr>
                        ) : (
                            list.map((item, index) => {
                                const t = typeMap[item.popup_type] || { label: item.popup_type, class: 'bg-gray-100 text-gray-700' }
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-3 font-medium">{item.title}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.class}`}>{t.label}</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{item.width} × {item.height}px</td>
                                        <td className="px-4 py-3 text-gray-500">{displayMap[item.display_type]}</td>
                                        <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded ${item.hide_today === '1' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    {item.hide_today === '1' ? '사용' : '미사용'}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded ${item.is_active === '1' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    {item.is_active === '1' ? '노출' : '미노출'}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">{item.created_at?.slice(0, 10)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => navigate(`/admin/design/popups/${item.id}`)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">수정</button>
                                                <button onClick={() => handleDelete(item.id, item.title)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">삭제</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default PopupList