/**
 * 文档上传指引组件
 *
 * 显示上传限制、最佳实践和隐私说明。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from 'react-i18next'
import { CheckCircle, Info, Lock } from 'lucide-react'

export function UploadGuidance() {
  const { t } = useTranslation('documents')

  const sections = [
    {
      id: 'formats',
      icon: CheckCircle,
      title: t('upload.guidance.formats.title'),
      items: [
        t('upload.guidance.formats.pdfOnly'),
        t('upload.guidance.formats.textBased'),
        t('upload.guidance.formats.maxSize'),
      ],
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      id: 'bestPractices',
      icon: Info,
      title: t('upload.guidance.bestPractices.title'),
      items: [
        t('upload.guidance.bestPractices.descriptiveNames'),
        t('upload.guidance.bestPractices.noPassword'),
        t('upload.guidance.bestPractices.latestVersion'),
      ],
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'privacy',
      icon: Lock,
      title: t('upload.guidance.privacy.title'),
      items: [
        t('upload.guidance.privacy.publicOnly'),
        t('upload.guidance.privacy.noPersonalData'),
        t('upload.guidance.privacy.localProcessing'),
      ],
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="mt-12 pt-12 border-t border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-8">{t('upload.guidance.title')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map((section) => (
          <div key={section.id} className="space-y-4">
            <div className={`p-3 w-fit rounded-xl ${section.bgColor}`}>
              <section.icon className={`w-6 h-6 ${section.iconColor}`} />
            </div>
            <h4 className="font-bold text-gray-900">{section.title}</h4>
            <ul className="space-y-2">
              {section.items.map((item, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
