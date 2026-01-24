/**
 * 设置模块常量
 *
 * 定义设置相关的常量。
 * 遵循 dev-frontend_patterns skill 规范。
 */

/**
 * 语言选项
 */
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
] as const

/**
 * 主题选项
 */
export const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const
