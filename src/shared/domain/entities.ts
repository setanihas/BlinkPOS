/**
 * Core domain entities. These are storage-agnostic shapes shared between the
 * main process (SQLite) and the renderer (React). They map 1:1 onto future
 * REST DTOs so the data layer can be swapped without touching the UI.
 */

export interface Product {
  id: string
  barcode: string
  name: string
  category: string
  purchasePrice: number
  salePrice: number
  stock: number
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface SaleItem {
  id: string
  saleId: string
  productId: string | null
  name: string
  barcode: string
  quantity: number
  unitPrice: number
  purchasePrice: number
  subtotal: number
  profit: number
}

export interface Sale {
  id: string
  subtotal: number
  tax: number
  discount: number
  total: number
  profit: number
  itemCount: number
  createdAt: string
  items: SaleItem[]
}

export type ExpenseCategory =
  | 'rent'
  | 'electricity'
  | 'salary'
  | 'supplier'
  | 'transportation'
  | 'misc'

export interface Expense {
  id: string
  title: string
  amount: number
  category: ExpenseCategory
  description: string | null
  createdAt: string
}

export type ThemePreference = 'system' | 'dark' | 'light'

export type LanguagePreference = 'tr' | 'en'

export interface AppSettings {
  currencyCode: string
  currencySymbol: string
  taxRate: number
  storeName: string
  storeAddress: string
  storePhone: string
  lowStockThreshold: number
  theme: ThemePreference
  language: LanguagePreference
}
