/**
 * 设置页面组件
 *
 * 显示用户设置界面。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft, User, Globe, Bell, Palette, CheckCircle } from 'lucide-react'
import type { UserProfile, UserPreferences } from '@/features/settings/types'
import { LANGUAGE_OPTIONS, THEME_OPTIONS } from '@/features/settings/constants'

interface SettingsPageProps {
  /** 用户资料 */
  profile: UserProfile | null
  /** 偏好设置 */
  preferences: UserPreferences
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否正在保存 */
  isSaving: boolean
  /** 错误信息 */
  error: string | null
  /** 保存成功 */
  saveSuccess: boolean
  /** 更新语言回调 */
  onLanguageChange: (value: 'en' | 'fr') => void
  /** 更新主题回调 */
  onThemeChange: (value: 'light' | 'dark' | 'system') => void
  /** 更新邮件通知回调 */
  onEmailNotificationChange: (value: boolean) => void
  /** 更新浏览器通知回调 */
  onBrowserNotificationChange: (value: boolean) => void
}

export function SettingsPage({
  profile,
  preferences,
  isLoading,
  isSaving,
  error,
  saveSuccess,
  onLanguageChange,
  onThemeChange,
  onEmailNotificationChange,
  onBrowserNotificationChange,
}: SettingsPageProps) {
  const { t } = useTranslation('settings')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-indigo-50">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50">
      {/* 头部 */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-sm text-gray-500">{t('subtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 成功消息 */}
        {saveSuccess && (
          <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <p>{t('saveSuccess')}</p>
          </div>
        )}

        {/* 错误消息 */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        )}

        {/* 用户资料 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-50 rounded-lg">
              <User className="w-5 h-5 text-primary-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('profile.title')}</h2>
          </div>
          
          {profile && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.displayName')}
                </label>
                <p className="text-gray-900">{profile.displayName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.email')}
                </label>
                <p className="text-gray-900">{profile.email}</p>
              </div>
              {profile.department && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.department')}
                  </label>
                  <p className="text-gray-900">{profile.department}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 语言设置 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Globe className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('language.title')}</h2>
          </div>
          
          <div className="flex gap-3">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onLanguageChange(option.value as 'en' | 'fr')}
                disabled={isSaving}
                className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                  preferences.language === option.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* 主题设置 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Palette className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('theme.title')}</h2>
          </div>
          
          <div className="flex gap-3">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onThemeChange(option.value as 'light' | 'dark' | 'system')}
                disabled={isSaving}
                className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                  preferences.theme === option.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {t(`theme.${option.value}`)}
              </button>
            ))}
          </div>
        </section>

        {/* 通知设置 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Bell className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('notifications.title')}</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">{t('notifications.email')}</p>
                <p className="text-sm text-gray-500">{t('notifications.emailDescription')}</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.email}
                onChange={(e) => onEmailNotificationChange(e.target.checked)}
                disabled={isSaving}
                className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
              />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">{t('notifications.browser')}</p>
                <p className="text-sm text-gray-500">{t('notifications.browserDescription')}</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.browser}
                onChange={(e) => onBrowserNotificationChange(e.target.checked)}
                disabled={isSaving}
                className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
              />
            </label>
          </div>
        </section>
      </main>
    </div>
  )
}
