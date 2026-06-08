import { useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { useCartStore, type CartLine } from '../../stores/cartStore'
import { formatMoney } from '../../lib/format'

/* Deterministic avatar color from product name */
const PALETTE = ['#5d5fef','#7c3aed','#db2777','#b45309','#047857','#0369a1','#c2410c','#4338ca']
const color = (name: string) => {
  let h = 0; for (const c of name) h = (h << 5) - h + c.charCodeAt(0)
  return PALETTE[Math.abs(h) % PALETTE.length]
}
const abbr = (name: string) =>
  name.split(' ').slice(0,2).map(w => w[0]?.toUpperCase() ?? '').join('')

export function CartItem({ line }: { line: CartLine }): JSX.Element {
  const { increment, decrement, removeLine, setQuantity } = useCartStore()
  const [focused, setFocused] = useState(false)
  const bg = color(line.name)
  const nearMax = line.stock > 0 && line.quantity >= line.stock - 1

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 border-b transition-colors hover:bg-s1"
      style={{ borderColor: 'var(--b0)' }}>

      {/* Avatar */}
      <div className="flex items-center justify-center w-8 h-8 rounded-lg text-white text-xs font-bold shrink-0 ring-2 ring-black/10"
        style={{ background: bg }}>
        {abbr(line.name)}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-t0 truncate leading-tight">{line.name}</p>
        <p className="text-xs text-t2 tabnum">{formatMoney(line.unitPrice)}</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => decrement(line.productId)}
          className="flex items-center justify-center w-6 h-6 rounded border text-t1 hover:text-t0 hover:bg-s2 transition-colors"
          style={{ borderColor: 'var(--b1)' }}>
          <Minus size={11} />
        </button>
        <input
          value={line.quantity}
          onChange={e => setQuantity(line.productId, Math.max(1, Number(e.target.value) || 1))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-10 h-6 text-center text-sm font-semibold rounded border outline-none tabnum transition-shadow"
          style={{
            background: 'var(--s2)',
            borderColor: focused ? 'var(--a0)' : 'var(--b1)',
            color: 'var(--t0)',
            boxShadow: focused ? '0 0 0 2px var(--a-ring)' : 'none',
          }}
        />
        <button onClick={() => increment(line.productId)} disabled={line.quantity >= line.stock}
          className="flex items-center justify-center w-6 h-6 rounded border text-t1 hover:text-t0 hover:bg-s2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderColor: 'var(--b1)' }}>
          <Plus size={11} />
        </button>
      </div>

      {/* Line total */}
      <div className="w-20 text-right shrink-0">
        <p className="text-sm font-semibold text-t0 tabnum">{formatMoney(line.unitPrice * line.quantity)}</p>
        {nearMax && (
          <p className="text-2xs" style={{ color: 'var(--wa-t)' }}>Son {line.stock}</p>
        )}
      </div>

      {/* Remove */}
      <button onClick={() => removeLine(line.productId)}
        className="flex items-center justify-center w-6 h-6 rounded text-t2 hover:text-t0 hover:bg-s2 transition-all opacity-0 group-hover:opacity-100 shrink-0">
        <X size={12} />
      </button>
    </div>
  )
}
