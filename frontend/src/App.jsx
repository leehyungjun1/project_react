// App.jsx
import { Routes, Route } from 'react-router-dom'

// Layout Wrappers
import PublicWrapper from './layouts/PublicWrapper'
import AdminWrapper from './components/admin/AdminWrapper'

// 일반 사용자 페이지
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

// 관리자 로그인 페이지
import AdminLogin from './pages/admin/AdminLogin'

// 관리자 페이지 컴포넌트
// import AdminDashboard from './pages/admin/AdminDashboard'
import UserList         from './pages/admin/users/UserList'
import UserCreate       from './pages/admin/users/UserCreate'
import UserDetail       from './pages/admin/users/UserDetail'
import AdminList        from './pages/admin/managers/AdminList'
import AdminRegister    from './pages/admin/managers/AdminRegister'
import AdminDetail      from './pages/admin/managers/AdminDetail'
import BannerList       from './pages/admin/design/BannerList'
import BannerForm       from './pages/admin/design/BannerForm'
import PopupList        from './pages/admin/design/PopupList'
import PopupForm        from './pages/admin/design/PopupForm'
import SiteSetting      from './pages/admin/settings/SiteSetting'
import CodeManage       from './pages/admin/settings/CodeManage'
import BoardList        from './pages/admin/boards/BoardList'
import BoardForm        from './pages/admin/boards/BoardForm'
import PostList         from './pages/admin/boards/PostList'
import PostForm         from './pages/admin/boards/PostForm'
import PostView         from './pages/admin/boards/PostView'

// 일반 사용자 라우트 배열
const publicRoutes = [
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
]

// 관리자 하위 페이지 라우트 배열
const adminRoutes = [
    { path: 'users', element: <UserList /> },
    { path: 'users/create', element: <UserCreate /> },
    { path: 'users/:id',    element: <UserDetail /> },
    { path: 'managers', element: <AdminList /> },
    { path: 'managers/register', element: <AdminRegister /> },
    { path: 'managers/:id', element: <AdminDetail /> },
    { path: 'design/banners', element: <BannerList /> },
    { path: 'design/banners/create', element: <BannerForm /> },
    { path: 'design/banners/:id', element: <BannerForm /> },
    { path: 'design/popups', element: <PopupList  /> },
    { path: 'design/popups/create', element: <PopupForm /> },
    { path: 'design/popups/:id', element: <PopupForm /> },
    { path: 'settings/site', element: <SiteSetting /> },
    { path: 'settings/codes', element: <CodeManage /> },
    { path: 'boards', element: <BoardList /> },
    { path: 'boards/create', element: <BoardForm /> },
    { path: 'boards/:id', element: <BoardForm /> },
    { path: 'boards/:boardCode/posts', element: <PostList /> },
    { path: 'boards/:boardCode/posts/create', element: <PostForm /> },
    { path: 'boards/:boardCode/posts/:id', element: <PostForm /> },
    { path: 'boards/:boardCode/posts/:id/view', element: <PostView /> },
]

function App() {
    return (
        <Routes>

            {/* ----------------------- 일반 사용자 ----------------------- */}
            <Route element={<PublicWrapper />}>
                {publicRoutes.map(({ path, element }) => (
                    <Route key={path} path={path} element={element} />
                ))}
            </Route>

            {/* ----------------------- 관리자 로그인 ----------------------- */}
            {/* 로그인 페이지는 Layout 필요 없음 */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ----------------------- 관리자 페이지 ----------------------- */}
            {/* AdminWrapper = Layout + ProtectedRoute */}
            <Route path="/admin" element={<AdminWrapper />}>
                {adminRoutes.map(({ path, element }) => (
                    <Route key={path} path={path} element={element} />
                ))}
            </Route>

        </Routes>
    )
}

export default App