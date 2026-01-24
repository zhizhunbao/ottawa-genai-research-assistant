/**
 * HomePage - 首页页面组件
 *
 * 聚合首页各子区域组件：Hero, FeatureSection, HowItWorksSection, CTASection。
 * 遵循 dev-frontend_patterns 规范，保持组件逻辑简洁。
 */

import { LucideIcon } from 'lucide-react'
import { Hero } from './Hero'
import { FeatureSection } from './FeatureSection'
import { HowItWorksSection } from './HowItWorksSection'
import { CTASection } from './CTASection'
import { HOME_STEPS_CONFIG } from '../enums'

interface HomePageProps {
  isAuthenticated: boolean
  features: readonly { key: string; Icon: LucideIcon }[]
  stats: readonly { key: string; number: string }[]
}

export function HomePage({ isAuthenticated, features, stats }: HomePageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 核心展示区 */}
      <Hero isAuthenticated={isAuthenticated} stats={stats} />
      
      {/* 功能特性区 */}
      <FeatureSection features={features} />
      
      {/* 操作流程区 */}
      <HowItWorksSection steps={HOME_STEPS_CONFIG} />
      
      {/* 行动呼吁区 */}
      <CTASection isAuthenticated={isAuthenticated} />
    </div>
  )
}
