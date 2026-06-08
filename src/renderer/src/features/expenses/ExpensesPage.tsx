import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Receipt, TrendingDown, ArrowDownRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Expense, ExpenseCategory, ExpenseQuery } from '@shared/domain'
import { Topbar } from '../../components/layout/Topbar'
import { PageBody } from '../../components/layout/AppShell'
import {
  Button, Select, Card, StatCard, Badge,
  Table, THead, TH, TBody, TR, TD,
  Pagination, Spinner, EmptyState, ConfirmDialog
} from '../../components/ui'
import { DateRangeFilter } from '../../components/common/DateRangeFilter'
import { useDateRangeStore } from '../../stores/dateRangeStore'
import { formatMoney, formatDate } from '../../lib/format'
import { toast } from '../../stores/toastStore'
import { EXPENSE_CATEGORY_VALUES, expenseCategoryLabel } from './categories'
import { useExpenses, useDeleteExpense } from './hooks'
import { ExpenseFormModal } from './ExpenseFormModal'

const PAGE_SIZE = 15

export default function ExpensesPage(): JSX.Element {
  const { t } = useTranslation()
  const { range } = useDateRangeStore()
  const [category, setCategory] = useState<ExpenseCategory | ''>('')
  const [page,     setPage]     = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing,  setEditing]  = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState<Expense | null>(null)

  const query: ExpenseQuery = useMemo(
    () => ({ from: range.from, to: range.to, category: category || undefined, page, pageSize: PAGE_SIZE }),
    [range, category, page]
  )
  const { data, isLoading } = useExpenses(query)
  const deleteMutation      = useDeleteExpense()

  const items = data?.items ?? []
  const total = useMemo(() => items.reduce((s, e) => s + e.amount, 0), [items])
  const avg   = items.length ? total / items.length : 0
  const max   = items.length ? Math.max(...items.map(e => e.amount)) : 0

  const confirmDelete = async () => {
    if (!deleting) return
    try { await deleteMutation.mutateAsync(deleting.id); toast.success(t('expenses.expenseDeleted')); setDeleting(null) }
    catch (e) { toast.error(e instanceof Error ? e.message : t('expenses.deleteFailed')) }
  }

  return (
    <>
      <Topbar title={t('nav.expenses')} subtitle={t('expenses.subtitle')}
        actions={
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true) }} leftIcon={<Plus size={13} />}>
            {t('expenses.addExpense')}
          </Button>
        }
      />
      <PageBody>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-lg border"
          style={{ background: 'var(--s0)', borderColor: 'var(--b0)' }}>
          <DateRangeFilter />
          <Select value={category} onChange={e => { setCategory(e.target.value as ExpenseCategory | ''); setPage(1) }} className="w-44 ml-auto">
            <option value="">{t('common.allCategories')}</option>
            {EXPENSE_CATEGORY_VALUES.map(c => <option key={c} value={c}>{expenseCategoryLabel(c)}</option>)}
          </Select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatCard label="Dönem Toplamı" value={formatMoney(total)}
            sub={`${data?.total ?? 0} kayıt`} icon={<TrendingDown size={13} />} accent tone="danger" />
          <StatCard label="Kayıt Ortalaması" value={formatMoney(avg)} sub="Ortalama tutar" icon={<Receipt size={13} />} />
          <StatCard label="En Yüksek" value={formatMoney(max)} sub="Tek kayıt" icon={<ArrowDownRight size={13} />} />
        </div>

        {/* Table */}
        {isLoading ? (
          <Spinner />
        ) : !data || data.items.length === 0 ? (
          <EmptyState icon={<Receipt size={24} />} title={t('expenses.noExpenses')} description={t('expenses.noExpensesDesc')} />
        ) : (
          <Card>
            <Table>
              <THead>
                <TH>{t('expenses.colTitle')}</TH>
                <TH>{t('expenses.colCategory')}</TH>
                <TH>{t('expenses.colDate')}</TH>
                <TH align="right">{t('expenses.colAmount')}</TH>
                <TH align="right" />
              </THead>
              <TBody>
                {data.items.map(e => (
                  <TR key={e.id}>
                    <TD>
                      <p className="font-medium text-t0">{e.title}</p>
                      {e.description && <p className="text-xs text-t2 truncate max-w-xs">{e.description}</p>}
                    </TD>
                    <TD><Badge>{expenseCategoryLabel(e.category)}</Badge></TD>
                    <TD className="text-t1">{formatDate(e.createdAt)}</TD>
                    <TD align="right">
                      <span className="font-semibold tabnum" style={{ color: 'var(--er-t)' }}>{formatMoney(e.amount)}</span>
                    </TD>
                    <TD align="right">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => { setEditing(e); setFormOpen(true) }}
                          className="flex items-center justify-center w-7 h-7 rounded text-t2 hover:text-t0 hover:bg-s2 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleting(e)}
                          className="flex items-center justify-center w-7 h-7 rounded text-t2 hover:text-er-t hover:bg-er-bg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <div className="px-4 border-t" style={{ borderColor: 'var(--b0)' }}>
              <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />
            </div>
          </Card>
        )}
      </PageBody>

      <ExpenseFormModal open={formOpen} onClose={() => setFormOpen(false)} expense={editing} />
      <ConfirmDialog open={!!deleting} title={t('expenses.deleteTitle')}
        message={t('expenses.deleteMessage', { title: deleting?.title ?? '' })}
        confirmLabel={t('common.delete')} loading={deleteMutation.isPending}
        onConfirm={confirmDelete} onCancel={() => setDeleting(null)}
      />
    </>
  )
}
