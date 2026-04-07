// src/pages/admin/products/components/ProductBasicInfo.jsx
import * as FC from '@/components/admin/FormComponents'

function ProductBasicInfo({ form, onChange }) {
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        onChange({ [name]: type === 'checkbox' ? (checked ? 1 : 0) : value })
    }

    return (
        <div className="space-y-2">

            {/* 상품명 + 상품코드 2단 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <FC.Row label="상품명" required>
                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="상품명 입력" className={FC.inputClass} />
                </FC.Row>
                <FC.Row label="상품코드" className="last:border-b">  {/* ← border 강제 유지 */}
                    <input type="text" name="code" value={form.code} onChange={handleChange} placeholder="미입력 시 DEFAULT 자동 세팅" className={FC.inputClass} />
                </FC.Row>
            </div>

            {/* 상품명 타입 */}
            <FC.Row label="상품명 타입">
                <div className="flex gap-4 pt-1">
                    {[['basic','기본 상품명'],['extended','확장 상품명']].map(([val, lbl]) => (
                        <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" name="name_type" value={val} checked={form.name_type === val} onChange={handleChange} className="accent-orange-500" />
                            {lbl}
                        </label>
                    ))}
                </div>
            </FC.Row>

            {/* 기본 상품명 */}
            {form.name_type === 'basic' && (
                <FC.Row label="기본 상품명">
                    <input type="text" name="name_basic" value={form.name_basic ?? ''} onChange={handleChange} placeholder="기본 상품명" className={FC.inputClass} />
                </FC.Row>
            )}

            {/* 확장 상품명 - 하나의 그룹으로 묶어서 표시 */}
            {form.name_type === 'extended' && (
                <div className="border border-gray-100 rounded p-4 bg-gray-50">
                    <h4 className="text-xs font-bold text-gray-600 mb-3">확장 상품명</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                        {[
                            ['name_basic',   '기본'],
                            ['name_main',    '메인'],
                            ['name_list',    '리스트'],
                            ['name_detail',  '상세'],
                            ['name_partner', '제휴'],
                        ].map(([field, label]) => (
                            <FC.Row key={field} label={label}>
                                <input type="text" name={field} value={form[field] ?? ''} onChange={handleChange} placeholder={`${label} 상품명`} className={FC.inputClass} />
                            </FC.Row>
                        ))}
                    </div>
                </div>
            )}

            {/* 검색 키워드 */}
            <FC.Row label="검색 키워드">
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" name="keyword_auto" checked={form.keyword_auto == 1} onChange={handleChange} className="w-4 h-4" />
                        기본 상품명을 검색 키워드로 자동 포함
                    </label>
                    <textarea
                        name="keyword"
                        value={form.keyword ?? ''}
                        onChange={handleChange}
                        rows={2}
                        placeholder="키워드 입력 (쉼표로 구분)"
                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
                    />
                </div>
            </FC.Row>

        </div>
    )
}

export default ProductBasicInfo