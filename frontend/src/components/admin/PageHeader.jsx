import { Link } from 'react-router-dom'

function PageHeader({ title, breadcrumbs = [], actions }) {
    return (
        <div className="mb-6">
            {/* 브레드크럼 */}
            {breadcrumbs.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                    {breadcrumbs.map((crumb, index) => (
                        <span key={index} className="flex items-center gap-1">
                            {index > 0 && <span>›</span>}
                            {crumb.path ? (
                                <Link to={crumb.path} className="hover:text-orange-500">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-gray-600">{crumb.label}</span>
                            )}
                        </span>
                    ))}
                </div>
            )}

            {/* 타이틀 + 버튼 */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>

            {/* 구분선 */}
            <div className="border-b border-gray-200 mt-3" />
        </div>
    )
}

export default PageHeader