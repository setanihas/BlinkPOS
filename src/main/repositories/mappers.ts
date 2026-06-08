import type { Product } from '@shared/domain'

/** Raw column shape returned by SQLite for the `products` table. */
export interface ProductRow {
  id: string
  barcode: string
  name: string
  category: string
  purchase_price: number
  sale_price: number
  stock: number
  description: string | null
  created_at: string
  updated_at: string
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    barcode: row.barcode,
    name: row.name,
    category: row.category,
    purchasePrice: row.purchase_price,
    salePrice: row.sale_price,
    stock: row.stock,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}
