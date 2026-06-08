import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag, Check, X } from 'lucide-react'
import { useCategoryStore } from './useCategoryStore'

export function CategoriesManager(): JSX.Element {
  const { productCategories, addCategory, removeCategory, renameCategory } = useCategoryStore()
  const [input,    setInput]    = useState('')
  const [editing,  setEditing]  = useState<string | null>(null)
  const [editVal,  setEditVal]  = useState('')

  const handleAdd = () => {
    if (!input.trim()) return
    addCategory(input.trim())
    setInput('')
  }

  const startEdit = (cat: string) => { setEditing(cat); setEditVal(cat) }
  const commitEdit = () => {
    if (editing) renameCategory(editing, editVal)
    setEditing(null)
  }
  const cancelEdit = () => setEditing(null)

  return (
    <div className="flex flex-col gap-3">
      {/* Add new */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-t2" />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Yeni kategori adı…"
            className="h-8 w-full pl-8 pr-3 rounded-md border text-sm text-t0 placeholder:text-t2 outline-none transition-shadow focus:ring-2 focus:border-a0"
            style={{ background: 'var(--s2)', borderColor: 'var(--b1)' }}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--a0)' }}
        >
          <Plus size={13} /> Ekle
        </button>
      </div>

      {/* Category list */}
      {productCategories.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-t2 rounded-lg border border-dashed"
          style={{ borderColor: 'var(--b1)' }}>
          Henüz kategori yok
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--b0)' }}>
          {productCategories.map((cat, i) => (
            <div key={cat}
              className="flex items-center justify-between px-3 h-10 border-b last:border-b-0 group"
              style={{ borderColor: 'var(--b0)', background: i % 2 === 0 ? 'var(--s0)' : 'var(--s1)' }}>

              {editing === cat ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit() }}
                    autoFocus
                    className="flex-1 h-6 px-2 rounded border text-sm text-t0 outline-none"
                    style={{ background: 'var(--s2)', borderColor: 'var(--a0)', boxShadow: '0 0 0 2px var(--a-ring)' }}
                  />
                  <button onClick={commitEdit} className="p-1 rounded text-ok hover:bg-ok-bg transition-colors"><Check size={13} /></button>
                  <button onClick={cancelEdit} className="p-1 rounded text-t2 hover:bg-s3 transition-colors"><X size={13} /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-md text-2xs font-bold text-white"
                      style={{ background: catColor(cat) }}>
                      {cat[0]?.toUpperCase()}
                    </span>
                    <span className="text-sm text-t0">{cat}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(cat)}
                      className="flex items-center justify-center w-6 h-6 rounded text-t2 hover:text-t0 hover:bg-s3 transition-colors">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => removeCategory(cat)}
                      className="flex items-center justify-center w-6 h-6 rounded text-t2 hover:text-er-t hover:bg-er-bg transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-t2">
        {productCategories.length} kategori · Mevcut ürünlerde kullanılan kategoriler otomatik eklenir.
      </p>
    </div>
  )
}

const CAT_COLORS = ['#5d5fef','#7c3aed','#db2777','#b45309','#047857','#0369a1','#c2410c','#4338ca']
function catColor(name: string): string {
  let h = 0; for (const c of name) h = (h << 5) - h + c.charCodeAt(0)
  return CAT_COLORS[Math.abs(h) % CAT_COLORS.length]
}
