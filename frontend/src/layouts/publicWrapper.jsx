// src/layouts/PublicWrapper.jsx
import { Outlet } from 'react-router-dom'
import PublicLayout from './public/PublicLayout' // 실제 공통 레이아웃 (헤더/푸터 등)

const PublicWrapper = () => (
    <PublicLayout>
        {/* Outlet이 하위 Route 컴포넌트를 렌더링 */}
        <Outlet />
    </PublicLayout>
)

export default PublicWrapper