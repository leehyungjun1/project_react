import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Register() {
    const navigate = useNavigate()

    // 입력값 상태
    const [form, setForm]       = useState({ email: '', password: '', nickname: '' })
    // 에러 메시지 상태
    const [errors, setErrors]   = useState({})
    // 로딩 상태
    const [loading, setLoading] = useState(false)

    // 입력값 변경 시
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // 회원가입 버튼 클릭 시
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        try {
            await api.post('/auth/register', form)

            // 회원가입 성공 → 로그인 페이지로 이동
            alert('회원가입이 완료되었습니다!')
            navigate('/login')
        } catch (err) {
            // CI4 유효성 검사 에러 (객체로 옴)
            const msg = err.response?.data?.message
            if (typeof msg === 'object') {
                setErrors(msg)
            } else {
                setErrors({ general: msg || '회원가입 실패' })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">

                {/* 로고 */}
                <h1 className="text-2xl font-bold text-orange-500 text-center mb-6">
                    🥕 당근마켓
                </h1>

                {/* 일반 에러 */}
                {errors.general && (
                    <div className="bg-red-100 text-red-600 text-sm p-3 rounded mb-4">
                        {errors.general}
                    </div>
                )}

                {/* 회원가입 폼 */}
                <div className="flex flex-col gap-3">

                    {/* 이메일 */}
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="이메일"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:border-orange-400"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* 비밀번호 */}
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="비밀번호 (6자 이상)"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:border-orange-400"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* 닉네임 */}
                    <div>
                        <input
                            type="text"
                            name="nickname"
                            placeholder="닉네임 (2자 이상)"
                            value={form.nickname}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:border-orange-400"
                        />
                        {errors.nickname && (
                            <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>
                        )}
                    </div>

                    {/* 회원가입 버튼 */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-orange-500 text-white rounded py-2 text-sm font-bold hover:bg-orange-600 disabled:opacity-50"
                    >
                        {loading ? '처리 중...' : '회원가입'}
                    </button>
                </div>

                {/* 로그인 링크 */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    이미 계정이 있으신가요?{' '}
                    <span
                        onClick={() => navigate('/login')}
                        className="text-orange-500 cursor-pointer hover:underline"
                    >
                        로그인
                    </span>
                </p>

            </div>
        </div>
    )
}

export default Register