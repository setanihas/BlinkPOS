import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { invalid?: boolean }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...rest }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-8 w-full px-3 text-sm rounded-md border outline-none cursor-pointer',
        'transition-shadow duration-150',
        'focus:ring-2 focus:ring-a-ring',
        invalid ? 'border-er text-er-t focus:border-er' : 'border-b1 text-t0 focus:border-a0',
        className
      )}
      style={{ background: 'var(--s2)' }}
      {...rest}
    >
      {children}
    </select>
  )
)
Select.displayName = 'Select'
