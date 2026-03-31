import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLogin    from './pages/admin/AdminLogin'
import AdminRegister from './pages/admin/AdminRegister'

function App() {
    return (
        <Routes>
            {/* 일반 사용자 */}
            <Route path="/"       element={<Home />} />
            <Route path="/login"  element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 관리자 */}
            <Route path="/admin/login"    element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
        </Routes>
    )
}

export default App