import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/factory'
import { queryKeys } from '../app/queryClient'
import { useTheme } from '../app/ThemeProvider'
import { setLanguage, type Language } from '../i18n'
import { setCurrencySymbol } from '../lib/format'

/**
 * Side-effect-only component that loads settings once at startup and keeps
 * theme, language and currency in sync. Lives outside the router so it never
 * unmounts.
 *
 * Theme is applied from the DB only on the very first load. After that the
 * ThemeToggle manages preference in-memory; saving from SettingsPage calls
 * setPreference directly, so the DB never silently overrides a mid-session
 * toggle.
 */
export function SettingsBootstrap(): null {
  const { setPreference } = useTheme()
  const themeApplied = useRef(false)
  const query = useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => api.settings.get()
  })

  useEffect(() => {
    if (!query.data) return
    setCurrencySymbol(query.data.currencySymbol)
    setLanguage(query.data.language as Language)
    // Apply the saved theme only on cold start. Once applied, ThemeToggle
    // owns the preference for the rest of the session.
    if (!themeApplied.current) {
      themeApplied.current = true
      setPreference(query.data.theme)
    }
    // setPreference is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data])

  return null
}
