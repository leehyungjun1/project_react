// src/pages/admin/products/components/ProductDescription.jsx
import { useRef, useEffect } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'

function ProductDescription({ value, onChange }) {
    const editorRef = useRef(null)
    const editorInstance = useRef(null)

    useEffect(() => {
        editorInstance.current = new Editor({
            el: editorRef.current,
            initialEditType: 'wysiwyg',
            previewStyle: 'vertical',
            height: '400px',
            initialValue: value || '',
            language: 'ko-KR',
        })

        editorInstance.current.on('change', () => {
            onChange(editorInstance.current.getHTML())
        })

        return () => {
            editorInstance.current?.destroy()
        }
    }, [])

    return <div ref={editorRef} />
}

export default ProductDescription