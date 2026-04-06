// src/pages/admin/products/CategoryList.jsx 를 트리 구조로 전면 교체
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import ImageUpload from '@/components/ImageUpload'
import { showAlert } from '@/utils/modal'
import * as FC from '@/components/admin/FormComponents'

const INITIAL_FORM = {
    parent_id        : '',
    name             : '',
    description      : '',
    depth            : 0,
    sort_order       : 0,
    category_type    : 'normal',
    is_pc_show       : 1,
    is_mobile_show   : 1,
    is_active        : 1,
    pc_image         : '',
    mobile_image     : '',
    hover_image      : '',
    is_adult         : 0,
    access_type      : 'all',
    access_grade_code: '',
    display_type     : 'auto',
    pc_theme_id      : '',
    mobile_theme_id  : '',
    recommended_themes: [
        { device_type: 'pc',     image: '', product_count: 10, show_soldout: 1, show_icon: 1, display_items: ['image','name','price'], layout_type: 'gallery' },
        { device_type: 'mobile', image: '', product_count: 10, show_soldout: 1, show_icon: 1, display_items: ['image','name','price'], layout_type: 'gallery' },
    ],
}

const DISPLAY_ITEMS_OPTIONS = [
    { value: 'image', label: '이미지' },
    { value: 'name',  label: '상품명' },
    { value: 'price', label: '판매가' },
]

