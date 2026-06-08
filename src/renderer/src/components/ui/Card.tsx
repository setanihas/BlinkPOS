import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, children, style, ...rest }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div className={cn('rounded-lg border', className)}
      style={{ background: 'var(--s0)', borderColor: 'var(--b0)', ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  label:  string
  value:  ReactNode
  sub?:   ReactNode
  icon?:  ReactNode
  accent?: boolean
  tone?:  'default' | 'success' | 'danger' | 'warning' | 'info'
}

const tonePalette = {
  default: { color: 'var(--t0)',    icon: { bg: 'var(--s2)',    color: 'var(--t2)' } },
  success: { color: 'var(--ok-t)',  icon: { bg: 'var(--ok-bg)', color: 'var(--ok-t)' } },
  danger:  { color: 'var(--er-t)',  icon: { bg: 'var(--er-bg)', color: 'var(--er-t)' } },
  warning: { color: 'var(--wa-t)',  icon: { bg: 'var(--wa-bg)', color: 'var(--wa-t)' } },
  info:    { color: 'var(--in-t)',  icon: { bg: 'var(--in-bg)', color: 'var(--in-t)' } },
}

export function StatCard({ label, value, sub, icon, accent, tone = 'default' }: StatCardProps): JSX.Element {
  const p = tonePalette[tone]
  return (
    <div className="flex flex-col gap-2.5 p-4 rounded-lg border transition-shadow hover:shadow-2"
      style={{
        background: accent ? 'linear-gradient(135deg,var(--s0),var(--s1))' : 'var(--s0)',
        borderColor: 'var(--b0)',
      }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-t1 tracking-wide">{label}</span>
        {icon && (
          <span className="flex items-center justify-center w-6 h-6 rounded"
            style={{ background: p.icon.bg, color: p.icon.color }}>
            {icon}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold leading-none tabnum" style={{ color: p.color }}>{value}</p>
      {sub && <p className="text-xs text-t2 leading-none">{sub}</p>}
    </div>
  )
}
