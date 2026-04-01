import { createContext, useContext, useState, useEffect } from 'react'
import { AlertModal, ConfirmModal } from '../components/admin/Modal'
import { registerModal } from '../utils/modal'

const ModalContext = createContext(null)

export function ModalProvider({ children }) {
    const [alertModal, setAlertModal]     = useState({ show: false, type: 'success', title: '', message: '', onClose: null })
    const [confirmModal, setConfirmModal] = useState({ show: false, type: 'warning', title: '', message: '', onConfirm: null })

    // Alert 모달 열기
    const showAlert = (type, title, message, onClose = null) => {
        setAlertModal({ show: true, type, title, message, onClose })
    }

    // Confirm 모달 열기
    const showConfirm = (title, message, onConfirm, type = 'warning') => {
        setConfirmModal({ show: true, type, title, message, onConfirm })
    }

    useEffect(() => {
        registerModal(showAlert, showConfirm)
    }, [])

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}

            {/* Alert 모달 */}
            <AlertModal
                show={alertModal.show}
                type={alertModal.type}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => {
                    setAlertModal({ show: false })
                    if (alertModal.onClose) alertModal.onClose()
                }}
            />

            {/* Confirm 모달 */}
            <ConfirmModal
                show={confirmModal.show}
                type={confirmModal.type}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={() => {
                    setConfirmModal({ show: false })
                    if (confirmModal.onConfirm) confirmModal.onConfirm()
                }}
                onCancel={() => setConfirmModal({ show: false })}
            />
        </ModalContext.Provider>
    )
}

// 커스텀 훅
export function useModal() {
    return useContext(ModalContext)
}