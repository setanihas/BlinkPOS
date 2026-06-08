import { useMemo, useState } from 'react'
import { FileDown, FileText, BarChart3, TrendingUp, Receipt, Package2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ExpenseQuery } from '@shared/domain'
import { Topbar } from '../../components/layout/Topbar'
import { PageBody } from '../../components/layout/AppShell'
import {
  Button, Card, StatCard, Badge,
  Table, THead, TH, TBody, TR, TD,
  Spinner, EmptyState, ErrorState
} from '../../components/ui'
import { DateRangeFilter } from '../../components/common/DateRangeFilter'
import { useDateRangeStore } from '../../stores/dateRangeStore'
import { i18n } from '../../i18n'
import { formatMoney, formatDate } from '../../lib/format'
import { exportCsv, exportPdf } from '../../lib/export'
import { useReport } from '../dashboard/hooks'
import { useExpenses } from '../expenses/hooks'
import { expenseCategoryLabel } from '../expenses/categories'

type ReportTab = 'sales' | 'profit' | 'expense' | 'inventory'

const TABS: { key: ReportTab; labelKey: string; icon: React.ElementType }[] = [
  { key: 'sales',     labelKey: 'reports.tabSales',     icon: BarChart3 },
  { key: 'profit',    labelKey: 'reports.tabProfit',    icon: TrendingUp },
  { key: 'expense',   labelKey: 'reports.tabExpense',   icon: Receipt },
  { key: 'inventory', labelKey: 'reports.tabInventory', icon: Package2 },
]

