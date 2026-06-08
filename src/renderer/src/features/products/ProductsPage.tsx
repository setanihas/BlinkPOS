import { useMemo, useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Product, ProductQuery, ProductSortField } from '@shared/domain'
import { Topbar } from '../../components/layout/Topbar'
import { PageBody } from '../../components/layout/AppShell'
import {
  Button, Input, Select, Card, Badge,
  Table, THead, TH, TBody, TR, TD,
  Pagination, Spinner, EmptyState, ConfirmDialog
} from '../../components/ui'
import { useDebounce } from '../../hooks/useDebounce'
import { useSettings } from '../../hooks/useSettings'
import { formatMoney } from '../../lib/format'
import { toast } from '../../stores/toastStore'
import { useProducts, useProductCategories, useDeleteProduct } from './hooks'
import { useCategoryStore, useCategories } from '../categories/useCategoryStore'
import { ProductFormModal } from './ProductFormModal'

const PAGE_SIZE = 15
const PALETTE = ['#5d5fef','#7c3aed','#db2777','#b45309','#047857','#0369a1','#c2410c','#4338ca']

function avatarColor(name: string): string {
  let h = 0; for (const c of name) h = (h << 5) - h + c.charCodeAt(0)
  return PALETTE[Math.abs(h) % PALETTE.length]
}
function abbr(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

export default function ProductsPage(): JSX.Element {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const threshold = settings?.lowStockThreshold ?? 5

  const [search,       setSearch]       = useState('')
  const [category,     setCategory]     = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [sortField,    setSortField]    = useState<ProductSortField>('name')
  const [sortDir,      setSortDir]      = useState<'asc'|'desc'>('asc')
  const [page,         setPage]         = useState(1)
  const [formOpen,     setFormOpen]     = useState(false)
  const [editing,      setEditing]      = useState<Product | null>(null)
  const [deleting,     setDeleting]     = useState<Product | null>(null)

  const { mergeFrom } = useCategoryStore()
  const allCategories  = useCategories()
  const { data: apiCats } = useProductCategories()
  useEffect(() => { if (apiCats?.length) mergeFrom(apiCats) }, [apiCats])

  const dSearch = useDebounce(search)
  const query: ProductQuery = useMemo(() => ({
    search: dSearch || undefined, category: category || undefined,
    lowStockOnly: lowStockOnly || undefined,
    sortField, sortDirection: sortDir, page, pageSize: PAGE_SIZE
  }), [dSearch, category, lowStockOnly, sortField, sortDir, page])

  const { data, isLoading } = useProducts(query)
  const deleteMutation      = useDeleteProduct()

  const openEdit   = (p: Product) => { setEditing(p); setFormOpen(true) }
  const openCreate = ()            => { setEditing(null); setFormOpen(true) }

  const confirmDelete = async () => {
    if (!deleting) return
    try { await deleteMutation.mutateAsync(deleting.id); toast.success(t('products.productDeleted')); setDeleting(null) }
    catch (e) { toast.error(e instanceof Error ? e.message : t('products.deleteFailed')) }
  }

  const toggleSort = (f: ProductSortField) => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(f); setSortDir('asc') }
    setPage(1)
  }

  const SH = ({ field, label }: { field: ProductSortField; label: string }) => (
    <button onClick={() => toggleSort(field)}
      className="inline-flex items-center gap-1 font-medium hover:text-t0 transition-colors">
      {label}
      <span className="w-3 inline-block text-center" style={{ color: 'var(--a0)' }}>
        {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </span>
    </button>
  )

  return (
    <>
      <Topbar title={t('nav.products')} subtitle={t('products.subtitle')}
        actions={<Button size="sm" onClick={openCreate} leftIcon={<Plus size={13} />}>{t('products.addProduct')}</Button>}
      />
      <PageBody>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4 px-3 py-2.5 rounded-lg border"
          style={{ background: 'var(--s0)', borderColor: 'var(--b0)' }}>
          <div className="relative flex-1 min-w-52">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-t2" />
            <Input value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('products.searchPlaceholder')} className="pl-8 h-8" />
          </div>
          <Select value={category}
            onChange={e => { setCategory(e.target.value); setPage(1) }}
            className="w-44 h-8">
            <option value="">{t('common.allCategories')}</option>
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <label className="flex items-center gap-1.5 text-sm text-t1 cursor-pointer select-none whitespace-nowrap px-1">
            <input type="checkbox" checked={lowStockOnly}
              onChange={e => { setLowStockOnly(e.target.checked); setPage(1) }}
              className="w-3.5 h-3.5 rounded" style={{ accentColor: 'var(--a0)' }} />
            <AlertTriangle size={12} style={{ color: 'var(--wa-t)' }} />
            {t('products.lowStockOnly')}
          </label>
        </div>

        {isLoading ? <Spinner /> :
         !data || data.items.length === 0 ? (
          <EmptyState icon={<Package size={24} />}
            title={t('products.noProducts')} description={t('products.noProductsDesc')}
            action={<Button size="sm" onClick={openCreate} leftIcon={<Plus size={13} />}>{t('products.addProduct')}</Button>}
          />
        ) : (
          <Card>
            <Table>
              <THead>
                <TH className="w-8" />
                <TH><SH field="name" label={t('products.colProduct')} /></TH>
                <TH>{t('products.colBarcode')}</TH>
                <TH>{t('products.colCategory')}</TH>
                <TH align="right"><SH field="purchasePrice" label="Alış" /></TH>
                <TH align="right"><SH field="salePrice" label={t('products.colPrice')} /></TH>
                <TH align="right"><SH field="stock" label={t('products.colStock')} /></TH>
                <TH className="w-16" />
              </THead>
              <TBody>
                {data.items.map(p => {
                  const st = p.stock === 0 ? 'danger' as const : p.stock <= threshold ? 'warning' as const : 'success' as const
                  const bg = avatarColor(p.name)
                  return (
                    <TR key={p.id}>
                      {/* Avatar with border */}
                      <TD className="py-2 pr-0 pl-3">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold ring-1 ring-black/[0.12]"
                          style={{ background: bg }}>
                          {abbr(p.name)}
                        </div>
                      </TD>
                      <TD className="pl-2">
                        <p className="font-medium text-t0 leading-tight">{p.name}</p>
                        {p.description && <p className="text-xs text-t2 truncate max-w-[180px]">{p.description}</p>}
                      </TD>
                      <TD>
                        <span className="font-mono text-xs text-t1">{p.barcode || '—'}</span>
                      </TD>
                      <TD>
                        {p.category
                          ? <Badge tone="accent">{p.category}</Badge>
                          : <span className="text-t2 text-xs">—</span>
                        }
                      </TD>
                      <TD align="right">
                        <span className="text-sm text-t1 tabnum">{formatMoney(p.purchasePrice)}</span>
                      </TD>
                      <TD align="right">
                        <span className="text-sm font-semibold text-t0 tabnum">{formatMoney(p.salePrice)}</span>
                      </TD>
                      <TD align="right">
                        {p.stock === 0
                          ? <Badge tone="danger">Tükendi</Badge>
                          : p.stock <= threshold
                            ? <Badge tone="warning">{p.stock} kaldı</Badge>
                            : <span className="text-sm text-t0 tabnum">{p.stock}</span>
                        }
                      </TD>
                      <TD align="right">
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={() => openEdit(p)}
                            className="flex items-center justify-center w-7 h-7 rounded text-t2 hover:text-t0 hover:bg-s2 transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleting(p)}
                            className="flex items-center justify-center w-7 h-7 rounded text-t2 hover:text-er-t hover:bg-er-bg transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </TD>
                    </TR>
                  )
                })}
              </TBody>
            </Table>
            <div className="px-3 border-t" style={{ borderColor: 'var(--b0)' }}>
              <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />
            </div>
          </Card>
        )}
      </PageBody>

      <ProductFormModal open={formOpen} onClose={() => setFormOpen(false)} product={editing} />
      <ConfirmDialog open={!!deleting} title={t('products.deleteTitle')}
        message={t('products.deleteMessage', { name: deleting?.name ?? '' })}
        confirmLabel={t('common.delete')} loading={deleteMutation.isPending}
        onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </>
  )
}
