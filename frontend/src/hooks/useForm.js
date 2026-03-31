import { useState } from 'react'
import { formatPhone } from '../components/admin/FormComponents'

export function useForm(initialValues) {
    const [form, setForm]     = useState(initialValues)
    const [errors, setErrors] = useState({})

    // 일반 입력값 변경
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // 전화번호 자동 포맷
    const handlePhoneChange = (e) => {
        const formatted = formatPhone(e.target.value)
        setForm({ ...form, [e.target.name]: formatted })
    }

    // 카카오 주소 검색
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: (data) => {
                setForm({
                    ...form,
                    postcode: data.zonecode,
                    address1: data.roadAddress
                })
            }
        }).open()
    }

    return {
        form,
        setForm,
        errors,
        setErrors,
        handleChange,
        handlePhoneChange,
        handleAddressSearch,
    }
}