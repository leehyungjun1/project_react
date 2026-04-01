import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import AdminJoinModal from '../../components/admin/AdminJoinModal'
import api from '../../api/axios'

function AdminLogin() {
    const navigate      = useNavigate()
    const { login }     = useAdminAuth()

    const [form, setForm]       = useState({ admin_id: '', password: '' })
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)
    const [joinModal, setJoinModal] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await api.post('/admin/auth/login', form)
            login(res.data.admin, res.data.token)
            navigate('/admin/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || '로그인 실패')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">

                {/* 로고 */}
                <h1 className="text-2xl font-bold text-orange-500 text-center mb-2">
                    🥕 당근마켓
                </h1>
                <p className="text-sm text-gray-500 text-center mb-6">관리자 로그인</p>

                {/* 에러 */}
                {error && (
                    <div className="bg-red-100 text-red-600 text-sm p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        name="admin_id"
                        placeholder="아이디"
                        value={form.admin_id}
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

                <p className="text-center text-sm text-gray-500 mt-4">
                    계정이 없으신가요?{' '}
                    <span
                        onClick={() => setJoinModal(true)}
                        className="text-orange-500 cursor-pointer hover:underline"
                    >
                        가입 신청
                    </span>
                </p>
            </div>
            {/* 가입 신청 모달 */}
            <AdminJoinModal
                show={joinModal}
                onClose={() => setJoinModal(false)}
            />
        </div>
    )
}

export default AdminLogin