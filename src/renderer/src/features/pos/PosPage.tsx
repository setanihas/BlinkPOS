import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import {
  ScanLine, ShoppingCart, X, Check, Search,
  Banknote, CreditCard, Delete, Plus, Zap,
  ChevronRight, ReceiptText
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Product } from '@shared/domain'
import { Topbar } from '../../components/layout/Topbar'
import { Button, Input, EmptyState, Modal, Badge } from '../../components/ui'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useCartStore, computeCartTotals } from '../../stores/cartStore'
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner'
import { useSettings } from '../../hooks/useSettings'
import { formatMoney } from '../../lib/format'
import { toast } from '../../stores/toastStore'
import { api } from '../../api/factory'
import { CartItem } from './CartItem'
import { useCreateSale } from './hooks'
import { ProductFormModal } from '../products/ProductFormModal'

type PayMethod = 'cash' | 'card'

/* ── Numpad ──────────────────────────────────────────────── */
function Numpad({ value, onChange }: { value: string; onChange: (v: string) => void }): JSX.Element {
  const KEYS = ['7','8','9','4','5','6','1','2','3','00','0','.']

  const press = (k: string) => {
    if (k === '.' && value.includes('.')) return
    if (k === '.' && value === '') { onChange('0.'); return }
    const next = value === '0' && k !== '.' ? k : value + k
    if ((next.split('.')[1]?.length ?? 0) > 2) return
    onChange(next.replace(/^0+([1-9])/, '$1'))
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {KEYS.map(k => (
        <button key={k} type="button" onClick={() => press(k)}
          className="numkey h-10 rounded-md border text-sm font-semibold text-t0 tabnum hover:bg-s3 transition-colors"
          style={{ background: 'var(--s2)', borderColor: 'var(--b1)' }}>
          {k}
        </button>
      ))}
      <button type="button" onClick={() => onChange(value.slice(0, -1))}
        className="numkey col-span-3 h-8 rounded-md border text-xs font-medium text-t1 hover:bg-s3 flex items-center justify-center gap-1.5 transition-colors"
        style={{ background: 'var(--s2)', borderColor: 'var(--b1)' }}>
        <Delete size={13} /> Sil
      </button>
    </div>
  )
}

