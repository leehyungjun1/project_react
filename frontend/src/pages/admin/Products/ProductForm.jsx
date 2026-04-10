// src/pages/admin/products/ProductForm.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import { showAlert } from '@/utils/modal'

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
    delivery_group_id: '',
}

const SectionTitle = ({ title }) => (
    <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-4">{title}</h2>
)

function ProductForm() {
    const { id } = useParams()
    const isEdit  = !!id
    const navigate = useNavigate()

    const [form, setForm]       = useState(INITIAL_FORM)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(isEdit)

    // 수정 모드: 기존 데이터 로드
    useEffect(() => {
        if (!isEdit) return
        setFetching(true)
        api.get(`/admin/products/${id}`)
            .then(res => {
                const data       = res.data.data       || {}
                const categories = res.data.categories || []
                const names      = data.names          || {}
                const images     = data.images         || {}

                const mappedCategories = categories.map(cat => ({
                    id1  : cat.category_id1,
                    id2  : cat.category_id2,
                    id3  : cat.category_id3,
                    id4  : cat.category_id4,
                    label: [cat.name1, cat.name2, cat.name3, cat.name4].filter(Boolean).join(' > '),
                }))

                setForm({
                    ...INITIAL_FORM,
                    ...data,
                    categories  : mappedCategories,
                    name_basic  : names.name_basic   || '',
                    name_main   : names.name_main    || '',
                    name_list   : names.name_list    || '',
                    name_detail : names.name_detail  || '',
                    name_partner: names.name_partner || '',
                    // 이미지 (type => path 맵)
                    original  : images.original   || '',
                    zoom      : images.zoom       || '',
                    detail    : images.detail     || '',
                    thumb     : images.thumb      || '',
                    list      : images.list       || '',
                    list_group: images.list_group || '',
                    simple    : images.simple     || '',
                    add_list1 : images.add_list1  || '',
                    add_list2 : images.add_list2  || '',
                    add1      : images.add1       || '',
                    add2      : images.add2       || '',
                })
            })
            .catch(() => showAlert('error', '오류', '상품 정보를 불러오지 못했습니다.'))
            .finally(() => setFetching(false))
    }, [id])

    const handleChange = (updates) => {
        setForm(prev => ({ ...prev, ...updates }))
    }

    const validate = () => {
        if (!form.name)
            return showAlert('warning', '확인', '상품명을 입력해주세요.'), false
        if (!form.categories || form.categories.length === 0)
            return showAlert('warning', '확인', '카테고리를 선택해주세요.'), false
        if (!form.sale_price || form.sale_price <= 0)
            return showAlert('warning', '확인', '판매가를 입력해주세요.'), false
        return true
    }

    const handleSubmit = async (status = 'draft') => {
        if (!validate()) return
        setLoading(true)

        console.log('전체 form:', form)  // ← 추가
        console.log('저장할 이미지:', {
            original   : form.original,
            zoom       : form.zoom,
            thumb      : form.thumb,
            list       : form.list,
            detail     : form.detail,
            list_group : form.list_group,
            simple     : form.simple,
        })


        try {
            if (isEdit) {
                await api.put(`/admin/products/${id}`, { ...form, status })
                showAlert('success', '완료', '수정되었습니다.', () => navigate('/admin/products'))
            } else {
                await api.post('/admin/products', { ...form, status })
                showAlert('success', '완료',
                    status === 'active' ? '상품이 등록되었습니다.' : '임시저장되었습니다.',
                    () => navigate('/admin/products')
                )
            }
        } catch (err) {
            showAlert('error', '오류', err.response?.data?.message || (isEdit ? '수정 실패' : '등록 실패'))
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <div className="p-8 text-center text-gray-400 text-sm">불러오는 중...</div>
    }

    const submitLabel = isEdit ? '수정' : '등록'

    return (
        <div>
            <PageHeader
                title={isEdit ? '상품 수정' : '상품 등록'}
                breadcrumbs={[
                    { label: '상품관리' },
                    { label: isEdit ? '상품 수정' : '상품 등록' },
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
                            {loading ? '처리 중...' : submitLabel}
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
                        {loading ? '처리 중...' : submitLabel}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default ProductForm
