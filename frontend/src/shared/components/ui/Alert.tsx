/**
 * Alert 组件
 *
 * 用于显示各类提示信息的告警组件。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React from 'react'
import { cn } from '@/shared/utils/cn'

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'destructive' | 'success' | 'warning' }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      'relative w-full rounded-2xl border p-5 [&>svg~*]:pl-8 [&>svg]:absolute [&>svg]:left-5 [&>svg]:top-5 [&>svg]:text-slate-900',
      variant === 'default' && 'bg-slate-50 text-slate-900 border-slate-200',
      variant === 'destructive' && 'border-red-500/50 text-red-700 bg-red-50 [&>svg]:text-red-700',
      variant === 'success' && 'border-emerald-500/50 text-emerald-700 bg-emerald-50 [&>svg]:text-emerald-700',
      variant === 'warning' && 'border-amber-500/50 text-amber-700 bg-amber-50 [&>svg]:text-amber-700',
      className
    )}
    {...props}
  />
))
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-bold leading-none tracking-tight text-lg', className)}
    {...props}
  />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed font-medium opacity-90', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
