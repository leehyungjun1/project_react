import { useRef } from 'react'
import api from '@/api/axios'
import { showAlert } from '@/utils/modal'
import { FaImage, FaTrash } from 'react-icons/fa6'

const storageUrl = import.meta.env.VITE_STORAGE_URL ?? 'http://localhost:8080'
function ImageUpload({
                         value,           // 현재 이미지 경로
                         onChange,        // 이미지 경로 변경 콜백 (path) => void
                         folder = 'common', // 저장 폴더
                         width  = 'w-full', // 컨테이너 너비
                         height = 'h-40',   // 컨테이너 높이
                         accept = 'image/*',
                         label  = '이미지 선택',
                         hint,            // 하단 안내 문구
                         imageType   = null,
                         autoResize  = false,
                         onResized = null,
                     }) {
    const inputRef = useRef(null)

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', folder)
            if (imageType)  formData.append('image_type',  imageType)
            if (autoResize) formData.append('auto_resize', 1)

            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            console.log('업로드 응답:', res.data)

            const data = res.data.data
            if (data.resized && onResized) {
                onResized({ ...data.resized, [imageType]: data.path })  // 한번에 세팅
            } else {
                onChange(data.path)
            }

            if (data.resized && onResized) {
                console.log('onResized 호출:', data.resized)
                onResized(data.resized)
            }
        } catch (err) {
            showAlert('error', '오류', '이미지 업로드 실패')
        }
        e.target.value = ''
    }

    const handleDelete = async () => {
        if (!value) return
        try {
            await api.delete('/upload', { data: { path: value } })
            onChange('')
        } catch (err) {
            onChange('')
        }
    }

    return (
        <div className="flex flex-col gap-2">
            {/* 미리보기 */}
            <div
                className={`relative ${width} ${height} border-2 border-dashed border-gray-300 rounded overflow-hidden cursor-pointer hover:border-blue-400 transition-colors bg-gray-50`}
                onClick={() => inputRef.current?.click()}
            >
                {value ? (
                    <>
                        <img
                            src={`${storageUrl}/${value}`}
                            alt="업로드 이미지"
                            className="w-full h-full object-contain"
                        />
                        {/* 삭제 버튼 */}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDelete() }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                            <FaTrash size={10} />
                        </button>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                        <FaImage size={32} />
                        <span className="text-xs text-gray-400">{label}</span>
                    </div>
                )}
            </div>

            {/* 버튼 */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50"
                >
                    파일 선택
                </button>
                {value && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="text-sm border border-red-300 text-red-500 px-3 py-1.5 rounded hover:bg-red-50"
                    >
                        삭제
                    </button>
                )}
                {hint && <span className="text-xs text-gray-400">{hint}</span>}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleUpload}
            />
        </div>
    )
}

export default ImageUpload