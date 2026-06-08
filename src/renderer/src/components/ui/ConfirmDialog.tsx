import { Trash2, AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({ open, title, message, confirmLabel = 'Sil', loading, onConfirm, onCancel, variant = 'danger' }: {
  open: boolean; title: string; message: string; confirmLabel?: string;
  loading?: boolean; onConfirm: () => void; onCancel: () => void; variant?: 'danger' | 'warning'
}): JSX.Element {
  const icon = variant === 'danger'
    ? <Trash2 size={20} />
    : <AlertTriangle size={20} />

  return (
    <Modal open={open} onClose={onCancel} title="" size="xs"
      footer={<>
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>İptal</Button>
        <Button variant={variant === 'danger' ? 'danger' : 'secondary'} size="sm" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </>}
    >
      <div className="flex flex-col items-center gap-3 pt-2 pb-1 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg"
          style={{ background: variant === 'danger' ? 'var(--er-bg)' : 'var(--wa-bg)', color: variant === 'danger' ? 'var(--er-t)' : 'var(--wa-t)' }}>
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-t0">{title}</p>
          <p className="text-sm text-t1">{message}</p>
        </div>
      </div>
    </Modal>
  )
}
