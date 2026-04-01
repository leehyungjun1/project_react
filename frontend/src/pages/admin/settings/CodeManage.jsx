import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import PageHeader from '../../../components/admin/PageHeader'
import api from '../../../api/axios'
import { AlertModal, ConfirmModal } from '../../../components/admin/Modal'

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FaGripVertical, FaChevronDown, FaChevronRight, FaPlus, FaPen, FaTrash } from 'react-icons/fa6'

// 정렬 가능한 코드 아이템
function SortableItem({ item, depth, expandedIds, onToggle, onSelect, onAddChild, onDelete, selectedId }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const isExpanded = expandedIds.includes(item.id)
    const hasChildren = item.children?.length > 0
    const isSelected = selectedId === item.id
    const paddingLeft = depth * 24 + 12

    return (
        <div ref={setNodeRef} style={style}>
            {/* 아이템 행 */}
            <div
                className={`
                    flex items-center gap-2 py-2.5 pr-3 border-b border-gray-100 cursor-pointer transition-colors
                    ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                `}
                style={{ paddingLeft }}
                onClick={() => onSelect(item)}
            >
                {/* 드래그 핸들 */}
                <div
                    {...attributes}
                    {...listeners}
                    className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
                    onClick={(e) => e.stopPropagation()}
                >
                    <FaGripVertical size={12} />
                </div>

                {/* 펼치기/접기 */}
                <div
                    className="w-4 text-gray-400"
                    onClick={(e) => { e.stopPropagation(); hasChildren && onToggle(item.id) }}
                >
                    {hasChildren ? (
                        isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />
                    ) : null}
                </div>

                {/* 코드값 */}
                <span className="text-xs text-gray-400 w-20 shrink-0">{item.code}</span>

                {/* 코드명 */}
                <span className={`flex-1 text-sm ${depth === 0 ? 'font-bold' : ''}`}>
                    {item.name}
                </span>

                {/* 사용여부 */}
                <span className={`text-xs px-1.5 py-0.5 rounded ${item.is_active === '1' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {item.is_active === '1' ? '사용' : '미사용'}
                </span>

                {/* 버튼 */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {/* 자식 추가 */}
                    <button
                        onClick={() => onAddChild(item)}
                        className="text-gray-400 hover:text-blue-500 p-1"
                        title="하위 코드 추가"
                    >
                        <FaPlus size={10} />
                    </button>
                    {/* 삭제 */}
                    <button
                        onClick={() => onDelete(item)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="삭제"
                    >
                        <FaTrash size={10} />
                    </button>
                </div>
            </div>

            {/* 자식 */}
            {hasChildren && isExpanded && (
                <SortableContext
                    items={item.children.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {item.children.map(child => (
                        <SortableItem
                            key={child.id}
                            item={child}
                            depth={depth + 1}
                            expandedIds={expandedIds}
                            onToggle={onToggle}
                            onSelect={onSelect}
                            onAddChild={onAddChild}
                            onDelete={onDelete}
                            selectedId={selectedId}
                        />
                    ))}
                </SortableContext>
            )}
        </div>
    )
}

function CodeManage() {
    const { token }               = useAdminAuth()
    const [tree, setTree]         = useState([])
    const [selectedItem, setSelectedItem] = useState(null)  // 선택된 아이템
    const [parentItem, setParentItem]     = useState(null)  // 추가할 부모
    const [expandedIds, setExpandedIds]   = useState([])    // 펼쳐진 아이디
    const [loading, setLoading]           = useState(false)
    const [form, setForm] = useState({
        name      : '',
        value     : '',
        is_active : '1',
    })
    const [isEdit, setIsEdit] = useState(false)

    const [alertModal, setAlertModal]     = useState({ show: false, type: 'success', title: '', message: '' })
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null })

    const showAlert = (type, title, message) => {
        setAlertModal({ show: true, type, title, message })
    }

    const showConfirm = (title, message, onConfirm) => {
        setConfirmModal({ show: true, title, message, onConfirm })
    }

    const headers = { Authorization: `Bearer ${token}` }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        })
    )

    // 목록 조회
    const fetchTree = async () => {
        setLoading(true)
        try {
            const res = await api.get('/admin/settings/codes', { headers })
            setTree(res.data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTree()
    }, [])

    // 펼치기/접기
    const handleToggle = (id) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    // 아이템 선택 (수정 모드)
    const handleSelect = (item) => {
        setSelectedItem(item)
        setParentItem(null)
        setIsEdit(true)
        setForm({
            name      : item.name,
            value     : item.value ?? '',
            is_active : item.is_active,
        })
    }

    // 최상위 추가
    const handleAddRoot = () => {
        setSelectedItem(null)
        setParentItem(null)
        setIsEdit(false)
        setForm({ name: '', value: '', is_active: '1' })
    }

    // 자식 추가
    const handleAddChild = (item) => {
        setSelectedItem(null)
        setParentItem(item)
        setIsEdit(false)
        setForm({ name: '', value: '', is_active: '1' })
    }

    // 삭제
    const handleDelete = async (item) => {
        showConfirm(
            '코드 삭제',
            `"${item.name}" 을 삭제하시겠습니까?\n하위 코드도 모두 삭제됩니다.`,
            async () => {
                setConfirmModal({ show: false })
                try {
                    await api.delete(`/admin/settings/codes/${item.id}`, { headers })
                    showAlert('success', '삭제 완료', '삭제되었습니다.')
                    fetchTree()
                    setSelectedItem(null)
                    setForm({ name: '', value: '', is_active: '1' })
                    setIsEdit(false)
                } catch (err) {
                    showAlert('error', '삭제 실패', '삭제 중 오류가 발생했습니다.')
                }
            }
        )
    }

    // 저장 alert
    const handleSubmit = async () => {
        if (!form.name) {
            showAlert('warning', '입력 오류', '코드명을 입력해 주세요.')
            return
        }

        try {
            if (isEdit && selectedItem) {
                await api.put(`/admin/settings/codes/${selectedItem.id}`, form, { headers })
                showAlert('success', '수정 완료', '수정되었습니다.')
            } else {
                await api.post('/admin/settings/codes', {
                    ...form,
                    parent_id: parentItem?.id ?? null,
                }, { headers })
                showAlert('success', '추가 완료', '추가되었습니다.')
                if (parentItem) {
                    setExpandedIds(prev => [...prev, parentItem.id])
                }
            }
            fetchTree()
            setSelectedItem(null)
            setParentItem(null)
            setIsEdit(false)
            setForm({ name: '', value: '', is_active: '1' })
        } catch (err) {
            showAlert('error', '저장 실패', '저장 중 오류가 발생했습니다.')
        }
    }

    // 취소
    const handleCancel = () => {
        setSelectedItem(null)
        setParentItem(null)
        setIsEdit(false)
        setForm({ name: '', value: '', is_active: '1' })
    }

    // 드래그 종료
    const handleDragEnd = async (event) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        // 같은 레벨에서만 순서 변경
        const newTree = reorderTree(tree, active.id, over.id)
        setTree(newTree)

        // API 호출
        const items = getFlatItems(newTree)
        try {
            await api.post('/admin/settings/codes/reorder', { items }, { headers })
        } catch (err) {
            console.error('순서 변경 실패')
            fetchTree()
        }
    }

    // 트리에서 순서 변경
    const reorderTree = (nodes, activeId, overId) => {
        const activeIndex = nodes.findIndex(n => n.id === activeId)
        const overIndex   = nodes.findIndex(n => n.id === overId)

        if (activeIndex !== -1 && overIndex !== -1) {
            return arrayMove(nodes, activeIndex, overIndex)
        }

        return nodes.map(node => ({
            ...node,
            children: node.children?.length
                ? reorderTree(node.children, activeId, overId)
                : node.children
        }))
    }

    // 플랫 아이템 추출 (순서 변경용)
    const getFlatItems = (nodes, result = []) => {
        nodes.forEach((node, index) => {
            result.push({ id: node.id, order_no: index + 1 })
            if (node.children?.length) getFlatItems(node.children, result)
        })
        return result
    }

    return (
        <div>
            <PageHeader
                title="코드 관리"
                breadcrumbs={[
                    { label: '설정', path: '/admin/settings' },
                    { label: '코드 관리' },
                ]}
                actions={
                    <button
                        onClick={handleAddRoot}
                        className="bg-red-500 text-white text-sm px-4 py-1.5 rounded hover:bg-red-600 flex items-center gap-1"
                    >
                        <FaPlus size={10} />
                        최상위 코드 추가
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ===== 왼쪽: 코드 트리 ===== */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <span className="font-bold text-sm text-gray-700">코드 트리</span>
                            <span className="text-xs text-gray-400 ml-2">같은 레벨 내에서 드래그하여 순서를 변경할 수 있습니다.</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-400 text-sm">로딩 중...</div>
                    ) : tree.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            코드가 없습니다. 최상위 코드를 추가해 주세요.
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={tree.map(i => i.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {tree.map(item => (
                                    <SortableItem
                                        key={item.id}
                                        item={item}
                                        depth={0}
                                        expandedIds={expandedIds}
                                        onToggle={handleToggle}
                                        onSelect={handleSelect}
                                        onAddChild={handleAddChild}
                                        onDelete={handleDelete}
                                        selectedId={selectedItem?.id}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                {/* ===== 오른쪽: 코드 등록/수정 폼 ===== */}
                <div className="bg-white rounded-lg shadow h-fit">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <span className="font-bold text-sm text-gray-700">
                            {isEdit ? '코드 수정' : parentItem ? `"${parentItem.name}" 하위 코드 등록` : '코드 등록'}
                        </span>
                    </div>

                    <div className="p-4">
                        {/* 코드값 */}
                        <div className="flex items-start py-3 border-b border-gray-100">
                            <div className="w-24 shrink-0 text-sm font-medium text-gray-600 pt-1.5">코드값</div>
                            <div className="flex-1 text-sm text-gray-400 pt-1.5">
                                {isEdit ? selectedItem?.code : '자동 생성'}
                            </div>
                        </div>

                        {/* 코드명 */}
                        <div className="flex items-start py-3 border-b border-gray-100">
                            <div className="w-24 shrink-0 text-sm font-medium text-gray-600 pt-1.5">
                                <span className="text-red-500 mr-1">*</span>코드명
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="코드명 입력"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                                />
                            </div>
                        </div>

                        {/* 추가값 */}
                        <div className="flex items-start py-3 border-b border-gray-100">
                            <div className="w-24 shrink-0 text-sm font-medium text-gray-600 pt-1.5">추가값</div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="추가값 입력 (선택)"
                                    value={form.value}
                                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                                />
                            </div>
                        </div>

                        {/* 사용여부 */}
                        <div className="flex items-start py-3 border-b border-gray-100">
                            <div className="w-24 shrink-0 text-sm font-medium text-gray-600 pt-1.5">사용여부</div>
                            <div className="flex-1 flex items-center gap-4 pt-1.5">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="is_active"
                                        value="1"
                                        checked={form.is_active === '1'}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.value })}
                                        className="accent-red-500"
                                    />
                                    사용
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="is_active"
                                        value="0"
                                        checked={form.is_active === '0'}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.value })}
                                        className="accent-red-500"
                                    />
                                    미사용
                                </label>
                            </div>
                        </div>

                        {/* 버튼 */}
                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                onClick={handleCancel}
                                className="border border-gray-300 text-sm px-4 py-1.5 rounded hover:bg-gray-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="bg-red-500 text-white text-sm px-4 py-1.5 rounded hover:bg-red-600"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AlertModal
                show={alertModal.show}
                type={alertModal.type}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal({ show: false })}
            />

            {/* Confirm 모달 */}
            <ConfirmModal
                show={confirmModal.show}
                type="warning"
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ show: false })}
            />
        </div>
    )
}

export default CodeManage