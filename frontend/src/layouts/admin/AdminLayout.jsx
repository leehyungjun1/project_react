import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
    FaGauge,        // 대시보드
    FaUsers,        // 회원 관리
    FaUserShield,   // 관리자 관리
    FaBox,          // 상품 관리
    FaClipboard,    // 게시판 관리
    FaGear,         // 설정
    FaRightFromBracket, // 로그아웃
    FaBell,         // 알림
} from 'react-icons/fa6'

// 메뉴 구조
const menus = [
    { label: '대시보드',   path: '/admin/dashboard', icon: FaGauge,           sub: [] },
    { label: '회원 관리',  path: '/admin/users',      icon: FaUsers,           sub: [
            { label: '회원 리스트', path: '/admin/users' },
            { label: '회원 등록',   path: '/admin/users/create' },
        ]},
    { label: '관리자 관리', path: '/admin/managers',  icon: FaUserShield,      sub: [
            { label: '관리자 리스트',  path: '/admin/managers' },
            { label: '관리자 등록',    path: '/admin/managers/create' },
            { label: '승인 대기 목록', path: '/admin/managers/pending' },
        ]},
    { label: '상품 관리',  path: '/admin/products',  icon: FaBox,             sub: [
            { label: '상품 리스트', path: '/admin/products' },
            { label: '상품 등록',   path: '/admin/products/create' },
        ]},
    { label: '게시판 관리', path: '/admin/boards',    icon: FaClipboard,       sub: [
            { label: '게시글 리스트', path: '/admin/boards' },
            { label: '댓글 관리',     path: '/admin/boards/comments' },
        ]},
    { label: '설정',       path: '/admin/settings',  icon: FaGear,            sub: [
            { label: '기본 설정', path: '/admin/settings' },
            { label: '코드 관리', path: '/admin/settings/codes' },
        ]},
]

function AdminLayout({ children }) {
    const navigate          = useNavigate()
    const location          = useLocation()
    const { admin, logout } = useAdminAuth()

    // 현재 경로에 맞는 메뉴 찾기
    const currentMenu = menus.find(m =>
        location.pathname.startsWith(m.path) && m.path !== '/admin/dashboard'
    ) || menus[0]

    // 로그아웃
    const handleLogout = () => {
        logout()
        navigate('/admin/login')
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            {/* ===== 상단 GNB ===== */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">

                {/* 최상단 바 */}
                <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-100">
                    <div
                        onClick={() => navigate('/admin/dashboard')}
                        className="text-lg font-bold text-orange-500 cursor-pointer"
                    >
                        🥕 당근마켓 관리자
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <FaBell className="text-gray-400 cursor-pointer hover:text-orange-500" />
                        <span className="font-medium">{admin?.name} 님</span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <FaRightFromBracket />
                            로그아웃
                        </button>
                    </div>
                </div>

                {/* 상단 메뉴 */}
                <nav className="flex overflow-x-auto px-2">
                    {menus.map((menu) => (
                        <Link
                            key={menu.label}
                            to={menu.sub.length > 0 ? menu.sub[0].path : menu.path}
                            className={`
                                shrink-0 flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors
                                ${location.pathname.startsWith(menu.path)
                                ? 'border-orange-500 text-orange-500'
                                : 'border-transparent text-gray-600 hover:text-orange-500 hover:border-orange-200'
                            }
                            `}
                        >
                            <menu.icon />
                            {menu.label}
                        </Link>
                    ))}
                </nav>
            </header>

            {/* ===== 본문 영역 ===== */}
            <div className="flex flex-1">

                {/* ===== 사이드바 ===== */}
                {currentMenu?.sub.length > 0 && (
                    <aside className="w-48 bg-white border-r border-gray-200 shrink-0 min-h-full">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 font-bold text-sm text-gray-700">
                            <currentMenu.icon className="text-orange-500" />
                            {currentMenu.label}
                        </div>
                        <nav className="py-2">
                            {currentMenu.sub.map((sub) => (
                                <Link
                                    key={sub.path}
                                    to={sub.path}
                                    className={`
                                        block px-4 py-2.5 text-sm transition-colors
                                        ${location.pathname === sub.path
                                        ? 'bg-orange-50 text-orange-500 font-medium border-r-2 border-orange-500'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-orange-500'
                                    }
                                    `}
                                >
                                    {sub.label}
                                </Link>
                            ))}
                        </nav>
                    </aside>
                )}

                {/* ===== 콘텐츠 영역 ===== */}
                <main className="flex-1 p-6">
                    {children}
                </main>

            </div>
        </div>
    )
}

export default AdminLayout