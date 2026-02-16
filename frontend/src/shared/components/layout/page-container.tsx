/**
 * PageContainer - Standardized page content wrapper with max-width and padding
 *
 * @module shared/components/layout
 * @template none
 * @reference none
 */
import { ReactNode } from 'react'

interface PageContainerProps {
  /** 子元素 */
  children: ReactNode
  /** 页面标题（可选，用于页面顶部） */
  title?: string
  /** 页面描述（可选，显示在标题下方） */
  description?: string
  /** 最大宽度类名 */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'
  /** 是否全高度 */
  fullHeight?: boolean
  /** 自定义类名 */
  className?: string
  /** 内边距大小 */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
}

const paddingClasses = {
  none: '',
  sm: 'px-4 py-4',
  md: 'px-6 py-6',
  lg: 'px-8 py-8',
}

export function PageContainer({
  children,
  title,
  description,
  maxWidth = '7xl',
  fullHeight = false,
  className = '',
  padding = 'md',
}: PageContainerProps) {
  return (
    <div
      className={`
        ${maxWidthClasses[maxWidth]}
        mx-auto
        ${paddingClasses[padding]}
        ${fullHeight ? 'min-h-[calc(100vh-4rem)]' : ''}
        ${className}
      `}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          )}
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
