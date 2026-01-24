/**
 * 文档管理 Hook
 *
 * 提供文档列表、过滤、分页等业务逻辑。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useCallback, useEffect, useState } from 'react'
import { documentsApi } from '@/features/documents/services/documentsApi'
import type {
  Document,
  DocumentListParams,
  DocumentStatus,
  Quarter,
  ReportType,
} from '@/features/documents/types'

/**
 * 过滤器状态
 */
interface DocumentFilters {
  search: string
  quarter: Quarter | ''
  year: number | ''
  reportType: ReportType | ''
  status: DocumentStatus | ''
}

/**
 * 文档管理 Hook 返回值
 */
interface UseDocumentsReturn {
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
  /** 过滤器状态 */
  filters: DocumentFilters
  /** 刷新列表 */
  refresh: () => Promise<void>
  /** 更新搜索关键词 */
  handleSearchChange: (value: string) => void
  /** 更新季度过滤 */
  handleQuarterChange: (value: Quarter | '') => void
  /** 更新年份过滤 */
  handleYearChange: (value: number | '') => void
  /** 更新报告类型过滤 */
  handleReportTypeChange: (value: ReportType | '') => void
  /** 更新状态过滤 */
  handleStatusChange: (value: DocumentStatus | '') => void
  /** 切换页码 */
  handlePageChange: (page: number) => void
  /** 清除所有过滤器 */
  clearFilters: () => void
}

/**
 * 文档管理 Hook
 */
export function useDocuments(): UseDocumentsReturn {
  // 文档列表状态
  const [documents, setDocuments] = useState<Document[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 过滤器状态
  const [filters, setFilters] = useState<DocumentFilters>({
    search: '',
    quarter: '',
    year: '',
    reportType: '',
    status: '',
  })

  /**
   * 加载文档列表
   */
  const loadDocuments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params: DocumentListParams = {
        page,
        pageSize,
      }

      if (filters.search) params.search = filters.search
      if (filters.quarter) params.quarter = filters.quarter as Quarter
      if (filters.year) params.year = filters.year as number
      if (filters.reportType) params.reportType = filters.reportType as ReportType
      if (filters.status) params.status = filters.status as DocumentStatus

      const response = await documentsApi.getDocuments(params)
      setDocuments(response.documents)
      setTotal(response.total)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load documents'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, filters])

  // 初始加载和过滤器变化时重新加载
  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  /**
   * 刷新列表
   */
  const refresh = useCallback(async () => {
    await loadDocuments()
  }, [loadDocuments])

  /**
   * 处理搜索变化
   */
  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    setPage(1) // 重置到第一页
  }, [])

  /**
   * 处理季度变化
   */
  const handleQuarterChange = useCallback((value: Quarter | '') => {
    setFilters(prev => ({ ...prev, quarter: value }))
    setPage(1)
  }, [])

  /**
   * 处理年份变化
   */
  const handleYearChange = useCallback((value: number | '') => {
    setFilters(prev => ({ ...prev, year: value }))
    setPage(1)
  }, [])

  /**
   * 处理报告类型变化
   */
  const handleReportTypeChange = useCallback((value: ReportType | '') => {
    setFilters(prev => ({ ...prev, reportType: value }))
    setPage(1)
  }, [])

  /**
   * 处理状态变化
   */
  const handleStatusChange = useCallback((value: DocumentStatus | '') => {
    setFilters(prev => ({ ...prev, status: value }))
    setPage(1)
  }, [])

  /**
   * 处理页码变化
   */
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  /**
   * 清除所有过滤器
   */
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      quarter: '',
      year: '',
      reportType: '',
      status: '',
    })
    setPage(1)
  }, [])

  return {
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
  }
}

export default useDocuments
