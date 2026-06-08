import { createPortal } from 'react-dom'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../../stores/toastStore'

const cfg = {
  success: { Icon: CheckCircle2, color: 'var(--ok-t)',  bg: 'var(--ok-bg)',  border: 'var(--ok-b)' },
  error:   { Icon: XCircle,      color: 'var(--er-t)',  bg: 'var(--er-bg)',  border: 'var(--er-b)' },
  info:    { Icon: Info,         color: 'var(--a0)',    bg: 'var(--a-bg)',   border: 'var(--a-ring)' },
}

export function Toaster(): JSX.Element {
  const { toasts, dismiss } = useToastStore()
  return createPortal(
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 340 }}>
      {toasts.map(t => {
        const type = (t.type ?? 'info') as keyof typeof cfg
        const { Icon, color, border } = cfg[type]
        return (
          <div key={t.id}
            className="flex items-start gap-2.5 pl-3 pr-2 py-2.5 rounded-lg border pointer-events-auto anim-right"
            style={{ background: 'var(--s1)', borderColor: border, boxShadow: 'var(--sh3)' }}>
            <Icon size={14} className="shrink-0 mt-0.5" style={{ color }} />
            <span className="flex-1 text-sm text-t0 leading-snug">{t.message}</span>
            <button onClick={() => dismiss(t.id)}
              className="shrink-0 text-t2 hover:text-t1 transition-colors p-0.5 rounded">
              <X size={12} />
            </button>
          </div>
        )
      })}
    </div>,
    document.body
  )
}
