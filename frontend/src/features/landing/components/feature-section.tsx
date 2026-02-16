/**
 * FeatureSection - Core feature showcase grid with icon cards and hover effects
 *
 * @module features/landing
 * @source shadcn-landing-page/src/components/Features.tsx (adapted)
 * @reference https://github.com/leoMirandaa/shadcn-landing-page
 */

import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/shared/components/ui'
import { LucideIcon } from 'lucide-react'

interface FeatureSectionProps {
  features: readonly { key: string; Icon: LucideIcon }[]
}

export function FeatureSection({ features }: FeatureSectionProps) {
  const { t } = useTranslation('home')

  return (
    <section id="features" className="py-24 px-6 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            {t('features.sectionTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map(({ key, Icon }) => (
            <Card key={key} className="group hover:border-primary/30 hover:shadow-xl hover:shadow-muted/40 transition-all duration-300">
              <CardContent className="p-10">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-8 group-hover:bg-primary/5 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 tracking-tight">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
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
