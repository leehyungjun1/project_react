// 라벨 + 입력 한 행 컴포넌트
export const Row = ({ label, required, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-start py-2.5 border-b border-gray-100 last:border-0">
        <div className="w-full sm:w-28 shrink-0 text-sm font-medium text-gray-600 py-1.5">
            {required && <span className="text-red-500 mr-1">*</span>}
            {label}
        </div>
        <div className="flex-1">{children}</div>
    </div>
)

// 섹션 타이틀
export const SectionTitle = ({ title }) => (
    <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-1 col-span-1 sm:col-span-2">
        {title}
    </h2>
)

// 전화번호 자동 포맷 함수
export const formatPhone = (value) => {
    const numbers = value.replace(/[^\d]/g, '')

    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    if (numbers.length <= 10) return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
}

// 공통 input 스타일
export const inputClass = "w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
export const selectClass = "border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 shrink-0"