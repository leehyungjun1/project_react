import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/api/axios'
import * as FC from '@/components/admin/FormComponents'
import PageHeader from '@/components/admin/PageHeader'
import { showAlert, showConfirm } from '@/utils/modal'
import { Editor } from '@toast-ui/react-editor'
import '@toast-ui/editor/dist/toastui-editor.css'

function PopupForm() {
    const navigate    = useNavigate()
    const { id }      = useParams()
    const isEdit      = !!id
    const editorRef   = useRef(null)

    const [loading, setLoading]         = useState(false)
    const [pageLoading, setPageLoading] = useState(isEdit)
    const [showPreview, setShowPreview] = useState(false)

    const [form, setForm] = useState({
        popup_code   : '',
        title        : '',
        content      : '',
        popup_type   : 'fixed',
        width        : '400',
        height       : '500',
        pos_type     : 'center',
        pos_top      : '0',
        pos_left     : '0',
        display_type : 'always',
        start_at     : '',
        end_at       : '',
        hide_today   : '1',
        is_active    : '1',
        order_no     : '0',
    })

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    useEffect(() => {
        if (!isEdit) return
        const fetchDetail = async () => {
            try {
                const res  = await api.get(`/admin/design/popups/${id}`)
                const data = res.data.data
                setForm({
                    popup_code   : data.popup_code   ?? '',
                    title        : data.title,
                    content      : data.content      ?? '',
                    popup_type   : data.popup_type,
                    width        : data.width,
                    height       : data.height,
                    pos_type     : data.pos_type,
                    pos_top      : data.pos_top,
                    pos_left     : data.pos_left,
                    display_type : data.display_type,
                    start_at     : data.start_at     ?? '',
                    end_at       : data.end_at       ?? '',
                    hide_today   : data.hide_today,
                    is_active    : data.is_active,
                    order_no     : data.order_no,
                })
                setTimeout(() => {
                    editorRef.current?.getInstance().setHTML(data.content ?? '')
                }, 100)
            } catch (err) {
                showAlert('error', '오류', '데이터를 불러오는데 실패했습니다.')
            } finally {
                setPageLoading(false)
            }
        }
        fetchDetail()
    }, [id])

    const handleSubmit = async () => {
        if (!form.title) return showAlert('warning', '입력 오류', '팝업 제목을 입력해 주세요.')

        const content = editorRef.current?.getInstance().getHTML()
        setLoading(true)
        try {
            if (isEdit) {
                await api.put(`/admin/design/popups/${id}`, { ...form, content })
                showAlert('success', '수정 완료', '수정되었습니다.', () => navigate('/admin/design/popups'))
            } else {
                await api.post('/admin/design/popups', { ...form, content })
                showAlert('success', '등록 완료', '등록되었습니다.', () => navigate('/admin/design/popups'))
            }
        } catch (err) {
            const msg = err.response?.data?.message
            showAlert('error', '오류', typeof msg === 'object' ? Object.values(msg)[0] : msg || '저장 실패')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = () => {
        showConfirm('삭제', '정말 삭제하시겠습니까?', async () => {
            try {
                await api.delete(`/admin/design/popups/${id}`)
                showAlert('success', '삭제 완료', '삭제되었습니다.', () => navigate('/admin/design/popups'))
            } catch (err) {
                showAlert('error', '오류', '삭제 실패')
            }
        })
    }

    // 미리보기 팝업 스타일
    const getPreviewStyle = () => {
        const base = {
            width    : `${form.width}px`,
            minHeight: `${form.height}px`,
            position : 'absolute',
            zIndex   : 9999,
        }

        switch (form.pos_type) {
            case 'top'    : return { ...base, top: '20px', left: '50%', transform: 'translateX(-50%)' }
            case 'bottom' : return { ...base, bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
            case 'center' : return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
            case 'custom' : return { ...base, top: `${form.pos_top}px`, left: `${form.pos_left}px` }
            default       : return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        }
    }

    if (pageLoading) {
        return <div className="flex items-center justify-center p-20 text-gray-400">로딩 중...</div>
    }

    return (
        <div>
            <PageHeader
                title={isEdit ? '팝업 수정' : '팝업 등록'}
                breadcrumbs={[
                    { label: '디자인' },
                    { label: '팝업 관리', path: '/admin/design/popups' },
                    { label: isEdit ? '팝업 수정' : '팝업 등록' },
                ]}
                actions={
                    <>
                        <button onClick={() => navigate('/admin/design/popups')} className="border border-gray-300 text-sm px-4 py-1.5 rounded hover:bg-gray-50">목록</button>
                        <button onClick={() => setShowPreview(true)} className="bg-blue-500 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-600">미리보기</button>
                        {isEdit && <button onClick={handleDelete} className="bg-gray-500 text-white text-sm px-4 py-1.5 rounded hover:bg-gray-600">삭제</button>}
                        <button onClick={handleSubmit} disabled={loading} className="bg-red-500 text-white text-sm px-4 py-1.5 rounded hover:bg-red-600 disabled:opacity-50">
                            {loading ? '처리 중...' : '저장'}
                        </button>
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ===== 기본 설정 ===== */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">기본 설정</h2>

                    <FC.Row label="팝업 코드">
                        <input
                            type="text" name="popup_code" value={form.popup_code} onChange={handleChange}
                            placeholder="영문/숫자 (예: main_popup)"
                            readOnly={isEdit}
                            className={`${FC.inputClass} ${isEdit ? 'bg-gray-50 text-gray-500' : ''}`}
                        />
                    </FC.Row>

                    <FC.Row label="팝업 제목" required>
                        <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="팝업 제목" className={FC.inputClass} />
                    </FC.Row>

                    <FC.Row label="노출 여부">
                        <div className="flex items-center gap-4 pt-1.5">
                            {[['1', '노출'], ['0', '미노출']].map(([val, label]) => (
                                <label key={val} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="is_active" value={val} checked={form.is_active === val} onChange={handleChange} className="accent-orange-500" />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </FC.Row>

                    <FC.Row label="노출 방식">
                        <div className="flex flex-col gap-2">
                            {[
                                ['always',      '항상 팝업창이 열림'],
                                ['period',      '특정 기간 동안 팝업창이 열림'],
                                ['period_time', '특정 기간 + 특정 시간 동안 팝업창이 열림'],
                            ].map(([val, label]) => (
                                <label key={val} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="display_type" value={val} checked={form.display_type === val} onChange={handleChange} className="accent-orange-500" />
                                    {label}
                                </label>
                            ))}
                            {(form.display_type === 'period' || form.display_type === 'period_time') && (
                                <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-100 mt-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 w-12">시작일</span>
                                        <input
                                            type={form.display_type === 'period_time' ? 'datetime-local' : 'date'}
                                            name="start_at" value={form.start_at} onChange={handleChange}
                                            className={FC.inputClass}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 w-12">종료일</span>
                                        <input
                                            type={form.display_type === 'period_time' ? 'datetime-local' : 'date'}
                                            name="end_at" value={form.end_at} onChange={handleChange}
                                            className={FC.inputClass}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </FC.Row>

                    <FC.Row label="오늘 하루 보이지 않음">
                        <div className="flex items-center gap-4 pt-1.5">
                            {[['1', '사용'], ['0', '미사용']].map(([val, label]) => (
                                <label key={val} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="hide_today" value={val} checked={form.hide_today === val} onChange={handleChange} className="accent-orange-500" />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </FC.Row>
                </div>

                {/* ===== 창 설정 ===== */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">창 설정</h2>

                        <FC.Row label="창 종류">
                            <div className="flex flex-col gap-2">
                                {[
                                    ['fixed',  '고정 레이어 팝업', '스크롤해도 고정 위치에 표시'],
                                    ['move',   '이동 레이어 팝업', '드래그로 이동 가능'],
                                    ['window', '윈도우 팝업',      '새 브라우저 창으로 열림'],
                                ].map(([val, label, desc]) => (
                                    <label key={val} className="flex items-start gap-2 cursor-pointer">
                                        <input type="radio" name="popup_type" value={val} checked={form.popup_type === val} onChange={handleChange} className="accent-orange-500 mt-0.5" />
                                        <div>
                                            <span className="text-sm">{label}</span>
                                            <span className="text-xs text-gray-400 ml-2">{desc}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </FC.Row>

                        <FC.Row label="팝업 크기">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">가로</span>
                                <input type="number" name="width" value={form.width} onChange={handleChange} className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
                                <span className="text-xs text-gray-500">× 세로</span>
                                <input type="number" name="height" value={form.height} onChange={handleChange} className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
                                <span className="text-xs text-gray-400">px</span>
                            </div>
                        </FC.Row>

                        <FC.Row label="창 위치">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        ['top',    '상단'],
                                        ['center', '중앙'],
                                        ['bottom', '하단'],
                                        ['custom', '직접 입력'],
                                    ].map(([val, label]) => (
                                        <label key={val} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                            <input type="radio" name="pos_type" value={val} checked={form.pos_type === val} onChange={handleChange} className="accent-orange-500" />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                                {form.pos_type === 'custom' && (
                                    <div className="flex items-center gap-3 pl-2">
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-gray-500">상단</span>
                                            <input type="number" name="pos_top" value={form.pos_top} onChange={handleChange} className="w-16 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none" />
                                            <span className="text-xs text-gray-400">px</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-gray-500">좌측</span>
                                            <input type="number" name="pos_left" value={form.pos_left} onChange={handleChange} className="w-16 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none" />
                                            <span className="text-xs text-gray-400">px</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </FC.Row>

                        <FC.Row label="정렬순서">
                            <input type="number" name="order_no" value={form.order_no} onChange={handleChange} className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
                        </FC.Row>
                    </div>
                </div>
            </div>

            {/* ===== 내용 ===== */}
            <div className="bg-white rounded-lg shadow p-4 mt-4">
                <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-3">팝업 내용</h2>
                <Editor
                    ref={editorRef}
                    initialValue=" "
                    previewStyle="vertical"
                    height="400px"
                    initialEditType="wysiwyg"
                    useCommandShortcut={true}
                    language="ko-KR"
                    autofocus={false}
                    usageStatistics={false}
                />
            </div>

            {/* ===== 미리보기 모달 ===== */}
            {showPreview && (
                <div
                    className="fixed inset-0 bg-black/40 z-50"
                    onClick={() => setShowPreview(false)}
                >
                    <div style={getPreviewStyle()} onClick={(e) => e.stopPropagation()}>
                        <div className="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col" style={{ width: '100%', minHeight: `${form.height}px` }}>
                            {/* 팝업 헤더 */}
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
                                <span className="text-sm font-medium">{form.title}</span>
                                <button onClick={() => setShowPreview(false)} className="text-gray-300 hover:text-white text-lg leading-none">×</button>
                            </div>

                            {/* 팝업 내용 */}
                            <div
                                className="flex-1 p-4 overflow-auto text-sm"
                                dangerouslySetInnerHTML={{ __html: editorRef.current?.getInstance().getHTML() ?? form.content }}
                            />

                            {/* 오늘 하루 보이지 않음 */}
                            {form.hide_today === '1' && (
                                <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                        <input type="checkbox" className="accent-orange-500" />
                                        오늘 하루 보이지 않음
                                    </label>
                                    <button onClick={() => setShowPreview(false)} className="text-xs text-gray-500 hover:text-gray-700">닫기</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PopupForm