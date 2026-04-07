// src/pages/admin/products/components/ProductImageUpload.jsx
import ImageUpload from '@/components/ImageUpload'

const IMAGE_FIELDS = [
    { key: 'zoom',       label: '확대 이미지' },
    { key: 'detail',     label: '상세 이미지' },
    { key: 'thumb',      label: '썸네일 이미지' },
    { key: 'list',       label: '리스트 이미지' },
    { key: 'list_group', label: '리스트 그룹형' },
    { key: 'simple',     label: '심플 이미지' },
    { key: 'add_list1',  label: '추가 리스트1' },
    { key: 'add_list2',  label: '추가 리스트2' },
    { key: 'add1',       label: '추가 이미지1' },
    { key: 'add2',       label: '추가 이미지2' },
]

function ProductImageUpload({ form, onChange }) {
    return (
        <div className="space-y-6">

            {/* 원본 이미지 */}
            <div className="border border-gray-100 rounded p-4">
                <h4 className="text-xs font-bold text-gray-600 mb-3">원본 이미지</h4>
                <ImageUpload
                    value={form.original}
                    onChange={(path) => onChange({ original: path })}
                    folder="products"
                    label="원본 이미지 업로드"
                    width="w-48"
                    height="h-48"
                    hint="JPG, PNG, WebP 권장"
                />
                <label className="flex items-center gap-2 text-sm cursor-pointer mt-3 text-gray-600">
                    <input
                        type="checkbox"
                        checked={form.img_auto_resize == 1}
                        onChange={(e) => onChange({ img_auto_resize: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4"
                    />
                    이미지 사이즈별 자동 리사이즈
                    <span className="text-xs text-gray-400">(원본 이미지 기준으로 각 사이즈 자동 생성)</span>
                </label>
            </div>

            {/* 개별 이미지 */}
            <div>
                <h4 className="text-xs font-bold text-gray-600 mb-3">개별 이미지</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {IMAGE_FIELDS.map(({ key, label }) => (
                        <div key={key}>
                            <label className="block text-xs text-gray-500 mb-1">{label}</label>
                            <ImageUpload
                                value={form[key]}
                                onChange={(path) => onChange({ [key]: path })}
                                folder="products"
                                label={label}
                                height="h-24"
                            />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default ProductImageUpload