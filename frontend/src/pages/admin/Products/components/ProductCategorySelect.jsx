// src/pages/admin/products/components/ProductCategorySelect.jsx
import { useState, useEffect } from 'react'
import api from '@/api/axios'
import * as FC from '@/components/admin/FormComponents'

function ProductCategorySelect({ form, onChange }) {
    const [cats1, setCats1] = useState([])
    const [cats2, setCats2] = useState([])
    const [cats3, setCats3] = useState([])
    const [cats4, setCats4] = useState([])

    // 현재 선택 중인 임시 상태
    const [sel1, setSel1] = useState('')
    const [sel2, setSel2] = useState('')
    const [sel3, setSel3] = useState('')
    const [sel4, setSel4] = useState('')

    // 선택된 카테고리 목록 (다중)
    // form.categories = [{ id1, id2, id3, id4, label }]
    const categories = form.categories || []

    // 1차 카테고리
    useEffect(() => {
        api.get('/admin/products/categories', {
            params: { depth: 0, is_active: 1, per_page: 100 }
        }).then(res => setCats1(res.data.data.list)).catch(() => {})
    }, [])

    // 2차 카테고리
    useEffect(() => {
        setSel2(''); setSel3(''); setSel4('')
        setCats2([]); setCats3([]); setCats4([])
        if (!sel1) return
        api.get('/admin/products/categories', {
            params: { parent_id: sel1, per_page: 100 }
        }).then(res => setCats2(res.data.data.list)).catch(() => {})
    }, [sel1])

    // 3차 카테고리
    useEffect(() => {
        setSel3(''); setSel4('')
        setCats3([]); setCats4([])
        if (!sel2) return
        api.get('/admin/products/categories', {
            params: { parent_id: sel2, per_page: 100 }
        }).then(res => setCats3(res.data.data.list)).catch(() => {})
    }, [sel2])

    // 4차 카테고리
    useEffect(() => {
        setSel4('')
        setCats4([])
        if (!sel3) return
        api.get('/admin/products/categories', {
            params: { parent_id: sel3, per_page: 100 }
        }).then(res => setCats4(res.data.data.list)).catch(() => {})
    }, [sel3])

    // 카테고리 추가
    const handleAdd = () => {
        if (!sel1) return

        // 선택된 카테고리명 조합
        const name1 = cats1.find(c => c.id == sel1)?.name || ''
        const name2 = cats2.find(c => c.id == sel2)?.name || ''
        const name3 = cats3.find(c => c.id == sel3)?.name || ''
        const name4 = cats4.find(c => c.id == sel4)?.name || ''

        const label = [name1, name2, name3, name4].filter(Boolean).join(' > ')

        // 중복 체크 (id1~id4 모두 같으면 중복)
        const isDuplicate = categories.some(c =>
            c.id1 == sel1 && c.id2 == sel2 && c.id3 == sel3 && c.id4 == sel4
        )
        if (isDuplicate) return

        const newCat = {
            id1: sel1 || null,
            id2: sel2 || null,
            id3: sel3 || null,
            id4: sel4 || null,
            label,
        }

        onChange({ categories: [...categories, newCat] })

        // 선택 초기화
        setSel1(''); setSel2(''); setSel3(''); setSel4('')
    }

    // 카테고리 제거
    const handleRemove = (index) => {
        onChange({ categories: categories.filter((_, i) => i !== index) })
    }

    return (
        <div className="space-y-3">
            {/* 선택된 카테고리 태그 */}
            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs px-2.5 py-1 rounded-full"
                        >
                            <span>{cat.label}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="text-orange-400 hover:text-orange-700 font-bold"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 카테고리 선택 드롭다운 */}
            <div className="flex flex-wrap items-end gap-2">
                {/* 1차 */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">1차</label>
                    <select
                        value={sel1}
                        onChange={(e) => setSel1(e.target.value)}
                        className={FC.selectClass}
                    >
                        <option value="">선택</option>
                        {cats1.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {/* 2차 */}
                {cats2.length > 0 && (
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">2차</label>
                        <select
                            value={sel2}
                            onChange={(e) => setSel2(e.target.value)}
                            className={FC.selectClass}
                        >
                            <option value="">선택</option>
                            {cats2.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                )}

                {/* 3차 */}
                {cats3.length > 0 && (
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">3차</label>
                        <select
                            value={sel3}
                            onChange={(e) => setSel3(e.target.value)}
                            className={FC.selectClass}
                        >
                            <option value="">선택</option>
                            {cats3.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                )}

                {/* 4차 */}
                {cats4.length > 0 && (
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">4차</label>
                        <select
                            value={sel4}
                            onChange={(e) => setSel4(e.target.value)}
                            className={FC.selectClass}
                        >
                            <option value="">선택</option>
                            {cats4.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                )}

                {/* 추가 버튼 */}
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!sel1}
                    className="bg-orange-500 text-white text-sm px-3 py-1.5 rounded hover:bg-orange-600 disabled:opacity-40 shrink-0"
                >
                    + 추가
                </button>
            </div>

            {categories.length === 0 && (
                <p className="text-xs text-gray-400">카테고리를 선택 후 추가 버튼을 눌러주세요.</p>
            )}
        </div>
    )
}

export default ProductCategorySelect