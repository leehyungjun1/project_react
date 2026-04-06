// src/pages/admin/products/DeliveryGroupDetail.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import { showAlert } from '@/utils/modal'
import * as FC from '@/components/admin/FormComponents'

const INITIAL_FORM = {
    name           : '',
    type           : 'fixed',
    base_fee       : 0,
    free_threshold : 0,
    jejudo_fee     : 0,
    island_fee     : 0,
    is_active      : 1,
    ranges         : [],
}

const TYPE_LABELS = {
    free             : '무료배송',
    fixed            : '고정배송비',
    conditional_free : '조건부 무료',
    range            : '구간별 배송비',
}

function DeliveryGroupDetail() {
    const { id }   = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const isCreate = id === 'create'

    const [form, setForm]           = useState(INITIAL_FORM)
    const [editMode, setEditMode]   = useState(isCreate)
    const [loading, setLoading]     = useState(false)
    const [pageLoading, setPageLoading] = useState(!isCreate)

    useEffect(() => {
        if (!isCreate) {
            if (searchParams.get('mode') === 'edit') setEditMode(true)
            api.get(`/admin/delivery-groups/${id}`)
                .then(res => setForm(res.data.data))
                .catch(() => showAlert('error', '오류', '데이터를 불러오는데 실패했습니다.'))
                .finally(() => setPageLoading(false))
        }
    }, [id])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    // 구간 추가
    const handleAddRange = () => {
        setForm(prev => ({
            ...prev,
            ranges: [...prev.ranges, { min_amount: 0, max_amount: 0, fee: 0 }]
        }))
    }

    // 구간 수정
    const handleRangeChange = (index, field, value) => {
        setForm(prev => {
            const ranges = [...prev.ranges]
            ranges[index] = { ...ranges[index], [field]: value }
            return { ...prev, ranges }
        })
    }

    // 구간 삭제
    const handleRemoveRange = (index) => {
        setForm(prev => ({
            ...prev,
            ranges: prev.ranges.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async () => {
        if (!form.name) return showAlert('warning', '확인', '그룹명을 입력해주세요.')
        setLoading(true)
        try {
            if (isCreate) {
                await api.post('/admin/delivery-groups', form)
                showAlert('success', '완료', '등록되었습니다.', () => navigate('/admin/delivery-groups'))
            } else {
                await api.put(`/admin/delivery-groups/${id}`, form)
                showAlert('success', '완료', '수정되었습니다.', () => setEditMode(false))
            }
        } catch (err) {
            showAlert('error', '오류', err.response?.data?.message || '처리 실패')
        } finally {
            setLoading(false)
        }
    }

    const ReadField = ({ label, children }) => (
        <div className="flex items-start py-2 border-b border-gray-50 last:border-0">
            <span className="w-32 shrink-0 text-xs text-gray-500 pt-0.5">{label}</span>
            <span className="flex-1 text-sm text-gray-800">{children || '-'}</span>
        </div>
    )

    if (pageLoading) return <div className="flex items-center justify-center p-20 text-gray-400">로딩 중...</div>

    return (
        <div>
            <PageHeader
                title={isCreate ? '배송비 그룹 등록' : '배송비 그룹 상세'}
                breadcrumbs={[
                    { label: '상품관리' },
                    { label: '배송비 그룹', path: '/admin/delivery-groups' },
                    { label: isCreate ? '등록' : '상세' },
                ]}
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/admin/delivery-groups')} className="border border-gray-300 text-sm px-4 py-1.5 rounded hover:bg-gray-50">
                            목록
                        </button>
                        {editMode ? (
                            <>
                                {!isCreate && (
                                    <button onClick={() => setEditMode(false)} className="bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded hover:bg-gray-300">
                                        취소
                                    </button>
                                )}
                                <button onClick={handleSubmit} disabled={loading} className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600 disabled:opacity-50">
                                    {loading ? '처리 중...' : isCreate ? '등록' : '저장'}
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setEditMode(true)} className="bg-blue-500 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-600">
                                수정
                            </button>
                        )}
                    </div>
                }
            />

            <div className="space-y-4">

                {/* 기본 설정 */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-4">기본 설정</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                        <div>
                            {editMode ? (
                                <>
                                    <FC.Row label="그룹명" required>
                                        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="배송비 그룹명" className={FC.inputClass} />
                                    </FC.Row>
                                    <FC.Row label="배송비 타입" required>
                                        <select name="type" value={form.type} onChange={handleChange} className={FC.selectClass + ' w-full'}>
                                            <option value="free">무료배송</option>
                                            <option value="fixed">고정배송비</option>
                                            <option value="conditional_free">조건부 무료</option>
                                            <option value="range">구간별 배송비</option>
                                        </select>
                                    </FC.Row>
                                    <FC.Row label="사용여부">
                                        <div className="flex gap-4 pt-1">
                                            {[['1','사용'],['0','미사용']].map(([val, label]) => (
                                                <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="radio" name="is_active" value={val} checked={String(form.is_active) === val} onChange={handleChange} className="accent-orange-500" />
                                                    {label}
                                                </label>
                                            ))}
                                        </div>
                                    </FC.Row>
                                </>
                            ) : (
                                <>
                                    <ReadField label="그룹명">{form.name}</ReadField>
                                    <ReadField label="배송비 타입">{TYPE_LABELS[form.type]}</ReadField>
                                    <ReadField label="사용여부">
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${form.is_active == 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {form.is_active == 1 ? '사용' : '미사용'}
                                        </span>
                                    </ReadField>
                                </>
                            )}
                        </div>
                        <div>
                            {editMode ? (
                                <>
                                    {form.type !== 'free' && (
                                        <FC.Row label="기본 배송비">
                                            <input type="number" name="base_fee" value={form.base_fee} onChange={handleChange} className={FC.inputClass} />
                                        </FC.Row>
                                    )}
                                    {(form.type === 'conditional_free') && (
                                        <FC.Row label="무료배송 기준금액">
                                            <input type="number" name="free_threshold" value={form.free_threshold} onChange={handleChange} placeholder="이 금액 이상 무료" className={FC.inputClass} />
                                        </FC.Row>
                                    )}
                                    <FC.Row label="제주 추가배송비">
                                        <input type="number" name="jejudo_fee" value={form.jejudo_fee} onChange={handleChange} className={FC.inputClass} />
                                    </FC.Row>
                                    <FC.Row label="도서산간 추가배송비">
                                        <input type="number" name="island_fee" value={form.island_fee} onChange={handleChange} className={FC.inputClass} />
                                    </FC.Row>
                                </>
                            ) : (
                                <>
                                    {form.type !== 'free' && (
                                        <ReadField label="기본 배송비">{Number(form.base_fee).toLocaleString()} 원</ReadField>
                                    )}
                                    {form.free_threshold > 0 && (
                                        <ReadField label="무료배송 기준">{Number(form.free_threshold).toLocaleString()} 원 이상</ReadField>
                                    )}
                                    <ReadField label="제주 추가">{form.jejudo_fee > 0 ? `+${Number(form.jejudo_fee).toLocaleString()} 원` : '-'}</ReadField>
                                    <ReadField label="도서산간 추가">{form.island_fee > 0 ? `+${Number(form.island_fee).toLocaleString()} 원` : '-'}</ReadField>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 구간별 배송비 설정 */}
                {(form.type === 'range') && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-700">구간별 배송비 설정</h3>
                            {editMode && (
                                <button onClick={handleAddRange} className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded hover:bg-orange-600">
                                    + 구간 추가
                                </button>
                            )}
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">최소금액 (원 이상)</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">최대금액 (원 미만, 0=이상)</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">배송비 (원)</th>
                                {editMode && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">삭제</th>}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {form.ranges?.length === 0 ? (
                                <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-400 text-sm">구간을 추가해주세요.</td></tr>
                            ) : form.ranges?.map((range, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2">
                                        {editMode ? (
                                            <input type="number" value={range.min_amount} onChange={e => handleRangeChange(index, 'min_amount', e.target.value)} className={FC.inputClass} />
                                        ) : (
                                            `${Number(range.min_amount).toLocaleString()} 원`
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {editMode ? (
                                            <input type="number" value={range.max_amount} onChange={e => handleRangeChange(index, 'max_amount', e.target.value)} className={FC.inputClass} />
                                        ) : (
                                            range.max_amount > 0 ? `${Number(range.max_amount).toLocaleString()} 원` : '이상'
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {editMode ? (
                                            <input type="number" value={range.fee} onChange={e => handleRangeChange(index, 'fee', e.target.value)} className={FC.inputClass} />
                                        ) : (
                                            `${Number(range.fee).toLocaleString()} 원`
                                        )}
                                    </td>
                                    {editMode && (
                                        <td className="px-4 py-2">
                                            <button onClick={() => handleRemoveRange(index)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                                                삭제
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DeliveryGroupDetail