// src/pages/admin/products/DeliveryGroupList.jsx
import { useNavigate } from 'react-router-dom'
import { useListData } from '@/hooks/useListData'
import { handleDeleteItem } from '@/utils/listActions'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import * as FC from '@/components/admin/FormComponents'
import * as LC from '@/components/admin/ListComponents'

const INITIAL_FILTER = {
    keyword  : '',
    type     : '',
    is_active: '',
    page     : 1,
    per_page : 20,
}

const TYPE_MAP = {
    free             : { label: '무료배송',     class: 'bg-green-100 text-green-600' },
    fixed            : { label: '고정배송비',   class: 'bg-blue-100 text-blue-700' },
    conditional_free : { label: '조건부무료',   class: 'bg-purple-100 text-purple-700' },
    range            : { label: '구간별배송비', class: 'bg-yellow-100 text-yellow-700' },
}

function DeliveryGroupList() {
    const navigate = useNavigate()

    const {
        list, total, lastPage, loading,
        filter,
        refetch,
        handleFilterChange,
        handleSearch,
        handleReset,
        handlePageChange,
        handlePerPageChange,
    } = useListData('/admin/delivery-groups', INITIAL_FILTER)

    const handleDelete = (id, name) => {
        handleDeleteItem({
            api,
            url: `/admin/delivery-groups/${id}`,
            label: name,
            onSuccess: refetch,
        })
    }

    return (
        <div>
            <PageHeader
                title="배송비 그룹 관리"
                breadcrumbs={[
                    { label: '상품관리' },
                    { label: '배송비 그룹' },
                ]}
                actions={
                    <button
                        onClick={() => navigate('/admin/delivery-groups/create')}
                        className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600"
                    >
                        + 배송비 그룹 추가
                    </button>
                }
            />

            {/* 검색 필터 */}
            <div className="bg-white rounded-lg shadow p-4 mb-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">검색어</label>
                            <input
                                type="text"
                                name="keyword"
                                value={filter.keyword}
                                onChange={handleFilterChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="배송비 그룹명 검색"
                                className={FC.inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">배송비 타입</label>
                            <select name="type" value={filter.type} onChange={handleFilterChange} className={FC.selectClass + ' w-full'}>
                                <option value="">전체</option>
                                <option value="free">무료배송</option>
                                <option value="fixed">고정배송비</option>
                                <option value="conditional_free">조건부 무료</option>
                                <option value="range">구간별 배송비</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">사용여부</label>
                            <select name="is_active" value={filter.is_active} onChange={handleFilterChange} className={FC.selectClass + ' w-full'}>
                                <option value="">전체</option>
                                <option value="1">사용</option>
                                <option value="0">미사용</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button onClick={handleSearch} className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600">검색</button>
                            <button onClick={handleReset}  className="bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded hover:bg-gray-300">초기화</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 리스트 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <LC.ListHeader
                    total={total}
                    keyword={filter.keyword}
                    perPage={filter.per_page}
                    onPerPageChange={handlePerPageChange}
                />
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">그룹명</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">타입</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">기본 배송비</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">무료 기준금액</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">제주 추가</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">도서산간 추가</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">사용여부</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">관리</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">로딩 중...</td></tr>
                        ) : list.length === 0 ? (
                            <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">배송비 그룹이 없습니다.</td></tr>
                        ) : list.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/delivery-groups/${item.id}`)}>
                                <td className="px-4 py-3 text-gray-400 text-xs">{total - (filter.page - 1) * filter.per_page - index}</td>
                                <td className="px-4 py-3 font-medium">{item.name}</td>
                                <td className="px-4 py-3">
                                    <LC.Badge value={item.type} map={TYPE_MAP} />
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {item.type === 'free' ? '-' : `${Number(item.base_fee).toLocaleString()} 원`}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {item.free_threshold > 0 ? `${Number(item.free_threshold).toLocaleString()} 원 이상` : '-'}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {item.jejudo_fee > 0 ? `+${Number(item.jejudo_fee).toLocaleString()} 원` : '-'}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {item.island_fee > 0 ? `+${Number(item.island_fee).toLocaleString()} 원` : '-'}
                                </td>
                                <td className="px-4 py-3">
                                    <LC.Badge value={String(item.is_active)} map={LC.BadgeMaps.isActive} />
                                </td>
                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => navigate(`/admin/delivery-groups/${item.id}`)} className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600">상세</button>
                                        <button onClick={() => navigate(`/admin/delivery-groups/${item.id}?mode=edit`)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">수정</button>
                                        <button onClick={() => handleDelete(item.id, item.name)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">삭제</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
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

export default DeliveryGroupList