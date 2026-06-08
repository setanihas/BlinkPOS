import { Monitor, Moon, Sun } from 'lucide-react'
import type { ThemePreference } from '@shared/domain'
import { useTheme } from '../../app/ThemeProvider'
import { useUpdateSettings } from '../../hooks/useSettings'

const opts = [
  { key: 'system' as ThemePreference, Icon: Monitor, label: 'Sistem' },
  { key: 'dark'   as ThemePreference, Icon: Moon,    label: 'Koyu' },
  { key: 'light'  as ThemePreference, Icon: Sun,     label: 'Açık' },
]

export function ThemeToggle(): JSX.Element {
  const { preference, setPreference } = useTheme()
  const mut = useUpdateSettings()
  const set = (p: ThemePreference) => { setPreference(p); mut.mutate({ theme: p }) }

  return (
    <div className="flex items-center gap-px p-0.5 rounded-md border"
      style={{ background: 'var(--s2)', borderColor: 'var(--b1)' }}>
      {opts.map(({ key, Icon, label }) => (
        <button key={key} title={label} onClick={() => set(key)}
          className="flex items-center justify-center w-6 h-6 rounded transition-all duration-100"
          style={{
            background: preference === key ? 'var(--s0)' : 'transparent',
            color: preference === key ? 'var(--t0)' : 'var(--t2)',
            boxShadow: preference === key ? 'var(--sh1)' : 'none',
          }}>
          <Icon size={12} />
        </button>
      ))}
    </div>
  )
}
