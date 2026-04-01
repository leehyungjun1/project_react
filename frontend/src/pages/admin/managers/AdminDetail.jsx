import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/api/axios'
import * as FC from '@/components/admin/FormComponents'
import PageHeader from '@/components/admin/PageHeader'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useSettingCodes } from '@/hooks/useSettingCodes'
import { useForm } from '@/hooks/useForm'
import { showAlert, showConfirm } from '@/utils/modal'

function AdminDetail() {
    const navigate    = useNavigate()
    const { id }      = useParams()
    const { token }   = useAdminAuth()
    const headers     = { Authorization: `Bearer ${token}` }

    const [loading, setLoading]     = useState(false)
    const [pageLoading, setPageLoading] = useState(true)

    // 코드 목록
    const positionCodes = useSettingCodes('100002', token)
    const jobTitleCodes = useSettingCodes('100003', token)
    const levelCodes    = useSettingCodes('100001', token)

    const {
        form,
        setForm,
        errors,
        setErrors,
        handleChange,
        handlePhoneChange,
        handleAddressSearch,
    } = useForm({
        admin_id        : '',
        name            : '',
        nickname        : '',
        mobile          : '',
        email_id        : '',
        email_domain    : '',
        phone           : '',
        phone_ext       : '',
        emp_type        : '',
        department      : '',
        position        : '',
        job_title       : '',
        postcode        : '',
        address1        : '',
        address2        : '',
        admin_level     : '',
        is_active       : '1002',
        password        : '',
        password_confirm: '',
    })

    // 상세 조회
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/admin/managers/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = res.data.data

                // 이메일 분리
                const emailParts = data.email?.split('@') || ['', '']

                setForm({
                    ...data,
                    email_id    : emailParts[0],
                    email_domain: emailParts[1] ?? '',
                    password        : '',
                    password_confirm: '',
                })
            } catch (err) {
                showAlert('error', '오류', '데이터를 불러오는데 실패했습니다.')
            } finally {
                setPageLoading(false)
            }
        }

        fetchDetail()
    }, [id])

    // 저장
    const handleSubmit = async (e) => {
        e?.preventDefault()
        setErrors({})

        if (form.password && form.password !== form.password_confirm) {
            setErrors({ password_confirm: '비밀번호가 일치하지 않습니다.' })
            return
        }

        setLoading(true)

        try {
            await api.post(`/admin/managers/${id}`, {
                ...form,
                email: `${form.email_id}@${form.email_domain}`,
            }, { headers })

            showAlert('success', '수정 완료', '수정되었습니다.', () => {
                navigate('/admin/managers')
            })
        } catch (err) {
            const msg = err.response?.data?.message
            if (typeof msg === 'object') {
                setErrors(msg)
            } else {
                showAlert('error', '수정 실패', msg || '수정 실패')
            }
        } finally {
            setLoading(false)
        }
    }

    // 삭제
    const handleDelete = () => {
        showConfirm('삭제', '정말 삭제하시겠습니까?', async () => {
            try {
                await api.delete(`/admin/managers/${id}`, { headers })
                showAlert('success', '삭제 완료', '삭제되었습니다.', () => {
                    navigate('/admin/managers')
                })
            } catch (err) {
                showAlert('error', '삭제 실패', '삭제 중 오류가 발생했습니다.')
            }
        })
    }

    if (pageLoading) {
        return <div className="flex items-center justify-center p-20 text-gray-400">로딩 중...</div>
    }

    return (
        <div>
            <PageHeader
                title="관리자 상세"
                breadcrumbs={[
                    { label: '관리자 관리', path: '/admin/managers' },
                    { label: '관리자 상세' },
                ]}
                actions={
                    <>
                        <button
                            onClick={() => navigate('/admin/managers')}
                            className="border border-gray-300 text-sm px-4 py-1.5 rounded hover:bg-gray-50"
                        >
                            목록
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-gray-500 text-white text-sm px-4 py-1.5 rounded hover:bg-gray-600"
                        >
                            삭제
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-red-500 text-white text-sm px-4 py-1.5 rounded hover:bg-red-600 disabled:opacity-50"
                        >
                            {loading ? '처리 중...' : '저장'}
                        </button>
                    </>
                }
            />

            <div className="bg-white rounded-lg shadow p-6">

                {/* 일반 에러 */}
                {errors.general && (
                    <div className="bg-red-100 text-red-600 text-sm p-3 rounded mb-4">
                        {errors.general}
                    </div>
                )}

                {/* 2단 그리드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">

                    {/* ===== 기본 정보 ===== */}
                    <FC.SectionTitle title="기본 정보" />

                    <div className="border border-gray-100 rounded p-3">
                        <FC.Row label="아이디">
                            <input
                                type="text"
                                value={form.admin_id}
                                readOnly
                                className="w-full border border-gray-100 rounded px-3 py-1.5 text-sm bg-gray-50 text-gray-500"
                            />
                        </FC.Row>
                        <FC.Row label="이름" required>
                            <input type="text" name="name" placeholder="이름" value={form.name} onChange={handleChange} className={FC.inputClass} />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </FC.Row>
                        <FC.Row label="닉네임">
                            <input type="text" name="nickname" placeholder="닉네임" value={form.nickname ?? ''} onChange={handleChange} className={FC.inputClass} />
                        </FC.Row>
                    </div>

                    {/* ===== 비밀번호 ===== */}
                    <div className="border border-gray-100 rounded p-3">
                        <FC.Row label="비밀번호">
                            <input type="password" name="password" placeholder="변경 시에만 입력" value={form.password} onChange={handleChange} className={FC.inputClass} />
                        </FC.Row>
                        <FC.Row label="비밀번호 확인">
                            <input type="password" name="password_confirm" placeholder="비밀번호 확인" value={form.password_confirm} onChange={handleChange} className={FC.inputClass} />
                            {errors.password_confirm && <p className="text-red-500 text-xs mt-1">{errors.password_confirm}</p>}
                        </FC.Row>
                    </div>

                    {/* ===== 연락처 정보 ===== */}
                    <FC.SectionTitle title="연락처 정보" />

                    <div className="border border-gray-100 rounded p-3">
                        <FC.Row label="휴대폰" required>
                            <input
                                type="text"
                                name="mobile"
                                placeholder="010-0000-0000"
                                value={form.mobile ?? ''}
                                onChange={handlePhoneChange}
                                className={FC.inputClass}
                            />
                            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                        </FC.Row>
                        <FC.Row label="이메일" required>
                            <div className="flex items-center gap-1">
                                <input type="text" name="email_id" placeholder="이메일 아이디" value={form.email_id ?? ''} onChange={handleChange} className={FC.inputClass} />
                                <span className="text-gray-500 text-sm shrink-0">@</span>
                                <input type="text" name="email_domain" placeholder="도메인" value={form.email_domain ?? ''} onChange={handleChange} className={FC.inputClass} />
                                <select name="email_domain" value={form.email_domain ?? ''} onChange={handleChange} className={FC.selectClass}>
                                    <option value="">직접입력</option>
                                    <option value="gmail.com">gmail.com</option>
                                    <option value="naver.com">naver.com</option>
                                    <option value="daum.net">daum.net</option>
                                    <option value="kakao.com">kakao.com</option>
                                    <option value="nate.com">nate.com</option>
                                </select>
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </FC.Row>
                    </div>

                    <div className="border border-gray-100 rounded p-3">
                        <FC.Row label="전화번호">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="02-0000-0000"
                                    value={form.phone ?? ''}
                                    onChange={handlePhoneChange}
                                    className={FC.inputClass}
                                />
                                <input
                                    type="text"
                                    name="phone_ext"
                                    placeholder="내선"
                                    value={form.phone_ext ?? ''}
                                    onChange={handleChange}
                                    className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                                />
                            </div>
                        </FC.Row>
                    </div>

                    {/* ===== 직원 정보 ===== */}
                    <FC.SectionTitle title="직원 정보" />

                    <div className="border border-gray-100 rounded p-3">
                        <FC.Row label="직원여부">
                            <select name="emp_type" value={form.emp_type ?? ''} onChange={handleChange} className={FC.selectClass}>
                                <option value="">= 선택 =</option>
                                <option value="1001">직원</option>
                                <option value="1002">비정규직</option>
                                <option value="1003">아르바이트</option>
                                <option value="1004">파견직</option>
                                <option value="1005">퇴사자</option>
                            </select>
                        </FC.Row>
                        <FC.Row label="부서">
                            <input type="text" name="department" placeholder="부서" value={form.department ?? ''} onChange={handleChange} className={FC.inputClass} />
                        </FC.Row>
                        <FC.Row label="등급">
                            <select name="admin_level" value={form.admin_level ?? ''} onChange={handleChange} className={FC.selectClass + ' w-full'}>
                                <option value="">= 선택 =</option>
                                {levelCodes.map(opt => (
                                    <option key={opt.id} value={opt.code}>{opt.name}</option>
                                ))}
                            </select>
                        </FC.Row>
                    </div>

                    <div className="border border-gray-100 rounded p-3">
                        <FC.Row label="직급">
                            <select name="position" value={form.position ?? ''} onChange={handleChange} className={FC.selectClass + ' w-full'}>
                                <option value="">= 선택 =</option>
                                {positionCodes.map(opt => (
                                    <option key={opt.id} value={opt.code}>{opt.name}</option>
                                ))}
                            </select>
                        </FC.Row>
                        <FC.Row label="직책">
                            <select name="job_title" value={form.job_title ?? ''} onChange={handleChange} className={FC.selectClass + ' w-full'}>
                                <option value="">= 선택 =</option>
                                {jobTitleCodes.map(opt => (
                                    <option key={opt.id} value={opt.code}>{opt.name}</option>
                                ))}
                            </select>
                        </FC.Row>
                        <FC.Row label="승인여부">
                            <div className="flex items-center gap-4 pt-1.5">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="is_active"
                                        value="1002"
                                        checked={form.is_active === '1002'}
                                        onChange={handleChange}
                                        className="accent-orange-500"
                                    />
                                    승인
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="is_active"
                                        value="1001"
                                        checked={form.is_active === '1001'}
                                        onChange={handleChange}
                                        className="accent-orange-500"
                                    />
                                    미승인
                                </label>
                            </div>
                        </FC.Row>
                    </div>

                    {/* ===== 주소 정보 ===== */}
                    <FC.SectionTitle title="주소 정보" />

                    <div className="border border-gray-100 rounded p-3 sm:col-span-2">
                        <FC.Row label="주소">
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="postcode"
                                        placeholder="우편번호"
                                        value={form.postcode ?? ''}
                                        readOnly
                                        className="w-36 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddressSearch}
                                        className="shrink-0 bg-gray-400 text-white text-sm px-3 py-1.5 rounded hover:bg-gray-500"
                                    >
                                        우편번호찾기
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    name="address1"
                                    placeholder="기본주소"
                                    value={form.address1 ?? ''}
                                    readOnly
                                    className={FC.inputClass}
                                />
                                <input
                                    type="text"
                                    name="address2"
                                    placeholder="상세주소"
                                    value={form.address2 ?? ''}
                                    onChange={handleChange}
                                    className={FC.inputClass}
                                />
                            </div>
                        </FC.Row>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default AdminDetail