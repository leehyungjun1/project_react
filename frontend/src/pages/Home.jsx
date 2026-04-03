import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '@/api/axios'
import Slider from '@/components/Slider'
import Popup from '@/components/Popup'

function Home() {
    const { user, logout } = useAuth()
    const navigate         = useNavigate()
    const [mainBanner, setMainBanner] = useState(null)

    useEffect(() => {
        // 'main_banner' 코드로 배너 가져오기
        api.get('/banners/main_banner')
            .then(res => {
                setMainBanner(res.data.data)  // 배너 데이터 저장
            })
            .catch(err => {
                console.error('배너 로딩 실패', err)
            })
    }, [])

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
                <div>
                    {/* 전체 활성 팝업 */}
                    <Popup />

                    {/* 특정 팝업만 */}
                    <Popup codes={['main_popup', 'event_popup']} />

                    {/* mainBanner가 있을 때만 슬라이더 표시 */}
                    {mainBanner && <Slider banner={mainBanner} />}
                </div>
            </main>
        </div>
    )
}

export default Home