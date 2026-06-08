import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function Pagination({ page, pageSize, total, onPageChange }: {
  page: number; pageSize: number; total: number; onPageChange: (p: number) => void
}): JSX.Element | null {
  const { t } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (total === 0) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  const btn = 'flex items-center justify-center w-6 h-6 rounded border text-t2 hover:text-t0 hover:bg-s2 transition-colors disabled:opacity-30 disabled:pointer-events-none'

  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-xs text-t2">{t('pagination.showing', { from, to, total })}</span>
      <div className="flex items-center gap-1.5">
        <button className={btn} style={{ borderColor: 'var(--b1)' }} disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={12} /></button>
        <span className="text-xs font-medium text-t1 tabnum px-1">{page} / {totalPages}</span>
        <button className={btn} style={{ borderColor: 'var(--b1)' }} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight size={12} /></button>
      </div>
    </div>
  )
}
