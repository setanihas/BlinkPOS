import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Sale, CreateSaleDTO, SaleQuery, Paginated } from '@shared/domain'
import { api } from '../../api/factory'
import { queryKeys } from '../../app/queryClient'

export function useCreateSale() {
  const qc = useQueryClient()
  return useMutation<Sale, Error, CreateSaleDTO>({
    mutationFn: (dto) => api.sales.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['report'] })
    }
  })
}

export function useSales(query: SaleQuery) {
  return useQuery<Paginated<Sale>>({
    queryKey: queryKeys.sales(query),
    queryFn: () => api.sales.list(query),
    placeholderData: (prev) => prev
  })
}
