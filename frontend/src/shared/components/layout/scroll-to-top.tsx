/**
 * ScrollToTop - Floating button to scroll back to top of page
 *
 * @module shared/components/layout
 * @source shadcn-landing-page/src/components/ScrollToTop.tsx
 * @reference https://github.com/leoMirandaa/shadcn-landing-page
 */
import { useState, useEffect } from 'react'
import { Button } from '@/shared/components/ui/button'
import { ArrowUpToLine } from 'lucide-react'

export function ScrollToTop() {
  const [showTopBtn, setShowTopBtn] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const goToTop = () => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  }

  if (!showTopBtn) return null

  return (
    <Button
      onClick={goToTop}
      className="fixed bottom-4 right-4 opacity-90 shadow-md z-50"
      size="icon"
      aria-label="Scroll to top"
    >
      <ArrowUpToLine className="h-4 w-4" />
    </Button>
  )
}
