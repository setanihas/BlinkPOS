import type { ElectronAPI } from '@electron-toolkit/preload'
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductQuery,
  Paginated,
  Sale,
  CreateSaleDTO,
  SaleQuery,
  Expense,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  ExpenseQuery,
  AppSettings,
  DashboardData,
  ReportBundle,
  DateRange
} from '../shared/domain'

export interface MarketApi {
  product: {
    list: (query: ProductQuery) => Promise<Paginated<Product>>
    getByBarcode: (barcode: string) => Promise<Product | null>
    getById: (id: string) => Promise<Product | null>
    create: (dto: CreateProductDTO) => Promise<Product>
    update: (id: string, dto: UpdateProductDTO) => Promise<Product>
    remove: (id: string) => Promise<void>
    categories: () => Promise<string[]>
  }
  sales: {
    create: (dto: CreateSaleDTO) => Promise<Sale>
    list: (query: SaleQuery) => Promise<Paginated<Sale>>
    getById: (id: string) => Promise<Sale | null>
  }
  expense: {
    list: (query: ExpenseQuery) => Promise<Paginated<Expense>>
    create: (dto: CreateExpenseDTO) => Promise<Expense>
    update: (id: string, dto: UpdateExpenseDTO) => Promise<Expense>
    remove: (id: string) => Promise<void>
  }
  analytics: {
    dashboard: (range: DateRange) => Promise<DashboardData>
    report: (range: DateRange) => Promise<ReportBundle>
  }
  settings: {
    get: () => Promise<AppSettings>
    update: (patch: Partial<AppSettings>) => Promise<AppSettings>
  }
  backup: {
    export: () => Promise<{ ok: boolean; path?: string }>
    restore: () => Promise<{ ok: boolean }>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: MarketApi
  }
}
