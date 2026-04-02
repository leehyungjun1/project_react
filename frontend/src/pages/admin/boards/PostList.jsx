import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '@/api/axios'
import { showAlert } from '@/utils/modal'
import NormalSkin  from './skins/NormalSkin'
import GallerySkin from './skins/GallerySkin'
import QnaSkin     from './skins/QnaSkin'
import EventSkin   from './skins/EventSkin'

function PostList() {
    const { boardCode }       = useParams()
    const [board, setBoard]   = useState(null)
    const [list, setList]     = useState([])
    const [total, setTotal]   = useState(0)
    const [lastPage, setLastPage] = useState(1)
    const [loading, setLoading]   = useState(false)

    const [filter, setFilter] = useState({
        keyword     : '',
        search_type : 'title',
        is_use      : '',
        is_notice   : '',
        page        : 1,
        per_page    : 20,
    })

    const fetchList = async (params = filter) => {
        setLoading(true)
        try {
            const res = await api.get(`/admin/boards/${boardCode}/posts`, { params })
            setBoard(res.data.data.board)
            setList(res.data.data.list)
            setTotal(res.data.data.total)
            setLastPage(res.data.data.last_page)
        } catch (err) {
            showAlert('error', '오류', '목록을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (board?.skin_type === 'qna') {
            fetchList({ ...filter, depth: 0 })
        } else {
            fetchList()
        }
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
        fetchList,
        boardCode,
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