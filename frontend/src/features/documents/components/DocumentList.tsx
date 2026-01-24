/**
 * 文档列表组件
 *
 * 显示文档列表表格。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from 'react-i18next'
import { FileText, Download, Trash2, CheckCircle } from 'lucide-react'
import type { Document, DocumentStatus } from '@/features/documents/types'
import { STATUS_STYLES } from '@/features/documents/constants'

interface DocumentListProps {
  /** 文档列表 */
  documents: Document[]
  /** 是否正在加载 */
  isLoading: boolean
  /** 状态图标映射 */
  statusIcons: Record<DocumentStatus, typeof CheckCircle>
  /** 删除文档回调 */
  onDelete: (id: string) => void
  /** 查看文档回调 */
  onView: (id: string) => void
}

export function DocumentList({
  documents,
  isLoading,
  statusIcons,
  onDelete,
  onView,
}: DocumentListProps) {
  const { t } = useTranslation('documents')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.title')}</h3>
        <p className="text-gray-500">{t('empty.description')}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-700">{t('table.title')}</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">{t('table.quarter')}</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">{t('table.type')}</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">{t('table.status')}</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">{t('table.uploadDate')}</th>
            <th className="text-right py-3 px-4 font-medium text-gray-700">{t('table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const StatusIcon = statusIcons[doc.status]
            return (
              <tr
                key={doc.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <button
                    onClick={() => onView(doc.id)}
                    className="flex items-center gap-3 text-left hover:text-primary-600 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500">{doc.fileName}</p>
                    </div>
                  </button>
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {doc.quarter} {doc.year}
                </td>
                <td className="py-4 px-4 text-gray-600">{doc.reportType}</td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[doc.status]}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {t(`status.${doc.status}`)}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-600 text-sm">
                  {new Date(doc.uploadDate).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(doc.id)}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title={t('actions.download')}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('actions.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
