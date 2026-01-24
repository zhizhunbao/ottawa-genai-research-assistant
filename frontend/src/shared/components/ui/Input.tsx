/**
 * Input 组件
 *
 * 遵循 dev-frontend_patterns skill 的类型化组件模式。
 */

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, style, ...props }, ref) => {
    return (
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        {label && (
          <label
            style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              fontWeight: 500,
              color: 'var(--color-text)',
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          style={{
            width: '100%',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            ...style,
          }}
          {...props}
        />
        {error && (
          <span
            style={{
              display: 'block',
              marginTop: 'var(--spacing-xs)',
              fontSize: '0.875rem',
              color: 'var(--color-error)',
            }}
          >
            {error}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
