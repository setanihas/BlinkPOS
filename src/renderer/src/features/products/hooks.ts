import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Product,
  ProductQuery,
  Paginated,
  CreateProductDTO,
  UpdateProductDTO
} from '@shared/domain'
import { api } from '../../api/factory'
import { queryKeys } from '../../app/queryClient'

export function useProducts(query: ProductQuery) {
  return useQuery<Paginated<Product>>({
    queryKey: queryKeys.products(query),
    queryFn: () => api.product.list(query),
    placeholderData: (prev) => prev
  })
}

export function useProductCategories() {
  return useQuery<string[]>({
    queryKey: queryKeys.productCategories,
    queryFn: () => api.product.categories()
  })
}

function useInvalidateProducts(): () => void {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['products'] })
    qc.invalidateQueries({ queryKey: queryKeys.productCategories })
    qc.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation<Product, Error, CreateProductDTO>({
    mutationFn: (dto) => api.product.create(dto),
    onSuccess: invalidate
  })
}

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation<Product, Error, { id: string; dto: UpdateProductDTO }>({
    mutationFn: ({ id, dto }) => api.product.update(id, dto),
    onSuccess: invalidate
  })
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.product.remove(id),
    onSuccess: invalidate
  })
}
