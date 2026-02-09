/**
 * AuthLayout - 认证页面布局组件
 *
 * 用于登录、注册等认证相关页面。
 * 简洁的居中布局，不显示导航栏和 Footer。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useTranslation } from 'react-i18next'

interface AuthLayoutProps {
  /** 已登录用户重定向的目标路径 */
  redirectTo?: string
}

export function AuthLayout({ redirectTo = '/chat' }: AuthLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const { t } = useTranslation('common')

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-indigo-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // 已登录用户重定向
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-indigo-50">
      {/* 简洁的顶部 Logo */}
      <header className="py-6 px-6">
        <Link to="/" className="flex items-center gap-3 w-fit mx-auto transition-opacity hover:opacity-80">
          <div className="w-10 h-10 bg-gradient-to-br from-[#004890] to-[#0066cc] rounded-lg flex items-center justify-center text-xl shadow-[0_4px_12px_rgba(0,72,144,0.2)]">
            🍁
          </div>
          <span className="font-bold text-[1.1rem] text-[#004890] tracking-tight">
            {t('app.name')}
          </span>
        </Link>
      </header>

      {/* 主内容区域 - 居中卡片 */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      {/* 简洁的底部版权 */}
      <footer className="py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {t('footer.organization')}
      </footer>
    </div>
  )
}
