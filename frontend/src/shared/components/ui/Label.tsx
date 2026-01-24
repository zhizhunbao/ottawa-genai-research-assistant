/**
 * Label 组件
 *
 * 表单标签组件。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React from 'react'
import { cn } from '@/shared/utils/cn'

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 mb-2 block',
        className
      )}
      {...props}
    />
  )
)
Label.displayName = 'Label'

export { Label }
