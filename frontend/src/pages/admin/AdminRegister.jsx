import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

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

    // 라벨 + 입력 한 행 컴포넌트
    const Row = ({ label, required, children }) => (
        <div className="flex flex-col sm:flex-row sm:items-start border-b border-gray-100 py-3">
            {/* 라벨 */}
            <div className="w-full sm:w-36 shrink-0 text-sm font-medium text-gray-600 py-1.5">
                {required && <span className="text-red-500 mr-1">*</span>}
                {label}
            </div>
            {/* 입력 */}
            <div className="flex-1">
                {children}
            </div>
        </div>
    )

    // 입력 필드
    const Input = ({ name, type = 'text', placeholder }) => (
        <>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
            {errors[name] && (
                <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
            )}
        </>
    )

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-3xl mx-auto">

                {/* 헤더 */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">관리자 가입 신청</h1>
                    <p className="text-sm text-gray-500 mt-1">가입 후 최고 관리자 승인이 필요합니다</p>
                </div>

                <div className="bg-white rounded-lg shadow">

                    {/* 일반 에러 */}
                    {errors.general && (
                        <div className="bg-red-100 text-red-600 text-sm p-3 rounded mx-6 mt-6">
                            {errors.general}
                        </div>
                    )}

                    {/* 기본 정보 */}
                    <div className="px-6 pt-6 pb-2">
                        <h2 className="text-base font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">
                            기본 정보
                        </h2>
                        <Row label="아이디" required>
                            <Input name="admin_id" placeholder="아이디 (4자 이상)" />
                        </Row>
                        <Row label="비밀번호" required>
                            <div className="flex flex-col gap-2">
                                <Input name="password" type="password" placeholder="비밀번호 (6자 이상)" />
                                <Input name="password_confirm" type="password" placeholder="비밀번호 확인" />
                                {errors.password_confirm && (
                                    <p className="text-red-500 text-xs">{errors.password_confirm}</p>
                                )}
                            </div>
                        </Row>
                        <Row label="이름" required>
                            <Input name="name" placeholder="이름" />
                        </Row>
                        <Row label="닉네임">
                            <Input name="nickname" placeholder="닉네임" />
                        </Row>
                    </div>

                    {/* 연락처 정보 */}
                    <div className="px-6 pt-4 pb-2">
                        <h2 className="text-base font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">
                            연락처 정보
                        </h2>
                        <Row label="휴대폰번호" required>
                            <Input name="mobile" placeholder="010-0000-0000" />
                        </Row>
                        <Row label="이메일" required>
                            <Input name="email" type="email" placeholder="이메일" />
                        </Row>
                        <Row label="전화번호">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="전화번호"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                                />
                                <input
                                    type="text"
                                    name="phone_ext"
                                    placeholder="내선번호"
                                    value={form.phone_ext}
                                    onChange={handleChange}
                                    className="w-24 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                                />
                            </div>
                        </Row>
                    </div>

                    {/* 직원 정보 */}
                    <div className="px-6 pt-4 pb-2">
                        <h2 className="text-base font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">
                            직원 정보
                        </h2>
                        <Row label="직원여부">
                            <select
                                name="emp_type"
                                value={form.emp_type}
                                onChange={handleChange}
                                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 w-40"
                            >
                                <option value="">= 선택 =</option>
                                <option value="1001">직원</option>
                                <option value="1002">비정규직</option>
                                <option value="1003">아르바이트</option>
                                <option value="1004">파견직</option>
                                <option value="1005">퇴사자</option>
                            </select>
                        </Row>
                        <Row label="부서">
                            <Input name="department" placeholder="부서" />
                        </Row>
                        <Row label="직급">
                            <Input name="position" placeholder="직급" />
                        </Row>
                        <Row label="직책">
                            <Input name="job_title" placeholder="직책" />
                        </Row>
                    </div>

                    {/* 주소 정보 */}
                    <div className="px-6 pt-4 pb-6">
                        <h2 className="text-base font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">
                            주소 정보
                        </h2>
                        <Row label="우편번호">
                            <Input name="postcode" placeholder="우편번호" />
                        </Row>
                        <Row label="기본주소">
                            <Input name="address1" placeholder="기본주소" />
                        </Row>
                        <Row label="상세주소">
                            <Input name="address2" placeholder="상세주소" />
                        </Row>
                    </div>

                    {/* 버튼 */}
                    <div className="border-t px-6 py-4 flex flex-col sm:flex-row gap-3 justify-center">
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