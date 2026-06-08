import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays } from 'lucide-react'
import { useDateRangeStore } from '../../stores/dateRangeStore'
import { customRange, type DateRangePreset } from '../../lib/dateRange'

const PRESETS: { key: Exclude<DateRangePreset,'custom'>; labelKey: string }[] = [
  { key: 'today', labelKey: 'dateRange.today' },
  { key: 'week',  labelKey: 'dateRange.week' },
  { key: 'month', labelKey: 'dateRange.month' },
  { key: 'year',  labelKey: 'dateRange.year' },
]

export function DateRangeFilter(): JSX.Element {
  const { t } = useTranslation()
  const { preset, setPreset, setCustom } = useDateRangeStore()
  const [from, setFrom] = useState('')
  const [to,   setTo]   = useState('')

  const apply = (f: string, tt: string) => { if (f && tt) setCustom(customRange(f, tt)) }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Preset segment control */}
      <div className="flex items-center p-0.5 rounded border" style={{ background: 'var(--s2)', borderColor: 'var(--b1)' }}>
        {PRESETS.map(p => (
          <button key={p.key} onClick={() => setPreset(p.key)}
            className="px-3 h-6 rounded text-xs font-medium transition-all duration-100 whitespace-nowrap"
            style={{
              background: preset === p.key ? 'var(--s0)' : 'transparent',
              color:      preset === p.key ? 'var(--t0)' : 'var(--t1)',
              boxShadow:  preset === p.key ? 'var(--sh1)' : 'none',
            }}>
            {t(p.labelKey as never)}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-5" style={{ background: 'var(--b1)' }} />

      {/* Custom date inputs */}
      <div className="flex items-center gap-1.5">
        <DateInput value={from} onChange={v => { setFrom(v); apply(v, to) }}
          active={preset === 'custom' && !!from} />
        <span className="text-xs text-t2 select-none">—</span>
        <DateInput value={to} onChange={v => { setTo(v); apply(from, v) }}
          active={preset === 'custom' && !!to} />
      </div>
    </div>
  )
}

function DateInput({ value, onChange, active }: {
  value: string; onChange: (v: string) => void; active: boolean
}): JSX.Element {
  return (
    <div className="relative flex items-center">
      <CalendarDays size={11} className="absolute left-2 pointer-events-none z-10"
        style={{ color: active ? 'var(--a0)' : 'var(--t2)' }} />
      <input type="date" value={value} onChange={e => onChange(e.target.value)}
        className="h-7 w-[118px] rounded border text-xs outline-none transition-shadow pl-7 pr-1.5"
        style={{
          background:  'var(--s2)',
          borderColor: active ? 'var(--a0)' : 'var(--b1)',
          color:       value ? 'var(--t0)' : 'var(--t2)',
          boxShadow:   active ? '0 0 0 2px var(--a-ring)' : 'none',
        }}
      />
    </div>
  )
}
