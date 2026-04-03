import { useState, useEffect, useRef } from 'react'
import { FaImage, FaTrash } from 'react-icons/fa6'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import * as FC from '@/components/admin/FormComponents'
import { showAlert } from '@/utils/modal'
import { useForm } from '@/hooks/useForm'
import ImageUpload from '@/components/ImageUpload'

function SiteSetting() {
    const [loading, setLoading]         = useState(false)
    const [pageLoading, setPageLoading] = useState(true)

    const logoInputRef    = useRef(null)
    const faviconInputRef = useRef(null)
    const [uploading, setUploading] = useState({ logo: false, favicon: false })

    const {
        form,
        setForm,
        handleChange,
        handlePhoneChange,
        handleAddressSearch,
    } = useForm({
        // 홈페이지 기본 정보
        site_name    : '',
        site_name_en : '',
        site_title   : '',
        site_favicon : '',
        // 회사 정보
        company_name          : '',
        company_reg_no        : '',
        company_ceo           : '',
        company_business_type : '',
        company_business_item : '',
        email_id              : '',
        email_domain          : '',
        company_postcode      : '',
        company_address1      : '',
        company_address2      : '',
        company_tel           : '',
        company_fax           : '',
        // 고객센터
        cs_tel1  : '',
        cs_tel2  : '',
        cs_fax   : '',
        cs_email_id          : '',
        cs_email_domain      : '',
        cs_hours : '',
    })

    // 설정 조회
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res  = await api.get('/admin/settings/site')
                const data = res.data.data
                const companyEmailParts = data.company_email?.split('@') || ['', '']
                const csEmailParts      = data.cs_email?.split('@')      || ['', '']

                setForm(prev => ({
                    ...prev,
                    ...data,
                    company_email_id     : companyEmailParts[0],
                    company_email_domain : companyEmailParts[1] ?? '',
                    cs_email_id          : csEmailParts[0],
                    cs_email_domain      : csEmailParts[1] ?? '',
                }))
            } catch (err) {
                showAlert('error', '오류', '데이터를 불러오는데 실패했습니다.')
            } finally {
                setPageLoading(false)
            }
        }
        fetchData()
    }, [])


    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(prev => ({ ...prev, [type]: true }))
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', type)

            const res = await api.post('/admin/settings/site/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setForm(prev => ({ ...prev, [type]: res.data.data.path }))
            showAlert('success', '업로드 완료', '파일이 업로드되었습니다.')
        } catch (err) {
            showAlert('error', '오류', '파일 업로드 실패')
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }))
            e.target.value = ''
        }
    }

    // 저장
    const handleSubmit = async () => {
        setLoading(true)
        try {
            await api.post('/admin/settings/site', {
                ...form,
                company_email : `${form.company_email_id}@${form.company_email_domain}`,
                cs_email      : `${form.cs_email_id}@${form.cs_email_domain}`,
            })
            showAlert('success', '저장 완료', '저장되었습니다.')
        } catch (err) {
            showAlert('error', '오류', '저장 실패')
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
                title="기본 설정"
                breadcrumbs={[
                    { label: '설정' },
                    { label: '기본 설정' },
                ]}
                actions={
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-red-500 text-white text-sm px-4 py-1.5 rounded hover:bg-red-600 disabled:opacity-50"
                    >
                        {loading ? '처리 중...' : '저장'}
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ===== 홈페이지 기본 정보 ===== */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">홈페이지 기본 정보</h2>

                    <FC.Row label="홈페이지명">
                        <input type="text" name="site_name" value={form.site_name ?? ''} onChange={handleChange} placeholder="홈페이지명" className={FC.inputClass} />
                    </FC.Row>
                    <FC.Row label="홈페이지 영문명">
                        <input type="text" name="site_name_en" value={form.site_name_en ?? ''} onChange={handleChange} placeholder="홈페이지 영문명" className={FC.inputClass} />
                    </FC.Row>
                    <FC.Row label="상단 타이틀">
                        <input type="text" name="site_title" value={form.site_title ?? ''} onChange={handleChange} placeholder="브라우저 상단에 표시될 타이틀" className={FC.inputClass} />
                    </FC.Row>

                    {/* ✅ 로고 */}
                    <FC.Row label="로고">
                        <ImageUpload
                            value={form.logo}
                            onChange={(path) => setForm(prev => ({ ...prev, logo: path }))}
                            folder="site"
                            width="w-48"
                            height="h-20"
                            hint="PNG, JPG, SVG 권장"
                        />
                    </FC.Row>

                    {/* ✅ 파비콘 */}
                    <FC.Row label="파비콘">
                        <ImageUpload
                            value={form.favicon}
                            onChange={(path) => setForm(prev => ({ ...prev, favicon: path }))}
                            folder="site"
                            width="w-16"
                            height="h-16"
                            accept="image/*,.ico"
                            hint="ICO, PNG 권장 (32x32)"
                        />
                    </FC.Row>
                </div>

                {/* ===== 회사 정보 ===== */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">회사 정보</h2>

                    <FC.Row label="상호(회사명)">
                        <input type="text" name="company_name" value={form.company_name ?? ''} onChange={handleChange} placeholder="상호명" className={FC.inputClass} />
                    </FC.Row>
                    <FC.Row label="사업자등록번호">
                        {/* ✅ 사업자등록번호 형식 000-00-00000 */}
                        <input
                            type="text"
                            name="company_reg_no"
                            value={form.company_reg_no ?? ''}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '')
                                let formatted = val
                                if (val.length > 5) formatted = val.slice(0, 3) + '-' + val.slice(3, 5) + '-' + val.slice(5, 10)
                                else if (val.length > 3) formatted = val.slice(0, 3) + '-' + val.slice(3)
                                setForm(prev => ({ ...prev, company_reg_no: formatted }))
                            }}
                            placeholder="000-00-00000"
                            maxLength={12}
                            className={FC.inputClass}
                        />
                    </FC.Row>
                    <FC.Row label="대표자명">
                        <input type="text" name="company_ceo" value={form.company_ceo ?? ''} onChange={handleChange} placeholder="대표자명" className={FC.inputClass} />
                    </FC.Row>
                    <FC.Row label="업태">
                        <input type="text" name="company_business_type" value={form.company_business_type ?? ''} onChange={handleChange} placeholder="업태" className={FC.inputClass} />
                    </FC.Row>
                    <FC.Row label="종목">
                        <input type="text" name="company_business_item" value={form.company_business_item ?? ''} onChange={handleChange} placeholder="종목" className={FC.inputClass} />
                    </FC.Row>
                    <FC.Row label="대표 이메일">
                        <FC.EmailInput
                            idName="company_email_id"
                            domainName="company_email_domain"
                            form={form}
                            onChange={handleChange}
                        />
                    </FC.Row>

                    {/* ✅ 주소 - handleAddressSearch 사용 */}
                    <FC.Row label="사업장 주소">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="company_postcode"
                                    placeholder="우편번호"
                                    value={form.company_postcode ?? ''}
                                    readOnly
                                    className="w-36 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleAddressSearch('company_postcode', 'company_address1')}
                                    className="shrink-0 bg-gray-400 text-white text-sm px-3 py-1.5 rounded hover:bg-gray-500"
                                >
                                    우편번호찾기
                                </button>
                            </div>
                            <input
                                type="text"
                                name="company_address1"
                                placeholder="기본주소"
                                value={form.company_address1 ?? ''}
                                readOnly
                                className={FC.inputClass}
                            />
                            <input
                                type="text"
                                name="company_address2"
                                placeholder="상세주소"
                                value={form.company_address2 ?? ''}
                                onChange={handleChange}
                                className={FC.inputClass}
                            />
                        </div>
                    </FC.Row>

                    {/* ✅ 전화번호 - handlePhoneChange 사용 */}
                    <FC.Row label="대표전화">
                        <input
                            type="text"
                            name="company_tel"
                            value={form.company_tel ?? ''}
                            onChange={handlePhoneChange}
                            placeholder="000-0000-0000"
                            className={FC.inputClass}
                        />
                    </FC.Row>
                    <FC.Row label="팩스번호">
                        <input
                            type="text"
                            name="company_fax"
                            value={form.company_fax ?? ''}
                            onChange={handlePhoneChange}
                            placeholder="000-0000-0000"
                            className={FC.inputClass}
                        />
                    </FC.Row>
                </div>

                {/* ===== 고객센터 ===== */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded mb-2">고객센터</h2>

                    <FC.Row label="전화번호 1">
                        <input type="text" name="cs_tel1" value={form.cs_tel1 ?? ''} onChange={handlePhoneChange} placeholder="000-0000-0000" className={FC.inputClass} />
                    </FC.Row>
                    <FC.Row label="전화번호 2">
                        <input type="text" name="cs_tel2" value={form.cs_tel2 ?? ''} onChange={handlePhoneChange} placeholder="000-0000-0000" className={FC.inputClass} />
                    </FC.Row>
                    <FC.Row label="팩스번호">
                        <input type="text" name="cs_fax" value={form.cs_fax ?? ''} onChange={handlePhoneChange} placeholder="000-0000-0000" className={FC.inputClass} />
                    </FC.Row>
                    <FC.Row label="이메일">
                        <FC.EmailInput
                            idName="cs_email_id"
                            domainName="cs_email_domain"
                            form={form}
                            onChange={handleChange}
                        />
                    </FC.Row>
                    <FC.Row label="운영시간">
                        <textarea
                            name="cs_hours"
                            value={form.cs_hours ?? ''}
                            onChange={handleChange}
                            placeholder={`평일 09:00 ~ 18:00\n점심 12:00 ~ 13:00\n주말 및 공휴일 휴무`}
                            rows={4}
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
                        />
                    </FC.Row>
                </div>

            </div>
        </div>
    )
}

export default SiteSetting