import type { ReactNode } from 'react'
import { ThemeToggle } from './ThemeToggle'

export function Topbar({ title, subtitle, actions }: {
  title: string; subtitle?: string; actions?: ReactNode
}): JSX.Element {
  return (
    <header className="drag shrink-0 flex items-center justify-between px-5 border-b"
      style={{ height: 48, background: 'var(--nav-blur)', backdropFilter: 'blur(12px)', borderColor: 'var(--b0)' }}>
      <div className="no-drag flex flex-col justify-center">
        <p className="text-sm font-semibold text-t0 leading-tight">{title}</p>
        {subtitle && <p className="text-xs text-t2">{subtitle}</p>}
      </div>
      <div className="no-drag flex items-center gap-2">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  )
}
