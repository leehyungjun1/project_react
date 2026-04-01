import { Routes, Route } from 'react-router-dom'
import Home          from './pages/Home'
import Login         from './pages/Login'
import Register      from './pages/Register'
import AdminLogin    from './pages/admin/AdminLogin'
import AdminRegister from './pages/admin/managers/AdminRegister.jsx'
import AdminList     from './pages/admin/managers/AdminList'
import AdminLayout   from './layouts/admin/AdminLayout'
import CodeManage from './pages/admin/settings/CodeManage'

const AdminDashboard = () => <div><h1 className="text-xl font-bold">대시보드</h1></div>

function App() {
    return (
        <Routes>
            {/* 일반 사용자 */}
            <Route path="/"         element={<Home />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 관리자 인증 (레이아웃 없음 - admin/* 보다 먼저!) */}
            <Route path="/admin/login"    element={<AdminLogin />} />



            {/* 관리자 페이지 (레이아웃 있음) */}
            <Route path="/admin/*" element={
                <AdminLayout>
                    <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="managers"          element={<AdminList />} />
                        <Route path="managers/register" element={<AdminRegister />} />
                        <Route path="settings/codes" element={<CodeManage />} />
                    </Routes>
                </AdminLayout>
            } />
        </Routes>
    )
}

export default App