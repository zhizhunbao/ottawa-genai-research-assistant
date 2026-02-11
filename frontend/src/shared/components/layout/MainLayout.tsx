/**
 * MainLayout - 主布局组件
 *
 * 包含 Header、PageContainer、Footer 的完整页面布局。
 * - 默认所有内容页面自动套 PageContainer（max-width + padding）。
 * - /chat 路由：全屏布局，无 PageContainer、无 Footer。
 * - /（首页）：全宽 landing page，无 PageContainer，有 Footer。
 */

import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { PageContainer } from './PageContainer'

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
