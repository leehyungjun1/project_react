// src/layouts/PublicLayout.jsx
const PublicLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* 상단 헤더 */}
            <header className="bg-white border-b p-4 text-lg font-bold">
                My App
            </header>

            {/* 본문 */}
            <main className="flex-1 p-4">{children}</main>

            {/* 하단 푸터 */}
            <footer className="bg-gray-100 p-4 text-center text-sm">
                © 2026 My App
            </footer>
        </div>
    )
}

export default PublicLayout