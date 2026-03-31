import { createContext, useContext, useState, useEffect } from 'react'

// Context 생성
const AuthContext = createContext(null)

// Provider 컴포넌트 (앱 전체를 감쌈)
export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null)   // 유저 정보
    const [token, setToken]     = useState(null)   // JWT 토큰
    const [loading, setLoading] = useState(true)   // 초기 로딩

    // 앱 시작 시 localStorage에서 유저 정보 복원
    useEffect(() => {
        const savedToken = localStorage.getItem('token')
        const savedUser  = localStorage.getItem('user')

        if (savedToken && savedUser) {
            setToken(savedToken)
            setUser(JSON.parse(savedUser))
        }

        setLoading(false)
    }, [])

    // 로그인
    const login = (userData, jwtToken) => {
        setUser(userData)
        setToken(jwtToken)
        localStorage.setItem('token', jwtToken)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    // 로그아웃
    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

// 커스텀 훅 (편하게 쓰기 위해)
export function useAuth() {
    return useContext(AuthContext)
}