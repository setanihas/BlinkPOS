import { QueryClient, QueryCache } from '@tanstack/react-query'
import { toast } from '../stores/toastStore'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : String(error))
    }
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000
    }
  }
})

/** Centralised React Query keys to keep cache invalidation consistent. */
export const queryKeys = {
  products: (params?: unknown) => ['products', params] as const,
  productCategories: ['product-categories'] as const,
  sales: (params?: unknown) => ['sales', params] as const,
  expenses: (params?: unknown) => ['expenses', params] as const,
  dashboard: (range: unknown) => ['dashboard', range] as const,
  report: (range: unknown) => ['report', range] as const,
  settings: ['settings'] as const
}
