/**
 * Document Management Hook
 *
 * Provides business logic for document listing, uploading, and deletion within the research feature.
 *
 * @template — Custom Implementation
 */

import { useState, useCallback } from 'react'
import { researchApi } from '@/features/research/services/researchApi'
import type { Document } from '@/features/research/types'

interface UseDocumentsOptions {
  initialPage?: number
  pageSize?: number
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const { initialPage = 1, pageSize = 20 } = options

  const [documents, setDocuments] = useState<Document[]>([])
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 加载文档列表
   */
  const loadDocuments = useCallback(
    async (
      page = pagination.page,
      filters?: { year?: number; quarter?: string; status?: string }
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await researchApi.getDocuments(page, pagination.pageSize, filters)
        setDocuments(result.items)
        setPagination({
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        })
        return { success: true, data: result }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load documents'
        setError(message)
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
      }
    },
    [pagination.page, pagination.pageSize]
  )

  /**
   * 上传文档
   */
  const uploadDocument = useCallback(
    async (file: File, metadata: { quarter: string; year: number; reportType: string }) => {
      setIsLoading(true)
      setError(null)

      try {
        const document = await researchApi.uploadDocument(file, metadata)
        // 刷新列表
        await loadDocuments()
        return { success: true, document }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload document'
        setError(message)
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
      }
    },
    [loadDocuments]
  )

  /**
   * 删除文档
   */
  const deleteDocument = useCallback(
    async (documentId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        await researchApi.deleteDocument(documentId)
        // 从本地列表移除
        setDocuments((prev) => prev.filter((d) => d.id !== documentId))
        return { success: true }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete document'
        setError(message)
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  /**
   * 切换页面
   */
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        loadDocuments(page)
      }
    },
    [loadDocuments, pagination.totalPages]
  )

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // 状态
    documents,
    pagination,
    isLoading,
    error,

    // 操作
    loadDocuments,
    uploadDocument,
    deleteDocument,
    goToPage,
    clearError,
  }
}

export default useDocuments
