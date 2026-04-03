import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import PageHeader from '../../../components/admin/PageHeader'
import api from '../../../api/axios'
import { AlertModal, ConfirmModal } from '../../../components/admin/Modal'
import {useNavigate} from "react-router-dom";
import {showAlert} from "@/utils/modal.js";

function CompanyManage() {
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e?.preventDefault()
        setErrors({})

        if (form.password !== form.password_confirm) {
            setErrors({ password_confirm: '비밀번호가 일치하지 않습니다.' })
            return
        }

        setLoading(true)

        try {
            await api.post('/admin/settings', {
                ...form,
                email: `${form.email_id}@${form.email_domain}`,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            showAlert('success', '등록 완료', '관리자가 등록되었습니다.', () => {
                navigate('/admin/managers')
            })
        } catch (err) {
            const msg = err.response?.data?.message
            if (typeof msg === 'object') {
                setErrors(msg)
            } else {
                showAlert('error', '등록 실패', msg || '등록 실패')
            }
        } finally {
            setLoading(false)
        }
    }


    return (
        <div>
            <PageHeader
                title="회사 설정"
                breadcrumbs={[
                    { label :  '설정', path:'/admin/setting'},
                    { label : '회사 설정'  },
                ]}
                action={
                    <>
                        <button onClick={handleSubmit}
                        disabled={loading}
                                className="bg-red-500 text-white text-sm px-4 py-1.5 rounded hover:bg-red-600 disabled:opacity-50"
                        >
                            {loading ? '처리 중...' : '저장'}
                        </button>
                    </>
                }
            />
        </div>
    )
}

export default CompanyManage