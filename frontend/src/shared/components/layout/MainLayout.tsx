/**
 * MainLayout - 主布局组件
 *
 * 包含 Header、主内容区域和 Footer 的完整页面布局。
 * 用于公开页面（首页）和一般页面。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

interface MainLayoutProps {
  /** 是否显示 Footer */
  showFooter?: boolean
  /** 自定义主内容区域的类名 */
  className?: string
}

export function MainLayout({ showFooter = true, className = '' }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Header />
      <main className={`flex-1 ${className}`}>
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  )
}
