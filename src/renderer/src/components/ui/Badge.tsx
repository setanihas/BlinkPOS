import type { ReactNode } from 'react'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent' | 'info'

const T: Record<Tone, { bg: string; color: string; border: string }> = {
  neutral: { bg: 'var(--s3)',    color: 'var(--t1)',    border: 'var(--b1)' },
  success: { bg: 'var(--ok-bg)', color: 'var(--ok-t)',  border: 'var(--ok-b)' },
  warning: { bg: 'var(--wa-bg)', color: 'var(--wa-t)',  border: 'var(--wa-b)' },
  danger:  { bg: 'var(--er-bg)', color: 'var(--er-t)',  border: 'var(--er-b)' },
  accent:  { bg: 'var(--a-bg)',  color: 'var(--a0)',    border: 'var(--a-ring)' },
  info:    { bg: 'var(--in-bg)', color: 'var(--in-t)',  border: 'var(--in-b)' },
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }): JSX.Element {
  const { bg, color, border } = T[tone]
  return (
    <span className="inline-flex items-center px-1.5 h-[18px] rounded text-2xs font-semibold border tracking-wide"
      style={{ background: bg, color, borderColor: border }}>
      {children}
    </span>
  )
}
