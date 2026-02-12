/**
 * HowItWorksSection - Step-by-step workflow showcase with numbered badges and connecting line
 *
 * @module features/landing
 * @templateRef none
 * @reference none
 */

import { useTranslation } from 'react-i18next'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent, Badge } from '@/shared/components/ui'

interface HowItWorksSectionProps {
  steps: readonly { key: string; Icon: LucideIcon }[]
}

export function HowItWorksSection({ steps }: HowItWorksSectionProps) {
  const { t } = useTranslation('home')

  return (
    <section className="py-24 px-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            {t('howItWorks.sectionTitle')}
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            {t('howItWorks.subtitle')}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-12 max-w-6xl mx-auto relative">
          {/* 装饰连线 (仅桌面端) */}
          <div className="hidden md:block absolute top-11 left-[10%] right-[10%] h-px bg-slate-200 z-0" />
          
          {steps.map(({ key, Icon }, index) => (
            <Card
              key={key}
              className="flex-1 relative z-10 border-none bg-transparent shadow-none"
            >
              <CardContent className="flex flex-col items-center p-0">
                <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-8 shadow-sm group hover:border-primary transition-colors relative">
                  <Icon className="w-6 h-6 text-[#004890]" />
                  <Badge className="absolute -top-1 -right-1 w-6 h-6 rounded-full p-0 flex items-center justify-center text-[10px] font-black">
                    {index + 1}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{t(`howItWorks.${key}.title`)}</h3>
                <p className="text-slate-600 font-medium text-center leading-relaxed">
                  {t(`howItWorks.${key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
