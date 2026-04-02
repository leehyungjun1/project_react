import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import * as FC from '../../../components/admin/FormComponents.jsx'
import PageHeader from '../../../components/admin/PageHeader'
import api from '../../../api/axios'
import * as LC from '../../../components/admin/ListComponents'
import { useSettingCodes } from '../../../hooks/useSettingCodes'
import { showAlert, showConfirm } from '@/utils/modal'

// 상태 뱃지
const StatusBadge = ({ value }) => {
    const map = {
        '1001': { label: '승인대기', class: 'bg-yellow-100 text-yellow-700' },
        '1002': { label: '재직중',   class: 'bg-green-100 text-green-700' },
        '1003': { label: '휴가중',   class: 'bg-blue-100 text-blue-700' },
        '1004': { label: '퇴직',     class: 'bg-red-100 text-red-700' },
    }
    const status = map[value] || { label: value, class: 'bg-gray-100 text-gray-700' }
    return (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.class}`}>
            {status.label}
        </span>
    )
}

// 레벨 뱃지

function AdminList() {
    const navigate   = useNavigate()
    const levelCodes                = useSettingCodes('100001')

    const getLevelName = (code) => {
        const found = levelCodes.find(opt => opt.code === code)
        return found?.name ?? code ?? '-'
    }

    const [list, setList]         = useState([])
    const [total, setTotal]       = useState(0)
    const [lastPage, setLastPage] = useState(1)
    const [loading, setLoading]   = useState(false)

    // 필터
    const [filter, setFilter] = useState({
        keyword     : '',
        search_type : 'name',
        is_active   : '',
        admin_level : '',
        emp_type    : '',
        start_date  : '',
        end_date    : '',
        date_type   : 'created_at',
        page        : 1,
        per_page    : 20,
    })

    // 목록 조회
    const fetchList = async (params = filter) => {
        setLoading(true)
        try {
            const res = await api.get('/admin/managers', { params });
            setList(res.data.data.list)
            setTotal(res.data.data.total)
            setLastPage(res.data.data.last_page)
        } catch (err) {
            console.error(err)
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
            admin_level : '',
            emp_type    : '',
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

    // 상태 변경
    const handleStatusChange = async (id, isActive) => {
        showConfirm('상태 변경', '상태를 변경하시겠습니까?', async () => {
            try {
                await api.put(`/admin/managers/status/${id}`, { is_active: isActive })
                fetchList()
            } catch (err) {
                showAlert('error', '오류', '상태 변경 실패')
            }
        })
    }

    // 삭제
    const handleDelete = async (id) => {
        showConfirm('삭제', '정말 삭제하시겠습니까?', async () => {
            try {
                await api.delete(`/admin/managers/${id}`)
                showAlert('success', '삭제 완료', '삭제되었습니다.', () => {
                    fetchList()
                })
            } catch (err) {
                showAlert('error', '오류', '삭제 실패')
            }
        })
    }

    return (
        <div>
            <PageHeader
                title="관리자 리스트"
                breadcrumbs={[
                    { label: '관리자 관리', path: '/admin/managers' },
                    { label: '관리자 리스트' },
                ]}
                actions={
                    <button
                        onClick={() => navigate('/admin/managers/register')}
                        className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600"
                    >
                        + 가입 신청
                    </button>
                }
            />

            {/* ===== 검색 필터 ===== */}
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
                                    <option value="admin_id">아이디</option>
                                    <option value="email">이메일</option>
                                    <option value="mobile">휴대폰</option>
                                </select>

                                <input
                                    type="text"
                                    name="keyword"
                                    placeholder="검색어 입력"
                                    value={filter.keyword}
                                    onChange={handleFilterChange}
                                    className={FC.inputClass}
                                />
                            </div>
                        </div>

                        {/* 직원여부 */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">직원여부</label>
                            <select
                                name="emp_type"
                                value={filter.emp_type}
                                onChange={handleFilterChange}
                                className={FC.selectClass + ' w-full'}
                            >
                                <option value="">전체</option>
                                <option value="1001">직원</option>
                                <option value="1002">비정규직</option>
                                <option value="1003">아르바이트</option>
                                <option value="1004">파견직</option>
                                <option value="1005">퇴사자</option>
                            </select>
                        </div>
                    </div>

                    {/* 우측 */}
                    <div className="space-y-3">
                        {/* 상태 */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">상태</label>
                            <select
                                name="is_active"
                                value={filter.is_active}
                                onChange={handleFilterChange}
                                className={FC.selectClass + ' w-full'}
                            >
                                <option value="">전체</option>
                                <option value="1001">승인대기</option>
                                <option value="1002">재직중</option>
                                <option value="1003">휴가중</option>
                                <option value="1004">퇴직</option>
                            </select>
                        </div>

                        {/* 레벨 + 텍스트 검색 */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">관리자 레벨</label>
                            <select
                                name="admin_level"
                                value={filter.admin_level}
                                onChange={handleFilterChange}
                                className={FC.selectClass + ' w-full'}
                            >
                                <option value="">전체</option>
                                {levelCodes.map(opt => (
                                    <option key={opt.id} value={opt.code}>
                                        {opt.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                </div>

                {/* ===== 기간 (무조건 1줄) ===== */}
                <div className="flex flex-col lg:flex-row lg:items-end gap-2">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">기간</label>
                        <select
                            name="date_type"
                            value={filter.date_type}
                            onChange={handleFilterChange}
                            className={FC.selectClass}
                        >
                            <option value="created_at">가입일</option>
                            <option value="last_login_at">최근 로그인</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">시작일</label>
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

                    {/* 버튼 */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleSearch}
                            className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600"
                        >
                            검색
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded hover:bg-gray-300"
                        >
                            초기화
                        </button>
                    </div>
                </div>

            </div>

            {/* ===== 목록 ===== */}
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

                {/* 테이블 */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">아이디</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">이름</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">휴대폰</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">이메일</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">레벨</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">상태</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">최근 로그인</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">가입일</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">관리</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="10" className="px-4 py-8 text-center text-gray-400">
                                    로딩 중...
                                </td>
                            </tr>
                        ) : list.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="px-4 py-8 text-center text-gray-400">
                                    데이터가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            list.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-500">
                                        {total - ((filter.page - 1) * filter.per_page) - index}
                                    </td>
                                    <td className="px-4 py-3 font-medium">{item.admin_id}</td>
                                    <td className="px-4 py-3">{item.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{item.mobile}</td>
                                    <td className="px-4 py-3 text-gray-500">{item.email}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                                            {getLevelName(item.admin_level)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge value={item.is_active} />
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {item.last_login_at ?? '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {item.created_at?.slice(0, 10)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {/* 승인 버튼 (승인대기일 때만) */}
                                            {item.is_active === '1001' && (
                                                <button
                                                    onClick={() => handleStatusChange(item.id, '1002')}
                                                    className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                                >
                                                    승인
                                                </button>
                                            )}
                                            {/* 수정 */}
                                            <button
                                                onClick={() => navigate(`/admin/managers/${item.id}`)}
                                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                            >
                                                수정
                                            </button>
                                            {/* 삭제 */}
                                            <button
                                                onClick={() => handleDelete(item.id)}
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

export default AdminList