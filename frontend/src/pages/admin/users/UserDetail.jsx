// src/pages/admin/users/UserDetail.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import ImageUpload from '@/components/ImageUpload'
import { showAlert } from '@/utils/modal'
import * as FC from '@/components/admin/FormComponents'
import * as LC from '@/components/admin/ListComponents'

function UserDetail() {
    const { id }     = useParams()
    const navigate   = useNavigate()
    const [editMode, setEditMode]       = useState(false)
    const [loading, setLoading]         = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [grades, setGrades]           = useState([])
    const [interests, setInterests]     = useState([])

    const [form, setForm] = useState({
        member_type: 'personal', is_approved: 'Y', grade_code: '',
        user_id: '', password: '', name: '', nickname: '',
        email_id: '', email_domain: '',
        email_agree: false, mobile: '', sms_agree: false,
        postcode: '', address1: '', address2: '', tel: '',
        referrer_id: '', mileage: 0, cash: 0,
        login_count: 0, last_login_at: '', last_login_ip: '',
        biz_name: '', biz_number: '', biz_ceo: '',
        biz_type: '', biz_item: '',
        biz_postcode: '', biz_address1: '', biz_address2: '',
        biz_reg_file: '',
        fax: '', job: '', gender: '',
        birth_type: 'solar', birthday: '',
        marry_yn: '', anniversary: '',
        interests: [], privacy_period: '1year', memo: '',
    })

    // 마일리지
    const [mileageList, setMileageList]     = useState([])
    const [mileageTotal, setMileageTotal]   = useState(0)
    const [mileagePage, setMileagePage]     = useState(1)
    const [mileageLastPage, setMileageLastPage] = useState(1)
    const [mileageModal, setMileageModal]   = useState(false)

    // 캐시
    const [cashList, setCashList]         = useState([])
    const [cashTotal, setCashTotal]       = useState(0)
    const [cashPage, setCashPage]         = useState(1)
    const [cashLastPage, setCashLastPage] = useState(1)
    const [cashModal, setCashModal]       = useState(false)

    const [pointForm, setPointForm] = useState({ type: 'earn', amount: '', reason: '' })

    // 마일리지 이력 fetch 함수 분리
    const fetchMileage = (page = 1) => {
        api.get(`/admin/users/${id}/mileage`, { params: { page } })
            .then(res => {
                setMileageList(res.data.data.list)
                setMileageTotal(res.data.data.total)
                setMileageLastPage(res.data.data.lastPage)
            }).catch(() => {})
    }

// 캐시 이력 fetch 함수 분리
    const fetchCash = (page = 1) => {
        api.get(`/admin/users/${id}/cash`, { params: { page } })
            .then(res => {
                setCashList(res.data.data.list)
                setCashTotal(res.data.data.total)
                setCashLastPage(res.data.data.lastPage)
            }).catch(() => {})
    }

    useEffect(() => {
        Promise.all([
            api.get('/admin/users/grades'),
            api.get('/admin/users/interests'),
            api.get(`/admin/users/${id}`),
        ]).then(([gradeRes, interestRes, userRes]) => {
            setGrades(gradeRes.data.data)
            setInterests(interestRes.data.data)
            const user = userRes.data.data
            const emailParts = user.email?.split('@') || ['', '']
            setForm(prev => ({
                ...prev, ...user,
                email_id:     emailParts[0],
                email_domain: emailParts[1] ?? '',
                interests:    user.interests ?? [],
                password:     '',
            }))
        }).catch(() => {
            showAlert('error', '오류', '데이터를 불러오는데 실패했습니다.')
        }).finally(() => setPageLoading(false))
    }, [id])

    // 마일리지 이력
    useEffect(() => {
        api.get(`/admin/users/${id}/mileage`, { params: { page: mileagePage } })
            .then(res => {
                setMileageList(res.data.data.list)
                setMileageTotal(res.data.data.total)
                setMileageLastPage(res.data.data.lastPage)
            }).catch(() => {})
    }, [mileagePage])

    // useEffect는 페이지 변경 시에만
    useEffect(() => { fetchMileage(mileagePage) }, [mileagePage])
    useEffect(() => { fetchCash(cashPage) }, [cashPage])

    // 캐시 이력
    useEffect(() => {
        api.get(`/admin/users/${id}/cash`, { params: { page: cashPage } })
            .then(res => {
                setCashList(res.data.data.list)
                setCashTotal(res.data.data.total)
                setCashLastPage(res.data.data.lastPage)
            }).catch(() => {})
    }, [cashPage])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handlePhoneChange = (e) => {
        const { name, value } = e.target
        const nums = value.replace(/[^0-9]/g, '')
        let f = nums
        if (nums.length > 7)      f = nums.slice(0,3) + '-' + nums.slice(3,7) + '-' + nums.slice(7,11)
        else if (nums.length > 3) f = nums.slice(0,3) + '-' + nums.slice(3)
        setForm(prev => ({ ...prev, [name]: f }))
    }

    const handleAddressSearch = (postcodeField, addressField) => {
        new window.daum.Postcode({
            oncomplete: (data) => {
                setForm(prev => ({
                    ...prev,
                    [postcodeField]: data.zonecode,
                    [addressField]:  data.roadAddress || data.jibunAddress,
                }))
            }
        }).open()
    }

    const handleInterestToggle = (code) => {
        setForm(prev => ({
            ...prev,
            interests: prev.interests.includes(code)
                ? prev.interests.filter(c => c !== code)
                : [...prev.interests, code],
        }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await api.put(`/admin/users/${id}`, {
                ...form,
                email: `${form.email_id}@${form.email_domain}`,
            })
            showAlert('success', '완료', '수정되었습니다.', () => setEditMode(false))
        } catch (err) {
            showAlert('error', '오류', err.response?.data?.message || '수정 실패')
        } finally {
            setLoading(false)
        }
    }

    const handleMileageSubmit = async () => {
        try {
            await api.post(`/admin/users/${id}/mileage`, pointForm)
            showAlert('success', '완료', '처리되었습니다.', () => {
                setMileageModal(false)
                setPointForm({ type: 'earn', amount: '', reason: '' })
                fetchMileage(1)
                setMileagePage(1)
                api.get(`/admin/users/${id}`).then(res => {
                    setForm(prev => ({ ...prev, mileage: res.data.data.mileage }))
                })
            })
        } catch { showAlert('error', '오류', '처리 실패') }
    }

    const handleCashSubmit = async () => {
        try {
            await api.post(`/admin/users/${id}/cash`, pointForm)
            showAlert('success', '완료', '처리되었습니다.', () => {
                setCashModal(false)
                setPointForm({ type: 'charge', amount: '', reason: '' })
                fetchCash(1)
                setCashPage(1)
                api.get(`/admin/users/${id}`).then(res => {
                    setForm(prev => ({ ...prev, cash: res.data.data.cash }))
                })
            })
        } catch { showAlert('error', '오류', '처리 실패') }
    }

    // 읽기 전용 필드
    const ReadField = ({ label, children }) => (
        <div className="flex items-start py-2 border-b border-gray-50 last:border-0">
            <span className="w-28 shrink-0 text-xs text-gray-500 pt-0.5">{label}</span>
            <span className="flex-1 text-sm text-gray-800">{children || '-'}</span>
        </div>
    )

    // 섹션 헤더
    const SectionHeader = ({ title, children }) => (
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded mb-3">
            <h3 className="text-sm font-bold text-gray-700">{title}</h3>
            {children}
        </div>
    )

    const mileageTypeMap = {
        earn   : { label: '적립',    class: 'bg-green-100 text-green-600' },
        use    : { label: '사용',    class: 'bg-red-100 text-red-500' },
        expire : { label: '소멸',    class: 'bg-gray-100 text-gray-500' },
        admin  : { label: '관리자',  class: 'bg-blue-100 text-blue-600' },
    }

    const cashTypeMap = {
        charge : { label: '충전',   class: 'bg-green-100 text-green-600' },
        use    : { label: '사용',   class: 'bg-red-100 text-red-500' },
        refund : { label: '환불',   class: 'bg-yellow-100 text-yellow-600' },
        admin  : { label: '관리자', class: 'bg-blue-100 text-blue-600' },
    }

    const TypeBadge = ({ value, map }) => {
        const d = map[value] || { label: value, class: 'bg-gray-100 text-gray-600' }
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.class}`}>{d.label}</span>
    }

    if (pageLoading) return (
        <div className="flex items-center justify-center p-20 text-gray-400">로딩 중...</div>
    )

    return (
        <div>
            <PageHeader
                title="회원 상세"
                breadcrumbs={[
                    { label: '회원관리', path: '/admin/users' },
                    { label: '회원 상세' },
                ]}
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/admin/users')} className="border border-gray-300 text-sm px-4 py-1.5 rounded hover:bg-gray-50">
                            목록
                        </button>
                        {editMode ? (
                            <>
                                <button onClick={() => setEditMode(false)} className="bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded hover:bg-gray-300">
                                    취소
                                </button>
                                <button onClick={handleSubmit} disabled={loading} className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600 disabled:opacity-50">
                                    {loading ? '처리 중...' : '저장'}
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

                {/* ===== 기본정보 ===== */}
                <div className="bg-white rounded-lg shadow p-4">
                    <SectionHeader title="기본정보" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">

                        {/* 좌측 */}
                        <div>
                            {editMode ? (
                                <>
                                    <FC.Row label="회원구분">
                                        <div className="flex gap-4 pt-1">
                                            {[['personal','개인회원'],['business','사업자회원']].map(([val, label]) => (
                                                <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="radio" name="member_type" value={val} checked={form.member_type === val} onChange={handleChange} className="accent-orange-500" />
                                                    {label}
                                                </label>
                                            ))}
                                        </div>
                                    </FC.Row>
                                    <FC.Row label="승인여부">
                                        <div className="flex gap-4 pt-1">
                                            {[['Y','승인'],['N','미승인']].map(([val, label]) => (
                                                <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="radio" name="is_approved" value={val} checked={form.is_approved === val} onChange={handleChange} className="accent-orange-500" />
                                                    {label}
                                                </label>
                                            ))}
                                        </div>
                                    </FC.Row>
                                    <FC.Row label="등급">
                                        <select name="grade_code" value={form.grade_code} onChange={handleChange} className={FC.selectClass + ' w-full'}>
                                            <option value="">= 선택 =</option>
                                            {grades.map(g => <option key={g.code} value={g.code}>{g.name}</option>)}
                                        </select>
                                    </FC.Row>
                                    <FC.Row label="이름">
                                        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="이름" className={FC.inputClass} />
                                    </FC.Row>
                                    <FC.Row label="닉네임">
                                        <input type="text" name="nickname" value={form.nickname} onChange={handleChange} placeholder="닉네임" className={FC.inputClass} />
                                    </FC.Row>
                                    <FC.Row label="비밀번호">
                                        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="변경 시에만 입력" className={FC.inputClass} />
                                    </FC.Row>
                                </>
                            ) : (
                                <>
                                    <ReadField label="회원구분">{form.member_type === 'personal' ? '개인회원' : '사업자회원'}</ReadField>
                                    <ReadField label="승인여부">
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${form.is_approved === 'Y' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                            {form.is_approved === 'Y' ? '승인' : '미승인'}
                                        </span>
                                    </ReadField>
                                    <ReadField label="등급">{grades.find(g => g.code === form.grade_code)?.name || '-'}</ReadField>
                                    <ReadField label="이름">{form.name}</ReadField>
                                    <ReadField label="닉네임">{form.nickname}</ReadField>
                                </>
                            )}
                        </div>

                        {/* 우측 */}
                        <div>
                            <ReadField label="아이디">{form.user_id}</ReadField>
                            {editMode ? (
                                <>
                                    <FC.Row label="이메일">
                                        <div className="flex flex-col gap-1">
                                            <FC.EmailInput idName="email_id" domainName="email_domain" form={form} onChange={handleChange} />
                                            <label className="flex items-center gap-2 text-xs cursor-pointer text-gray-500">
                                                <input type="checkbox" name="email_agree" checked={form.email_agree} onChange={handleChange} className="w-3.5 h-3.5" />
                                                이메일 수신동의
                                            </label>
                                        </div>
                                    </FC.Row>
                                    <FC.Row label="휴대폰">
                                        <div className="flex flex-col gap-1">
                                            <input type="text" name="mobile" value={form.mobile} onChange={handlePhoneChange} placeholder="000-0000-0000" className={FC.inputClass} />
                                            <label className="flex items-center gap-2 text-xs cursor-pointer text-gray-500">
                                                <input type="checkbox" name="sms_agree" checked={form.sms_agree} onChange={handleChange} className="w-3.5 h-3.5" />
                                                SMS 수신동의
                                            </label>
                                        </div>
                                    </FC.Row>
                                    <FC.Row label="전화번호">
                                        <input type="text" name="tel" value={form.tel} onChange={handlePhoneChange} placeholder="000-0000-0000" className={FC.inputClass} />
                                    </FC.Row>
                                    <FC.Row label="주소">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <input type="text" name="postcode" value={form.postcode} readOnly placeholder="우편번호" className="w-28 border border-gray-300 rounded px-3 py-1.5 text-sm" />
                                                <button type="button" onClick={() => handleAddressSearch('postcode', 'address1')} className="shrink-0 bg-gray-400 text-white text-sm px-3 py-1.5 rounded hover:bg-gray-500">
                                                    우편번호 찾기
                                                </button>
                                            </div>
                                            <input type="text" name="address1" value={form.address1} readOnly placeholder="기본주소" className={FC.inputClass} />
                                            <input type="text" name="address2" value={form.address2} onChange={handleChange} placeholder="상세주소" className={FC.inputClass} />
                                        </div>
                                    </FC.Row>
                                </>
                            ) : (
                                <>
                                    <ReadField label="이메일">
                                        <span className="flex items-center gap-2">
                                            {form.email_id ? `${form.email_id}@${form.email_domain}` : '-'}
                                            {form.email_agree && <span className="text-xs text-green-500">수신동의</span>}
                                        </span>
                                    </ReadField>
                                    <ReadField label="휴대폰">
                                        <span className="flex items-center gap-2">
                                            {form.mobile || '-'}
                                            {form.sms_agree && <span className="text-xs text-green-500">수신동의</span>}
                                        </span>
                                    </ReadField>
                                    <ReadField label="전화번호">{form.tel}</ReadField>
                                    <ReadField label="주소">
                                        {form.address1 ? `(${form.postcode}) ${form.address1} ${form.address2 || ''}` : '-'}
                                    </ReadField>
                                </>
                            )}
                        </div>

                    </div>

                    {/* 하단 - 가입정보 요약 */}
                    <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-xs text-gray-400 mb-1">마일리지</div>
                            <div className="text-sm font-bold text-orange-500">{form.mileage?.toLocaleString() ?? 0} P</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 mb-1">캐시</div>
                            <div className="text-sm font-bold text-blue-500">{form.cash?.toLocaleString() ?? 0} 원</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 mb-1">로그인 횟수</div>
                            <div className="text-sm font-bold text-gray-700">{form.login_count ?? 0} 회</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 mb-1">마지막 로그인</div>
                            <div className="text-sm text-gray-600">{form.last_login_at?.slice(0, 10) || '-'}</div>
                        </div>
                    </div>
                </div>

                {/* ===== 사업자정보 (사업자회원만) ===== */}
                {form.member_type === 'business' && (
                    <div className="bg-white rounded-lg shadow p-4">
                        <SectionHeader title="사업자정보" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                            <div>
                                {editMode ? (
                                    <>
                                        <FC.Row label="상호">
                                            <input type="text" name="biz_name" value={form.biz_name} onChange={handleChange} placeholder="상호명" className={FC.inputClass} />
                                        </FC.Row>
                                        <FC.Row label="사업자번호">
                                            <input type="text" name="biz_number" value={form.biz_number} onChange={handleChange} placeholder="000-00-00000" className={FC.inputClass} />
                                        </FC.Row>
                                        <FC.Row label="대표자명">
                                            <input type="text" name="biz_ceo" value={form.biz_ceo} onChange={handleChange} placeholder="대표자명" className={FC.inputClass} />
                                        </FC.Row>
                                        <FC.Row label="업태">
                                            <input type="text" name="biz_type" value={form.biz_type} onChange={handleChange} placeholder="업태" className={FC.inputClass} />
                                        </FC.Row>
                                        <FC.Row label="종목">
                                            <input type="text" name="biz_item" value={form.biz_item} onChange={handleChange} placeholder="종목" className={FC.inputClass} />
                                        </FC.Row>
                                    </>
                                ) : (
                                    <>
                                        <ReadField label="상호">{form.biz_name}</ReadField>
                                        <ReadField label="사업자번호">{form.biz_number}</ReadField>
                                        <ReadField label="대표자명">{form.biz_ceo}</ReadField>
                                        <ReadField label="업태">{form.biz_type}</ReadField>
                                        <ReadField label="종목">{form.biz_item}</ReadField>
                                    </>
                                )}
                            </div>
                            <div>
                                {editMode ? (
                                    <FC.Row label="사업장 주소">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <input type="text" name="biz_postcode" value={form.biz_postcode} readOnly placeholder="우편번호" className="w-28 border border-gray-300 rounded px-3 py-1.5 text-sm" />
                                                <button type="button" onClick={() => handleAddressSearch('biz_postcode', 'biz_address1')} className="shrink-0 bg-gray-400 text-white text-sm px-3 py-1.5 rounded hover:bg-gray-500">
                                                    우편번호 찾기
                                                </button>
                                            </div>
                                            <input type="text" name="biz_address1" value={form.biz_address1} readOnly placeholder="기본주소" className={FC.inputClass} />
                                            <input type="text" name="biz_address2" value={form.biz_address2} onChange={handleChange} placeholder="상세주소" className={FC.inputClass} />
                                        </div>
                                    </FC.Row>
                                ) : (
                                    <ReadField label="사업장 주소">
                                        {form.biz_address1 ? `(${form.biz_postcode}) ${form.biz_address1} ${form.biz_address2 || ''}` : '-'}
                                    </ReadField>
                                )}
                                <FC.Row label="사업자등록증">
                                    <ImageUpload
                                        value={form.biz_reg_file}
                                        onChange={(path) => setForm(prev => ({ ...prev, biz_reg_file: path }))}
                                        folder="member/biz"
                                        label="사업자등록증 업로드"
                                        accept="image/*,.pdf"
                                        hint="JPG, PNG, PDF 가능"
                                    />
                                </FC.Row>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== 부가정보 ===== */}
                <div className="bg-white rounded-lg shadow p-4">
                    <SectionHeader title="부가정보" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                        <div>
                            {editMode ? (
                                <>
                                    <FC.Row label="직업">
                                        <input type="text" name="job" value={form.job} onChange={handleChange} placeholder="직업" className={FC.inputClass} />
                                    </FC.Row>
                                    <FC.Row label="성별">
                                        <div className="flex gap-4 pt-1">
                                            {[['M','남'],['F','여']].map(([val, label]) => (
                                                <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="radio" name="gender" value={val} checked={form.gender === val} onChange={handleChange} className="accent-orange-500" />
                                                    {label}
                                                </label>
                                            ))}
                                        </div>
                                    </FC.Row>
                                    <FC.Row label="생일">
                                        <div className="flex gap-2">
                                            <select name="birth_type" value={form.birth_type} onChange={handleChange} className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm">
                                                <option value="solar">양력</option>
                                                <option value="lunar">음력</option>
                                            </select>
                                            <input type="date" name="birthday" value={form.birthday} onChange={handleChange} className={FC.inputClass} />
                                        </div>
                                    </FC.Row>
                                    <FC.Row label="결혼여부">
                                        <div className="flex gap-4 pt-1">
                                            {[['N','미혼'],['Y','기혼']].map(([val, label]) => (
                                                <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="radio" name="marry_yn" value={val} checked={form.marry_yn === val} onChange={handleChange} className="accent-orange-500" />
                                                    {label}
                                                </label>
                                            ))}
                                        </div>
                                    </FC.Row>
                                    {form.marry_yn === 'Y' && (
                                        <FC.Row label="결혼기념일">
                                            <input type="date" name="anniversary" value={form.anniversary} onChange={handleChange} className={FC.inputClass} />
                                        </FC.Row>
                                    )}
                                    <FC.Row label="팩스번호">
                                        <input type="text" name="fax" value={form.fax} onChange={handlePhoneChange} placeholder="000-0000-0000" className={FC.inputClass} />
                                    </FC.Row>
                                </>
                            ) : (
                                <>
                                    <ReadField label="직업">{form.job}</ReadField>
                                    <ReadField label="성별">{form.gender === 'M' ? '남' : form.gender === 'F' ? '여' : '-'}</ReadField>
                                    <ReadField label="생일">{form.birthday ? `${form.birth_type === 'solar' ? '양력' : '음력'} ${form.birthday}` : '-'}</ReadField>
                                    <ReadField label="결혼여부">{form.marry_yn === 'Y' ? '기혼' : form.marry_yn === 'N' ? '미혼' : '-'}</ReadField>
                                    {form.marry_yn === 'Y' && <ReadField label="결혼기념일">{form.anniversary}</ReadField>}
                                    <ReadField label="팩스번호">{form.fax}</ReadField>
                                </>
                            )}
                        </div>
                        <div>
                            {editMode ? (
                                <>
                                    <FC.Row label="유효기간">
                                        <div className="flex flex-wrap gap-3 pt-1">
                                            {[['1year','1년'],['3year','3년'],['5year','5년'],['withdrawal','탈퇴시']].map(([val, label]) => (
                                                <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="radio" name="privacy_period" value={val} checked={form.privacy_period === val} onChange={handleChange} className="accent-orange-500" />
                                                    {label}
                                                </label>
                                            ))}
                                        </div>
                                    </FC.Row>
                                    <FC.Row label="관심분야">
                                        <div className="flex flex-wrap gap-2">
                                            {interests.map(item => (
                                                <label key={item.code}
                                                       className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border cursor-pointer transition-colors ${form.interests.includes(item.code) ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 text-gray-600 hover:border-orange-300'}`}>
                                                    <input type="checkbox" className="hidden" checked={form.interests.includes(item.code)} onChange={() => handleInterestToggle(item.code)} />
                                                    {item.name}
                                                </label>
                                            ))}
                                        </div>
                                    </FC.Row>
                                    <FC.Row label="남기는 말씀">
                                        <textarea name="memo" value={form.memo} onChange={handleChange} rows={3} placeholder="메모"
                                                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
                                    </FC.Row>
                                </>
                            ) : (
                                <>
                                    <ReadField label="유효기간">{{ '1year':'1년', '3year':'3년', '5year':'5년', 'withdrawal':'탈퇴시' }[form.privacy_period]}</ReadField>
                                    <ReadField label="관심분야">
                                        {form.interests?.map(code => interests.find(i => i.code === code)?.name).filter(Boolean).join(', ') || '-'}
                                    </ReadField>
                                    <ReadField label="남기는 말씀">{form.memo}</ReadField>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== 마일리지 ===== */}
                <div className="bg-white rounded-lg shadow p-4">
                    <SectionHeader title={`마일리지 이력`}>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">잔액 <span className="font-bold text-orange-500">{form.mileage?.toLocaleString() ?? 0} P</span></span>
                            <button onClick={() => { setPointForm({ type: 'earn', amount: '', reason: '' }); setMileageModal(true) }}
                                    className="bg-orange-500 text-white text-xs px-3 py-1 rounded hover:bg-orange-600">
                                + 지급/차감
                            </button>
                        </div>
                    </SectionHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">구분</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">금액</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">잔액</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">사유</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">일시</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {mileageList.length === 0 ? (
                                <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400 text-sm">내역이 없습니다.</td></tr>
                            ) : mileageList.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2"><TypeBadge value={item.type} map={mileageTypeMap} /></td>
                                    <td className={`px-4 py-2 font-medium text-sm ${item.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {item.amount > 0 ? '+' : ''}{item.amount?.toLocaleString()} P
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{item.balance?.toLocaleString()} P</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{item.reason || '-'}</td>
                                    <td className="px-4 py-2 text-xs text-gray-400">{item.created_at}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <LC.Pagination page={mileagePage} lastPage={mileageLastPage} total={mileageTotal} onPageChange={setMileagePage} />
                </div>

                {/* ===== 캐시 ===== */}
                <div className="bg-white rounded-lg shadow p-4">
                    <SectionHeader title="캐시 이력">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">잔액 <span className="font-bold text-blue-500">{form.cash?.toLocaleString() ?? 0} 원</span></span>
                            <button onClick={() => { setPointForm({ type: 'charge', amount: '', reason: '' }); setCashModal(true) }}
                                    className="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600">
                                + 충전/차감
                            </button>
                        </div>
                    </SectionHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">구분</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">금액</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">잔액</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">사유</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">일시</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {cashList.length === 0 ? (
                                <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400 text-sm">내역이 없습니다.</td></tr>
                            ) : cashList.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2"><TypeBadge value={item.type} map={cashTypeMap} /></td>
                                    <td className={`px-4 py-2 font-medium text-sm ${item.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {item.amount > 0 ? '+' : ''}{item.amount?.toLocaleString()} 원
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{item.balance?.toLocaleString()} 원</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{item.reason || '-'}</td>
                                    <td className="px-4 py-2 text-xs text-gray-400">{item.created_at}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <LC.Pagination page={cashPage} lastPage={cashLastPage} total={cashTotal} onPageChange={setCashPage} />
                </div>

            </div>

            {/* ===== 마일리지 모달 ===== */}
            {mileageModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-96 p-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-4">마일리지 지급 / 차감</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">구분</label>
                                <select value={pointForm.type} onChange={e => setPointForm(prev => ({ ...prev, type: e.target.value }))} className={FC.selectClass + ' w-full'}>
                                    <option value="earn">적립</option>
                                    <option value="use">차감</option>
                                    <option value="admin">관리자 조정</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">금액</label>
                                <input type="number" value={pointForm.amount} onChange={e => setPointForm(prev => ({ ...prev, amount: e.target.value }))} placeholder="0" className={FC.inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">사유</label>
                                <input type="text" value={pointForm.reason} onChange={e => setPointForm(prev => ({ ...prev, reason: e.target.value }))} placeholder="사유 입력" className={FC.inputClass} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setMileageModal(false)} className="bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded hover:bg-gray-300">취소</button>
                            <button onClick={handleMileageSubmit} className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600">처리</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== 캐시 모달 ===== */}
            {cashModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-96 p-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-4">캐시 충전 / 차감</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">구분</label>
                                <select value={pointForm.type} onChange={e => setPointForm(prev => ({ ...prev, type: e.target.value }))} className={FC.selectClass + ' w-full'}>
                                    <option value="charge">충전</option>
                                    <option value="use">차감</option>
                                    <option value="refund">환불</option>
                                    <option value="admin">관리자 조정</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">금액</label>
                                <input type="number" value={pointForm.amount} onChange={e => setPointForm(prev => ({ ...prev, amount: e.target.value }))} placeholder="0" className={FC.inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">사유</label>
                                <input type="text" value={pointForm.reason} onChange={e => setPointForm(prev => ({ ...prev, reason: e.target.value }))} placeholder="사유 입력" className={FC.inputClass} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setCashModal(false)} className="bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded hover:bg-gray-300">취소</button>
                            <button onClick={handleCashSubmit} className="bg-blue-500 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-600">처리</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserDetail