/**
 * DashboardLayout - 仪表板布局组件
 *
 * 用于需要认证的页面，支持可选的侧边栏。
 * 不显示 Footer，最大化内容区域。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { Outlet, Navigate } from 'react-router-dom'
import { Header } from './Header'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface DashboardLayoutProps {
  /** 是否需要认证才能访问 */
  requireAuth?: boolean
  /** 侧边栏内容（可选） */
  sidebar?: React.ReactNode
  /** 侧边栏宽度 */
  sidebarWidth?: string
}

export function DashboardLayout({
  requireAuth = true,
  sidebar,
  sidebarWidth = 'w-64',
}: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // 需要认证但未登录，重定向到登录页
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Header />
      <div className="flex-1 flex">
        {sidebar && (
          <aside className={`${sidebarWidth} border-r border-gray-200 bg-white shrink-0`}>
            {sidebar}
          </aside>
        )}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
