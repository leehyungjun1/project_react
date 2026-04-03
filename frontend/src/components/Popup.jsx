import { useState, useEffect } from 'react'
import api from '@/api/axios'

// 오늘 하루 숨김 체크
const isHiddenToday = (popupId) => {
    const key   = `popup_hide_${popupId}`
    const value = localStorage.getItem(key)
    if (!value) return false
    return new Date(value) > new Date()
}

const hideToday = (popupId) => {
    const key      = `popup_hide_${popupId}`
    const tomorrow = new Date()
    tomorrow.setHours(23, 59, 59, 999)
    localStorage.setItem(key, tomorrow.toISOString())
}

// 개별 팝업
function PopupItem({ popup, onClose }) {
    const [hideChecked, setHideChecked] = useState(false)
    const [pos, setPos]                 = useState({ top: 0, left: 0 })
    const [dragging, setDragging]       = useState(false)
    const [dragStart, setDragStart]     = useState({ x: 0, y: 0 })

    // 초기 위치
    useEffect(() => {
        switch (popup.pos_type) {
            case 'top':
                setPos({ top: 20, left: window.innerWidth / 2 - parseInt(popup.width) / 2 })
                break
            case 'bottom':
                setPos({ top: window.innerHeight - parseInt(popup.height) - 20, left: window.innerWidth / 2 - parseInt(popup.width) / 2 })
                break
            case 'custom':
                setPos({ top: parseInt(popup.pos_top), left: parseInt(popup.pos_left) })
                break
            default: // center
                setPos({ top: window.innerHeight / 2 - parseInt(popup.height) / 2, left: window.innerWidth / 2 - parseInt(popup.width) / 2 })
        }
    }, [])

    // 드래그 (이동 레이어)
    const handleMouseDown = (e) => {
        if (popup.popup_type !== 'move') return
        setDragging(true)
        setDragStart({ x: e.clientX - pos.left, y: e.clientY - pos.top })
    }

    useEffect(() => {
        if (!dragging) return
        const onMove = (e) => setPos({ top: e.clientY - dragStart.y, left: e.clientX - dragStart.x })
        const onUp   = () => setDragging(false)
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
    }, [dragging, dragStart])

    const handleClose = () => {
        if (hideChecked) hideToday(popup.id)
        onClose(popup.id)
    }

    const style = {
        position : popup.popup_type === 'fixed' ? 'fixed' : 'fixed',
        top      : `${pos.top}px`,
        left     : `${pos.left}px`,
        width    : `${popup.width}px`,
        minHeight: `${popup.height}px`,
        zIndex   : 9999,
    }

    return (
        <div style={style} className="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
            {/* 헤더 */}
            <div
                className={`flex items-center justify-between px-4 py-2 bg-gray-800 text-white ${popup.popup_type === 'move' ? 'cursor-move' : ''}`}
                onMouseDown={handleMouseDown}
            >
                <span className="text-sm font-medium select-none">{popup.title}</span>
                <button onClick={handleClose} className="text-gray-300 hover:text-white text-xl leading-none">×</button>
            </div>

            {/* 내용 */}
            <div
                className="flex-1 p-4 overflow-auto text-sm"
                dangerouslySetInnerHTML={{ __html: popup.content }}
            />

            {/* 오늘 하루 보이지 않음 */}
            {popup.hide_today === '1' && (
                <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={hideChecked}
                            onChange={(e) => setHideChecked(e.target.checked)}
                            className="accent-orange-500"
                        />
                        오늘 하루 보이지 않음
                    </label>
                    <button onClick={handleClose} className="text-xs text-gray-500 hover:text-gray-700">닫기</button>
                </div>
            )}
        </div>
    )
}

// 팝업 컨테이너
function Popup({ codes }) {
    const [popups, setPopups] = useState([])
    const [closed, setClosed] = useState([])

    useEffect(() => {
        const fetchPopups = async () => {
            try {
                let list = []
                if (codes?.length > 0) {
                    // 특정 코드만
                    const results = await Promise.all(
                        codes.map(code => api.get(`/popups/${code}`).then(r => r.data.data).catch(() => null))
                    )
                    list = results.filter(Boolean)
                } else {
                    // 전체 활성 팝업
                    const res = await api.get('/popups')
                    list = res.data.data
                }

                // 오늘 하루 숨김 필터
                list = list.filter(p => !isHiddenToday(p.id))
                setPopups(list)
            } catch (err) {
                console.error('팝업 로딩 실패', err)
            }
        }
        fetchPopups()
    }, [])

    const handleClose = (id) => {
        setClosed(prev => [...prev, id])
    }

    const visiblePopups = popups.filter(p => !closed.includes(p.id))

    if (visiblePopups.length === 0) return null

    return (
        <>
            {visiblePopups.map(popup => (
                <PopupItem key={popup.id} popup={popup} onClose={handleClose} />
            ))}
        </>
    )
}

export default Popup