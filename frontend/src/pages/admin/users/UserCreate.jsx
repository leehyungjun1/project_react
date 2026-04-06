// src/pages/admin/member/MemberCreate.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import ImageUpload from '@/components/ImageUpload'
import { showAlert } from '@/utils/modal'
import * as FC from '@/components/admin/FormComponents'

const INITIAL_FORM = {
    member_type     : 'personal',
    is_approved     : 'Y',
    grade_code      : '',
    user_id         : '',
    nickname        : '',
    name            : '',
    password        : '',
    password_confirm: '',
    email_id        : '',
    email_domain    : '',
    email_agree     : false,
    mobile          : '',
    sms_agree       : false,
    postcode        : '',
    address1        : '',
    address2        : '',
    tel             : '',
    biz_name        : '',
    biz_number      : '',
    biz_ceo         : '',
    biz_type        : '',
    biz_item        : '',
    biz_postcode    : '',
    biz_address1    : '',
    biz_address2    : '',
    biz_reg_file    : '',
    fax             : '',
    job             : '',
    gender          : '',
    birth_type      : 'solar',
    birthday        : '',
    marry_yn        : '',
    anniversary     : '',
    referrer_id     : '',
    referrer_count  : 0,
    interests       : [],
    privacy_period  : '1year',
    memo            : '',
}

