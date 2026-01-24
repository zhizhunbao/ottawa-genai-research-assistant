/**
 * FeatureSection - 核心功能展示区
 *
 * 遵循 dev-frontend_patterns 规范。
 * 采用“回归经典、底层现代”的设计原则，使用 Card 组件和细边框。
 */

import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { LucideIcon } from 'lucide-react'

interface FeatureSectionProps {
  features: readonly { key: string; Icon: LucideIcon }[]
}

export function FeatureSection({ features }: FeatureSectionProps) {
  const { t } = useTranslation('home')

  return (
    <section className="py-24 px-6 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            {t('features.sectionTitle')}
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map(({ key, Icon }) => (
            <Card key={key} className="group border-slate-200/60 hover:border-ottawa-blue/30 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
              <CardContent className="p-10">
                <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-ottawa-blue/5 transition-colors">
                  <Icon className="w-7 h-7 text-[#004890]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {t(`features.${key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
