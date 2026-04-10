import { useState } from 'react'
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom'


import { useAdminAuth } from '../../context/AdminAuthContext'
import {
    FaGauge,
    FaUsers,
    FaUserShield,
    FaBox,
    FaClipboard,
    FaGear,
    FaRightFromBracket,
    FaBell,
    FaBars,
} from 'react-icons/fa6'

import { FaPaintBrush } from 'react-icons/fa'

// 메뉴 구조
const menus = [
    { label: '대시보드',   path: '/admin/dashboard', icon: FaGauge,      sub: [] },
    { label: '회원 관리',  path: '/admin/users',      icon: FaUsers,      sub: [
            { label: '회원 리스트', path: '/admin/users' },
            { label: '회원 등록',   path: '/admin/users/create' },
        ]},
    { label: '관리자 관리', path: '/admin/managers',  icon: FaUserShield, sub: [
            { label: '관리자 리스트',  path: '/admin/managers' },
            { label: '관리자 가입',    path: '/admin/managers/register' },
            { label: '승인 대기 목록', path: '/admin/managers/pending' },
        ]},
    { label : '디자인', path  : '/admin/design', icon: FaPaintBrush, sub: [
            { label: '슬라이드 배너', path: '/admin/design/banners' },
            { label: '팝업 관리',     path: '/admin/design/popups' },
        ]},
    { label: '상품 관리',  path: '/admin/products',  icon: FaBox,        sub: [
            { label: '상품 리스트', path: '/admin/products' },
            { label: '상품 등록',   path: '/admin/products/create' },
            { label: '이미지 사이즈 설정', path: '/admin/products/image-sizes' },
            { label: '카테고리 관리',  path: '/admin/products/categories' },
            { label: '배송비 그룹',    path: '/admin/products/delivery-groups' },
        ]},
    { label: '게시판 관리', path: '/admin/boards',    icon: FaClipboard,  sub: [
            { label: '게시글 리스트', path: '/admin/boards' },
            { label: '댓글 관리',     path: '/admin/boards/comments' },
        ]},
    { label: '설정',       path: '/admin/settings',  icon: FaGear,       sub: [
            { label: '기본 설정', path: '/admin/settings/site', icon: FaGear },
            { label: '코드 관리', path: '/admin/settings/codes' },
        ]},
]

function AdminLayout() {
    const navigate              = useNavigate()
    const location              = useLocation()
    const { admin, logout }     = useAdminAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // 현재 경로에 맞는 메뉴 찾기
    const currentMenu = menus.find(m => {
        if (m.path === '/admin/dashboard') return false
        if (location.pathname.startsWith(m.path)) return true
        return m.sub.some(s => location.pathname.startsWith(s.path))
    }) || menus[0]

    // 사이드바 아이콘 동적 컴포넌트
    const SidebarIcon = currentMenu?.icon || null

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
                    <div className="flex items-center gap-3">
                        {/* 햄버거 버튼 (모바일만) */}
                        {currentMenu?.sub.length > 0 && (
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden text-gray-500 hover:text-orange-500 text-lg"
                            >
                                <FaBars />
                            </button>
                        )}
                        {/* 로고 */}
                        <div
                            onClick={() => navigate('/admin/dashboard')}
                            className="text-lg font-bold text-orange-500 cursor-pointer"
                        >
                            홍련닷컴 관리자
                        </div>
                        {/* 관리자 정보 (로고 오른쪽) */}
                        <div className="flex items-center gap-3 text-sm text-gray-600 ml-4 pl-4 border-l border-gray-200">
                            <span className="font-medium">{admin?.name} 관리자님 환영합니다!</span>
                        </div>
                    </div>

                    {/* 우측 */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <FaBell className="text-gray-400 cursor-pointer hover:text-orange-500" />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <FaRightFromBracket />
                            <span className="hidden sm:block">로그아웃</span>
                        </button>
                    </div>
                </div>

                {/* 상단 메뉴 */}
                <nav className="hidden md:flex overflow-x-auto px-2">
                    {menus.map((menu) => {
                        const MenuIcon = menu.icon
                        return (
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
                                <MenuIcon />
                                {menu.label}
                            </Link>
                        )
                    })}
                </nav>
            </header>

            {/* ===== 본문 영역 ===== */}
            <div className="flex flex-1 relative">

                {/* ===== 모바일 오버레이 ===== */}
                {mobileMenuOpen && (
                    <div
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
                    />
                )}

                {/* ===== 사이드바 ===== */}
                {currentMenu?.sub.length > 0 && (
                    <>
                        {/* 모바일 사이드바 - 전체 메뉴 포함 */}
                        <aside className={`
    fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-200
    md:hidden
    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
`}>
                            {/* 헤더 */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <span className="font-bold text-orange-500">홍련닷컴 관리자</span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* 전체 메뉴 */}
                            <nav className="py-2 overflow-y-auto h-full">
                                {menus.map((menu) => {
                                    const MenuIcon = menu.icon
                                    return (
                                        <div key={menu.label}>
                                            {/* 상단 메뉴 */}
                                            <div className={`
                        flex items-center gap-2 px-4 py-2.5 text-sm font-bold
                        ${location.pathname.startsWith(menu.path)
                                                ? 'text-orange-500 bg-orange-50'
                                                : 'text-gray-700 bg-gray-50'
                                            }
                    `}>
                                                <MenuIcon />
                                                {menu.label}
                                            </div>
                                            {/* 서브 메뉴 */}
                                            {menu.sub.map((sub) => (
                                                <Link
                                                    key={sub.path}
                                                    to={sub.path}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className={`
                                block pl-8 pr-4 py-2 text-sm transition-colors
                                ${location.pathname === sub.path
                                                        ? 'text-orange-500 font-medium border-r-2 border-orange-500 bg-orange-50'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-orange-500'
                                                    }
                            `}
                                                >
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )
                                })}
                            </nav>
                        </aside>

                        {/* 데스크탑 사이드바 */}
                        <aside className={`
            hidden md:block bg-white border-r border-gray-200 shrink-0 min-h-full transition-all duration-200
            ${sidebarOpen ? 'w-48' : 'w-0 overflow-hidden'}
        `}>
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 font-bold text-sm text-gray-700">
                                {SidebarIcon && <SidebarIcon className="text-orange-500" />}
                                {sidebarOpen && currentMenu.label}
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
                    </>
                )}

                {/* 토글 버튼 (데스크탑만) */}
                {currentMenu?.sub.length > 0 && (
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ left: sidebarOpen ? '192px' : '0px' }}
                        className="hidden md:flex absolute top-6 transition-all duration-200 bg-white border border-l-0 border-gray-200 rounded-r w-4 h-10 items-center justify-center shadow-sm text-gray-400 hover:text-orange-500 text-xs z-10"
                    >
                        {sidebarOpen ? '‹' : '›'}
                    </button>
                )}

                {/* ===== 콘텐츠 영역 ===== */}
                <main className="flex-1 p-6 min-w-0">
                    <Outlet />
                </main>

            </div>
        </div>
    )
}

export default AdminLayout