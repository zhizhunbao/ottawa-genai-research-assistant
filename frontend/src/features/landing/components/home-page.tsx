/**
 * HomePage - Landing page root component composing Hero, Features, HowItWorks, and CTA sections
 *
 * @module features/landing
 * @source shadcn-landing-page (adapted layout)
 * @reference https://github.com/leoMirandaa/shadcn-landing-page
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
      {/* Hero Section */}
      <Hero isAuthenticated={isAuthenticated} stats={stats} />

      {/* Features Section */}
      <FeatureSection features={features} />

      {/* How It Works Section */}
      <HowItWorksSection steps={HOME_STEPS_CONFIG} />

      {/* CTA Section */}
      <CTASection isAuthenticated={isAuthenticated} />
    </div>
  )
}
