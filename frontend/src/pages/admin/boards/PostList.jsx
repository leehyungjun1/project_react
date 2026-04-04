import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListData } from '@/hooks/useListData';
import { handleDeleteItem } from '@/utils/listActions';
import { useParams } from 'react-router-dom'
import api from '@/api/axios'
import PageHeader from '@/components/admin/PageHeader'
import * as FC from "@/components/admin/FormComponents.jsx";
import * as LC from "@/components/admin/ListComponents.jsx";
import NormalSkin  from './skins/NormalSkin'
import GallerySkin from './skins/GallerySkin'
import QnaSkin     from './skins/QnaSkin'
import EventSkin   from './skins/EventSkin'


const INITIAL_FILTER = {
    keyword     : '',
    search_type : 'title',
    is_use      : '',
    is_notice   : '',
    page        : 1,
    per_page    : 20,
};

function PostList() {
    const { boardCode }      = useParams()
    const [board, setBoard]         = useState(null)
    const navigate   = useNavigate()
    const {
        list, total, lastPage, loading,
        filter, setFilter,
        fetchList,
        handleFilterChange,
        handleSearch,
        handleReset,
        handlePageChange,
    } = useListData(`/admin/boards/${boardCode}/posts`, INITIAL_FILTER);

    useEffect(() => {
        const fetchBoard = async () => {
            try {
                const res = await api.get(`/admin/boards/${boardCode}`)
                setBoard(res.data.data)
            } catch (err) {
                console.error('게시판 정보 로드 실패', err)
            }
        }
        fetchBoard()
    }, [boardCode])

    // 공통 props
    const skinProps = {
        board,
        list,
        total,
        lastPage,
        loading,
        filter,
        setFilter,
        boardCode,
        navigate,
        handleFilterChange,
        handleSearch,
        handleReset,
        handlePageChange,
    }

    // 스킨 타입에 따라 분기
    const renderSkin = () => {
        switch (board?.skin_type) {
            case 'gallery' : return <GallerySkin {...skinProps} />
            case 'qna'     : return <QnaSkin     {...skinProps} />
            case 'event'   : return <EventSkin   {...skinProps} />
            default        : return <NormalSkin  {...skinProps} />
        }
    }

    if (loading && !board) {
        return <div className="flex items-center justify-center p-20 text-gray-400">로딩 중...</div>
    }

    return renderSkin()
}

export default PostList