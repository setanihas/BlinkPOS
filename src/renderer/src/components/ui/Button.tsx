import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size    = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant
  size?:     Size
  loading?:  boolean
  leftIcon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, leftIcon, style, ...rest }, ref) => {
    const base = 'inline-flex items-center justify-center gap-1.5 font-medium select-none transition-all duration-100 disabled:pointer-events-none disabled:opacity-45 active:scale-[.97]'

    const variants: Record<Variant, { cls: string; style?: React.CSSProperties }> = {
      primary:   { cls: 'text-white border border-transparent', style: { background: 'var(--a0)', boxShadow: '0 1px 2px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.08)' } },
      secondary: { cls: 'text-t0 border', style: { background: 'var(--s2)', borderColor: 'var(--b1)' } },
      ghost:     { cls: 'text-t1 border border-transparent hover:text-t0', style: { background: 'transparent' } },
      danger:    { cls: 'text-white border border-transparent', style: { background: 'var(--er)' } },
      success:   { cls: 'text-white border border-transparent', style: { background: 'var(--ok)' } },
    }

    const sizes: Record<Size, string> = {
      xs: 'h-6 px-2 text-xs rounded-md gap-1',
      sm: 'h-7 px-3 text-sm rounded-md',
      md: 'h-8 px-3.5 text-sm rounded-md',
      lg: 'h-10 px-5 text-base rounded-lg',
    }

    const hoverStyles: Record<Variant, string> = {
      primary:   'hover:opacity-90',
      secondary: 'hover:bg-s3',
      ghost:     'hover:bg-s2',
      danger:    'hover:opacity-90',
      success:   'hover:opacity-90',
    }

    const v = variants[variant]

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, v.cls, sizes[size], hoverStyles[variant], className)}
        style={{ ...v.style, ...style }}
        {...rest}
      >
        {loading
          ? <Loader2 size={13} className="anim-spin shrink-0" />
          : leftIcon && <span className="shrink-0">{leftIcon}</span>
        }
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
