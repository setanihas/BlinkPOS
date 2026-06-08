import type { LabelHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Field({ label, error, required, children, className }: {
  label: string; error?: string; required?: boolean; children: ReactNode; className?: string
}): JSX.Element {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-xs font-medium text-t1 tracking-wide">
        {label}{required && <span className="ml-0.5" style={{ color: 'var(--er)' }}>*</span>}
      </label>
      {children}
      {error && <p className="text-xs font-medium" style={{ color: 'var(--er-t)' }}>{error}</p>}
    </div>
  )
}

export function Label({ className, children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>): JSX.Element {
  return <label className={cn('text-xs font-medium text-t1', className)} {...rest}>{children}</label>
}
