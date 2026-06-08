import type { ExpenseCategory } from './entities'

/**
 * Data Transfer Objects — the request/response payloads exchanged across the
 * data boundary (IPC today, REST tomorrow). They intentionally exclude
 * server-generated fields like `id`, `createdAt`, `updatedAt`.
 */

export interface CreateProductDTO {
  barcode: string
  name: string
  category: string
  purchasePrice: number
  salePrice: number
  stock: number
  description?: string | null
}

export type UpdateProductDTO = Partial<CreateProductDTO>

export type ProductSortField = 'name' | 'stock' | 'salePrice' | 'createdAt'
export type SortDirection = 'asc' | 'desc'

export interface ProductQuery {
  search?: string
  category?: string
  lowStockOnly?: boolean
  sortField?: ProductSortField
  sortDirection?: SortDirection
  page?: number
  pageSize?: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface CartLineDTO {
  productId: string
  barcode: string
  name: string
  quantity: number
  unitPrice: number
  purchasePrice: number
}

export interface CreateSaleDTO {
  items: CartLineDTO[]
  taxRate: number
  discount: number
}

export interface SaleQuery {
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

export interface CreateExpenseDTO {
  title: string
  amount: number
  category: ExpenseCategory
  description?: string | null
}

export type UpdateExpenseDTO = Partial<CreateExpenseDTO>

export interface ExpenseQuery {
  from?: string
  to?: string
  category?: ExpenseCategory
  page?: number
  pageSize?: number
}

/** Inclusive ISO date range used by analytics & reports. */
export interface DateRange {
  from: string
  to: string
}
