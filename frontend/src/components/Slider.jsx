import { useState, useEffect, useRef } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:8080'

function Slider({ banner }) {
    const [current, setCurrent]   = useState(0)
    const [animate, setAnimate]   = useState(true)
    const timerRef                = useRef(null)

    const items    = banner?.items?.filter(item => {
        if (item.is_active !== '1') return false
        if (item.display_type === 'period') {
            const now   = new Date()
            const start = new Date(item.start_at)
            const end   = new Date(item.end_at)
            return now >= start && now <= end
        }
        return true
    }) ?? []

    const total = items.length

    // 자동 슬라이드
    const startTimer = () => {
        if (total <= 1) return
        timerRef.current = setInterval(() => {
            setCurrent(prev => prev + 1)
        }, parseInt(banner?.interval ?? 3) * 1000)
    }

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current)
    }

    useEffect(() => {
        startTimer()
        return () => stopTimer()
    }, [total, banner?.interval])

    // 무한 루프 처리
    useEffect(() => {
        if (current === total) {
            const t = setTimeout(() => {
                setAnimate(false)
                setCurrent(0)
            }, parseInt(getSpeed()) )
            return () => clearTimeout(t)
        }
        if (!animate) {
            const t = setTimeout(() => setAnimate(true), 50)
            return () => clearTimeout(t)
        }
    }, [current])

    const getSpeed = () => {
        const map = { slow: 700, normal: 500, fast: 300 }
        return map[banner?.speed ?? 'normal']
    }

    const goPrev = () => {
        stopTimer()
        setCurrent(prev => prev > 0 ? prev - 1 : total - 1)
        startTimer()
    }

    const goNext = () => {
        stopTimer()
        setCurrent(prev => prev + 1)
        startTimer()
    }

    const goTo = (index) => {
        stopTimer()
        setCurrent(index)
        startTimer()
    }

    if (!banner || total === 0) return null

    const arrowSize  = parseInt(banner.arrow_size ?? 40)
    const navSizeMap = { sm: 8, md: 10, lg: 12 }
    const navSize    = navSizeMap[banner.nav_size ?? 'sm']

    const containerStyle = {
        width   : banner.width_unit === '%' ? `${banner.banner_width}%` : `${banner.banner_width}px`,
        height  : `${banner.banner_height}px`,
        maxWidth: '100%',
    }

    return (
        <div
            className="relative overflow-hidden bg-gray-100 rounded"
            style={containerStyle}
            onMouseEnter={stopTimer}
            onMouseLeave={startTimer}
        >
            {/* ===== 페이드 효과 ===== */}
            {banner.effect === 'fade' ? (
                <div className="relative w-full h-full">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className="absolute inset-0"
                            style={{
                                opacity    : i === (current % total) ? 1 : 0,
                                transition : `opacity ${getSpeed()}ms ease`,
                            }}
                        >
                            <SliderItem item={item} />
                        </div>
                    ))}
                </div>
            ) : (
                /* ===== 슬라이드 효과 ===== */
                <div
                    className="flex h-full"
                    style={{
                        width     : `${(total + 1) * 100}%`,
                        transform : `translateX(-${current * (100 / (total + 1))}%)`,
                        transition: animate ? `transform ${getSpeed()}ms ease` : 'none',
                    }}
                >
                    {items.map((item, i) => (
                        <div key={i} style={{ width: `${100 / (total + 1)}%`, height: '100%' }}>
                            <SliderItem item={item} />
                        </div>
                    ))}
                    {/* 복사본 */}
                    <div style={{ width: `${100 / (total + 1)}%`, height: '100%' }}>
                        <SliderItem item={items[0]} />
                    </div>
                </div>
            )}

            {/* ===== 좌우 버튼 ===== */}
            {banner.show_arrow === '1' && total > 1 && (
                <>
                    <button
                        onClick={goPrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center z-10"
                        style={{
                            width           : `${arrowSize}px`,
                            height          : `${arrowSize}px`,
                            backgroundColor : 'rgba(0,0,0,0.3)',
                            color           : banner.arrow_color ?? '#ffffff',
                        }}
                    >
                        <FaChevronLeft size={arrowSize * 0.4} />
                    </button>
                    <button
                        onClick={goNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center z-10"
                        style={{
                            width           : `${arrowSize}px`,
                            height          : `${arrowSize}px`,
                            backgroundColor : 'rgba(0,0,0,0.3)',
                            color           : banner.arrow_color ?? '#ffffff',
                        }}
                    >
                        <FaChevronRight size={arrowSize * 0.4} />
                    </button>
                </>
            )}

            {/* ===== 네비게이션 ===== */}
            {banner.show_nav === '1' && total > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className="rounded-full transition-all"
                            style={{
                                width           : navSize,
                                height          : navSize,
                                backgroundColor : i === (current % total)
                                    ? banner.nav_active_color   ?? '#ffffff'
                                    : banner.nav_inactive_color ?? '#ffffff',
                                opacity         : i === (current % total) ? 1 : 0.5,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// 슬라이드 아이템
function SliderItem({ item }) {
    if (!item) return null

    const content = (
        <div className="w-full h-full">
            {item.image_path ? (
                <img
                    src={`${BASE_URL}/${item.image_path}`}
                    alt={item.description ?? ''}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-gray-200" />
            )}
        </div>
    )

    if (item.link_url) {
        return (
            <a href={item.link_url} target={item.link_target ?? '_self'} className="block w-full h-full">
                {content}
            </a>
        )
    }

    return content
}

export default Slider