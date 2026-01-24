/**
 * 设置视图
 *
 * 视图层只组合组件和调用 Hooks。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { SettingsPage } from '@/features/settings/components/SettingsPage'
import { useSettings } from '@/features/settings/hooks/useSettings'

export default function SettingsView() {
  const {
    profile,
    preferences,
    isLoading,
    isSaving,
    error,
    saveSuccess,
    handleLanguageChange,
    handleThemeChange,
    handleEmailNotificationChange,
    handleBrowserNotificationChange,
  } = useSettings()

  return (
    <SettingsPage
      profile={profile}
      preferences={preferences}
      isLoading={isLoading}
      isSaving={isSaving}
      error={error}
      saveSuccess={saveSuccess}
      onLanguageChange={handleLanguageChange}
      onThemeChange={handleThemeChange}
      onEmailNotificationChange={handleEmailNotificationChange}
      onBrowserNotificationChange={handleBrowserNotificationChange}
    />
  )
}