export default function ReportsPage(): JSX.Element {
  const { t } = useTranslation()
  const { range } = useDateRangeStore()
  const [tab, setTab] = useState<ReportTab>('sales')
  const { data: report, isLoading, isError, refetch } = useReport(range)

  const expenseQuery: ExpenseQuery = useMemo(
    () => ({ from: range.from, to: range.to, page: 1, pageSize: 500 }), [range]
  )
  const { data: expenseData } = useExpenses(expenseQuery)
  const expenses = expenseData?.items ?? []

  const handleExportCsv = () => {
    if (!report) return
    const stamp = new Date().toISOString().slice(0, 10)
    if (tab === 'sales' || tab === 'profit') {
      exportCsv(`${tab}-rapor-${stamp}`, report.topProducts.map(p => ({
        Ürün: p.name, 'Satılan Adet': p.quantitySold,
        Gelir: p.revenue.toFixed(2), Kâr: p.profit.toFixed(2)
      })))
    } else if (tab === 'expense') {
      exportCsv(`gider-rapor-${stamp}`, expenses.map(e => ({
        Başlık: e.title, Kategori: expenseCategoryLabel(e.category),
        Tarih: formatDate(e.createdAt), Tutar: e.amount.toFixed(2)
      })))
    } else {
      exportCsv(`envanter-rapor-${stamp}`, report.inventory.map(r => ({
        Ürün: r.product.name, Barkod: r.product.barcode,
        Stok: r.product.stock, 'Stok Değeri': r.stockValue.toFixed(2),
        'Potansiyel Gelir': r.potentialRevenue.toFixed(2)
      })))
    }
  }

  const handleExportPdf = () => {
    if (!report) return
    const stamp = new Date().toISOString().slice(0, 10)
    if (tab === 'sales' || tab === 'profit') {
      exportPdf(`${tab}-rapor-${stamp}`, tab === 'sales' ? i18n.t('reports.salesReport') : i18n.t('reports.profitReport'), [{
        title: i18n.t('reports.sectionProducts'),
        head: [i18n.t('reports.colProduct'), i18n.t('reports.colUnitsSold'), i18n.t('reports.colRevenue'), i18n.t('reports.colProfit')],
        body: report.topProducts.map(p => [p.name, p.quantitySold, formatMoney(p.revenue), formatMoney(p.profit)])
      }])
    } else if (tab === 'expense') {
      exportPdf(`gider-rapor-${stamp}`, i18n.t('reports.expenseReport'), [{
        title: i18n.t('reports.sectionExpenses'),
        head: [i18n.t('reports.colTitle'), i18n.t('reports.colCategory'), i18n.t('reports.colDate'), i18n.t('reports.colAmount')],
        body: expenses.map(e => [e.title, expenseCategoryLabel(e.category), formatDate(e.createdAt), formatMoney(e.amount)])
      }])
    } else {
      exportPdf(`envanter-rapor-${stamp}`, i18n.t('reports.inventoryReport'), [{
        title: i18n.t('reports.sectionInventory'),
        head: [i18n.t('reports.colProduct'), i18n.t('reports.colBarcode'), i18n.t('reports.colStock'), i18n.t('reports.colStockValue'), i18n.t('reports.colPotentialRevenue')],
        body: report.inventory.map(r => [r.product.name, r.product.barcode, r.product.stock, formatMoney(r.stockValue), formatMoney(r.potentialRevenue)])
      }])
    }
  }

  return (
    <>
      <Topbar title={t('nav.reports')} subtitle={t('reports.subtitle')}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExportCsv} disabled={!report}
              leftIcon={<FileDown size={13} />}>{t('reports.csv')}</Button>
            <Button variant="secondary" size="sm" onClick={handleExportPdf} disabled={!report}
              leftIcon={<FileText size={13} />}>{t('reports.pdf')}</Button>
          </div>
        }
      />
      <PageBody>
        {/* Filters + tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <DateRangeFilter />
          <div className="flex items-center gap-px p-0.5 rounded border"
            style={{ background: 'var(--s1)', borderColor: 'var(--b1)' }}>
            {TABS.map(({ key, labelKey, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className="flex items-center gap-1.5 px-3 h-7 rounded text-xs font-medium transition-all duration-100 whitespace-nowrap"
                style={{
                  background: tab === key ? 'var(--a0)' : 'transparent',
                  color:      tab === key ? '#fff' : 'var(--t1)',
                }}>
                <Icon size={11} />
                {t(labelKey as never)}
              </button>
            ))}
          </div>
        </div>

        {isError ? (
          <ErrorState title={t('common.loadError')} description={t('common.loadErrorDesc')}
            retryLabel={t('common.retry')} onRetry={() => refetch()} />
        ) : isLoading || !report ? (
          <Spinner label={t('reports.building')} />
        ) : (
          <div className="flex flex-col gap-4">
            {/* KPI row */}
            <div className="grid grid-cols-4 gap-3">
              <StatCard label={t('reports.revenue')} value={formatMoney(report.summary.rangeRevenue)}
                icon={<BarChart3 size={13} />} accent tone="info" />
              <StatCard label={t('reports.profit')} value={formatMoney(report.summary.rangeProfit)}
                icon={<TrendingUp size={13} />} accent tone="success" />
              <StatCard label={t('reports.expenses')} value={formatMoney(report.summary.rangeExpenses)}
                icon={<Receipt size={13} />} accent tone="warning" />
              <StatCard label={t('reports.net')} value={formatMoney(report.summary.rangeNet)}
                icon={<TrendingUp size={13} />} accent
                tone={report.summary.rangeNet >= 0 ? 'success' : 'danger'} />
            </div>

            {/* Table */}
            <Card>
              {(tab === 'sales' || tab === 'profit') && (
                report.topProducts.length === 0 ? (
                  <EmptyState title={t('reports.noSalesRange')} />
                ) : (
                  <Table>
                    <THead>
                      <TH>{t('reports.colProduct')}</TH>
                      <TH align="right">{t('reports.colUnitsSold')}</TH>
                      <TH align="right">{t('reports.colRevenue')}</TH>
                      <TH align="right">{tab === 'profit' ? t('reports.colProfit') : t('reports.colAvgPrice')}</TH>
                    </THead>
                    <TBody>
                      {report.topProducts.map((p, i) => (
                        <TR key={p.productId || p.name}>
                          <TD>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-t2 w-5 text-right tabnum">{i + 1}</span>
                              <span className="font-medium text-t0">{p.name}</span>
                            </div>
                          </TD>
                          <TD align="right">
                            <span className="text-t0 tabnum font-medium">{p.quantitySold}</span>
                          </TD>
                          <TD align="right">
                            <span className="text-t0 tabnum">{formatMoney(p.revenue)}</span>
                          </TD>
                          <TD align="right">
                            <span className="font-semibold tabnum" style={{ color: 'var(--ok-t)' }}>
                              {tab === 'profit'
                                ? formatMoney(p.profit)
                                : formatMoney(p.quantitySold ? p.revenue / p.quantitySold : 0)
                              }
                            </span>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                )
              )}

              {tab === 'expense' && (
                expenses.length === 0 ? (
                  <EmptyState title={t('reports.noExpensesRange')} />
                ) : (
                  <Table>
                    <THead>
                      <TH>{t('reports.colTitle')}</TH>
                      <TH>{t('reports.colCategory')}</TH>
                      <TH>{t('reports.colDate')}</TH>
                      <TH align="right">{t('reports.colAmount')}</TH>
                    </THead>
                    <TBody>
                      {expenses.map(e => (
                        <TR key={e.id}>
                          <TD><span className="font-medium text-t0">{e.title}</span></TD>
                          <TD><Badge>{expenseCategoryLabel(e.category)}</Badge></TD>
                          <TD className="text-t1">{formatDate(e.createdAt)}</TD>
                          <TD align="right">
                            <span className="font-semibold tabnum" style={{ color: 'var(--er-t)' }}>
                              {formatMoney(e.amount)}
                            </span>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                )
              )}

              {tab === 'inventory' && (
                <Table>
                  <THead>
                    <TH>{t('reports.colProduct')}</TH>
                    <TH>{t('reports.colBarcode')}</TH>
                    <TH align="right">{t('reports.colStock')}</TH>
                    <TH align="right">{t('reports.colStockValue')}</TH>
                    <TH align="right">{t('reports.colPotentialRevenue')}</TH>
                  </THead>
                  <TBody>
                    {report.inventory.map(row => (
                      <TR key={row.product.id}>
                        <TD><span className="font-medium text-t0">{row.product.name}</span></TD>
                        <TD><span className="font-mono text-xs text-t1">{row.product.barcode || '—'}</span></TD>
                        <TD align="right">
                          {row.product.stock === 0
                            ? <Badge tone="danger">Tükendi</Badge>
                            : <span className="tabnum">{row.product.stock}</span>
                          }
                        </TD>
                        <TD align="right"><span className="tabnum">{formatMoney(row.stockValue)}</span></TD>
                        <TD align="right">
                          <span className="font-semibold tabnum" style={{ color: 'var(--ok-t)' }}>
                            {formatMoney(row.potentialRevenue)}
                          </span>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </Card>
          </div>
        )}
      </PageBody>
    </>
  )
}
