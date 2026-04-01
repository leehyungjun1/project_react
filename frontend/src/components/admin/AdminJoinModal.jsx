import { useState } from 'react'
import { AlertModal } from './Modal'
import api from '../../api/axios'
import * as FC from './FormComponents'
import { useForm } from '../../hooks/useForm'

function AdminJoinModal({ show, onClose }) {
    const {
        form,
        setForm,
        errors,
        setErrors,
        handleChange,
        handlePhoneChange,
    } = useForm({
        admin_id : '',
        password : '',
        password_confirm: '',
        name     : '',
        mobile   : '',
        email_id : '',
        email_domain : '',
    })

    const [loading, setLoading] = useState(false)
    const [alertModal, setAlertModal] = useState({ show: false, type: 'success', title: '', message: '' })

    const showAlert = (type, title, message) => {
        setAlertModal({ show: true, type, title, message })
    }

    const handleSubmit = async () => {
        setErrors({})

        // 유효성 검사
        if (!form.admin_id) return showAlert('warning', '입력 오류', '아이디를 입력해 주세요.')
        if (!form.password) return showAlert('warning', '입력 오류', '비밀번호를 입력해 주세요.')
        if (form.password !== form.password_confirm) return showAlert('warning', '입력 오류', '비밀번호가 일치하지 않습니다.')
        if (!form.name)     return showAlert('warning', '입력 오류', '이름을 입력해 주세요.')
        if (!form.mobile)   return showAlert('warning', '입력 오류', '휴대폰 번호를 입력해 주세요.')
        if (!form.email_id || !form.email_domain) return showAlert('warning', '입력 오류', '이메일을 입력해 주세요.')

        setLoading(true)

        try {
            await api.post('/admin/auth/register', {
                ...form,
                email    : `${form.email_id}@${form.email_domain}`,
                is_active: '1001', // 승인 대기
            })
            showAlert('success', '가입 신청 완료', '가입 신청이 완료되었습니다.\n관리자 승인 후 로그인 가능합니다.')
        } catch (err) {
            const msg = err.response?.data?.message
            if (typeof msg === 'object') {
                setErrors(msg)
                showAlert('error', '가입 실패', Object.values(msg)[0])
            } else {
                showAlert('error', '가입 실패', msg || '가입 신청 실패')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setForm({ admin_id: '', password: '', password_confirm: '', name: '', mobile: '' })
        setErrors({})
        onClose()
    }

    if (!show) return null

    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20" >
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
                    onClick={(e) => e.stopPropagation()} >
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-800">관리자 가입 신청</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 mb-4 bg-yellow-50 border border-yellow-200 rounded p-2">
                        가입 신청 후 관리자 승인이 완료되면 로그인 가능합니다.
                    </p>

                    {/* 폼 */}
                    <div className="flex flex-col gap-3">

                        {/* 아이디 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                <span className="text-red-500 mr-1">*</span>아이디
                            </label>
                            <input
                                type="text"
                                name="admin_id"
                                placeholder="아이디 (4자 이상)"
                                value={form.admin_id}
                                onChange={handleChange}
                                className={FC.inputClass}
                            />
                            {errors.admin_id && <p className="text-red-500 text-xs mt-1">{errors.admin_id}</p>}
                        </div>

                        {/* 비밀번호 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                <span className="text-red-500 mr-1">*</span>비밀번호
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="비밀번호 (6자 이상)"
                                value={form.password}
                                onChange={handleChange}
                                className={FC.inputClass}
                            />
                        </div>

                        {/* 비밀번호 확인 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                <span className="text-red-500 mr-1">*</span>비밀번호 확인
                            </label>
                            <input
                                type="password"
                                name="password_confirm"
                                placeholder="비밀번호 확인"
                                value={form.password_confirm}
                                onChange={handleChange}
                                className={FC.inputClass}
                            />
                        </div>

                        {/* 이름 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                <span className="text-red-500 mr-1">*</span>이름
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="이름"
                                value={form.name}
                                onChange={handleChange}
                                className={FC.inputClass}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* 휴대폰 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                <span className="text-red-500 mr-1">*</span>휴대폰 번호
                            </label>
                            <input
                                type="text"
                                name="mobile"
                                placeholder="010-0000-0000"
                                value={form.mobile}
                                onChange={handlePhoneChange}
                                className={FC.inputClass}
                            />
                            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                        </div>

                        {/* 이메일 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                <span className="text-red-500 mr-1">*</span>이메일
                            </label>
                            <div className="flex items-center gap-1">
                                <input
                                    type="text"
                                    name="email_id"
                                    placeholder="이메일 아이디"
                                    value={form.email_id}
                                    onChange={handleChange}
                                    className={FC.inputClass}
                                />
                                <span className="text-gray-500 text-sm shrink-0">@</span>
                                <input
                                    type="text"
                                    name="email_domain"
                                    placeholder="도메인"
                                    value={form.email_domain}
                                    onChange={handleChange}
                                    className={FC.inputClass}
                                />
                                <select
                                    name="email_domain"
                                    value={form.email_domain}
                                    onChange={handleChange}
                                    className={FC.selectClass}
                                >
                                    <option value="">직접입력</option>
                                    <option value="gmail.com">gmail.com</option>
                                    <option value="naver.com">naver.com</option>
                                    <option value="daum.net">daum.net</option>
                                    <option value="kakao.com">kakao.com</option>
                                    <option value="nate.com">nate.com</option>
                                </select>
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-2 mt-5">
                        <button
                            onClick={handleClose}
                            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                        >
                            {loading ? '처리 중...' : '가입 신청'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Alert 모달 */}
            <AlertModal
                show={alertModal.show}
                type={alertModal.type}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => {
                    setAlertModal({ show: false })
                    // 성공 시 모달 닫기
                    if (alertModal.type === 'success') handleClose()
                }}
            />
        </>
    )
}

export default AdminJoinModal