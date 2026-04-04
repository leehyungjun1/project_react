// src/hooks/useListData.js
import { useState, useEffect } from 'react';
import { useListFilter } from '@/hooks/useListFilter';
import { showAlert } from '@/utils/modal';
import api from '@/api/axios';

export function useListData(apiUrl, initialFilter) {
    const [list, setList]           = useState([]);
    const [total, setTotal]         = useState(0);
    const [lastPage, setLastPage]   = useState(1);
    const [loading, setLoading]     = useState(false);

    const [appliedFilter, setAppliedFilter] = useState(initialFilter);
    const { filter, setFilter, handleFilterChange } = useListFilter(initialFilter);

    const handleSearch = () => {
        const next = { ...filter, page: 1 };
        setFilter(next);
        setAppliedFilter(next); // ← 여기서 fetch 트리거
    };

    const handleReset = () => {
        const next = { ...initialFilter, page: 1 };
        setFilter(next);
        setAppliedFilter(next);
    };

    const handlePageChange = (page) => {
        const next = { ...filter, page };
        setFilter(next);
        setAppliedFilter(next); // 페이지 변경은 즉시 fetch
    };

    const fetchList = async (params) => {
        setLoading(true);
        try {
            const res = await api.get(apiUrl, { params });
            setList(res.data.data.list);
            setTotal(res.data.data.total);
            setLastPage(res.data.data.lastPage);
        } catch (err) {
            showAlert('error', '오류', '목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList(appliedFilter);
    }, [appliedFilter]);



    return {
        list, total, lastPage, loading,
        filter, setFilter,
        fetchList,
        handleFilterChange,
        handleSearch,
        handleReset,
        handlePageChange,
    };
}