// 트리 아이템 컴포넌트
const TreeItem = ({ item, selectedId, onSelect, onAdd, onDelete, depth = 0 }) => {
    const [open, setOpen] = useState(true)
    const hasChildren = item.children?.length > 0

    return (
        <div>
            <div
                className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer group transition-colors ${selectedId === item.id ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50 text-gray-700'}`}
                style={{ paddingLeft: `${8 + depth * 16}px` }}
            >
                {/* 펼치기/접기 */}
                <button
                    onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
                    className="w-4 h-4 flex items-center justify-center text-gray-400 shrink-0"
                >
                    {hasChildren ? (open ? '▼' : '▶') : ''}
                </button>

                {/* 카테고리명 */}
                <span
                    onClick={() => onSelect(item)}
                    className="flex-1 text-sm truncate"
                >
                    {item.name}
                </span>

                {/* 뱃지 */}
                <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${item.is_active == 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {item.is_active == 1 ? '사용' : '미사용'}
                </span>

                {/* 버튼 (hover시) */}
                <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                    {depth < 2 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAdd(item.id) }}
                            className="text-xs text-blue-500 hover:text-blue-700 px-1"
                            title="하위 카테고리 추가"
                        >
                            +
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id, item.name) }}
                        className="text-xs text-red-400 hover:text-red-600 px-1"
                        title="삭제"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* 자식 */}
            {hasChildren && open && (
                <div>
                    {item.children.map(child => (
                        <TreeItem
                            key={child.id}
                            item={child}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            onAdd={onAdd}
                            onDelete={onDelete}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function CategoryList() {
    const navigate = useNavigate()

    const [tree, setTree]               = useState([])
    const [selectedId, setSelectedId]   = useState(null)
    const [form, setForm]               = useState(INITIAL_FORM)
    const [isCreate, setIsCreate]       = useState(false)
    const [loading, setLoading]         = useState(false)
    const [treeLoading, setTreeLoading] = useState(true)
    const [pcThemes, setPcThemes]       = useState([])
    const [mobileThemes, setMobileThemes] = useState([])
    const [grades, setGrades]           = useState([])

    // 트리 + 옵션 데이터 로드
    const fetchTree = () => {
        setTreeLoading(true)
        api.get('/admin/products/categories/tree')
            .then(res => setTree(res.data.data))
            .catch(() => {})
            .finally(() => setTreeLoading(false))
    }

    useEffect(() => {
        fetchTree()
        Promise.all([
            api.get('/admin/products/categories/themes', { params: { device_type: 'pc' } }),
            api.get('/admin/products/categories/themes', { params: { device_type: 'mobile' } }),
            api.get('/admin/users/grades'),
        ]).then(([pcRes, mobileRes, gradeRes]) => {
            setPcThemes(pcRes.data.data)
            setMobileThemes(mobileRes.data.data)
            setGrades(gradeRes.data.data)
        }).catch(() => {})
    }, [])

    // 카테고리 선택
    const handleSelect = (item) => {
        setSelectedId(item.id)
        setIsCreate(false)
        api.get(`/admin/products/categories/${item.id}`)
            .then(res => setForm(prev => ({ ...INITIAL_FORM, ...res.data.data })))
            .catch(() => showAlert('error', '오류', '데이터를 불러오는데 실패했습니다.'))
    }

    // 새 카테고리 추가 (상위 카테고리 id 또는 null)
    const handleAdd = (parentId = null) => {
        setSelectedId(null)
        setIsCreate(true)
        setForm({ ...INITIAL_FORM, parent_id: parentId ?? '' })
    }

    // 삭제
    const handleDelete = (id, name) => {
        showAlert('confirm', '삭제', `"${name}" 카테고리를 삭제하시겠습니까?`, async () => {
            try {
                await api.delete(`/admin/products/categories/${id}`)
                fetchTree()
                if (selectedId === id) {
                    setSelectedId(null)
                    setForm(INITIAL_FORM)
                    setIsCreate(false)
                }
            } catch (err) {
                showAlert('error', '오류', err.response?.data?.message || '삭제 실패')
            }
        })
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }))
    }

    const handleThemeChange = (deviceType, field, value) => {
        setForm(prev => ({
            ...prev,
            recommended_themes: prev.recommended_themes.map(t =>
                t.device_type === deviceType ? { ...t, [field]: value } : t
            )
        }))
    }

    const handleDisplayItemToggle = (deviceType, value) => {
        setForm(prev => ({
            ...prev,
            recommended_themes: prev.recommended_themes.map(t => {
                if (t.device_type !== deviceType) return t
                const items = t.display_items?.includes(value)
                    ? t.display_items.filter(i => i !== value)
                    : [...(t.display_items || []), value]
                return { ...t, display_items: items }
            })
        }))
    }

    const handleSubmit = async () => {
        if (!form.name) return showAlert('warning', '확인', '카테고리명을 입력해주세요.')
        setLoading(true)
        try {
            if (isCreate) {
                await api.post('/admin/products/categories', form)
                showAlert('success', '완료', '등록되었습니다.', () => {
                    fetchTree()
                    setIsCreate(false)
                })
            } else {
                await api.put(`/admin/products/categories/${selectedId}`, form)
                showAlert('success', '완료', '수정되었습니다.', () => fetchTree())
            }
        } catch (err) {
            showAlert('error', '오류', err.response?.data?.message || '처리 실패')
        } finally {
            setLoading(false)
        }
    }

    const ThemeForm = ({ deviceType, label }) => {
        const theme = form.recommended_themes?.find(t => t.device_type === deviceType) || {}
        return (
            <div className="border border-gray-100 rounded p-4">
                <h4 className="text-xs font-bold text-gray-600 mb-3">{label}</h4>
                <FC.Row label="이미지">
                    <ImageUpload
                        value={theme.image}
                        onChange={(path) => handleThemeChange(deviceType, 'image', path)}
                        folder="categories/themes"
                        height="h-24"
                        hint="테마 대표 이미지"
                    />
                </FC.Row>
                <FC.Row label="상품 노출 수">
                    <input type="number" value={theme.product_count ?? 10} onChange={e => handleThemeChange(deviceType, 'product_count', e.target.value)} className={FC.inputClass} />
                </FC.Row>
                <FC.Row label="품절상품 노출">
                    <div className="flex gap-4 pt-1">
                        {[['1','노출'],['0','미노출']].map(([val, lbl]) => (
                            <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" checked={String(theme.show_soldout) === val} onChange={() => handleThemeChange(deviceType, 'show_soldout', Number(val))} className="accent-orange-500" />
                                {lbl}
                            </label>
                        ))}
                    </div>
                </FC.Row>
                <FC.Row label="아이콘 노출">
                    <div className="flex gap-4 pt-1">
                        {[['1','노출'],['0','미노출']].map(([val, lbl]) => (
                            <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" checked={String(theme.show_icon) === val} onChange={() => handleThemeChange(deviceType, 'show_icon', Number(val))} className="accent-orange-500" />
                                {lbl}
                            </label>
                        ))}
                    </div>
                </FC.Row>
                <FC.Row label="노출항목">
                    <div className="flex gap-3 pt-1">
                        {DISPLAY_ITEMS_OPTIONS.map(opt => (
                            <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="checkbox" checked={theme.display_items?.includes(opt.value)} onChange={() => handleDisplayItemToggle(deviceType, opt.value)} className="w-4 h-4" />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                </FC.Row>
                <FC.Row label="디스플레이 유형">
                    <div className="flex gap-4 pt-1">
                        {[['gallery','갤러리'],['list','리스트']].map(([val, lbl]) => (
                            <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" checked={theme.layout_type === val} onChange={() => handleThemeChange(deviceType, 'layout_type', val)} className="accent-orange-500" />
                                {lbl}
                            </label>
                        ))}
                    </div>
                </FC.Row>
            </div>
        )
    }

    const SectionTitle = ({ title }) => (
        <div className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-3 mt-4 first:mt-0">
            {title}
        </div>
    )

    return (
        <div>
            <PageHeader
                title="카테고리 관리"
                breadcrumbs={[
                    { label: '상품관리' },
                    { label: '카테고리 관리' },
                ]}
                actions={
                    <button
                        onClick={() => handleAdd(null)}
                        className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600"
                    >
                        + 대분류 추가
                    </button>
                }
            />

            <div className="flex gap-4 items-start">

                {/* ===== 좌측 트리 ===== */}
                <div className="w-72 shrink-0 bg-white rounded-lg shadow overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-gray-50">
                        <span className="text-xs font-bold text-gray-600">카테고리 트리</span>
                        <button
                            onClick={() => handleAdd(null)}
                            className="text-xs text-orange-500 hover:text-orange-700"
                        >
                            + 추가
                        </button>
                    </div>
                    <div className="py-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {treeLoading ? (
                            <div className="px-4 py-6 text-center text-sm text-gray-400">로딩 중...</div>
                        ) : tree.length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-gray-400">카테고리가 없습니다.</div>
                        ) : tree.map(item => (
                            <TreeItem
                                key={item.id}
                                item={item}
                                selectedId={selectedId}
                                onSelect={handleSelect}
                                onAdd={handleAdd}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </div>

                {/* ===== 우측 폼 ===== */}
                <div className="flex-1 min-w-0">
                    {!selectedId && !isCreate ? (
                        <div className="bg-white rounded-lg shadow flex items-center justify-center h-64 text-gray-400 text-sm">
                            카테고리를 선택하거나 추가 버튼을 눌러주세요.
                        </div>
                    ) : (
                        <div className="space-y-4">

                            {/* 저장 버튼 */}
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-700">
                                    {isCreate ? '카테고리 등록' : '카테고리 수정'}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setSelectedId(null); setIsCreate(false); setForm(INITIAL_FORM) }}
                                        className="bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded hover:bg-gray-300"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded hover:bg-orange-600 disabled:opacity-50"
                                    >
                                        {loading ? '처리 중...' : isCreate ? '등록' : '저장'}
                                    </button>
                                </div>
                            </div>

                            {/* 기본정보 */}
                            <div className="bg-white rounded-lg shadow p-4">
                                <SectionTitle title="기본정보" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                                    <div>
                                        <FC.Row label="카테고리명" required>
                                            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="카테고리명" className={FC.inputClass} />
                                        </FC.Row>
                                        <FC.Row label="카테고리 타입">
                                            <div className="flex gap-4 pt-1">
                                                {[['normal','일반'],['group','그룹']].map(([val, lbl]) => (
                                                    <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                                        <input type="radio" name="category_type" value={val} checked={form.category_type === val} onChange={handleChange} className="accent-orange-500" />
                                                        {lbl}
                                                    </label>
                                                ))}
                                            </div>
                                        </FC.Row>
                                        <FC.Row label="노출 상태">
                                            <div className="flex gap-4 pt-1">
                                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="checkbox" name="is_pc_show" checked={form.is_pc_show == 1} onChange={handleChange} className="w-4 h-4" />
                                                    PC
                                                </label>
                                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input type="checkbox" name="is_mobile_show" checked={form.is_mobile_show == 1} onChange={handleChange} className="w-4 h-4" />
                                                    모바일
                                                </label>
                                            </div>
                                        </FC.Row>
                                        <FC.Row label="사용여부">
                                            <div className="flex gap-4 pt-1">
                                                {[['1','사용'],['0','미사용']].map(([val, lbl]) => (
                                                    <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                                        <input type="radio" name="is_active" value={val} checked={String(form.is_active) === val} onChange={handleChange} className="accent-orange-500" />
                                                        {lbl}
                                                    </label>
                                                ))}
                                            </div>
                                        </FC.Row>
                                        <FC.Row label="순서">
                                            <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} className={FC.inputClass} />
                                        </FC.Row>
                                        <FC.Row label="설명">
                                            <textarea name="description" value={form.description ?? ''} onChange={handleChange} rows={3} placeholder="카테고리 설명"
                                                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
                                        </FC.Row>
                                    </div>
                                    <div>
                                        <FC.Row label="성인인증">
                                            <div className="flex gap-4 pt-1">
                                                {[['1','사용'],['0','미사용']].map(([val, lbl]) => (
                                                    <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                                        <input type="radio" name="is_adult" value={val} checked={String(form.is_adult) === val} onChange={handleChange} className="accent-orange-500" />
                                                        {lbl}
                                                    </label>
                                                ))}
                                            </div>
                                        </FC.Row>
                                        <FC.Row label="접근 권한">
                                            <select name="access_type" value={form.access_type} onChange={handleChange} className={FC.selectClass + ' w-full'}>
                                                <option value="all">전체</option>
                                                <option value="member">회원전용</option>
                                                <option value="grade">특정 등급</option>
                                            </select>
                                        </FC.Row>
                                        {form.access_type === 'grade' && (
                                            <FC.Row label="접근 등급">
                                                <select name="access_grade_code" value={form.access_grade_code} onChange={handleChange} className={FC.selectClass + ' w-full'}>
                                                    <option value="">= 선택 =</option>
                                                    {grades.map(g => <option key={g.code} value={g.code}>{g.name}</option>)}
                                                </select>
                                            </FC.Row>
                                        )}
                                        <FC.Row label="상품 진열">
                                            <div className="flex gap-4 pt-1">
                                                {[['auto','자동'],['manual','수동']].map(([val, lbl]) => (
                                                    <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                                        <input type="radio" name="display_type" value={val} checked={form.display_type === val} onChange={handleChange} className="accent-orange-500" />
                                                        {lbl}
                                                    </label>
                                                ))}
                                            </div>
                                        </FC.Row>
                                        <FC.Row label="PC 테마">
                                            <select name="pc_theme_id" value={form.pc_theme_id ?? ''} onChange={handleChange} className={FC.selectClass + ' w-full'}>
                                                <option value="">테마 선택</option>
                                                {pcThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </FC.Row>
                                        <FC.Row label="모바일 테마">
                                            <select name="mobile_theme_id" value={form.mobile_theme_id ?? ''} onChange={handleChange} className={FC.selectClass + ' w-full'}>
                                                <option value="">테마 선택</option>
                                                {mobileThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </FC.Row>
                                    </div>
                                </div>
                            </div>

                            {/* 이미지 설정 */}
                            <div className="bg-white rounded-lg shadow p-4">
                                <SectionTitle title="이미지 설정" />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-2">PC 이미지</label>
                                        <ImageUpload value={form.pc_image} onChange={(path) => setForm(prev => ({ ...prev, pc_image: path }))} folder="categories" hint="PC 카테고리 이미지" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-2">모바일 이미지</label>
                                        <ImageUpload value={form.mobile_image} onChange={(path) => setForm(prev => ({ ...prev, mobile_image: path }))} folder="categories" hint="모바일 카테고리 이미지" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-2">마우스오버 이미지</label>
                                        <ImageUpload value={form.hover_image} onChange={(path) => setForm(prev => ({ ...prev, hover_image: path }))} folder="categories" hint="호버 이미지 (PC)" />
                                    </div>
                                </div>
                            </div>

                            {/* 추천상품 테마 */}
                            <div className="bg-white rounded-lg shadow p-4">
                                <SectionTitle title="추천상품 테마" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ThemeForm deviceType="pc"     label="PC 추천상품 테마" />
                                    <ThemeForm deviceType="mobile" label="모바일 추천상품 테마" />
                                </div>
                            </div>

                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default CategoryList