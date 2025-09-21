import React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-secondary-700 dark:text-secondary-300"
          >
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary-600 dark:bg-secondary-700 dark:text-white dark:placeholder:text-secondary-500',
            error && 'border-error-500 focus:ring-error-500',
            className
          )}
          ref={ref}
          id={textareaId}
          {...props}
        />
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
Textarea.displayName = 'Textarea'

export { Textarea }
