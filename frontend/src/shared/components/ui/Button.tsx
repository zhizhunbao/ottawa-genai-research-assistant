/**
 * Button 组件
 *
 * 基础按钮组件，支持多种变体和尺寸。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React from 'react'
import { cn } from '@/shared/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gold'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, children, disabled, ...props }, ref) => {
    const variants = {
      default: 'bg-ottawa-blue text-white hover:bg-ottawa-blue-dark shadow-md',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-md',
      outline: 'border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      ghost: 'text-slate-600 hover:bg-slate-100',
      link: 'text-ottawa-blue underline-offset-4 px-0',
      gold: 'bg-ottawa-gold text-ottawa-blue hover:brightness-110 shadow-md font-black',
    }

    const sizes = {
      default: 'h-11 px-6 py-2',
      sm: 'h-9 px-3 text-xs',
      lg: 'h-14 px-10 text-lg',
      icon: 'h-10 w-10',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-xl text-sm font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ottawa-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
