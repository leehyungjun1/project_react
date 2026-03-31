import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Login() {
    const navigate   = useNavigate()
    const { login }                 = useAuth()

    // 입력값 상태
    const [form, setForm]     = useState({ email: '', password: '' })
    // 에러 메시지 상태
    const [error, setError]   = useState('')
    // 로딩 상태
    const [loading, setLoading] = useState(false)

    // 입력값 변경 시
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // 로그인 버튼 클릭 시
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await api.post('/auth/login', form)

            // 토큰 저장
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('user', JSON.stringify(res.data.user))

            // 홈으로 이동
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || '로그인 실패')
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

                {/* 에러 메시지 */}
                {error && (
                    <div className="bg-red-100 text-red-600 text-sm p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* 로그인 폼 */}
                <div className="flex flex-col gap-3">
                    <input
                        type="email"
                        name="email"
                        placeholder="이메일"
                        value={form.email}
                        onChange={handleChange}
                        className="border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="비밀번호"
                        value={form.password}
                        onChange={handleChange}
                        className="border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-orange-500 text-white rounded py-2 text-sm font-bold hover:bg-orange-600 disabled:opacity-50"
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </div>

                {/* 회원가입 링크 */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    계정이 없으신가요?{' '}
                    <span
                        onClick={() => navigate('/register')}
                        className="text-orange-500 cursor-pointer hover:underline"
                    >
                        회원가입
                    </span>
                </p>

            </div>
        </div>
    )
}

export default Login