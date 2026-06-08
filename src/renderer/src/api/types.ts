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
} from '@shared/domain'

/**
 * Renderer-facing data-access interfaces. The UI depends ONLY on these
 * abstractions. Today they are implemented over IPC (see `ipc/`), but a future
 * REST/HTTP implementation can be dropped in via the factory with zero UI
 * changes. This is the seam for backend migration.
 */

export interface IProductApi {
  list(query: ProductQuery): Promise<Paginated<Product>>
  getByBarcode(barcode: string): Promise<Product | null>
  getById(id: string): Promise<Product | null>
  create(dto: CreateProductDTO): Promise<Product>
  update(id: string, dto: UpdateProductDTO): Promise<Product>
  remove(id: string): Promise<void>
  categories(): Promise<string[]>
}

export interface ISalesApi {
  create(dto: CreateSaleDTO): Promise<Sale>
  list(query: SaleQuery): Promise<Paginated<Sale>>
  getById(id: string): Promise<Sale | null>
}

export interface IExpenseApi {
  list(query: ExpenseQuery): Promise<Paginated<Expense>>
  create(dto: CreateExpenseDTO): Promise<Expense>
  update(id: string, dto: UpdateExpenseDTO): Promise<Expense>
  remove(id: string): Promise<void>
}

export interface IAnalyticsApi {
  dashboard(range: DateRange): Promise<DashboardData>
  report(range: DateRange): Promise<ReportBundle>
}

export interface ISettingsApi {
  get(): Promise<AppSettings>
  update(patch: Partial<AppSettings>): Promise<AppSettings>
}

export interface IBackupApi {
  export(): Promise<{ ok: boolean; path?: string }>
  restore(): Promise<{ ok: boolean }>
}

export interface ApiClient {
  product: IProductApi
  sales: ISalesApi
  expense: IExpenseApi
  analytics: IAnalyticsApi
  settings: ISettingsApi
  backup: IBackupApi
}
