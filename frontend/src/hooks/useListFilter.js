// src/hooks/useListFilter.js (권장 패턴 - fetchFn 분리)
import { useState, useCallback } from 'react';

export function useListFilter(initialFilter) {
    const [filter, setFilter] = useState({ ...initialFilter });

    const handleFilterChange = useCallback((e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    }, []);

    // 검색: page 초기화만 담당, 실제 fetch는 컴포넌트에서 처리
    const handleSearch = useCallback(() => {
        setFilter(prev => ({ ...prev, page: 1 }));
    }, []);

    const handleReset = useCallback(() => {
        setFilter({ ...initialFilter, page: 1 });
    }, [initialFilter]);

    const handlePageChange = useCallback((page) => {
        setFilter(prev => ({ ...prev, page }));
    }, []);

    return {
        filter,
        setFilter,
        handleFilterChange,
        handleSearch,
        handleReset,
        handlePageChange,
    };
}