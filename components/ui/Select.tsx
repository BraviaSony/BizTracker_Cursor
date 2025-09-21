import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-secondary-700 dark:text-secondary-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              'flex h-10 w-full appearance-none rounded-md border border-secondary-300 bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary-600 dark:bg-secondary-700 dark:text-white',
              error && 'border-error-500 focus:ring-error-500',
              className
            )}
            ref={ref}
            id={selectId}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400 pointer-events-none" />
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
Select.displayName = 'Select'

export { Select }
