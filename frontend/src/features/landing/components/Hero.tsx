/**
 * Hero - Landing page hero section with gradient background, CTA, and stats cards
 *
 * @module features/landing
 * @templateRef .agent/templates/frontend/features/landing/hero-section.tsx.template
 * @reference none
 */

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { MessageSquare, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui'

interface HeroProps {
  isAuthenticated: boolean
  stats: readonly { key: string; number: string }[]
}

export function Hero({ isAuthenticated, stats }: HeroProps) {
  const { t } = useTranslation('home')

  return (
    <section className="relative min-h-[80vh] flex items-center bg-linear-to-br from-[#004890] via-[#0066cc] to-[#004890] text-white overflow-hidden py-24 px-6">
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight">
          {t('hero.title')}{' '}
          <span className="text-[#ffd700]">
            {t('hero.titleHighlight')}
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
          {t('hero.subtitle')}
        </p>
        
        <div className="flex justify-center mb-20">
          <Button
            asChild
            size="lg"
            className="px-12 py-5 h-auto bg-white text-[#004890] font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all hover:bg-white/95"
          >
            <Link to="/chat">
              <MessageSquare size={22} />
              {isAuthenticated ? t('cta.startChat') : t('cta.startSession')}
              <ArrowRight size={20} />
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto px-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex-1 min-w-[200px] max-w-[240px] bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:bg-white/15 transition-all">
              <div className="text-4xl font-black text-[#ffd700] mb-2">
                {stat.number}
              </div>
              <div className="text-white/80 text-xs font-bold tracking-widest leading-normal">
                {t(`stats.${stat.key}`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
