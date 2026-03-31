import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

// 라벨 + 입력 한 행 컴포넌트
const Row = ({ label, required, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-start py-2.5 border-b border-gray-100 last:border-0">
        <div className="w-full sm:w-28 shrink-0 text-sm font-medium text-gray-600 py-1.5">
            {required && <span className="text-red-500 mr-1">*</span>}
            {label}
        </div>
        <div className="flex-1">{children}</div>
    </div>
)

// 섹션 타이틀
const SectionTitle = ({ title }) => (
    <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-1 col-span-1 sm:col-span-2">
        {title}
    </h2>
)

// 공통 input 스타일
const inputClass = "w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"

function AdminRegister() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        admin_id        : '',
        password        : '',
        password_confirm: '',
        name            : '',
        nickname        : '',
        mobile          : '',
        email           : '',
        phone           : '',
        phone_ext       : '',
        emp_type        : '',
        department      : '',
        position        : '',
        job_title       : '',
        postcode        : '',
        address1        : '',
        address2        : '',
    })
    const [errors, setErrors]   = useState({})
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})

        if (form.password !== form.password_confirm) {
            setErrors({ password_confirm: '비밀번호가 일치하지 않습니다.' })
            return
        }

        setLoading(true)

        try {
            await api.post('/admin/auth/register', form)
            alert('가입 신청이 완료되었습니다.\n최고 관리자 승인 후 로그인 가능합니다.')
            navigate('/admin/login')
        } catch (err) {
            const msg = err.response?.data?.message
            if (typeof msg === 'object') {
                setErrors(msg)
            } else {
                setErrors({ general: msg || '가입 신청 실패' })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-5xl mx-auto">

                {/* 헤더 */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">관리자 가입 신청</h1>
                    <p className="text-sm text-gray-500 mt-1">가입 후 최고 관리자 승인이 필요합니다</p>
                </div>

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
                        <SectionTitle title="기본 정보" />

                        <div className="border border-gray-100 rounded p-3">
                            <Row label="아이디" required>
                                <input type="text" name="admin_id" placeholder="아이디 (4자 이상)" value={form.admin_id} onChange={handleChange} className={inputClass} />
                                {errors.admin_id && <p className="text-red-500 text-xs mt-1">{errors.admin_id}</p>}
                            </Row>
                            <Row label="이름" required>
                                <input type="text" name="name" placeholder="이름" value={form.name} onChange={handleChange} className={inputClass} />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </Row>
                            <Row label="닉네임">
                                <input type="text" name="nickname" placeholder="닉네임" value={form.nickname} onChange={handleChange} className={inputClass} />
                            </Row>
                        </div>

                        {/* ===== 비밀번호 ===== */}
                        <div className="border border-gray-100 rounded p-3">
                            <Row label="비밀번호" required>
                                <input type="password" name="password" placeholder="비밀번호 (6자 이상)" value={form.password} onChange={handleChange} className={inputClass} />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </Row>
                            <Row label="비밀번호 확인" required>
                                <input type="password" name="password_confirm" placeholder="비밀번호 확인" value={form.password_confirm} onChange={handleChange} className={inputClass} />
                                {errors.password_confirm && <p className="text-red-500 text-xs mt-1">{errors.password_confirm}</p>}
                            </Row>
                        </div>

                        {/* ===== 연락처 정보 ===== */}
                        <SectionTitle title="연락처 정보" />

                        <div className="border border-gray-100 rounded p-3">
                            <Row label="휴대폰" required>
                                <input type="text" name="mobile" placeholder="010-0000-0000" value={form.mobile} onChange={handleChange} className={inputClass} />
                                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                            </Row>
                            <Row label="이메일" required>
                                <input type="email" name="email" placeholder="이메일" value={form.email} onChange={handleChange} className={inputClass} />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </Row>
                        </div>

                        <div className="border border-gray-100 rounded p-3">
                            <Row label="전화번호">
                                <div className="flex gap-2">
                                    <input type="text" name="phone" placeholder="전화번호" value={form.phone} onChange={handleChange} className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
                                    <input type="text" name="phone_ext" placeholder="내선" value={form.phone_ext} onChange={handleChange} className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
                                </div>
                            </Row>
                        </div>

                        {/* ===== 직원 정보 ===== */}
                        <SectionTitle title="직원 정보" />

                        <div className="border border-gray-100 rounded p-3">
                            <Row label="직원여부">
                                <select name="emp_type" value={form.emp_type} onChange={handleChange} className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 w-36">
                                    <option value="">= 선택 =</option>
                                    <option value="1001">직원</option>
                                    <option value="1002">비정규직</option>
                                    <option value="1003">아르바이트</option>
                                    <option value="1004">파견직</option>
                                    <option value="1005">퇴사자</option>
                                </select>
                            </Row>
                            <Row label="부서">
                                <input type="text" name="department" placeholder="부서" value={form.department} onChange={handleChange} className={inputClass} />
                            </Row>
                        </div>

                        <div className="border border-gray-100 rounded p-3">
                            <Row label="직급">
                                <input type="text" name="position" placeholder="직급" value={form.position} onChange={handleChange} className={inputClass} />
                            </Row>
                            <Row label="직책">
                                <input type="text" name="job_title" placeholder="직책" value={form.job_title} onChange={handleChange} className={inputClass} />
                            </Row>
                        </div>

                        {/* ===== 주소 정보 ===== */}
                        <SectionTitle title="주소 정보" />

                        <div className="border border-gray-100 rounded p-3 sm:col-span-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                                <Row label="우편번호">
                                    <input type="text" name="postcode" placeholder="우편번호" value={form.postcode} onChange={handleChange} className={inputClass} />
                                </Row>
                                <Row label="기본주소">
                                    <input type="text" name="address1" placeholder="기본주소" value={form.address1} onChange={handleChange} className={inputClass} />
                                </Row>
                                <Row label="상세주소">
                                    <input type="text" name="address2" placeholder="상세주소" value={form.address2} onChange={handleChange} className={inputClass} />
                                </Row>
                            </div>
                        </div>

                    </div>

                    {/* 버튼 */}
                    <div className="border-t mt-6 pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="sm:w-40 bg-blue-600 text-white rounded py-2 text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? '처리 중...' : '가입 신청'}
                        </button>
                        <button
                            onClick={() => navigate('/admin/login')}
                            className="sm:w-40 bg-gray-200 text-gray-700 rounded py-2 text-sm font-bold hover:bg-gray-300"
                        >
                            로그인으로 돌아가기
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default AdminRegister