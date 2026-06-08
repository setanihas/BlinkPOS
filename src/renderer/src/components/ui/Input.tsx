import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { invalid?: boolean }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, style, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-8 w-full px-3 text-sm rounded-md border outline-none',
        'transition-shadow duration-150 placeholder:text-t2',
        'focus:ring-2 focus:ring-a-ring',
        invalid
          ? 'border-er text-er-t focus:border-er focus:ring-er-b'
          : 'border-b1 text-t0 focus:border-a0',
        className
      )}
      style={{ background: 'var(--s2)', ...style }}
      {...rest}
    />
  )
)
Input.displayName = 'Input'
