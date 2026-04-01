// 전역 모달 함수 저장소
let _showAlert   = null
let _showConfirm = null

// ModalContext에서 등록
export const registerModal = (showAlert, showConfirm) => {
    console.log('registerModal 호출됨!') // ✅ 임시 로그
    _showAlert   = showAlert
    _showConfirm = showConfirm
}

// 어디서든 import해서 바로 사용
export const showAlert = (type, title, message, onClose = null) => {
    console.log('showAlert 호출됨:', type, title) // ✅ 임시 로그
    if (_showAlert) _showAlert(type, title, message, onClose)
    else console.log('_showAlert 없음!')
}

export const showConfirm = (title, message, onConfirm, type = 'warning') => {
    console.log('showConfirm 호출됨:', title) // ✅ 임시 로그
    if (_showConfirm) _showConfirm(title, message, onConfirm, type)
    else console.log('_showConfirm 없음!')
}