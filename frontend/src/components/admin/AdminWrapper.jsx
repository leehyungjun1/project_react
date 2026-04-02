import { Outlet } from 'react-router-dom'
import AdminProtectedRoute from './AdminProtectedRoute'
import AdminLayout from '../../layouts/admin/AdminLayout'

const AdminWrapper = () => (
    <AdminProtectedRoute>
        <AdminLayout>
            <Outlet />
        </AdminLayout>
    </AdminProtectedRoute>
)

export default AdminWrapper