function UserCreate() {
    const navigate = useNavigate()
    const [form, setForm]       = useState(INITIAL_FORM)
    const [loading, setLoading] = useState(false)
    const [grades, setGrades]   = useState([])
    const [interests, setInterests] = useState([])
    const [errors, setErrors]   = useState({})

    const [idChecked,       setIdChecked]       = useState(false)
    const [bizChecked,      setBizChecked]      = useState(false)
    const [referrerChecked, setReferrerChecked] = useState(false)

    useEffect(() => {
        Promise.all([
            api.get('/admin/users/grades'),
            api.get('/admin/users/interests'),
        ]).then(([gradeRes, interestRes]) => {
            setGrades(gradeRes.data.data)
            setInterests(interestRes.data.data)
        }).catch(() => {})
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
        if (name === 'user_id')    setIdChecked(false)
        if (name === 'biz_number') setBizChecked(false)
        if (name === 'referrer_id') setReferrerChecked(false)
    }

    const handlePhoneChange = (e) => {
        const { name, value } = e.target
        const nums = value.replace(/[^0-9]/g, '')
        let formatted = nums
        if (nums.length > 7)      formatted = nums.slice(0,3) + '-' + nums.slice(3,7) + '-' + nums.slice(7,11)
        else if (nums.length > 3) formatted = nums.slice(0,3) + '-' + nums.slice(3)
        setForm(prev => ({ ...prev, [name]: formatted }))
    }

    const handleAddressSearch = (postcodeField, addressField) => {
        new window.daum.Postcode({
            oncomplete: (data) => {
                setForm(prev => ({
                    ...prev,
                    [postcodeField]: data.zonecode,
                    [addressField] : data.roadAddress || data.jibunAddress,
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

    const handleCheckId = async () => {
        if (!form.user_id) return showAlert('warning', '확인', '아이디를 입력해주세요.')
        try {
            const res = await api.get('/admin/users/check-id', { params: { user_id: form.user_id } })
            if (res.data.data.exists) {
                showAlert('error', '중복', '이미 사용 중인 아이디입니다.')
            } else {
                setIdChecked(true)
                showAlert('success', '확인', '사용 가능한 아이디입니다.')
            }
        } catch { showAlert('error', '오류', '아이디 확인 실패') }
    }

    const handleCheckBizNumber = async () => {
        if (!form.biz_number) return showAlert('warning', '확인', '사업자번호를 입력해주세요.')
        try {
            const res = await api.get('/admin/users/check-business-number', { params: { number: form.biz_number } })
            if (res.data.data.exists) {
                showAlert('error', '중복', '이미 등록된 사업자번호입니다.')
            } else {
                setBizChecked(true)
                showAlert('success', '확인', '사용 가능한 사업자번호입니다.')
            }
        } catch { showAlert('error', '오류', '사업자번호 확인 실패') }
    }

    const handleCheckReferrer = async () => {
        if (!form.referrer_id) return showAlert('warning', '확인', '추천인 아이디를 입력해주세요.')
        try {
            const res = await api.get('/admin/users/check-referrer', { params: { user_id: form.referrer_id } })
            if (res.data.data.exists) {
                setReferrerChecked(true)
                showAlert('success', '확인', '존재하는 회원입니다.')
            } else {
                showAlert('error', '없음', '존재하지 않는 회원입니다.')
            }
        } catch { showAlert('error', '오류', '추천인 확인 실패') }
    }

    const validate = () => {
        if (!idChecked)
            return showAlert('warning', '확인', '아이디 중복확인을 해주세요.'), false
        if (!form.name)
            return showAlert('warning', '확인', '이름을 입력해주세요.'), false
        if (!form.password)
            return showAlert('warning', '확인', '비밀번호를 입력해주세요.'), false
        if (form.password !== form.password_confirm)
            return showAlert('warning', '확인', '비밀번호가 일치하지 않습니다.'), false
        if (!form.email_id || !form.email_domain)
            return showAlert('warning', '확인', '이메일을 입력해주세요.'), false
        if (form.member_type === 'business') {
            if (!form.biz_name) return showAlert('warning', '확인', '상호를 입력해주세요.'), false
            if (!bizChecked)    return showAlert('warning', '확인', '사업자번호 중복확인을 해주세요.'), false
            if (!form.biz_ceo)  return showAlert('warning', '확인', '대표자명을 입력해주세요.'), false
        }
        if (form.referrer_id && !referrerChecked)
            return showAlert('warning', '확인', '추천인 존재 여부를 확인해주세요.'), false
        return true
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setLoading(true)
        try {
            await api.post('/admin/users/create', {
                ...form,
                email: `${form.email_id}@${form.email_domain}`,  // ← 조합해서 전송
            })
            showAlert('success', '완료', '회원이 등록되었습니다.', () => navigate('/admin/users'))
        } catch (err) {
            showAlert('error', '오류', err.response?.data?.message || '등록 실패')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <PageHeader
                title="회원 등록"
                breadcrumbs={[
                    { label: '회원관리', path: '/admin/users' },
                    { label: '회원 등록' },
                ]}
                actions={
                    <>
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="border border-gray-300 text-sm px-4 py-1.5 rounded hover:bg-gray-50"
                        >
                            목록
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600 disabled:opacity-50"
                        >
                            {loading ? '처리 중...' : '등록'}
                        </button>
                    </>
                }
            />

            <div className="bg-white rounded-lg shadow p-6">

                {/* ===== 2단 그리드 ===== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">

                    {/* ===== 기본정보 ===== */}
                    <FC.SectionTitle title="기본정보" />

                    <div className="border border-gray-100 rounded p-3 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">

                            {/* 좌측 */}
                            <div>
                                <FC.Row label="회원구분" required>
                                    <div className="flex gap-4 pt-1">
                                        {[['personal','개인회원'],['business','사업자회원']].map(([val, label]) => (
                                            <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                                <input type="radio" name="member_type" value={val} checked={form.member_type === val} onChange={handleChange} className="accent-orange-500" />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </FC.Row>
                                <FC.Row label="승인여부" required>
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
                                        {grades.map(g => (
                                            <option key={g.code} value={g.code}>{g.name}</option>
                                        ))}
                                    </select>
                                </FC.Row>
                                <FC.Row label="아이디" required>
                                    <div className="flex gap-2">
                                        <input type="text" name="user_id" value={form.user_id} onChange={handleChange} placeholder="아이디" className={FC.inputClass} />
                                        <button type="button" onClick={handleCheckId}
                                                className={`shrink-0 text-sm px-3 py-1.5 rounded border ${idChecked ? 'bg-green-50 border-green-400 text-green-600' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'}`}>
                                            {idChecked ? '✓ 확인됨' : '중복확인'}
                                        </button>
                                    </div>
                                </FC.Row>
                                <FC.Row label="닉네임">
                                    <input type="text" name="nickname" value={form.nickname} onChange={handleChange} placeholder="닉네임" className={FC.inputClass} />
                                </FC.Row>
                                <FC.Row label="이름" required>
                                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="이름" className={FC.inputClass} />
                                </FC.Row>
                                <FC.Row label="비밀번호" required>
                                    <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="비밀번호" className={FC.inputClass} />
                                </FC.Row>
                                <FC.Row label="비밀번호 확인" required>
                                    <div className="flex flex-col gap-1">
                                        <input type="password" name="password_confirm" value={form.password_confirm} onChange={handleChange} placeholder="비밀번호 확인" className={FC.inputClass} />
                                        {form.password_confirm && (
                                            <span className={`text-xs ${form.password === form.password_confirm ? 'text-green-500' : 'text-red-500'}`}>
                            {form.password === form.password_confirm ? '✓ 일치합니다.' : '✗ 일치하지 않습니다.'}
                        </span>
                                        )}
                                    </div>
                                </FC.Row>
                            </div>

                            {/* 우측 */}
                            <div>
                                <FC.Row label="이메일" required>
                                    <div className="flex flex-col gap-1">
                                        <FC.EmailInput
                                            idName="email_id"
                                            domainName="email_domain"
                                            form={form}
                                            onChange={handleChange}
                                        />
                                        <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-600">
                                            <input type="checkbox" name="email_agree" checked={form.email_agree} onChange={handleChange} className="w-4 h-4" />
                                            이메일 수신동의
                                        </label>
                                    </div>
                                </FC.Row>
                                <FC.Row label="휴대폰번호">
                                    <div className="flex flex-col gap-1">
                                        <input type="text" name="mobile" value={form.mobile} onChange={handlePhoneChange} placeholder="000-0000-0000" className={FC.inputClass} />
                                        <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-600">
                                            <input type="checkbox" name="sms_agree" checked={form.sms_agree} onChange={handleChange} className="w-4 h-4" />
                                            SMS 수신동의
                                        </label>
                                    </div>
                                </FC.Row>
                                <FC.Row label="전화번호">
                                    <input type="text" name="tel" value={form.tel} onChange={handlePhoneChange} placeholder="000-0000-0000" className={FC.inputClass} />
                                </FC.Row>
                                <FC.Row label="팩스번호">
                                    <input type="text" name="fax" value={form.fax} onChange={handlePhoneChange} placeholder="000-0000-0000" className={FC.inputClass} />
                                </FC.Row>
                                {/* 주소 */}
                                <FC.Row label="주소">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <input type="text" name="postcode" value={form.postcode} readOnly placeholder="우편번호" className="w-36 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none" />
                                            <button type="button" onClick={() => handleAddressSearch('postcode', 'address1')} className="shrink-0 bg-gray-400 text-white text-sm px-3 py-1.5 rounded hover:bg-gray-500">
                                                우편번호 찾기
                                            </button>
                                        </div>
                                        <input type="text" name="address1" value={form.address1} readOnly placeholder="기본주소" className={FC.inputClass} />
                                        <input type="text" name="address2" value={form.address2} onChange={handleChange} placeholder="상세주소" className={FC.inputClass} />
                                    </div>
                                </FC.Row>
                            </div>

                        </div>
                    </div>

                    {/* ===== 사업자정보 (조건부) ===== */}
                    {form.member_type === 'business' && (
                        <>
                            <FC.SectionTitle title="사업자정보" />

                            <div className="border border-gray-100 rounded p-3 sm:col-span-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">

                                    {/* 좌측 */}
                                    <div>
                                        <FC.Row label="상호" required>
                                            <input type="text" name="biz_name" value={form.biz_name} onChange={handleChange} placeholder="상호명" className={FC.inputClass} />
                                        </FC.Row>
                                        <FC.Row label="사업자번호" required>
                                            <div className="flex gap-2">
                                                <input type="text" name="biz_number" value={form.biz_number} onChange={handleChange} placeholder="000-00-00000" className={FC.inputClass} />
                                                <button type="button" onClick={handleCheckBizNumber}
                                                        className={`shrink-0 text-sm px-3 py-1.5 rounded border ${bizChecked ? 'bg-green-50 border-green-400 text-green-600' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'}`}>
                                                    {bizChecked ? '✓ 확인됨' : '중복확인'}
                                                </button>
                                            </div>
                                        </FC.Row>
                                        <FC.Row label="대표자명" required>
                                            <input type="text" name="biz_ceo" value={form.biz_ceo} onChange={handleChange} placeholder="대표자명" className={FC.inputClass} />
                                        </FC.Row>
                                        <FC.Row label="업태">
                                            <input type="text" name="biz_type" value={form.biz_type} onChange={handleChange} placeholder="업태" className={FC.inputClass} />
                                        </FC.Row>
                                        <FC.Row label="종목">
                                            <input type="text" name="biz_item" value={form.biz_item} onChange={handleChange} placeholder="종목" className={FC.inputClass} />
                                        </FC.Row>
                                    </div>

                                    {/* 우측 */}
                                    <div>
                                        <FC.Row label="사업장 주소">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    <input type="text" name="biz_postcode" value={form.biz_postcode} readOnly placeholder="우편번호" className="w-36 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none" />
                                                    <button type="button" onClick={() => handleAddressSearch('biz_postcode', 'biz_address1')} className="shrink-0 bg-gray-400 text-white text-sm px-3 py-1.5 rounded hover:bg-gray-500">
                                                        우편번호 찾기
                                                    </button>
                                                </div>
                                                <input type="text" name="biz_address1" value={form.biz_address1} readOnly placeholder="기본주소" className={FC.inputClass} />
                                                <input type="text" name="biz_address2" value={form.biz_address2} onChange={handleChange} placeholder="상세주소" className={FC.inputClass} />
                                            </div>
                                        </FC.Row>
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
                        </>
                    )}

                    {/* ===== 부가정보 ===== */}
                    <FC.SectionTitle title="부가정보" />
                    <div className="border border-gray-100 rounded p-3 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">

                            {/* 좌측 */}
                            <div>
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
                                        <select name="birth_type" value={form.birth_type} onChange={handleChange} className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400">
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
                            </div>

                            {/* 우측 */}
                            <div>
                                <FC.Row label="추천인 아이디">
                                    <div className="flex gap-2">
                                        <input type="text" name="referrer_id" value={form.referrer_id} onChange={handleChange} placeholder="추천인 아이디" className={FC.inputClass} />
                                        <button type="button" onClick={handleCheckReferrer}
                                                className={`shrink-0 text-sm px-3 py-1.5 rounded border ${referrerChecked ? 'bg-green-50 border-green-400 text-green-600' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'}`}>
                                            {referrerChecked ? '✓ 확인됨' : '존재확인'}
                                        </button>
                                    </div>
                                </FC.Row>
                                <FC.Row label="개인정보 기간">
                                    <div className="flex flex-wrap gap-3 pt-1">
                                        {[['1','1년'],['3','3년'],['5','5년'],['withdrawal','탈퇴시']].map(([val, label]) => (
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
                <textarea name="memo" value={form.memo} onChange={handleChange} rows={4} placeholder="메모"
                          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
                                </FC.Row>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default UserCreate