import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListData } from '@/hooks/useListData'
import { handleDeleteItem } from '@/utils/listActions'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import * as FC from '@/components/admin/FormComponents'
import * as LC from '@/components/admin/ListComponents'

const INITIAL_FILTER = {
    keyword      : '',
    search_type  : 'name',
    member_type  : '',
    is_approved  : '',
    grade_code   : '',
    date_type    : 'created_at',
    start_date   : '',
    end_date     : '',
    page         : 1,
    per_page     : 20,
}

function UserList() {
    const navigate = useNavigate()

    const {
        list, total, lastPage, loading,
        filter, setFilter,
        refetch,
        handleFilterChange,
        handleSearch,
        handleReset,
        handlePageChange,
        handlePerPageChange,
    } = useListData('/admin/users', INITIAL_FILTER)

    const [grades, setGrades] = useState([])

    const handleDelete = (id, name) => {
        handleDeleteItem({
            api,
            url: `/admin/member/${id}`,
            label: name,
            onSuccess: refetch,
        })
    }

    const MemberTypeBadge = ({ value }) => {
        const map = {
            personal : { label: '개인', class: 'bg-blue-100 text-blue-700' },
            business : { label: '사업자', class: 'bg-purple-100 text-purple-700' },
        }
        const d = map[value] || { label: value, class: 'bg-gray-100 text-gray-600' }
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.class}`}>{d.label}</span>
    }

    const ApprovedBadge = ({ value }) => (
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${value === 'Y' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
            {value === 'Y' ? '승인' : '미승인'}
        </span>
    )

    return (
        <div>
            <PageHeader
                title="회원 목록"
                breadcrumbs={[
                    { label: '회원관리' },
                    { label: '회원 목록' },
                ]}
                actions={
                    <button
                        onClick={() => navigate('/admin/member/create')}
                        className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600"
                    >
                        + 회원 등록
                    </button>
                }
            />

            {/* 검색 필터 */}
            <div className="bg-white rounded-lg shadow p-4 mb-4 space-y-4">

                {/* ===== 2단 영역 ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* 좌측 */}
                    <div className="space-y-3">
                        {/* 검색어 */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">검색어</label>
                            <div className="flex gap-2">
                                <select
                                    name="search_type"
                                    value={filter.search_type}
                                    onChange={handleFilterChange}
                                    className={FC.selectClass}
                                >
                                    <option value="name">이름</option>
                                    <option value="user_id">아이디</option>
                                    <option value="email">이메일</option>
                                    <option value="mobile">휴대폰</option>
                                </select>
                                <input
                                    type="text"
                                    name="keyword"
                                    value={filter.keyword}
                                    onChange={handleFilterChange}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="검색어 입력"
                                    className={FC.inputClass}
                                />
                            </div>
                        </div>

                        {/* 회원구분 */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">회원구분</label>
                            <select name="member_type" value={filter.member_type} onChange={handleFilterChange} className={FC.selectClass + ' w-full'}>
                                <option value="">전체</option>
                                <option value="personal">개인회원</option>
                                <option value="business">사업자회원</option>
                            </select>
                        </div>
                    </div>

                    {/* 우측 */}
                    <div className="space-y-3">
                        {/* 승인여부 */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">승인여부</label>
                            <select name="is_approved" value={filter.is_approved} onChange={handleFilterChange} className={FC.selectClass + ' w-full'}>
                                <option value="">전체</option>
                                <option value="Y">승인</option>
                                <option value="N">미승인</option>
                            </select>
                        </div>

                        {/* 등급 */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">등급</label>
                            <select name="grade_code" value={filter.grade_code} onChange={handleFilterChange} className={FC.selectClass + ' w-full'}>
                                <option value="">전체</option>
                                {grades.map(g => (
                                    <option key={g.code} value={g.code}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                </div>

                {/* ===== 기간 (1줄) ===== */}
                <div className="flex flex-col lg:flex-row lg:items-end gap-2">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">기간</label>
                        <select name="date_type" value={filter.date_type} onChange={handleFilterChange} className={FC.selectClass}>
                            <option value="created_at">가입일</option>
                            <option value="last_login_at">최근접속일</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">시작일</label>
                        <input type="date" name="start_date" value={filter.start_date} onChange={handleFilterChange} className={FC.inputClass} />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">종료일</label>
                        <input type="date" name="end_date" value={filter.end_date} onChange={handleFilterChange} className={FC.inputClass} />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSearch} className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600">
                            검색
                        </button>
                        <button onClick={handleReset} className="bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded hover:bg-gray-300">
                            초기화
                        </button>
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">구분</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">아이디</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">이름</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">이메일</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">휴대폰</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">등급</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">승인</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">가입일</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">관리</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="10" className="px-4 py-8 text-center text-gray-400">로딩 중...</td></tr>
                        ) : list.length === 0 ? (
                            <tr><td colSpan="10" className="px-4 py-8 text-center text-gray-400">회원이 없습니다.</td></tr>
                        ) : (
                            list.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-400 text-xs">{total - (filter.page - 1) * filter.per_page - index}</td>
                                    <td className="px-4 py-3"><MemberTypeBadge value={item.member_type} /></td>
                                    <td className="px-4 py-3 font-medium">{item.user_id}</td>
                                    <td className="px-4 py-3">{item.name}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{item.email}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{item.mobile}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{item.grade_name ?? '-'}</td>
                                    <td className="px-4 py-3"><ApprovedBadge value={item.is_approved} /></td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{item.created_at?.slice(0, 10)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/users/${item.id}`)}
                                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                            >
                                                상세
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/member/${item.id}`)}
                                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.name)}
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

export default UserList