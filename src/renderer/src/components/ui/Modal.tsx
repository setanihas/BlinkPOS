import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

const sizes: Record<string, number> = { xs: 360, sm: 480, md: 560, lg: 700, xl: 880 }

export function Modal({ open, onClose, title, children, footer, size = 'md', noPad }: {
  open: boolean; onClose: () => void; title: string;
  children: ReactNode; footer?: ReactNode; size?: string; noPad?: boolean
}): JSX.Element | null {
  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 anim-fade"
      style={{ background: 'var(--scrim)', backdropFilter: 'blur(6px)' }}
      onMouseDown={onClose}>
      <div
        className="relative w-full flex flex-col rounded-xl border overflow-hidden anim-modal"
        style={{ maxWidth: sizes[size] ?? 560, maxHeight: '90vh', background: 'var(--s0)', borderColor: 'var(--b1)', boxShadow: 'var(--sh5)' }}
        onMouseDown={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0"
            style={{ borderColor: 'var(--b0)' }}>
            <h2 className="text-sm font-semibold text-t0">{title}</h2>
            <button onClick={onClose}
              className="flex items-center justify-center w-6 h-6 rounded text-t2 hover:text-t0 hover:bg-s2 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}
        <div className={cn('flex-1 overflow-y-auto', !noPad && 'px-5 py-4')}>{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t shrink-0"
            style={{ borderColor: 'var(--b0)', background: 'var(--s1)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
