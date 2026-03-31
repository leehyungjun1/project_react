import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

function AdminRegister() {
    const navigate = useNavigate()

    const [form, setForm]       = useState({
        admin_id : '',
        password : '',
        name     : '',
        mobile   : '',
        email    : '',
        postcode : '',
        address1 : '',
        address2 : '',
    })
    const [errors, setErrors]   = useState({})
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">

                {/* 타이틀 */}
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
                    관리자 가입 신청
                </h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                    가입 후 최고 관리자 승인이 필요합니다
                </p>

                {/* 일반 에러 */}
                {errors.general && (
                    <div className="bg-red-100 text-red-600 text-sm p-3 rounded mb-4">
                        {errors.general}
                    </div>
                )}

                <div className="flex flex-col gap-3">

                    {/* 아이디 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">아이디</label>
                        <input
                            type="text"
                            name="admin_id"
                            placeholder="아이디 (4자 이상)"
                            value={form.admin_id}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-4 py-2 text-sm mt-1 focus:outline-none focus:border-blue-400"
                        />
                        {errors.admin_id && (
                            <p className="text-red-500 text-xs mt-1">{errors.admin_id}</p>
                        )}
                    </div>

                    {/* 비밀번호 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="비밀번호 (6자 이상)"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-4 py-2 text-sm mt-1 focus:outline-none focus:border-blue-400"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* 이름 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">이름</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="이름"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-4 py-2 text-sm mt-1 focus:outline-none focus:border-blue-400"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* 연락처 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">연락처</label>
                        <input
                            type="text"
                            name="mobile"
                            placeholder="010-0000-0000"
                            value={form.mobile}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-4 py-2 text-sm mt-1 focus:outline-none focus:border-blue-400"
                        />
                        {errors.mobile && (
                            <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                        )}
                    </div>

                    {/* 이메일 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">이메일</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="이메일"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-4 py-2 text-sm mt-1 focus:outline-none focus:border-blue-400"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* 우편번호 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">주소</label>
                        <input
                            type="text"
                            name="postcode"
                            placeholder="우편번호"
                            value={form.postcode}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-4 py-2 text-sm mt-1 focus:outline-none focus:border-blue-400"
                        />
                    </div>

                    {/* 기본주소 */}
                    <input
                        type="text"
                        name="address1"
                        placeholder="기본주소"
                        value={form.address1}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                    />

                    {/* 상세주소 */}
                    <input
                        type="text"
                        name="address2"
                        placeholder="상세주소"
                        value={form.address2}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                    />

                    {/* 가입 버튼 */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 text-white rounded py-2 text-sm font-bold hover:bg-blue-700 disabled:opacity-50 mt-2"
                    >
                        {loading ? '처리 중...' : '가입 신청'}
                    </button>
                </div>

                {/* 로그인 링크 */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    이미 계정이 있으신가요?{' '}
                    <span
                        onClick={() => navigate('/admin/login')}
                        className="text-blue-600 cursor-pointer hover:underline"
                    >
                        로그인
                    </span>
                </p>

            </div>
        </div>
    )
}

export default AdminRegister