import type { ReactNode } from 'react'
import { Loader2, Inbox, AlertTriangle, RotateCw } from 'lucide-react'

export function Spinner({ label }: { label?: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Loader2 size={20} className="anim-spin" style={{ color: 'var(--a0)' }} />
      {label && <p className="text-sm text-t2">{label}</p>}
    </div>
  )
}

export function EmptyState({ title, description, icon, action }: {
  title: string; description?: string; icon?: ReactNode; action?: ReactNode
}): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center anim-fade">
      <div className="flex items-center justify-center w-14 h-14 rounded-xl"
        style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
        {icon ?? <Inbox size={24} />}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-t0">{title}</p>
        {description && <p className="text-sm text-t2 max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function ErrorState({ title, description, retryLabel, onRetry }: {
  title: string; description?: string; retryLabel?: string; onRetry?: () => void
}): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-xl"
        style={{ background: 'var(--er-bg)', color: 'var(--er-t)' }}>
        <AlertTriangle size={24} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-t0">{title}</p>
        {description && <p className="text-sm text-t2 max-w-xs">{description}</p>}
      </div>
      {onRetry && (
        <button onClick={onRetry}
          className="flex items-center gap-1.5 px-3 h-8 rounded-md border text-sm font-medium text-t1 hover:text-t0 hover:bg-s2 transition-colors"
          style={{ borderColor: 'var(--b1)' }}>
          <RotateCw size={13} /> {retryLabel ?? 'Tekrar dene'}
        </button>
      )}
    </div>
  )
}

export function Skeleton({ h = 16, w, className = '' }: { h?: number; w?: number | string; className?: string }): JSX.Element {
  return <div className={`skeleton rounded-md ${className}`} style={{ height: h, width: w }} />
}

export function SkeletonCard(): JSX.Element {
  return (
    <div className="p-4 rounded-lg border" style={{ background: 'var(--s0)', borderColor: 'var(--b0)' }}>
      <div className="flex justify-between items-start mb-3">
        <Skeleton h={10} w={80} />
        <Skeleton h={24} w={24} className="rounded" />
      </div>
      <Skeleton h={26} w={120} className="mb-2" />
      <Skeleton h={10} w={60} />
    </div>
  )
}
