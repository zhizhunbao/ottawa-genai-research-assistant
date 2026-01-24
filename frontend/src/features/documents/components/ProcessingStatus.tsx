/**
 * 文档处理状态组件
 *
 * 显示文档处理的各个阶段（处理、分析、知识库）。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from 'react-i18next'
import { FileText, Cpu, Database } from 'lucide-react'

export function ProcessingStatus() {
  const { t } = useTranslation('documents')

  const statuses = [
    {
      id: 'processing',
      icon: FileText,
      title: t('upload.status.processing.title'),
      description: t('upload.status.processing.description'),
      status: 'completed',
    },
    {
      id: 'analysis',
      icon: Cpu,
      title: t('upload.status.analysis.title'),
      description: t('upload.status.analysis.description'),
      status: 'completed',
    },
    {
      id: 'knowledge',
      icon: Database,
      title: t('upload.status.knowledge.title'),
      description: t('upload.status.knowledge.description'),
      status: 'ready',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      {statuses.map((item) => (
        <div
          key={item.id}
          className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-500">
              <item.icon className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900">{item.title}</h4>
          </div>
          <p className="text-sm text-gray-500 mb-4">{item.description}</p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {item.status === 'ready' ? t('upload.status.ready') : t('upload.status.completed')}
          </div>
        </div>
      ))}
    </div>
  )
}
