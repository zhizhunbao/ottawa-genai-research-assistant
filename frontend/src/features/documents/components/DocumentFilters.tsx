/**
 * 文档过滤器组件
 *
 * 提供文档列表的过滤和搜索功能。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from 'react-i18next'
import { Search, X, Filter } from 'lucide-react'
import type { DocumentStatus, Quarter, ReportType } from '@/features/documents/types'
import { QUARTERS, REPORT_TYPES, DOCUMENT_STATUSES, YEARS } from '@/features/documents/constants'

interface DocumentFiltersProps {
  /** 搜索关键词 */
  search: string
  /** 季度过滤 */
  quarter: Quarter | ''
  /** 年份过滤 */
  year: number | ''
  /** 报告类型过滤 */
  reportType: ReportType | ''
  /** 状态过滤 */
  status: DocumentStatus | ''
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
  /** 清除过滤器回调 */
  onClearFilters: () => void
}

export function DocumentFilters({
  search,
  quarter,
  year,
  reportType,
  status,
  onSearchChange,
  onQuarterChange,
  onYearChange,
  onReportTypeChange,
  onStatusChange,
  onClearFilters,
}: DocumentFiltersProps) {
  const { t } = useTranslation('documents')

  const hasFilters = search || quarter || year || reportType || status

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('filters.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* 过滤器组 */}
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400 hidden lg:block" />

          {/* 季度 */}
          <select
            value={quarter}
            onChange={(e) => onQuarterChange(e.target.value as Quarter | '')}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{t('filters.quarter')}</option>
            {QUARTERS.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>

          {/* 年份 */}
          <select
            value={year}
            onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value, 10) : '')}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{t('filters.year')}</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* 报告类型 */}
          <select
            value={reportType}
            onChange={(e) => onReportTypeChange(e.target.value as ReportType | '')}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{t('filters.reportType')}</option>
            {REPORT_TYPES.map((type) => (
              <option key={type} value={type}>{t(`reportTypes.${type}`)}</option>
            ))}
          </select>

          {/* 状态 */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as DocumentStatus | '')}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{t('filters.status')}</option>
            {DOCUMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{t(`status.${s}`)}</option>
            ))}
          </select>

          {/* 清除过滤器 */}
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              {t('filters.clear')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
