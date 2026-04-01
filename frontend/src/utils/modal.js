// 전역 모달 함수 저장소
let _showAlert   = null
let _showConfirm = null

// ModalContext에서 등록
export const registerModal = (showAlert, showConfirm) => {
    _showAlert   = showAlert
    _showConfirm = showConfirm
}

// 어디서든 import해서 바로 사용
export const showAlert = (type, title, message, onClose = null) => {
    if (_showAlert) _showAlert(type, title, message, onClose)
}

export const showConfirm = (title, message, onConfirm, type = 'warning') => {
    if (_showConfirm) _showConfirm(title, message, onConfirm, type)
}