/**
 * Header - 全局顶部导航栏
 *
 * 提供 Logo、主导航、语言切换和用户认证状态。
 * 复刻备份文件夹中的 Navbar 样式：文字内容、颜色、间距以及按钮梯度效果。
 * 遵循 dev-frontend_patterns 规范。
 */

import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { 
  MessageSquare, 
  FileText, 
  Settings, 
  Globe,
  LogIn,
  LogOut,
  Upload,
  BarChart3,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function Header() {
  const { t, i18n } = useTranslation('common')
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // 切换语言逻辑
  const toggleLanguage = () => {
    const nextLang = i18n.resolvedLanguage === 'en' ? 'fr' : 'en'
    i18n.changeLanguage(nextLang)
  }

  // 导航项配置 - 对应旧版 Navbar.tsx
  const navItems = [
    { path: '/chat', label: t('nav.chat'), icon: MessageSquare },
    { path: '/documents/upload', label: t('nav.upload', 'Upload'), icon: Upload },
    { path: '/documents', label: t('nav.documents'), icon: FileText },
    { path: '/analysis', label: t('nav.analysis', 'Analysis'), icon: BarChart3 },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm transition-all">
      <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Brand Section - 复刻 .brand-logo & .brand-text */}
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80 group">
          <div className="w-10 h-10 bg-linear-to-br from-[#004890] to-[#0066cc] rounded-lg flex items-center justify-center text-xl shadow-[0_4px_12px_rgba(0,72,144,0.2)]">
            🍁
          </div>
          <span className="font-bold text-[1.1rem] text-[#004890] tracking-tight">
            {t('app.name')}
          </span>
        </Link>

        {/* Navigation Menu - 复刻 .navbar-links & .navbar-link */}
        <div className="hidden md:flex items-center gap-1 mx-8 flex-1 justify-center">
          {isAuthenticated && navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-3 rounded-md font-medium text-[0.875rem] transition-all whitespace-nowrap ${
                isActive(item.path)
                  ? 'bg-[#004890]/10 text-[#004890] font-semibold'
                  : 'text-[#6b7280] hover:bg-gray-100 hover:text-[#374151]'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Actions Section - 复刻 .navbar-actions */}
        <div className="flex items-center gap-3">
          {/* Language Selector - 复刻 .language-button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 bg-[#f9fafb] border border-[#d1d5db] rounded-md text-[#374151] font-semibold text-[0.875rem] transition-all hover:bg-gray-100 hover:border-[#9ca3af]"
            title={i18n.resolvedLanguage === 'en' ? 'Switch to Français' : 'Switch to English'}
          >
            <Globe size={16} />
            <span className="min-w-[1.2rem] text-center font-bold">
              {i18n.resolvedLanguage === 'fr' ? 'FR' : 'EN'}
            </span>
          </button>

          {/* User Menu / Login Button */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 bg-[#f9fafb] border border-[#d1d5db] rounded-md text-[#374151] font-semibold text-[0.875rem] transition-all hover:bg-gray-100"
              >
                <div className="w-6 h-6 rounded-full bg-linear-to-br from-[#004890] to-[#0066cc] flex items-center justify-center text-[10px] text-white font-bold">
                  {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="font-medium hidden sm:inline">{user?.displayName || user?.email?.split('@')[0]}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu - 复刻 .dropdown-menu */}
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-[#e5e7eb] py-4 px-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#004890] to-[#0066cc] flex items-center justify-center text-white font-bold text-sm">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 tracking-widest mb-1">{t('auth.signedInAs')}</div>
                        <div className="font-semibold text-[#1f2937] text-sm truncate">{user?.displayName || user?.email}</div>
                      </div>
                    </div>
                    <div className="h-px bg-[#e5e7eb] mb-3" />
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left py-1 text-sm text-[#6b7280] hover:text-[#dc2626] font-medium transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      {t('nav.logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 bg-linear-to-br from-[#004890] to-[#0066cc] text-white rounded-md font-medium text-[0.95rem] shadow-[0_2px_12px_rgba(0,72,144,0.15)] transition-all hover:brightness-110 hover:-translate-y-px active:translate-y-0 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <div className="flex items-center gap-2">
                <LogIn size={18} />
                {t('nav.login')}
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
