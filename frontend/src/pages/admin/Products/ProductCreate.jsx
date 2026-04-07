// src/pages/admin/products/ProductCreate.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import { showAlert } from '@/utils/modal'
import * as FC from '@/components/admin/FormComponents'

import ProductCategorySelect from './components/ProductCategorySelect'
import ProductBasicInfo      from './components/ProductBasicInfo'
import ProductSaleInfo       from './components/ProductSaleInfo'
import ProductPriceInfo      from './components/ProductPriceInfo'
import ProductImageUpload    from './components/ProductImageUpload'
import ProductDescription    from './components/ProductDescription'

const INITIAL_FORM = {
    categories  : [],
    name        : '',
    code        : '',
    name_type   : 'basic',
    name_basic  : '',
    name_main   : '',
    name_list   : '',
    name_detail : '',
    name_partner: '',
    keyword_auto: 0,
    keyword     : '',
    tax_type    : 'taxable',
    tax_rate    : 0,
    weight      : '',
    volume      : '',
    stock_type  : 'unlimited',
    stock       : 0,
    qty_type    : 'unlimited',
    qty_min     : 1,
    qty_max     : 0,
    sale_period : 'unlimited',
    sale_start_at: '',
    sale_end_at  : '',
    price           : 0,
    cost_price      : 0,
    price_text      : '',
    sale_price      : 0,
    supply_price    : 0,
    commission_rate : 0,
    commission_price: 0,
    original    : '',
    zoom        : '',
    detail      : '',
    thumb       : '',
    list        : '',
    list_group  : '',
    simple      : '',
    add_list1   : '',
    add_list2   : '',
    add1        : '',
    add2        : '',
    img_auto_resize: 0,
    description : '',
    status      : 'draft',
}

const SectionTitle = ({ title }) => (
    <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-4">{title}</h2>
)

function ProductCreate() {
    const navigate = useNavigate()
    const [form, setForm]       = useState(INITIAL_FORM)
    const [loading, setLoading] = useState(false)

    const handleChange = (updates) => {
        setForm(prev => ({ ...prev, ...updates }))
    }

    const validate = () => {
        if (!form.name)
            return showAlert('warning', '확인', '상품명을 입력해주세요.'), false
        if (!form.categories || form.categories.length === 0)  // ← categories 배열로
            return showAlert('warning', '확인', '카테고리를 선택해주세요.'), false
        if (!form.sale_price || form.sale_price <= 0)
            return showAlert('warning', '확인', '판매가를 입력해주세요.'), false
        return true
    }

    const handleSubmit = async (status = 'draft') => {
        if (!validate()) return
        setLoading(true)
        try {
            await api.post('/admin/products', { ...form, status })
            showAlert('success', '완료', status === 'active' ? '상품이 등록되었습니다.' : '임시저장되었습니다.', () => {
                navigate('/admin/products')
            })
        } catch (err) {
            showAlert('error', '오류', err.response?.data?.message || '등록 실패')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <PageHeader
                title="상품 등록"
                breadcrumbs={[
                    { label: '상품관리' },
                    { label: '상품 등록' },
                ]}
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/admin/products')} className="border border-gray-300 text-sm px-4 py-1.5 rounded hover:bg-gray-50">
                            취소
                        </button>
                        <button
                            onClick={() => handleSubmit('draft')}
                            disabled={loading}
                            className="bg-gray-500 text-white text-sm px-4 py-1.5 rounded hover:bg-gray-600 disabled:opacity-50"
                        >
                            임시저장
                        </button>
                        <button
                            onClick={() => handleSubmit('active')}
                            disabled={loading}
                            className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600 disabled:opacity-50"
                        >
                            {loading ? '처리 중...' : '등록'}
                        </button>
                    </div>
                }
            />

            <div className="space-y-4">

                {/* 카테고리 */}
                <div className="bg-white rounded-lg shadow p-4">
                    <SectionTitle title="카테고리 선택" />
                    <ProductCategorySelect form={form} onChange={handleChange} />
                </div>

                {/* 기본정보 */}
                <div className="bg-white rounded-lg shadow p-4">
                    <SectionTitle title="상품 기본정보" />
                    <ProductBasicInfo form={form} onChange={handleChange} />
                </div>

                {/* 판매정보 */}
                <div className="bg-white rounded-lg shadow p-4">
                    <SectionTitle title="판매 정보" />
                    <ProductSaleInfo form={form} onChange={handleChange} />
                </div>

                {/* 가격 */}
                <div className="bg-white rounded-lg shadow p-4">
                    <SectionTitle title="가격 설정" />
                    <ProductPriceInfo form={form} onChange={handleChange} />
                </div>

                {/* 이미지 */}
                <div className="bg-white rounded-lg shadow p-4">
                    <SectionTitle title="이미지 업로드" />
                    <ProductImageUpload form={form} onChange={handleChange} />
                </div>

                {/* 상세설명 */}
                <div className="bg-white rounded-lg shadow p-4">
                    <SectionTitle title="상품 상세설명" />
                    <ProductDescription
                        value={form.description}
                        onChange={(html) => handleChange({ description: html })}
                    />
                </div>

                {/* 하단 버튼 */}
                <div className="bg-white rounded-lg shadow p-4 flex justify-end gap-2">
                    <button onClick={() => navigate('/admin/products')} className="border border-gray-300 text-sm px-6 py-2 rounded hover:bg-gray-50">
                        취소
                    </button>
                    <button
                        onClick={() => handleSubmit('draft')}
                        disabled={loading}
                        className="bg-gray-500 text-white text-sm px-6 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
                    >
                        임시저장
                    </button>
                    <button
                        onClick={() => handleSubmit('active')}
                        disabled={loading}
                        className="bg-orange-500 text-white text-sm px-6 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
                    >
                        {loading ? '처리 중...' : '등록'}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default ProductCreate