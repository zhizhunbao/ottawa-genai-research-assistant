/**
 * HomePage - Landing page root component composing Hero, Features, HowItWorks, and CTA sections
 *
 * @module features/landing
 * @template .agent/templates/frontend/features/landing/marketing-layout.tsx.template
 * @reference none
 */

import { LucideIcon } from 'lucide-react'
import { Hero } from './hero'
import { FeatureSection } from './feature-section'
import { HowItWorksSection } from './how-it-works-section'
import { CTASection } from './cta-section'
import { HOME_STEPS_CONFIG } from '../enums'

interface HomePageProps {
  isAuthenticated: boolean
  features: readonly { key: string; Icon: LucideIcon }[]
  stats: readonly { key: string; number: string }[]
}

export function HomePage({ isAuthenticated, features, stats }: HomePageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ����չʾ�� */}
      <Hero isAuthenticated={isAuthenticated} stats={stats} />
      
      
      {/* ���������� */}
      <FeatureSection features={features} />
      
      {/* ���������� */}
      <HowItWorksSection steps={HOME_STEPS_CONFIG} />
      
      {/* �ж������� */}
      <CTASection isAuthenticated={isAuthenticated} />
    </div>
  )
}
