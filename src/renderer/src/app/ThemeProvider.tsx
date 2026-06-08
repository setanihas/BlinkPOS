import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ThemePreference } from '@shared/domain'

interface ThemeContextValue {
  preference: ThemePreference
  resolved: 'dark' | 'light'
  setPreference: (pref: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'market-pos-theme'

function systemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function resolveTheme(pref: ThemePreference): 'dark' | 'light' {
  return pref === 'system' ? systemTheme() : pref
}

/**
 * Applies the theme by toggling `data-theme` on <html>. Defaults to following
 * the OS preference until the user overrides, and reacts to OS changes while
 * in "system" mode. The choice is mirrored to localStorage (and persisted to
 * settings separately by the settings screen).
 */
export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null
    return stored ?? 'system'
  })
  const [resolved, setResolved] = useState<'dark' | 'light'>(() => resolveTheme(preference))

  useEffect(() => {
    const next = resolveTheme(preference)
    setResolved(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem(STORAGE_KEY, preference)
  }, [preference])

  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (): void => {
      const next = systemTheme()
      setResolved(next)
      document.documentElement.setAttribute('data-theme', next)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference: setPreferenceState }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
