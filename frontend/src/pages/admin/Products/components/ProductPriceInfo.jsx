// src/pages/admin/products/components/ProductPriceInfo.jsx
import * as FC from '@/components/admin/FormComponents'

function ProductPriceInfo({ form, onChange }) {
    const handleChange = (e) => {
        const { name, value } = e.target
        const updated = { [name]: value }

        if (name === 'commission_rate' || name === 'sale_price') {
            const salePrice      = name === 'sale_price'      ? Number(value) : Number(form.sale_price      ?? 0)
            const commissionRate = name === 'commission_rate' ? Number(value) : Number(form.commission_rate ?? 0)
            updated.commission_price = Math.round(salePrice * commissionRate / 100)
        }

        onChange(updated)
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div>
                <FC.Row label="정가">
                    <div className="flex items-center gap-2">
                        <FC.PriceInput name="price" value={form.price} onChange={handleChange} />
                    </div>
                </FC.Row>
                <FC.Row label="매입가">
                    <div className="flex items-center gap-2">
                        <FC.PriceInput name="cost_price" value={form.cost_price} onChange={handleChange} />
                    </div>
                </FC.Row>
                <FC.Row label="가격 대체 문구">
                    <input type="text" name="price_text" value={form.price_text ?? ''} onChange={handleChange} placeholder="예: 가격문의" className={FC.inputClass} />
                </FC.Row>
                <FC.Row label="판매가" required>
                    <div className="flex items-center gap-2">
                        <FC.PriceInput name="sale_price" value={form.sale_price} onChange={handleChange} />
                    </div>
                </FC.Row>
            </div>
            <div>
                <FC.Row label="공급가">
                    <div className="flex items-center gap-2">
                        <FC.PriceInput name="supply_price" value={form.supply_price} onChange={handleChange} />
                    </div>
                </FC.Row>
                <FC.Row label="수수료율">
                    <div className="flex items-center gap-2">
                        <input type="number" name="commission_rate" value={form.commission_rate ?? 0} onChange={handleChange} step="0.01" className={FC.inputClass} />
                        <span className="text-sm text-gray-500 shrink-0">%</span>
                    </div>
                </FC.Row>
                <FC.Row label="수수료액">
                    <div className="flex items-center gap-2">
                        <FC.PriceInput name="commission_price" value={form.commission_price} readOnly onChange={handleChange} />
                        <span className="text-xs text-gray-400 shrink-0">(자동계산)</span>
                    </div>
                </FC.Row>
            </div>
        </div>
    )
}

export default ProductPriceInfo