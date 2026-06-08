import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import {
  TrendingUp, DollarSign, ShoppingBag, Wallet,
  ArrowUpRight, ScanLine, Plus, Receipt,
  BarChart3, Trophy, AlertTriangle, Package, ArrowRight
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Topbar } from '../../components/layout/Topbar'
import { PageBody } from '../../components/layout/AppShell'
import { StatCard, Card, Badge, SkeletonCard, ErrorState } from '../../components/ui'
import { DateRangeFilter } from '../../components/common/DateRangeFilter'
import { useDateRangeStore } from '../../stores/dateRangeStore'
import { formatMoney } from '../../lib/format'
import { useDashboard } from './hooks'
import { ChartCard } from './ChartCard'
import {
  RevenueTrendChart, ProfitTrendChart,
  TopProductsChart, ExpenseBreakdownChart, StockMovementChart
} from './charts'

export default function DashboardPage(): JSX.Element {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { range } = useDateRangeStore()
  const { data, isLoading, isError, refetch } = useDashboard(range)

  const netColor = useMemo(() => {
    if (!data) return 'default' as const
    return data.summary.rangeNet >= 0 ? 'success' as const : 'danger' as const
  }, [data])

  return (
    <>
      <Topbar title={t('nav.dashboard')} subtitle={t('dashboard.subtitle')} />
      <PageBody>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {[
            { Icon: ScanLine,  label: 'Satış Yap',   path: '/pos',      accent: true },
            { Icon: Plus,      label: 'Ürün Ekle',   path: '/products' },
            { Icon: Receipt,   label: 'Gider Ekle',  path: '/expenses' },
            { Icon: BarChart3, label: 'Raporlar',    path: '/reports' },
          ].map(({ Icon, label, path, accent }) => (
            <button key={path} onClick={() => nav(path)}
              className="flex items-center gap-2 h-8 px-3 rounded-md border text-sm font-medium transition-all duration-100 hover:bg-s2 active:scale-[.97]"
              style={{
                background: accent ? 'var(--a0)' : 'var(--s1)',
                borderColor: accent ? 'transparent' : 'var(--b1)',
                color: accent ? '#fff' : 'var(--t1)',
                boxShadow: accent ? '0 1px 3px rgba(93,95,239,.3)' : 'none',
              }}>
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <div className="flex items-center justify-between mb-5">
          <DateRangeFilter />
        </div>

        {isError ? (
          <ErrorState title={t('common.loadError')} description={t('common.loadErrorDesc')}
            retryLabel={t('common.retry')} onRetry={() => refetch()} />
        ) : isLoading || !data ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_,i) => <SkeletonCard key={i} />)}</div>
            <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_,i) => <SkeletonCard key={i} />)}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">

            {/* Period quick stats */}
            <section>
              <SectionTitle>Dönemsel Ciro</SectionTitle>
              <div className="grid grid-cols-4 gap-3">
                <StatCard label="Bugün"    value={formatMoney(data.summary.todayRevenue)}   icon={<DollarSign size={13} />} />
                <StatCard label="Bu Hafta" value={formatMoney(data.summary.weekRevenue)}    icon={<DollarSign size={13} />} />
                <StatCard label="Bu Ay"    value={formatMoney(data.summary.monthRevenue)}   icon={<DollarSign size={13} />} />
                <StatCard label="Bu Yıl"   value={formatMoney(data.summary.yearRevenue)}    icon={<DollarSign size={13} />} />
              </div>
            </section>

            {/* Range KPIs */}
            <section>
              <SectionTitle>Seçili Dönem</SectionTitle>
              <div className="grid grid-cols-4 gap-3">
                <StatCard label="Ciro" value={formatMoney(data.summary.rangeRevenue)}
                  sub={`${data.summary.salesCount} satış`}
                  icon={<ShoppingBag size={13} />} accent tone="info" />
                <StatCard label="Brüt Kâr" value={formatMoney(data.summary.rangeProfit)}
                  sub="Maliyetten sonra"
                  icon={<TrendingUp size={13} />} accent tone="success" />
                <StatCard label="Giderler" value={formatMoney(data.summary.rangeExpenses)}
                  sub="Toplam gider"
                  icon={<Wallet size={13} />} accent tone="warning" />
                <StatCard label="Net Kâr" value={formatMoney(data.summary.rangeNet)}
                  sub="Kâr − Giderler"
                  icon={<ArrowUpRight size={13} />} accent tone={netColor} />
              </div>
            </section>

            {/* Trend charts */}
            <div className="grid grid-cols-2 gap-4">
              <ChartCard title="Gelir Eğilimi" subtitle="Seçili dönem geliri">
                {data.revenueTrend.length ? <RevenueTrendChart data={data.revenueTrend} /> : <NoData />}
              </ChartCard>
              <ChartCard title="Kâr Eğilimi" subtitle="Seçili dönem kârı">
                {data.revenueTrend.length ? <ProfitTrendChart data={data.revenueTrend} /> : <NoData />}
              </ChartCard>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ChartCard title="En Çok Satanlar" subtitle="Adet bazında sıralama">
                {data.topProducts.length ? <TopProductsChart data={data.topProducts} /> : <NoData />}
              </ChartCard>
              <ChartCard title="Gider Dağılımı" subtitle="Kategoriye göre">
                {data.expenseBreakdown.length ? <ExpenseBreakdownChart data={data.expenseBreakdown} /> : <NoData />}
              </ChartCard>
            </div>

            <ChartCard title="Stok Hareketi" subtitle="Günlük satılan adet">
              {data.stockMovement.length ? <StockMovementChart data={data.stockMovement} /> : <NoData />}
            </ChartCard>

            {/* Bottom tables */}
            <div className="grid grid-cols-2 gap-4">
              {/* Best sellers list */}
              <Card>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--b0)' }}>
                  <div className="flex items-center gap-2">
                    <Trophy size={14} style={{ color: 'var(--wa-t)' }} />
                    <p className="text-sm font-semibold text-t0">En Çok Satanlar</p>
                  </div>
                  <button onClick={() => nav('/reports')} className="flex items-center gap-1 text-xs text-t2 hover:text-t0 transition-colors">
                    Rapor <ArrowRight size={11} />
                  </button>
                </div>
                {data.topProducts.length === 0 ? (
                  <p className="text-sm text-t2 text-center py-8">Veri yok</p>
                ) : (
                  <div className="px-1 py-1">
                    {data.topProducts.slice(0, 6).map((p, i) => (
                      <div key={p.productId || p.name}
                        className="flex items-center justify-between px-3 py-2 rounded hover:bg-s1 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex items-center justify-center w-5 h-5 rounded text-2xs font-bold shrink-0"
                            style={{ background: i === 0 ? 'var(--wa-bg)' : 'var(--s2)', color: i === 0 ? 'var(--wa-t)' : 'var(--t2)' }}>
                            {i + 1}
                          </span>
                          <span className="text-sm text-t0 truncate">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-t2">{p.quantitySold} adet</span>
                          <span className="text-sm font-semibold text-t0 tabnum">{formatMoney(p.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Low stock */}
              <Card>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--b0)' }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} style={{ color: 'var(--wa-t)' }} />
                    <p className="text-sm font-semibold text-t0">Düşük Stok</p>
                  </div>
                  <button onClick={() => nav('/products')} className="flex items-center gap-1 text-xs text-t2 hover:text-t0 transition-colors">
                    Envanter <ArrowRight size={11} />
                  </button>
                </div>
                {data.lowStockProducts.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <Package size={18} style={{ color: 'var(--ok-t)' }} />
                    <p className="text-sm text-t2">Stok seviyeleri normal</p>
                  </div>
                ) : (
                  <div className="px-1 py-1">
                    {data.lowStockProducts.slice(0, 6).map(p => (
                      <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded hover:bg-s1 transition-colors">
                        <span className="text-sm text-t0 truncate flex-1">{p.name}</span>
                        <Badge tone={p.stock === 0 ? 'danger' : 'warning'}>
                          {p.stock === 0 ? 'Tükendi' : `${p.stock} kaldı`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </PageBody>
    </>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }): JSX.Element {
  return <p className="text-2xs font-semibold text-t2 uppercase tracking-widest mb-2">{children}</p>
}

function NoData(): JSX.Element {
  return (
    <div className="h-56 flex items-center justify-center">
      <p className="text-sm text-t2">Bu dönem için veri yok</p>
    </div>
  )
}
