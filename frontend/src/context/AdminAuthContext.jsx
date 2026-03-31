import { createContext, useContext, useState, useEffect } from 'react'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
    const [admin, setAdmin]     = useState(null)   // 관리자 정보
    const [token, setToken]     = useState(null)   // JWT 토큰
    const [loading, setLoading] = useState(true)   // 초기 로딩

    // 앱 시작 시 localStorage에서 관리자 정보 복원
    useEffect(() => {
        const savedToken = localStorage.getItem('admin_token')
        const savedAdmin = localStorage.getItem('admin')

        if (savedToken && savedAdmin) {
            setToken(savedToken)
            setAdmin(JSON.parse(savedAdmin))
        }

        setLoading(false)
    }, [])

    // 로그인
    const login = (adminData, jwtToken) => {
        setAdmin(adminData)
        setToken(jwtToken)
        localStorage.setItem('admin_token', jwtToken)
        localStorage.setItem('admin', JSON.stringify(adminData))
    }

    // 로그아웃
    const logout = () => {
        setAdmin(null)
        setToken(null)
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin')
    }

    return (
        <AdminAuthContext.Provider value={{ admin, token, login, logout, loading }}>
            {children}
        </AdminAuthContext.Provider>
    )
}

export function useAdminAuth() {
    return useContext(AdminAuthContext)
}