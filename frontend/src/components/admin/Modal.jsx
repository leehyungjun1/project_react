import { FaCircleCheck, FaCircleXmark, FaTriangleExclamation, FaCircleInfo } from 'react-icons/fa6'

// Alert 모달 (확인 버튼만)
export const AlertModal = ({ show, type = 'success', title, message, onClose }) => {
    if (!show) return null

    const config = {
        success : { icon: FaCircleCheck,       color: 'text-green-500', btn: 'bg-green-500 hover:bg-green-600' },
        error   : { icon: FaCircleXmark,        color: 'text-red-500',   btn: 'bg-red-500 hover:bg-red-600' },
        warning : { icon: FaTriangleExclamation, color: 'text-yellow-500', btn: 'bg-yellow-500 hover:bg-yellow-600' },
        info    : { icon: FaCircleInfo,          color: 'text-blue-500',  btn: 'bg-blue-500 hover:bg-blue-600' },
    }

    const { icon: Icon, color, btn } = config[type] || config.success

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            {/* 오버레이 */}
            <div className="absolute inset-0 bg-black/20" onClick={onClose} />

            {/* 모달 */}
            <div className="relative bg-white rounded-xl shadow-xl w-80 p-6 text-center">
                <Icon className={`${color} mx-auto mb-3`} size={48} />
                {title && <h3 className="font-bold text-gray-800 text-lg mb-1">{title}</h3>}
                {message && <p className="text-sm text-gray-500 mb-5">{message}</p>}
                <button
                    onClick={onClose}
                    className={`w-full ${btn} text-white py-2 rounded-lg text-sm font-medium`}
                >
                    확인
                </button>
            </div>
        </div>
    )
}

// Confirm 모달 (확인 + 취소 버튼)
export const ConfirmModal = ({ show, type = 'warning', title, message, onConfirm, onCancel }) => {
    if (!show) return null

    const config = {
        success : { icon: FaCircleCheck,        color: 'text-green-500',  btn: 'bg-green-500 hover:bg-green-600' },
        error   : { icon: FaCircleXmark,         color: 'text-red-500',    btn: 'bg-red-500 hover:bg-red-600' },
        warning : { icon: FaTriangleExclamation, color: 'text-yellow-500', btn: 'bg-yellow-500 hover:bg-yellow-600' },
        info    : { icon: FaCircleInfo,           color: 'text-blue-500',   btn: 'bg-blue-500 hover:bg-blue-600' },
    }

    const { icon: Icon, color, btn } = config[type] || config.warning

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            {/* 오버레이 */}
            <div className="absolute inset-0 bg-black bg-opacity-20" onClick={onCancel} />

            {/* 모달 */}
            <div className="relative bg-white rounded-xl shadow-xl w-80 p-6 text-center">
                <Icon className={`${color} mx-auto mb-3`} size={48} />
                {title && <h3 className="font-bold text-gray-800 text-lg mb-1">{title}</h3>}
                {message && <p className="text-sm text-gray-500 mb-5">{message}</p>}
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 ${btn} text-white py-2 rounded-lg text-sm font-medium`}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    )
}