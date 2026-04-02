import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = (adminData, jwtToken) => {
        setAdmin(adminData);
        setToken(jwtToken);
        localStorage.setItem('admin_token', jwtToken);
    };

    const logout = () => {
        setAdmin(null);
        setToken(null);
        localStorage.removeItem('admin_token');
    };

    useEffect(() => {
        const savedToken = localStorage.getItem('admin_token');
        if (!savedToken) {
            setLoading(false);
            return;
        }

        const verifyAdmin = async () => {
            try {
                const res = await axiosInstance.get('/admin/me', {
                    headers: { Authorization: `Bearer ${savedToken}` },
                });
                if (res.data?.status) {
                    setAdmin(res.data.admin); // 서버에서 admin 객체 리턴
                    setToken(savedToken);
                } else {
                    logout();
                }
            } catch (err) {
                console.error('토큰 검증 실패', err);
                logout();
            } finally {
                setLoading(false);
            }
        };

        verifyAdmin();
    }, []);

    return (
        <AdminAuthContext.Provider value={{ admin, token, login, logout, loading, axios: axiosInstance }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    return useContext(AdminAuthContext);
}