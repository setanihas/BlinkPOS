import type { ReactNode } from 'react'

export function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }): JSX.Element {
  return (
    <div className="rounded-lg border" style={{ background: 'var(--s0)', borderColor: 'var(--b0)' }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--b0)' }}>
        <p className="text-sm font-semibold text-t0">{title}</p>
        {subtitle && <p className="text-xs text-t2 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
