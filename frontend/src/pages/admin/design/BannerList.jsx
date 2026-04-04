import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListData } from '@/hooks/useListData';
import { handleDeleteItem } from '@/utils/listActions';
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import * as FC from "@/components/admin/FormComponents.jsx";
import * as LC from "@/components/admin/ListComponents.jsx";

const INITIAL_FILTER = {
    keyword: '',
    effect: '',
    is_active: '',
    date_type: 'dated_at',
    start_date: '',
    end_date: '',
    page: 1,
    per_page: 10,
};


function BannerList() {
    const navigate          = useNavigate()
    const {
        list, total, lastPage, loading,
        filter, setFilter,
        fetchList,
        handleFilterChange,
        handleSearch,
        handleReset,
        handlePageChange,
    } = useListData('/admin/design/banners', INITIAL_FILTER);


    useEffect(() => {
        fetchList(filter);
    }, []);

    const handleDelete = (id, title) => {
        handleDeleteItem({
            api,
            url: `/admin/design/banners/${id}`,
            label: title,
            onSuccess: () => fetchList(),
        });
    };

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

            <div className="bg-white rounded-lg shadow p-4 mb-4 space-y-4">
                <div className={"flex flex-col lg:flex-row lg:items-end gap-2"}>
                    <div className={"flex items-center gap-2 w-full"}>
                        <input
                            type="text"
                            name="keyword"
                            placeholder="배너명 또는 배너코드명"
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

                <div className={"grid grid-cols-1 lg:grid-cols-2 gap-4"}>
                    <div className={"space-y-3"}>
                        <label className="block text-xs text-gray-500 mb-1">배너효과</label>
                        <select name="effect" value={filter.effect} onChange={handleFilterChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
                            <option value="">전체</option>
                            <option value="slide">슬라이드</option>
                            <option value="fade">페이드</option>
                        </select>
                    </div>

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

                <div className="flex flex-col lg:flex-row lg:items-end gap-2">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">기간</label>
                        <select
                            name="date_type"
                            value={filter.date_type}
                            onChange={handleFilterChange}
                            className={FC.selectClass}
                        >
                            <option value="dated_at">노출기간</option>
                            <option value="created_at">등록일</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-ls text-gray-500 mb-1">시작일</label>
                        <input
                            type="date"
                            name="start_date"
                            value={filter.start_date}
                            onChange={handleFilterChange}
                            className={FC.inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">종료일</label>
                        <input
                            type="date"
                            name="end_date"
                            value={filter.end_date}
                            onChange={handleFilterChange}
                            className={FC.inputClass}
                        />
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

export default BannerList