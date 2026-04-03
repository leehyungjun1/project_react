import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/api/axios'
import * as FC from '@/components/admin/FormComponents'
import PageHeader from '@/components/admin/PageHeader'
import { showAlert } from '@/utils/modal'

function BoardForm() {
    const navigate    = useNavigate()
    const { id }      = useParams()
    const isEdit      = !!id

    const [loading, setLoading]         = useState(false)
    const [pageLoading, setPageLoading] = useState(isEdit)

    const [form, setForm] = useState({
        board_code  : '',
        board_name  : '',
        skin_type   : 'normal',
        description : '',
        use_comment : '1',
        use_rating  : '0',
        use_file    : '0',
        use_secret  : '0',
        file_count  : '3',
        file_size   : '10',
        list_count  : '20',
        order_no    : '0',
        is_active   : '1',
        new_days   : '3',
        best_count : '100',
    })

    const [permissions, setPermissions] = useState([
        { target_type: 'guest', can_list: 1, can_read: 1, can_write: 0, can_comment: 0, can_file: 0 },
        { target_type: 'user',  can_list: 1, can_read: 1, can_write: 1, can_comment: 1, can_file: 1 },
        { target_type: 'admin', can_list: 1, can_read: 1, can_write: 1, can_comment: 1, can_file: 1 },
    ])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // 권한 변경
    const handlePermissionChange = (targetType, field, value) => {
        setPermissions(prev => prev.map(p =>
            p.target_type === targetType ? { ...p, [field]: value ? 1 : 0 } : p
        ))
    }

    const [headers, setHeaders] = useState([])

    // 상세 조회 (수정 시)
    useEffect(() => {
        if (!isEdit) return
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/admin/boards/${id}`)
                const data = res.data.data
                setForm({
                    board_code  : data.board_code,
                    board_name  : data.board_name,
                    skin_type   : data.skin_type,
                    description : data.description ?? '',
                    use_comment : data.use_comment,
                    use_rating  : data.use_rating,
                    use_file    : data.use_file,
                    use_secret  : data.use_secret,
                    file_count  : data.file_count,
                    file_size   : data.file_size,
                    list_count  : data.list_count,
                    order_no    : data.order_no,
                    is_active   : data.is_active,
                    new_days   : data.new_days   ?? '3',
                    best_count : data.best_count ?? '100',
                })

                if (data.headers?.length > 0) {
                    setHeaders(data.headers)
                }


                if (data.permissions?.length > 0) {
                    setPermissions(data.permissions)
                }
            } catch (err) {
                showAlert('error', '오류', '데이터를 불러오는데 실패했습니다.')
            } finally {
                setPageLoading(false)
            }
        }
        fetchDetail()
    }, [id])

    // 저장
    const handleSubmit = async () => {
        if (!form.board_code) return showAlert('warning', '입력 오류', '게시판 코드를 입력해 주세요.')
        if (!form.board_name) return showAlert('warning', '입력 오류', '게시판명을 입력해 주세요.')

        setLoading(true)
        try {
            if (isEdit) {
                await api.put(`/admin/boards/${id}`, { ...form, permissions, headers })
                showAlert('success', '수정 완료', '수정되었습니다.', () => navigate('/admin/boards'))
            } else {
                await api.post('/admin/boards', { ...form, permissions, headers })
                showAlert('success', '등록 완료', '게시판이 생성되었습니다.', () => navigate('/admin/boards'))
            }
        } catch (err) {
            const msg = err.response?.data?.message
            if (typeof msg === 'object') {
                showAlert('error', '오류', Object.values(msg)[0])
            } else {
                showAlert('error', '오류', msg || '저장 실패')
            }
        } finally {
            setLoading(false)
        }
    }

    if (pageLoading) {
        return <div className="flex items-center justify-center p-20 text-gray-400">로딩 중...</div>
    }

    const permLabels = { guest: '비회원', user: '회원', admin: '관리자' }
    const permFields = [
        { key: 'can_list',    label: '목록' },
        { key: 'can_read',    label: '읽기' },
        { key: 'can_write',   label: '쓰기' },
        { key: 'can_comment', label: '댓글' },
        { key: 'can_file',    label: '파일' },
    ]

    return (
        <div>
            <PageHeader
                title={isEdit ? '게시판 수정' : '게시판 등록'}
                breadcrumbs={[
                    { label: '게시판 관리', path: '/admin/boards' },
                    { label: isEdit ? '게시판 수정' : '게시판 등록' },
                ]}
                actions={
                    <>
                        <button
                            onClick={() => navigate('/admin/boards')}
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

                    <FC.Row label="게시판 코드" required>
                        <input
                            type="text"
                            name="board_code"
                            placeholder="영문/숫자 (예: notice)"
                            value={form.board_code}
                            onChange={handleChange}
                            readOnly={isEdit}
                            className={`${FC.inputClass} ${isEdit ? 'bg-gray-50 text-gray-500' : ''}`}
                        />
                        {!isEdit && <p className="text-xs text-gray-400 mt-1">영문/숫자만 입력 가능, 생성 후 변경 불가</p>}
                    </FC.Row>

                    <FC.Row label="게시판명" required>
                        <input type="text" name="board_name" placeholder="게시판명" value={form.board_name} onChange={handleChange} className={FC.inputClass} />
                    </FC.Row>

                    <FC.Row label="스킨">
                        <select name="skin_type" value={form.skin_type} onChange={handleChange} className={FC.selectClass + ' w-full'}>
                            <option value="normal">일반형</option>
                            <option value="gallery">갤러리형</option>
                            <option value="qna">1:1문의형</option>
                            <option value="event">이벤트형</option>
                        </select>
                    </FC.Row>

                    <FC.Row label="설명">
                        <textarea
                            name="description"
                            placeholder="게시판 설명"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
                        />
                    </FC.Row>

                    <FC.Row label="목록 수">
                        <input type="number" name="list_count" value={form.list_count} onChange={handleChange} className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
                        <span className="text-xs text-gray-400 ml-2">개</span>
                    </FC.Row>

                    <FC.Row label="정렬순서">
                        <input type="number" name="order_no" value={form.order_no} onChange={handleChange} className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
                    </FC.Row>

                    <FC.Row label="사용여부">
                        <div className="flex items-center gap-4 pt-1.5">
                            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name="is_active" value="1" checked={form.is_active === '1'} onChange={handleChange} className="accent-orange-500" />
                                사용
                            </label>
                            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name="is_active" value="0" checked={form.is_active === '0'} onChange={handleChange} className="accent-orange-500" />
                                미사용
                            </label>
                        </div>
                    </FC.Row>
                </div>

                {/* ===== 기능 설정 ===== */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">기능 설정</h2>

                        {[
                            { name: 'use_comment', label: '댓글 사용' },
                            { name: 'use_rating',  label: '별점 사용' },
                            { name: 'use_file',    label: '파일 첨부' },
                            { name: 'use_secret',  label: '비밀글 사용' },
                        ].map(({ name, label }) => (
                            <FC.Row key={name} label={label}>
                                <div className="flex items-center gap-4 pt-1.5">
                                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input type="radio" name={name} value="1" checked={form[name] === '1'} onChange={handleChange} className="accent-orange-500" />
                                        사용
                                    </label>
                                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input type="radio" name={name} value="0" checked={form[name] === '0'} onChange={handleChange} className="accent-orange-500" />
                                        미사용
                                    </label>
                                </div>
                            </FC.Row>
                        ))}

                        {form.use_file === '1' && (
                            <>
                                <FC.Row label="파일 개수">
                                    <input type="number" name="file_count" value={form.file_count} onChange={handleChange} className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
                                    <span className="text-xs text-gray-400 ml-2">개</span>
                                </FC.Row>
                                <FC.Row label="파일 크기">
                                    <input type="number" name="file_size" value={form.file_size} onChange={handleChange} className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
                                    <span className="text-xs text-gray-400 ml-2">MB</span>
                                </FC.Row>
                            </>
                        )}
                    </div>

                    {/* ===== 신규글 / 베스트 설정 ===== */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">신규글 / 베스트 설정</h2>

                        <FC.Row label="신규글 기간">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    name="new_days"
                                    value={form.new_days}
                                    onChange={handleChange}
                                    className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                                />
                                <span className="text-xs text-gray-400">일 이내 신규 표시</span>
                            </div>
                        </FC.Row>

                        <FC.Row label="베스트 기준">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    name="best_count"
                                    value={form.best_count}
                                    onChange={handleChange}
                                    className="w-20 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                                />
                                <span className="text-xs text-gray-400">회 이상 조회 시 베스트 표시</span>
                            </div>
                        </FC.Row>
                    </div>

                    {/* 머리말 */}
                    {/* ===== 머리말 설정 ===== */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">
                            머리말 설정
                            <button
                                type="button"
                                onClick={() => setHeaders(prev => [...prev, { name: '', color: '#6366f1' }])}
                                className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded hover:bg-blue-600 font-normal"
                            >
                                + 추가
                            </button>
                        </h2>

                        {headers.length === 0 ? (
                            <p className="text-xs text-gray-400 py-2">머리말이 없습니다.</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {headers.map((header, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={header.color ?? '#6366f1'}
                                            onChange={(e) => {
                                                const updated = [...headers]
                                                updated[index].color = e.target.value
                                                setHeaders(updated)
                                            }}
                                            className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                                        />
                                        <input
                                            type="text"
                                            value={header.name}
                                            placeholder="머리말 이름 (예: 공지, 자격증)"
                                            onChange={(e) => {
                                                const updated = [...headers]
                                                updated[index].name = e.target.value
                                                setHeaders(updated)
                                            }}
                                            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setHeaders(prev => prev.filter((_, i) => i !== index))}
                                            className="text-red-400 hover:text-red-600 text-xs"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* ===== 권한 설정 ===== */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-3">권한 설정</h2>

                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-2 text-xs text-gray-500 font-medium">대상</th>
                                {permFields.map(f => (
                                    <th key={f.key} className="text-center py-2 text-xs text-gray-500 font-medium">{f.label}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {permissions.map(perm => (
                                <tr key={perm.target_type} className="border-b border-gray-50">
                                    <td className="py-2.5 text-sm font-medium text-gray-700">
                                        {permLabels[perm.target_type]}
                                    </td>
                                    {permFields.map(f => (
                                        <td key={f.key} className="py-2.5 text-center">
                                            <input
                                                type="checkbox"
                                                checked={perm[f.key] === 1 || perm[f.key] === '1'}
                                                onChange={(e) => handlePermissionChange(perm.target_type, f.key, e.target.checked)}
                                                className="accent-orange-500 w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BoardForm