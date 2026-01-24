/**
 * HomeView - 首页视图
 *
 * 视图层仅负责组合组件和调用 Hook。
 * 不包含 CSS、i18n 或业务服务逻辑。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { HomePage } from '@/features/home/components/HomePage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useHomeData } from '@/features/home/hooks/useHomeData'

export default function HomeView() {
  const { isAuthenticated } = useAuth()
  const { features, stats } = useHomeData()

  return (
    <HomePage 
      isAuthenticated={isAuthenticated} 
      features={features}
      stats={stats}
    />
  )
}
