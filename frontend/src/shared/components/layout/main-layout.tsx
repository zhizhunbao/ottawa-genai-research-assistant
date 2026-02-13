/**
 * MainLayout - Top-level layout composing Header, PageContainer, and Footer
 *
 * @module shared/components/layout
 * @template none
 * @reference none
 */
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './header'
import { Footer } from './footer'
import { PageContainer } from './page-container'

/** 不需要 PageContainer 的路由（全宽或特殊布局） */
const FULL_WIDTH_ROUTES = ['/', '/chat']

export function MainLayout() {
  const location = useLocation()
  const isChatPage = location.pathname === '/chat'
  const usePageContainer = !FULL_WIDTH_ROUTES.includes(location.pathname)

  return (
    <div className={`flex flex-col bg-background ${isChatPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Header />
      <main className={`flex-1 ${isChatPage ? 'overflow-hidden' : ''}`}>
        {usePageContainer ? (
          <PageContainer>
            <Outlet />
          </PageContainer>
        ) : (
          <Outlet />
        )}
      </main>
      {!isChatPage && <Footer />}
    </div>
  )
}
