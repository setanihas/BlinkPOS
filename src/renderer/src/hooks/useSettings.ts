import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { AppSettings } from '@shared/domain'
import { api } from '../api/factory'
import { queryKeys } from '../app/queryClient'
import { setCurrencySymbol } from '../lib/format'
import { setLanguage, type Language } from '../i18n'

/** Loads settings and keeps the currency formatter in sync. */
export function useSettings(): {
  settings: AppSettings | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
} {
  const query = useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => api.settings.get()
  })

  useEffect(() => {
    if (query.data) {
      setCurrencySymbol(query.data.currencySymbol)
    }
  }, [query.data])

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch
  }
}

export function useUpdateSettings(): ReturnType<typeof useMutation<AppSettings, Error, Partial<AppSettings>>> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<AppSettings>) => api.settings.update(patch),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.settings, data)
      setCurrencySymbol(data.currencySymbol)
      setLanguage(data.language as Language)
    }
  })
}
