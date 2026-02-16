/**
 * MainLayout - Top-level layout composing Header, PageContainer, Footer, and ScrollToTop
 *
 * @module shared/components/layout
 * @source shadcn-landing-page (adapted)
 * @reference https://github.com/leoMirandaa/shadcn-landing-page
 */
import { Outlet } from 'react-router-dom'
import { Header } from './header'
import { ScrollToTop } from './scroll-to-top'

export function MainLayout() {
  return (
    <div className="flex flex-col bg-background h-screen overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <ScrollToTop />
    </div>
  )
}

