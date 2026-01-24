/**
 * HomeView - Home page view
 *
 * Views only compose components and call hooks.
 * No CSS, no i18n, no services.
 */

import { HomePage } from '@/features/research/components/HomePage'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function HomeView() {
  const { isAuthenticated, user } = useAuth()

  return (
    <HomePage 
      isAuthenticated={isAuthenticated} 
      user={user} 
    />
  )
}
