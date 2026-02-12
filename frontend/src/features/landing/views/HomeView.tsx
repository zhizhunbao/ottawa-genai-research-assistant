/**
 * HomeView - Landing page view orchestrating data fetching and auth state
 *
 * @module features/landing/views
 * @templateRef none
 * @reference none
 */

import { HomePage } from '@/features/landing/components/HomePage'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useHomeData } from '@/features/landing/hooks/useHomeData'

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
