/**
 * 文档列表 Hook
 *
 * 提供文档列表的图标映射等辅助数据。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useCallback, useMemo } from 'react'
import { Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { documentsApi } from '@/features/documents/services/documentsApi'
import type { DocumentStatus } from '@/features/documents/types'

/**
 * 状态图标类型
 */
type StatusIconType = typeof CheckCircle

/**
 * 文档列表辅助 Hook 返回值
 */
interface UseDocumentListReturn {
  /** 状态图标映射 */
  statusIcons: Record<DocumentStatus, StatusIconType>
  /** 删除文档 */
  handleDelete: (id: string) => Promise<void>
  /** 查看文档 */
  handleView: (id: string) => void
}

/**
 * 文档列表辅助 Hook
 */
export function useDocumentList(onRefresh: () => Promise<void>): UseDocumentListReturn {
  const navigate = useNavigate()

  /**
   * 状态图标映射
   */
  const statusIcons = useMemo<Record<DocumentStatus, StatusIconType>>(() => ({
    pending: Clock,
    processing: Loader,
    indexed: CheckCircle,
    failed: AlertCircle,
  }), [])

  /**
   * 删除文档
   */
  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      await documentsApi.deleteDocument(id)
      await onRefresh()
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }, [onRefresh])

  /**
   * 查看文档
   */
  const handleView = useCallback((id: string) => {
    navigate(`/documents/${id}`)
  }, [navigate])

  return {
    statusIcons,
    handleDelete,
    handleView,
  }
}

export default useDocumentList
