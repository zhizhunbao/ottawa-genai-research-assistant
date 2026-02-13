/**
 * HomeView - Landing page view orchestrating data fetching and auth state
 *
 * @module features/landing/views
 * @template none
 * @reference none
 */

import { HomePage } from '@/features/landing/components/home-page'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useHomeData } from '@/features/landing/hooks/use-home-data'

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
