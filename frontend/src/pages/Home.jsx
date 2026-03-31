import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
    const { user, logout } = useAuth()
    const navigate         = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-orange-500">🥕 당근마켓</h1>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-sm text-gray-600">
                                안녕하세요, {user.nickname}님!
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-500 hover:text-red-500"
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-orange-500 font-bold"
                        >
                            로그인
                        </button>
                    )}
                </div>
            </header>

            {/* 메인 */}
            <main className="max-w-2xl mx-auto p-6">
                <h2 className="text-lg font-bold text-gray-700">
                    중고 거래 물품
                </h2>
            </main>
        </div>
    )
}

export default Home