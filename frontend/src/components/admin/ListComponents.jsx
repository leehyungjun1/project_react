// 총 건수 + 검색결과 + 목록 수 선택
export const ListHeader = ({ total, keyword, perPage, onPerPageChange }) => (
    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="text-sm text-gray-500">
            총 <span className="font-bold text-gray-800">{total}</span> 건
            {keyword && (
                <span className="ml-2">
                    (검색결과 <span className="font-bold text-orange-500">{total}</span> 건)
                </span>
            )}
        </div>
        <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">목록 수</label>
            <select
                value={perPage}
                onChange={(e) => onPerPageChange(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 shrink-0"
            >
                <option value="2">2개</option>
                <option value="20">20개</option>
                <option value="50">50개</option>
                <option value="100">100개</option>
            </select>
        </div>
    </div>
)

// 페이지네이션
export const Pagination = ({ page, lastPage, total, onPageChange }) => {
    if (lastPage <= 0) return null

    return (
        <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between">
            {/* 페이지 정보 */}
            <div className="text-xs text-gray-400">
                {page} / {lastPage} 페이지
            </div>

            {/* 페이지 버튼 */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={page === 1}
                    className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
                >
                    «
                </button>
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
                >
                    ‹
                </button>

                {Array.from({ length: lastPage }, (_, i) => i + 1)
                    .filter(p => p >= page - 2 && p <= page + 2)
                    .map(p => (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`px-2.5 py-1 text-xs border rounded ${
                                p === page
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {p}
                        </button>
                    ))
                }

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === lastPage}
                    className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
                >
                    ›
                </button>
                <button
                    onClick={() => onPageChange(lastPage)}
                    disabled={page === lastPage}
                    className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
                >
                    »
                </button>
            </div>

            {/* 총 건수 */}
            <div className="text-xs text-gray-400">
                총 {total}건
            </div>
        </div>
    )
}