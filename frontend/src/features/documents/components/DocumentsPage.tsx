/**
 * 文档页面组件
 *
 * 组合文档列表、过滤器和上传功能。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Plus, ArrowLeft, CheckCircle } from 'lucide-react'
import type { Document, DocumentStatus, Quarter, ReportType } from '@/features/documents/types'
import { DocumentFilters } from './DocumentFilters'
import { DocumentList } from './DocumentList'

interface DocumentsPageProps {
  /** 文档列表 */
  documents: Document[]
  /** 总数 */
  total: number
  /** 当前页 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 是否正在加载 */
  isLoading: boolean
  /** 错误信息 */
  error: string | null
  /** 过滤器 - 搜索 */
  filterSearch: string
  /** 过滤器 - 季度 */
  filterQuarter: Quarter | ''
  /** 过滤器 - 年份 */
  filterYear: number | ''
  /** 过滤器 - 报告类型 */
  filterReportType: ReportType | ''
  /** 过滤器 - 状态 */
  filterStatus: DocumentStatus | ''
  /** 搜索变化回调 */
  onSearchChange: (value: string) => void
  /** 季度变化回调 */
  onQuarterChange: (value: Quarter | '') => void
  /** 年份变化回调 */
  onYearChange: (value: number | '') => void
  /** 报告类型变化回调 */
  onReportTypeChange: (value: ReportType | '') => void
  /** 状态变化回调 */
  onStatusChange: (value: DocumentStatus | '') => void
  /** 页码变化回调 */
  onPageChange: (page: number) => void
  /** 清除过滤器回调 */
  onClearFilters: () => void
  /** 删除文档回调 */
  onDelete: (id: string) => void
  /** 查看文档回调 */
  onView: (id: string) => void
  /** 状态图标映射 */
  statusIcons: Record<DocumentStatus, typeof CheckCircle>
}

export function DocumentsPage({
  documents,
  total,
  page,
  pageSize,
  isLoading,
  error,
  filterSearch,
  filterQuarter,
  filterYear,
  filterReportType,
  filterStatus,
  onSearchChange,
  onQuarterChange,
  onYearChange,
  onReportTypeChange,
  onStatusChange,
  onPageChange,
  onClearFilters,
  onDelete,
  onView,
  statusIcons,
}: DocumentsPageProps) {
  const { t } = useTranslation('documents')

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50">
      {/* 头部 */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-sm text-gray-500">{t('subtitle')}</p>
              </div>
            </div>
            <Link
              to="/documents/upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              {t('upload.button')}
            </Link>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 过滤器 */}
        <DocumentFilters
          search={filterSearch}
          quarter={filterQuarter}
          year={filterYear}
          reportType={filterReportType}
          status={filterStatus}
          onSearchChange={onSearchChange}
          onQuarterChange={onQuarterChange}
          onYearChange={onYearChange}
          onReportTypeChange={onReportTypeChange}
          onStatusChange={onStatusChange}
          onClearFilters={onClearFilters}
        />

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* 文档列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <DocumentList
            documents={documents}
            isLoading={isLoading}
            statusIcons={statusIcons}
            onDelete={onDelete}
            onView={onView}
          />

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {t('pagination.showing', {
                    from: (page - 1) * pageSize + 1,
                    to: Math.min(page * pageSize, total),
                    total,
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('pagination.previous')}
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => onPageChange(p)}
                      className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                        p === page
                          ? 'bg-primary-500 text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('pagination.next')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
