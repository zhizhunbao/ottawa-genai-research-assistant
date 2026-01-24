/**
 * 文档列表视图
 *
 * 视图层只组合组件和调用 Hooks。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { DocumentsPage } from '@/features/documents/components/DocumentsPage'
import { useDocuments } from '@/features/documents/hooks/useDocuments'
import { useDocumentList } from '@/features/documents/hooks/useDocumentList'

export default function DocumentsView() {
  const {
    documents,
    total,
    page,
    pageSize,
    isLoading,
    error,
    filters,
    refresh,
    handleSearchChange,
    handleQuarterChange,
    handleYearChange,
    handleReportTypeChange,
    handleStatusChange,
    handlePageChange,
    clearFilters,
  } = useDocuments()

  const { statusIcons, handleDelete, handleView } = useDocumentList(refresh)

  return (
    <DocumentsPage
      documents={documents}
      total={total}
      page={page}
      pageSize={pageSize}
      isLoading={isLoading}
      error={error}
      filterSearch={filters.search}
      filterQuarter={filters.quarter}
      filterYear={filters.year}
      filterReportType={filters.reportType}
      filterStatus={filters.status}
      onSearchChange={handleSearchChange}
      onQuarterChange={handleQuarterChange}
      onYearChange={handleYearChange}
      onReportTypeChange={handleReportTypeChange}
      onStatusChange={handleStatusChange}
      onPageChange={handlePageChange}
      onClearFilters={clearFilters}
      onDelete={handleDelete}
      onView={handleView}
      statusIcons={statusIcons}
    />
  )
}
