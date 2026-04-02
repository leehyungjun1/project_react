import { useAdminAuth } from '../../context/AdminAuthContext'
import { Navigate } from 'react-router-dom'

function AdminProtectedRoute({ children }) {
    const { admin, loading } = useAdminAuth()

    // 초기 로딩 중
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">로딩 중...</p>
            </div>
        )
    }

    // 로그인 안 되어 있으면 로그인 페이지로
    if (!admin) {
        return <Navigate to="/admin/login" replace />
    }

    return children
}

export default AdminProtectedRoute