import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/api/axios'
import * as FC from '@/components/admin/FormComponents'
import PageHeader from '@/components/admin/PageHeader'
import ImageUpload from '@/components/ImageUpload'
import { showAlert, showConfirm } from '@/utils/modal'
import { FaImage, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa6'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'


function BannerForm() {
    const navigate    = useNavigate()
    const { id }      = useParams()
    const isEdit      = !!id

    const [loading, setLoading]         = useState(false)
    const [pageLoading, setPageLoading] = useState(isEdit)
    const [items, setItems]             = useState([])
    const [preview, setPreview]         = useState(0)  // 미리보기 인덱스

    const [form, setForm] = useState({
        banner_code        : '',
        title              : '',
        device_type        : 'both',
        effect             : 'slide',
        speed              : 'normal',
        interval           : '3',
        show_arrow         : '1',
        arrow_color        : '#ffffff',
        arrow_size         : '40',
        show_nav           : '1',
        nav_type           : 'dot',
        nav_active_color   : '#ffffff',
        nav_inactive_color : '#ffffff',
        nav_size           : 'sm',
        banner_width       : '600',
        banner_height      : '384',
        width_unit         : 'px',
        display_type       : 'always',
        start_at           : '',
        end_at             : '',
        is_active          : '1',
    })

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const activeItems = items.filter(
        item => {
            if(item.is_active !== '1') return false

            if(item.display_type === 'always') return true

            if(item.display_type === 'period') {
                const now = new Date()
                const start = item.start_at ? new Date(item.start_at) : null
                const end = item.end_at ? new Date(item.end_at) : null

                if(start && now < start) return false
                if(end && now > end) return false

                return true
            }
            return false
        })

    // 상세 조회
    useEffect(() => {
        if (!isEdit) return
        const fetchDetail = async () => {
            try {
                const res    = await api.get(`/admin/design/banners/${id}`)
                const data   = res.data.data
                setForm({
                    banner_code        : data.banner_code ?? '',
                    title              : data.title,
                    device_type        : data.device_type,
                    effect             : data.effect,
                    speed              : data.speed,
                    interval           : data.interval,
                    show_arrow         : data.show_arrow,
                    arrow_color        : data.arrow_color,
                    show_nav           : data.show_nav,
                    nav_type           : data.nav_type,
                    nav_active_color   : data.nav_active_color,
                    nav_inactive_color : data.nav_inactive_color,
                    nav_size           : data.nav_size,
                    banner_width       : data.banner_width,
                    banner_height      : data.banner_height,
                    width_unit         : data.width_unit,
                    display_type       : data.display_type,
                    start_at           : data.start_at ?? '',
                    end_at             : data.end_at   ?? '',
                    is_active          : data.is_active,
                })
                setItems(data.items ?? [])
            } catch (err) {
                showAlert('error', '오류', '데이터를 불러오는데 실패했습니다.')
            } finally {
                setPageLoading(false)
            }
        }
        fetchDetail()
    }, [id])

    useEffect(() => {
        if (items.length <= 1) return

        const timer = setInterval(() => {
            setPreview(prev => prev < items.length - 1 ? prev + 1 : 0)
        }, parseInt(form.interval) * 1000)

        return () => clearInterval(timer)
    }, [items.length, form.interval])

    // 배너 아이템 추가
    const addItem = () => {
        setItems(prev => [...prev, {
            image_path   : '',
            link_url     : '',
            link_target  : '_self',
            description  : '',
            display_type : 'always',
            start_at     : '',
            end_at       : '',
            is_active    : '1',
        }])
    }

    // 배너 아이템 변경
    const handleItemChange = (index, field, value) => {
        setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
    }

    // 배너 아이템 삭제
    const handleItemDelete = (index) => {
        showConfirm('삭제', '배너 이미지를 삭제하시겠습니까?', () => {
            setItems(prev => prev.filter((_, i) => i !== index))
            if (preview >= index && preview > 0) setPreview(preview - 1)
        })
    }

    // 순서 변경
    const handleItemMove = (index, direction) => {
        const newItems = [...items]
        const target   = index + direction
        if (target < 0 || target >= newItems.length) return
            ;[newItems[index], newItems[target]] = [newItems[target], newItems[index]]
        setItems(newItems)
        setPreview(target)
    }

    // 저장
    const handleSubmit = async () => {
        if (!form.title) return showAlert('warning', '입력 오류', '배너 제목을 입력해 주세요.')

        setLoading(true)
        try {
            if (isEdit) {
                await api.put(`/admin/design/banners/${id}`, { ...form, items })
                showAlert('success', '수정 완료', '수정되었습니다.', () => navigate('/admin/design/banners'))
            } else {
                await api.post('/admin/design/banners', { ...form, items })
                showAlert('success', '등록 완료', '등록되었습니다.', () => navigate('/admin/design/banners'))
            }
        } catch (err) {
            const msg = err.response?.data?.message
            showAlert('error', '오류', typeof msg === 'object' ? Object.values(msg)[0] : msg || '저장 실패')
        } finally {
            setLoading(false)
        }
    }

    if (pageLoading) {
        return <div className="flex items-center justify-center p-20 text-gray-400">로딩 중...</div>
    }

    return (
        <div>
            <PageHeader
                title={isEdit ? '배너 수정' : '배너 등록'}
                breadcrumbs={[
                    { label: '디자인' },
                    { label: '슬라이드 배너', path: '/admin/design/banners' },
                    { label: isEdit ? '배너 수정' : '배너 등록' },
                ]}
                actions={
                    <>
                        <button
                            onClick={() => navigate('/admin/design/banners')}
                            className="border border-gray-300 text-sm px-4 py-1.5 rounded hover:bg-gray-50"
                        >
                            목록
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-red-500 text-white text-sm px-4 py-1.5 rounded hover:bg-red-600 disabled:opacity-50"
                        >
                            {loading ? '처리 중...' : '저장'}
                        </button>
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ===== 기본 설정 ===== */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">기본 설정</h2>

                    <FC.Row label="배너 코드" required>
                        <input
                            type="text"
                            name="banner_code"
                            value={form.banner_code}
                            onChange={handleChange}
                            placeholder="영문/숫자 (예: main_banner)"
                            readOnly={isEdit}
                            className={`${FC.inputClass} ${isEdit ? 'bg-gray-50 text-gray-500' : ''}`}
                        />
                        {!isEdit && <p className="text-xs text-gray-400 mt-1">영문/숫자/언더바만 입력 가능, 생성 후 변경 불가</p>}
                    </FC.Row>

                    <FC.Row label="배너 제목" required>
                        <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="배너 제목" className={FC.inputClass} />
                    </FC.Row>

                    <FC.Row label="구분">
                        <div className="flex items-center gap-4 pt-1.5">
                            {[['both', '전체'], ['pc', 'PC쇼핑몰'], ['mobile', '모바일쇼핑몰']].map(([val, label]) => (
                                <label key={val} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="device_type" value={val} checked={form.device_type === val} onChange={handleChange} className="accent-orange-500" />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </FC.Row>

                    <FC.Row label="노출 여부">
                        <div className="flex items-center gap-4 pt-1.5">
                            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name="is_active" value="1" checked={form.is_active === '1'} onChange={handleChange} className="accent-orange-500" />
                                노출
                            </label>
                            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name="is_active" value="0" checked={form.is_active === '0'} onChange={handleChange} className="accent-orange-500" />
                                미노출
                            </label>
                        </div>
                    </FC.Row>

                    <FC.Row label="노출 기간">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="display_type" value="always" checked={form.display_type === 'always'} onChange={handleChange} className="accent-orange-500" />
                                    상시 노출
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="display_type" value="period" checked={form.display_type === 'period'} onChange={handleChange} className="accent-orange-500" />
                                    기간 노출
                                </label>
                            </div>
                            {form.display_type === 'period' && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-500">시작일</span>
                                        <input type="datetime-local" name="start_at" value={form.start_at} onChange={handleChange} className={FC.inputClass} />
                                    </div>
                                    <span className="text-gray-400">~</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-500">종료일</span>
                                        <input type="datetime-local" name="end_at" value={form.end_at} onChange={handleChange} className={FC.inputClass} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </FC.Row>
                </div>

                {/* ===== 슬라이드 설정 ===== */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">슬라이드 설정</h2>

                        <FC.Row label="전환 속도">
                            <select name="speed" value={form.speed} onChange={handleChange} className={FC.selectClass + ' w-full'}>
                                <option value="slow">느리게</option>
                                <option value="normal">보통</option>
                                <option value="fast">빠르게</option>
                            </select>
                        </FC.Row>

                        <FC.Row label="전환 시간">
                            <div className="flex items-center gap-2">
                                <select name="interval" value={form.interval} onChange={handleChange} className={FC.selectClass}>
                                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                        <option key={n} value={n}>{n}초</option>
                                    ))}
                                </select>
                                <span className="text-xs text-gray-400">"수동" 선택 시 클릭할 때만 전환됩니다.</span>
                            </div>
                        </FC.Row>

                        <FC.Row label="효과 선택">
                            <div className="flex items-center gap-4 pt-1.5">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="effect" value="slide" checked={form.effect === 'slide'} onChange={handleChange} className="accent-orange-500" />
                                    슬라이드
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="effect" value="fade" checked={form.effect === 'fade'} onChange={handleChange} className="accent-orange-500" />
                                    페이드
                                </label>
                            </div>
                        </FC.Row>

                        <FC.Row label="좌우 전환 버튼">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-4 pt-1.5">
                                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input type="radio" name="show_arrow" value="1" checked={form.show_arrow === '1'} onChange={handleChange} className="accent-orange-500" />
                                        노출
                                    </label>
                                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input type="radio" name="show_arrow" value="0" checked={form.show_arrow === '0'} onChange={handleChange} className="accent-orange-500" />
                                        미노출
                                    </label>
                                </div>
                                {form.show_arrow === '1' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">색상</span>
                                        <input type="color" name="arrow_color" value={form.arrow_color} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                                        <span className="text-xs text-gray-400">{form.arrow_color}</span>
                                        <span className="text-xs text-gray-500 ml-2">크기</span>  {/* ✅ 추가 */}
                                        <input
                                            type="number"
                                            name="arrow_size"
                                            value={form.arrow_size ?? '40'}
                                            onChange={handleChange}
                                            className="w-16 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                                        />
                                        <span className="text-xs text-gray-400">px</span>
                                    </div>
                                )}
                            </div>
                        </FC.Row>

                        <FC.Row label="네비게이션 설정">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input type="radio" name="show_nav" value="1" checked={form.show_nav === '1'} onChange={handleChange} className="accent-orange-500" />
                                        노출
                                    </label>
                                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input type="radio" name="show_nav" value="0" checked={form.show_nav === '0'} onChange={handleChange} className="accent-orange-500" />
                                        미노출
                                    </label>
                                </div>
                                {form.show_nav === '1' && (
                                    <div className="flex flex-col gap-2 pl-2 border-l-2 border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 w-16">활성 색상</span>
                                            <input type="color" name="nav_active_color" value={form.nav_active_color} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                                            <span className="text-xs text-gray-500 w-16 ml-2">비활성 색상</span>
                                            <input type="color" name="nav_inactive_color" value={form.nav_inactive_color} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer border border-gray-300" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 w-16">크기</span>
                                            <div className="flex items-center gap-3">
                                                {[['sm', '소'], ['md', '중'], ['lg', '대']].map(([val, label]) => (
                                                    <label key={val} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                                        <input type="radio" name="nav_size" value={val} checked={form.nav_size === val} onChange={handleChange} className="accent-orange-500" />
                                                        {label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </FC.Row>
                    </div>

                    {/* ===== 배너 사이즈 ===== */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">배너 사이즈</h2>
                        <FC.Row label="배너 크기">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">가로크기</span>
                                <input type="number" name="banner_width" value={form.banner_width} onChange={handleChange} className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
                                <select name="width_unit" value={form.width_unit} onChange={handleChange} className={FC.selectClass}>
                                    <option value="px">pixel</option>
                                    <option value="%">%</option>
                                </select>
                                <span className="text-xs text-gray-500">X 세로크기</span>
                                <input type="number" name="banner_height" value={form.banner_height} onChange={handleChange} className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
                                <span className="text-xs text-gray-500">pixel</span>
                            </div>
                        </FC.Row>
                    </div>
                </div>
            </div>

            {/* ===== 배너 미리보기 ===== */}
            <div className="bg-white rounded-lg shadow p-4 mt-4">
                <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-4">
                    배너 미리보기
                </h2>

                <div
                    className="relative mx-auto overflow-hidden bg-gray-100 rounded"
                    style={{
                        width   : form.width_unit === '%' ? `${form.banner_width}%` : `${form.banner_width}px`,
                        height  : `${form.banner_height}px`,
                        maxWidth: '100%',
                    }}
                >
                    {activeItems.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <div className="text-center">
                                <FaImage size={48} className="mx-auto mb-2" />
                                <p className="text-sm">노출 가능한 배너 없음</p>
                            </div>
                        </div>

                    ) : form.effect === 'fade' ? (

                        // ✅ 페이드
                        <div className="relative w-full h-full">
                            {activeItems.map((item, i) => (
                                <div
                                    key={i}
                                    className="absolute inset-0 transition-opacity duration-700"
                                    style={{ opacity: i === preview ? 1 : 0 }}
                                >
                                    {item.image_path ? (
                                        <img src={`http://localhost:8080/${item.image_path}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-200">
                                            <FaImage size={48} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                    ) : (

                        // ✅ 슬라이드
                        <div
                            className="flex h-full"
                            style={{
                                width     : `${(activeItems.length + 1) * 100}%`,
                                transform : `translateX(-${preview * (100 / (activeItems.length + 1))}%)`,
                                transition: preview === 0 && activeItems.length > 1 ? 'none' : 'transform 500ms ease',
                            }}
                        >
                            {activeItems.map((item, i) => (
                                <div
                                    key={i}
                                    className="h-full"
                                    style={{ width: `${100 / (activeItems.length + 1)}%` }}
                                >
                                    {item.image_path ? (
                                        <img src={`http://localhost:8080/${item.image_path}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-200">
                                            <FaImage size={48} />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* 무한루프용 복사 */}
                            <div
                                className="h-full"
                                style={{ width: `${100 / (activeItems.length + 1)}%` }}
                            >
                                {activeItems[0]?.image_path ? (
                                    <img src={`http://localhost:8080/${activeItems[0].image_path}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-200">
                                        <FaImage size={48} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ✅ 화살표 */}
                    {form.show_arrow === '1' && activeItems.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={() => setPreview(prev => prev > 0 ? prev - 1 : activeItems.length - 1)}
                                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
                                style={{
                                    width  : `${form.arrow_size ?? 40}px`,
                                    height : `${form.arrow_size ?? 40}px`,
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    color  : form.arrow_color,
                                }}
                            >
                                <FaChevronLeft size={parseInt(form.arrow_size ?? 40) * 0.8} />
                            </button>

                            <button
                                type="button"
                                onClick={() => setPreview(prev => prev < activeItems.length - 1 ? prev + 1 : 0)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
                                style={{
                                    width  : `${form.arrow_size ?? 40}px`,
                                    height : `${form.arrow_size ?? 40}px`,
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    color  : form.arrow_color,
                                }}
                            >
                                <FaChevronRight size={parseInt(form.arrow_size ?? 40) * 0.8} />
                            </button>
                        </>
                    )}

                    {/* ✅ 네비 */}
                    {form.show_nav === '1' && activeItems.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {activeItems.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPreview(i)}
                                    className="rounded-full"
                                    style={{
                                        width  : form.nav_size === 'sm' ? 8 : form.nav_size === 'md' ? 10 : 12,
                                        height : form.nav_size === 'sm' ? 8 : form.nav_size === 'md' ? 10 : 12,
                                        backgroundColor : i === preview ? form.nav_active_color : form.nav_inactive_color,
                                        opacity: i === preview ? 1 : 0.5,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== 배너 이미지 설정 ===== */}
            <div className="bg-white rounded-lg shadow p-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded">배너이미지 설정</h2>
                    <button
                        type="button"
                        onClick={addItem}
                        className="bg-blue-500 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-600"
                    >
                        + 배너 추가
                    </button>
                </div>

                {/* 헤더 */}
                <div className="grid grid-cols-12 gap-2 px-2 py-2 bg-gray-50 rounded text-xs font-medium text-gray-500 mb-2">
                    <div className="col-span-1 text-center">순서</div>
                    <div className="col-span-3">이미지</div>
                    <div className="col-span-5">배너등록/링크/이미지설명</div>
                    <div className="col-span-1">노출여부</div>
                    <div className="col-span-2">노출기간</div>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">배너 이미지를 추가해 주세요.</div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 p-3 border border-gray-100 rounded items-start">

                                {/* 순서 */}
                                <div className="col-span-1 flex flex-col items-center gap-1 pt-2">
                                    <span className="text-sm text-gray-500">{index + 1}</span>
                                    <button type="button" onClick={() => handleItemMove(index, -1)} disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                                        <FaArrowUp size={11} />
                                    </button>
                                    <button type="button" onClick={() => handleItemMove(index, 1)} disabled={index === items.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                                        <FaArrowDown size={11} />
                                    </button>
                                    <button type="button" onClick={() => handleItemDelete(index)} className="text-red-400 hover:text-red-600 mt-1">
                                        <FaTrash size={11} />
                                    </button>
                                </div>

                                {/* ✅ ImageUpload 컴포넌트로 교체 */}
                                <div className="col-span-3">
                                    <ImageUpload
                                        value={item.image_path}
                                        onChange={(path) => {
                                            handleItemChange(index, 'image_path', path)
                                            setPreview(index)
                                        }}
                                        folder="banners"
                                        width="w-full"
                                        height="h-28"
                                        hint=""
                                    />
                                </div>

                                {/* 링크/설명 */}
                                <div className="col-span-5 flex flex-col gap-2">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-500 w-20 shrink-0">링크 주소</span>
                                        <input
                                            type="text"
                                            value={item.link_url ?? ''}
                                            onChange={(e) => handleItemChange(index, 'link_url', e.target.value)}
                                            placeholder="https://"
                                            className="flex-[0.9] border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                                        />
                                        <select
                                            value={item.link_target}
                                            onChange={(e) => handleItemChange(index, 'link_target', e.target.value)}
                                            className="border border-gray-300 rounded px-1 py-1 text-xs focus:outline-none"
                                        >
                                            <option value="_self">현재창</option>
                                            <option value="_blank">새창</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-500 w-20 shrink-0">이미지 설명</span>
                                        <input
                                            type="text"
                                            value={item.description ?? ''}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            placeholder="이미지 설명 (최대 50자)"
                                            maxLength={50}
                                            className="flex-[0.9] border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                                        />
                                        <span className="text-xs text-gray-400">{(item.description ?? '').length}/50</span>
                                    </div>
                                </div>

                                {/* 노출여부 */}
                                <div className="col-span-1 flex flex-col gap-1 pt-1">
                                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                        <input type="radio" checked={item.is_active === '1'} onChange={() => handleItemChange(index, 'is_active', '1')} className="accent-orange-500" />
                                        노출함
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                        <input type="radio" checked={item.is_active === '0'} onChange={() => handleItemChange(index, 'is_active', '0')} className="accent-orange-500" />
                                        노출안함
                                    </label>
                                </div>

                                {/* 노출기간 */}
                                <div className="col-span-2 flex flex-col gap-1 pt-1">
                                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                        <input type="radio" checked={item.display_type === 'always'} onChange={() => handleItemChange(index, 'display_type', 'always')} className="accent-orange-500" />
                                        상시노출
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                        <input type="radio" checked={item.display_type === 'period'} onChange={() => handleItemChange(index, 'display_type', 'period')} className="accent-orange-500" />
                                        기간노출
                                    </label>
                                    {item.display_type === 'period' && (
                                        <div className="flex flex-col gap-1 mt-1">
                                            <input
                                                type="datetime-local"
                                                value={item.start_at ?? ''}
                                                onChange={(e) => handleItemChange(index, 'start_at', e.target.value)}
                                                className="border border-gray-300 rounded px-1 py-0.5 text-xs focus:outline-none"
                                            />
                                            <input
                                                type="datetime-local"
                                                value={item.end_at ?? ''}
                                                onChange={(e) => handleItemChange(index, 'end_at', e.target.value)}
                                                className="border border-gray-300 rounded px-1 py-0.5 text-xs focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BannerForm