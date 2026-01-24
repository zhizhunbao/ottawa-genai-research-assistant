/**
 * Button 组件
 *
 * 遵循 dev-frontend_patterns skill 的类型化组件模式。
 */

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantStyles = {
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-primary)',
  },
  danger: {
    backgroundColor: 'var(--color-error)',
    color: 'white',
    border: 'none',
  },
}

const sizeStyles = {
  sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
  md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
  lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: 'var(--radius-md)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'all 0.2s ease',
        fontWeight: 500,
        ...style,
      }}
      {...props}
    >
      {loading ? '加载中...' : children}
    </button>
  )
}
