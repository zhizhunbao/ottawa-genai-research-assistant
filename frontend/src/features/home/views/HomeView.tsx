/**
 * Home View
 *
 * Orchestrates page-level layout, data fetching via hooks, and authentication logic for the landing page.
 *
 * @template — Custom Implementation
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
