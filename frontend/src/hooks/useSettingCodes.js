import { useState, useEffect } from 'react'
import api from '../api/axios'

// 특정 코드로 시작하는 settings 목록 가져오기
export function useSettingCodes(code, token) {
    const [options, setOptions] = useState([])

    useEffect(() => {
        if (!code) return
        api.get(`/admin/settings/codes/by/${code}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setOptions(res.data.data)
        }).catch(err => {
            console.error(err)
        })
    }, [code])

    return options
}