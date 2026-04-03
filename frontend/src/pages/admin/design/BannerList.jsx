import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import { showAlert, showConfirm } from '@/utils/modal'

function BannerList() {
    const navigate          = useNavigate()
    const [list, setList]   = useState([])
    const [loading, setLoading] = useState(false)

    const fetchList = async () => {
        setLoading(true)
        try {
            const res = await api.get('/admin/design/banners')
            setList(res.data.data)
        } catch (err) {
            showAlert('error', '오류', '목록을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchList() }, [])

    const handleDelete = (id, title) => {
        showConfirm('삭제', `"${title}" 배너를 삭제하시겠습니까?`, async () => {
            try {
                await api.delete(`/admin/design/banners/${id}`)
                showAlert('success', '삭제 완료', '삭제되었습니다.', () => fetchList())
            } catch (err) {
                showAlert('error', '오류', '삭제 실패')
            }
        })
    }

    const DeviceBadge = ({ value }) => {
        const map = {
            'pc'     : { label: 'PC',     class: 'bg-blue-100 text-blue-700' },
            'mobile' : { label: '모바일', class: 'bg-green-100 text-green-700' },
            'both'   : { label: '전체',   class: 'bg-purple-100 text-purple-700' },
        }
        const d = map[value] || { label: value, class: 'bg-gray-100 text-gray-700' }
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.class}`}>{d.label}</span>
    }

    return (
        <div>
            <PageHeader
                title="슬라이드 배너"
                breadcrumbs={[
                    { label: '디자인' },
                    { label: '슬라이드 배너' },
                ]}
                actions={
                    <button
                        onClick={() => navigate('/admin/design/banners/create')}
                        className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600"
                    >
                        + 배너 추가
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">배너 제목</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">구분</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">효과</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">크기</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">노출</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">등록일</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">관리</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">로딩 중...</td></tr>
                        ) : list.length === 0 ? (
                            <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">배너가 없습니다.</td></tr>
                        ) : (
                            list.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-3 font-medium">{item.title}</td>
                                    <td className="px-4 py-3"><DeviceBadge value={item.device_type} /></td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {item.effect === 'slide' ? '슬라이드' : '페이드'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {item.banner_width}{item.width_unit} × {item.banner_height}px
                                    </td>
                                    <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded ${item.is_active === '1' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {item.is_active === '1' ? '노출' : '미노출'}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{item.created_at?.slice(0, 10)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/design/banners/${item.id}`)}
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
            </div>
        </div>
    )
}

export default BannerList