/* ── Product search modal ────────────────────────────────── */
function SearchModal({ open, onClose, onSelect }: {
  open: boolean; onClose: () => void; onSelect: (p: Product) => void
}): JSX.Element {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) { setQ(''); setResults([]); setTimeout(() => ref.current?.focus(), 60) }
  }, [open])

  useEffect(() => {
    if (!open || !q.trim()) { setResults([]); return }
    setLoading(true)
    const id = setTimeout(async () => {
      try { const r = await api.product.list({ search: q.trim(), pageSize: 20 }); setResults(r.items) }
      catch { setResults([]) }
      finally { setLoading(false) }
    }, 220)
    return () => clearTimeout(id)
  }, [q, open])

  return (
    <Modal open={open} onClose={onClose} title={t('pos.searchProduct')} size="sm">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-t2" />
          <input ref={ref} value={q} onChange={e => setQ(e.target.value)}
            placeholder={t('pos.searchByName')}
            className="h-8 w-full pl-8 pr-3 rounded-md border text-sm text-t0 placeholder:text-t2 outline-none transition-shadow focus:ring-2 focus:ring-a-ring focus:border-a0"
            style={{ background: 'var(--s2)', borderColor: 'var(--b1)' }}
          />
        </div>
        <div className="flex flex-col max-h-72 overflow-y-auto -mx-5 px-2">
          {loading && <p className="text-xs text-t2 text-center py-8">{t('common.loading')}</p>}
          {!loading && q.trim() && results.length === 0 && (
            <p className="text-xs text-t2 text-center py-8">{t('pos.noResults')}</p>
          )}
          {results.map(p => (
            <button key={p.id} onClick={() => onSelect(p)}
              className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-s2 transition-colors text-left">
              <div className="min-w-0">
                <p className="text-sm font-medium text-t0 truncate">{p.name}</p>
                {p.barcode && <p className="text-xs text-t2 font-mono">{p.barcode}</p>}
              </div>
              <div className="flex items-center gap-2.5 shrink-0 ml-3">
                <span className="text-xs px-1.5 py-0.5 rounded"
                  style={{ background: p.stock <= 0 ? 'var(--er-bg)' : 'var(--s3)', color: p.stock <= 0 ? 'var(--er-t)' : 'var(--t1)' }}>
                  {p.stock} adet
                </span>
                <span className="text-sm font-semibold tabnum" style={{ color: 'var(--a0)' }}>
                  {formatMoney(p.salePrice)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

/* ── Main ────────────────────────────────────────────────── */
export default function PosPage(): JSX.Element {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const taxRate = settings?.taxRate ?? 0
  const sym = settings?.currencySymbol ?? '₺'

  const { lines, discount, addProduct, setDiscount, clear } = useCartStore()
  const createSale = useCreateSale()

  const [barcode,       setBarcode]       = useState('')
  const [unknownCode,   setUnknownCode]   = useState<string | null>(null)
  const [confirmClear,  setConfirmClear]  = useState(false)
  const [searchOpen,    setSearchOpen]    = useState(false)
  const [payMethod,     setPayMethod]     = useState<PayMethod>('cash')
  const [cashInput,     setCashInput]     = useState('')
  const [done,          setDone]          = useState(false)
  const scanRef = useRef<HTMLInputElement>(null)

  const totals     = useMemo(() => computeCartTotals(lines, discount, taxRate), [lines, discount, taxRate])
  const cashNum    = parseFloat(cashInput) || 0
  const change     = cashNum - totals.total
  const canComplete = lines.length > 0 && !(payMethod === 'cash' && cashInput !== '' && change < 0)

  /* Reset cash on total change */
  useEffect(() => { setCashInput('') }, [totals.total])
  useEffect(() => { if (!unknownCode && !searchOpen) scanRef.current?.focus() }, [lines.length, unknownCode, searchOpen])

  const handleBarcode = useCallback(async (code: string) => {
    const s = code.trim(); if (!s) return
    try {
      const p = await api.product.getByBarcode(s)
      if (p) {
        if (p.stock <= 0) { toast.error(t('pos.outOfStock', { name: p.name })); return }
        addProduct(p)
      } else {
        setUnknownCode(s)
      }
    } catch (e) { toast.error(e instanceof Error ? e.message : t('pos.lookupFailed')) }
  }, [addProduct, t])

  useBarcodeScanner(handleBarcode, unknownCode === null && !searchOpen)

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault(); if (!barcode.trim()) return
    void handleBarcode(barcode); setBarcode('')
  }

  const completeSale = async () => {
    if (!canComplete) return
    try {
      await createSale.mutateAsync({
        items: lines.map(l => ({
          productId: l.productId, barcode: l.barcode, name: l.name,
          quantity: l.quantity, unitPrice: l.unitPrice, purchasePrice: l.purchasePrice,
        })),
        taxRate, discount,
      })
      setDone(true); setTimeout(() => setDone(false), 2000)
      if (payMethod === 'cash' && change > 0)
        toast.success(`Satış tamamlandı · Para üstü ${formatMoney(change)}`)
      else
        toast.success(t('pos.saleCompleted', { amount: formatMoney(totals.total) }))
      clear(); setCashInput('')
    } catch (e) { toast.error(e instanceof Error ? e.message : t('pos.saleFailed')) }
  }

  /* Quick amounts for numpad shortcut */
  const quickAmounts = useMemo(() => {
    if (totals.total <= 0) return []
    const t = totals.total
    const opts = [...new Set([Math.ceil(t/10)*10, Math.ceil(t/50)*50, Math.ceil(t/100)*100])]
    return opts.filter(v => v >= t).slice(0, 3)
  }, [totals.total])

  return (
    <>
      <Topbar title={t('nav.pos')} subtitle={t('pos.subtitle')} />

      <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '1fr 360px' }}>

        {/* ── LEFT: Scanner + Cart ──────────────────────── */}
        <div className="flex flex-col overflow-hidden border-r" style={{ borderColor: 'var(--b0)' }}>

          {/* Scan bar */}
          <div className="shrink-0 px-4 py-3 border-b" style={{ borderColor: 'var(--b0)', background: 'var(--s0)' }}>
            <form onSubmit={submitManual} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded"
                  style={{ background: 'var(--a-bg)', color: 'var(--a0)' }}>
                  <ScanLine size={12} />
                </div>
                <input ref={scanRef} value={barcode} onChange={e => setBarcode(e.target.value)}
                  autoFocus placeholder={t('pos.scanPlaceholder')}
                  className="h-8 w-full pl-9 pr-3 rounded-md border text-sm text-t0 placeholder:text-t2 outline-none transition-shadow focus:ring-2 focus:ring-a-ring focus:border-a0"
                  style={{ background: 'var(--s1)', borderColor: 'var(--b1)' }}
                />
              </div>
              <button type="button" onClick={() => setSearchOpen(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-md border text-sm font-medium text-t1 hover:text-t0 hover:bg-s2 transition-colors shrink-0"
                style={{ background: 'var(--s1)', borderColor: 'var(--b1)' }}>
                <Search size={13} /> Ara
              </button>
            </form>
            <p className="flex items-center gap-1.5 mt-1.5 text-2xs text-t2">
              <Zap size={10} style={{ color: 'var(--a0)' }} />
              {t('pos.scannerHint')}
            </p>
          </div>

          {/* Cart */}
          <div className="flex-1 overflow-y-auto">
            {lines.length === 0 ? (
              <EmptyState
                icon={<ShoppingCart size={24} />}
                title={t('pos.cartEmpty')}
                description={t('pos.cartEmptyDesc')}
              />
            ) : (
              <>
                <div className="sticky top-0 z-10 flex items-center px-4 h-8 border-b text-2xs font-medium text-t2 uppercase tracking-wide"
                  style={{ background: 'var(--s0)', borderColor: 'var(--b0)' }}>
                  <span className="flex-1">Ürün</span>
                  <span className="w-28 text-center">Miktar</span>
                  <span className="w-20 text-right">Tutar</span>
                  <span className="w-6" />
                </div>
                {lines.map(line => <CartItem key={line.productId} line={line} />)}
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: Order summary + payment ────────────── */}
        <div className="flex flex-col overflow-hidden" style={{ background: 'var(--s0)', borderLeft: 'none' }}>

          {/* Header row */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--b0)' }}>
            <div className="flex items-center gap-2">
              <ReceiptText size={14} style={{ color: 'var(--t1)' }} />
              <span className="text-sm font-semibold text-t0">Sipariş</span>
            </div>
            <div className="flex items-center gap-2">
              {lines.length > 0 && (
                <span className="text-xs text-t2">{totals.itemCount} ürün</span>
              )}
              {lines.length > 0 && (
                <button onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1 text-xs text-t2 hover:text-er-t transition-colors px-1.5 py-0.5 rounded hover:bg-er-bg">
                  <X size={11} /> Temizle
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col">

            {/* Totals block */}
            <div className="px-4 py-3 flex flex-col gap-2 border-b" style={{ borderColor: 'var(--b0)' }}>
              <Row label={t('pos.subtotal')} value={formatMoney(totals.subtotal)} />

              <div className="flex items-center justify-between">
                <span className="text-sm text-t1">{t('pos.discount')}</span>
                <input type="number" step="0.01" min="0"
                  value={discount || ''} onChange={e => setDiscount(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-20 h-6 text-right text-sm rounded border px-2 outline-none tabnum transition-shadow focus:ring-2 focus:ring-a-ring focus:border-a0"
                  style={{ background: 'var(--s2)', borderColor: 'var(--b1)', color: 'var(--t0)' }}
                />
              </div>

              {taxRate > 0 && <Row label={`KDV %${taxRate}`} value={formatMoney(totals.tax)} muted />}
            </div>

            {/* Grand total */}
            <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--b0)' }}>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-t2 uppercase tracking-widest">Toplam</span>
                <span className="text-3xl font-black tabnum" style={{ color: 'var(--a0)' }}>
                  {formatMoney(totals.total)}
                </span>
              </div>
            </div>

            {/* Payment method selector */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--b0)' }}>
              <p className="text-2xs font-semibold text-t2 uppercase tracking-widest mb-2">Ödeme</p>
              <div className="grid grid-cols-2 gap-1.5">
                {(['cash','card'] as const).map(m => {
                  const active = payMethod === m
                  const Icon = m === 'cash' ? Banknote : CreditCard
                  return (
                    <button key={m} onClick={() => setPayMethod(m)}
                      className="flex items-center justify-center gap-2 h-9 rounded-md border text-sm font-medium transition-all duration-100"
                      style={{
                        background: active ? 'var(--s3)' : 'var(--s2)',
                        borderColor: active ? 'var(--a0)' : 'var(--b1)',
                        color: active ? 'var(--a0)' : 'var(--t1)',
                        boxShadow: active ? 'inset 0 0 0 1px var(--a0)' : 'none',
                      }}>
                      <Icon size={14} />
                      {m === 'cash' ? 'Nakit' : 'Kart'}
                    </button>
                  )
                })}
              </div>

              {/* Cash calculator */}
              {payMethod === 'cash' && totals.total > 0 && (
                <div className="mt-3 flex flex-col gap-2 anim-down">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-t2">{sym}</span>
                    <input value={cashInput} readOnly
                      placeholder={(totals.total).toFixed(2)}
                      className="h-10 w-full pl-6 pr-3 text-right text-lg font-bold rounded-md border outline-none tabnum"
                      style={{
                        background: 'var(--s2)',
                        borderColor: cashInput ? 'var(--a0)' : 'var(--b1)',
                        color: 'var(--t0)',
                        boxShadow: cashInput ? '0 0 0 2px var(--a-ring)' : 'none',
                      }}
                    />
                  </div>

                  {/* Quick amounts */}
                  {quickAmounts.length > 0 && (
                    <div className="flex gap-1">
                      {quickAmounts.map(a => (
                        <button key={a} type="button" onClick={() => setCashInput(String(a))}
                          className="flex-1 h-7 rounded border text-xs font-semibold text-t1 hover:text-t0 hover:bg-s3 transition-colors"
                          style={{ background: 'var(--s2)', borderColor: 'var(--b1)' }}>
                          {formatMoney(a)}
                        </button>
                      ))}
                    </div>
                  )}

                  <Numpad value={cashInput} onChange={setCashInput} />

                  {cashNum > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-md border font-semibold text-sm"
                      style={{
                        background: change >= 0 ? 'var(--ok-bg)' : 'var(--er-bg)',
                        borderColor: change >= 0 ? 'var(--ok-b)' : 'var(--er-b)',
                        color: change >= 0 ? 'var(--ok-t)' : 'var(--er-t)',
                      }}>
                      <span className="text-xs font-medium opacity-70">Para Üstü</span>
                      <span className="tabnum">{change >= 0 ? formatMoney(change) : `– ${formatMoney(-change)}`}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1" />
          </div>

          {/* Complete button */}
          <div className="shrink-0 px-4 py-4 border-t" style={{ borderColor: 'var(--b0)', background: 'var(--s1)' }}>
            <button
              disabled={!canComplete || createSale.isPending}
              onClick={completeSale}
              className="w-full h-11 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[.98]"
              style={{
                background: done ? 'var(--ok)' : 'var(--a0)',
                boxShadow: canComplete ? '0 2px 8px rgba(93,95,239,.35)' : 'none',
              }}
            >
              {createSale.isPending ? (
                <span className="text-sm opacity-80">İşleniyor…</span>
              ) : done ? (
                <><Check size={17} /> Tamamlandı</>
              ) : (
                <><Check size={16} /> Satışı Tamamla</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal open={unknownCode !== null} onClose={() => setUnknownCode(null)}
        initialBarcode={unknownCode ?? ''}
        onCreated={p => { setUnknownCode(null); if (p.stock > 0) addProduct(p) }}
      />
      <ConfirmDialog open={confirmClear} title={t('pos.cancelSaleTitle')} message={t('pos.cancelSaleMsg')}
        confirmLabel={t('pos.cancelConfirm')}
        onConfirm={() => { clear(); setConfirmClear(false) }}
        onCancel={() => setConfirmClear(false)}
      />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)}
        onSelect={p => {
          setSearchOpen(false)
          if (p.stock <= 0) { toast.error(t('pos.outOfStock', { name: p.name })); return }
          addProduct(p)
        }}
      />
    </>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }): JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${muted ? 'text-t2' : 'text-t1'}`}>{label}</span>
      <span className={`text-sm font-medium tabnum ${muted ? 'text-t2' : 'text-t0'}`}>{value}</span>
    </div>
  )
}
