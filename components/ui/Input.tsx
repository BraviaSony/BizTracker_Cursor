import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, icon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-secondary-700 dark:text-secondary-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary-600 dark:bg-secondary-700 dark:text-white dark:placeholder:text-secondary-500',
              icon && 'pl-9',
              error && 'border-error-500 focus:ring-error-500',
              className
            )}
            ref={ref}
            id={inputId}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-secondary-500 dark:text-secondary-400">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
