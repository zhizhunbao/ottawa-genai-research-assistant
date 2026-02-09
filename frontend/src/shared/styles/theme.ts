/**
 * Design System - 设计系统常量
 *
 * 这是设计系统的文档和 TypeScript 类型定义。
 * 实际样式在 tailwind.config.js 中定义。
 * 组件使用 Tailwind 类名，如 `bg-brand-primary`。
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

// ============================================================================
// 品牌颜色 - 与 tailwind.config.js 保持同步
// ============================================================================

/**
 * 品牌颜色值
 * 使用方式: className="bg-brand-primary text-white"
 */
export const brandColors = {
  /** Ottawa 政府蓝 - 主色 */
  primary: '#004890',
  /** 浅蓝 - 悬停/强调 */
  primaryLight: '#0066cc',
  /** 深蓝 - 按下状态 */
  primaryDark: '#003366',
  /** 次要色 - 紫色渐变 */
  secondary: '#667eea',
  /** 次要浅色 */
  secondaryLight: '#764ba2',
} as const

/**
 * 金色强调
 * 使用方式: className="text-gold"
 */
export const goldColors = {
  DEFAULT: '#ffd700',
  light: '#ffe44d',
  dark: '#ffb000',
} as const

// ============================================================================
// Tailwind 类名常量 - 避免硬编码
// ============================================================================

/**
 * 按钮样式预设
 * 使用方式: className={buttonStyles.primary}
 */
export const buttonStyles = {
  // 基础样式
  base: 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',

  // 尺寸
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-base rounded-lg',

  // 变体
  primary: 'bg-brand-primary text-white hover:bg-brand-primary-light focus:ring-brand-primary shadow-brand',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-brand-primary',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',

  // 组合示例
  primaryMd: 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm rounded-lg bg-brand-primary text-white hover:bg-brand-primary-light focus:ring-brand-primary shadow-brand',
} as const

/**
 * 输入框样式预设
 * 使用方式: className={inputStyles.default}
 */
export const inputStyles = {
  base: 'w-full rounded-lg border transition-colors focus:outline-none focus:ring-2',
  default: 'w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-primary focus:ring-brand-primary/20 transition-colors focus:outline-none focus:ring-2',
  error: 'w-full px-4 py-2 rounded-lg border border-red-500 focus:border-red-500 focus:ring-red-500/20 transition-colors focus:outline-none focus:ring-2',
} as const

/**
 * 卡片样式预设
 * 使用方式: className={cardStyles.default}
 */
export const cardStyles = {
  default: 'bg-white rounded-xl shadow-card overflow-hidden',
  elevated: 'bg-white rounded-xl shadow-lg overflow-hidden',
  outlined: 'bg-white rounded-xl border border-gray-200 overflow-hidden',
} as const

/**
 * 布局常量
 */
export const layout = {
  headerHeight: 'h-16',      // 64px
  sidebarWidth: 'w-64',      // 256px
  containerMax: 'max-w-7xl', // 1280px
  containerPadding: 'px-4 sm:px-6 lg:px-8',
} as const

/**
 * 文字样式
 */
export const textStyles = {
  // 标题
  h1: 'text-4xl font-bold text-gray-900',
  h2: 'text-3xl font-bold text-gray-900',
  h3: 'text-2xl font-semibold text-gray-900',
  h4: 'text-xl font-semibold text-gray-900',

  // 正文
  body: 'text-base text-gray-700',
  bodySmall: 'text-sm text-gray-600',
  caption: 'text-xs text-gray-500',

  // 链接
  link: 'text-brand-primary hover:text-brand-primary-light transition-colors',
} as const

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 合并多个类名
 * 使用方式: cn(buttonStyles.base, buttonStyles.md, buttonStyles.primary)
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ============================================================================
// 类型导出
// ============================================================================

export type ButtonVariant = keyof typeof buttonStyles
export type CardVariant = keyof typeof cardStyles
