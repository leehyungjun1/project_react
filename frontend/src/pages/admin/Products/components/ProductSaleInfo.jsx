// src/pages/admin/products/components/ProductSaleInfo.jsx
import * as FC from '@/components/admin/FormComponents'

function ProductSaleInfo({ form, onChange }) {
    const handleChange = (e) => {
        const { name, value } = e.target
        onChange({ [name]: value })
    }

    return (
        <div className="space-y-2">

            {/* 과세/면세 + 세금 한 줄 */}
            <FC.Row label="과세/면세" required>
                <div className="flex items-center gap-6 pt-1">
                    {[['taxable','과세'],['tax_free','면세']].map(([val, lbl]) => (
                        <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" name="tax_type" value={val} checked={form.tax_type === val} onChange={handleChange} className="accent-orange-500" />
                            {lbl}
                        </label>
                    ))}
                    {/* 과세 선택 시 세금 입력 인라인 */}
                    {form.tax_type === 'taxable' && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">세금</span>
                            <input
                                type="number"
                                name="tax_rate"
                                value={form.tax_rate ?? 0}
                                onChange={handleChange}
                                className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                            />
                            <span className="text-xs text-gray-500">%</span>
                        </div>
                    )}
                </div>
            </FC.Row>

            {/* 상품무게 + 상품용량 2단 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <FC.Row label="상품 무게">
                    <input type="text" name="weight" value={form.weight ?? ''} onChange={handleChange} placeholder="예: 500g" className={FC.inputClass} />
                </FC.Row>
                <FC.Row label="상품 용량">
                    <input type="text" name="volume" value={form.volume ?? ''} onChange={handleChange} placeholder="예: 500ml" className={FC.inputClass} />
                </FC.Row>
            </div>

            {/* 판매재고 - 무한정/재고 + 재고수량 인라인 */}
            <FC.Row label="판매재고" required>
                <div className="flex items-center gap-6 pt-1">
                    {[['unlimited','무한정'],['limited','재고']].map(([val, lbl]) => (
                        <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" name="stock_type" value={val} checked={form.stock_type === val} onChange={handleChange} className="accent-orange-500" />
                            {lbl}
                        </label>
                    ))}
                    {/* 재고 선택 시 수량 입력 인라인 */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">재고수량</span>
                        <input
                            type="number"
                            name="stock"
                            value={form.stock ?? 0}
                            onChange={handleChange}
                            disabled={form.stock_type === 'unlimited'}
                            className={`w-24 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 ${form.stock_type === 'unlimited' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                        />
                        <span className="text-xs text-gray-500">개</span>
                    </div>
                </div>
            </FC.Row>

            {/* 구매수량 설정 */}
            <FC.Row label="구매수량" required>
                <div className="flex items-center gap-6 pt-1">
                    {[['unlimited','제한없음'],['option','옵션기준']].map(([val, lbl]) => (
                        <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" name="qty_type" value={val} checked={form.qty_type === val} onChange={handleChange} className="accent-orange-500" />
                            {lbl}
                        </label>
                    ))}
                    {form.qty_type === 'option' && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">최소</span>
                            <input type="number" name="qty_min" value={form.qty_min ?? 1} onChange={handleChange} className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none" />
                            <span className="text-xs text-gray-500">최대</span>
                            <input type="number" name="qty_max" value={form.qty_max ?? 0} onChange={handleChange} className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none" />
                        </div>
                    )}
                </div>
            </FC.Row>

            {/* 판매기간 */}
            <FC.Row label="판매기간" required>
                <div className="flex flex-wrap items-center gap-4 pt-1">
                    {[['unlimited','제한없음'],['limited','기간설정']].map(([val, lbl]) => (
                        <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" name="sale_period" value={val} checked={form.sale_period === val} onChange={handleChange} className="accent-orange-500" />
                            {lbl}
                        </label>
                    ))}
                    {form.sale_period === 'limited' && (
                        <div className="flex items-center gap-2">
                            <input type="datetime-local" name="sale_start_at" value={form.sale_start_at ?? ''} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none" />
                            <span className="text-xs text-gray-500">~</span>
                            <input type="datetime-local" name="sale_end_at" value={form.sale_end_at ?? ''} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none" />
                        </div>
                    )}
                </div>
            </FC.Row>

        </div>
    )
}

export default ProductSaleInfo