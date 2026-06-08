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
} from '../domain'

/**
 * IPC channel names, grouped by domain. Centralised so the preload bridge and
 * main-process handlers never drift apart.
 */
export const IPC = {
  product: {
    list: 'product:list',
    getByBarcode: 'product:getByBarcode',
    getById: 'product:getById',
    create: 'product:create',
    update: 'product:update',
    remove: 'product:remove',
    categories: 'product:categories'
  },
  sales: {
    create: 'sales:create',
    list: 'sales:list',
    getById: 'sales:getById'
  },
  expense: {
    list: 'expense:list',
    create: 'expense:create',
    update: 'expense:update',
    remove: 'expense:remove'
  },
  analytics: {
    dashboard: 'analytics:dashboard',
    report: 'analytics:report'
  },
  settings: {
    get: 'settings:get',
    update: 'settings:update'
  },
  backup: {
    export: 'backup:export',
    restore: 'backup:restore'
  }
} as const

/**
 * Typed contract for every IPC method: `[argsTuple, returnType]`. The preload
 * `window.api` and the renderer api-clients are both derived from this so the
 * compiler enforces request/response shapes end to end.
 */
export interface IpcContract {
  product: {
    list: [[ProductQuery], Paginated<Product>]
    getByBarcode: [[string], Product | null]
    getById: [[string], Product | null]
    create: [[CreateProductDTO], Product]
    update: [[string, UpdateProductDTO], Product]
    remove: [[string], void]
    categories: [[], string[]]
  }
  sales: {
    create: [[CreateSaleDTO], Sale]
    list: [[SaleQuery], Paginated<Sale>]
    getById: [[string], Sale | null]
  }
  expense: {
    list: [[ExpenseQuery], Paginated<Expense>]
    create: [[CreateExpenseDTO], Expense]
    update: [[string, UpdateExpenseDTO], Expense]
    remove: [[string], void]
  }
  analytics: {
    dashboard: [[DateRange], DashboardData]
    report: [[DateRange], ReportBundle]
  }
  settings: {
    get: [[], AppSettings]
    update: [[Partial<AppSettings>], AppSettings]
  }
  backup: {
    export: [[], { ok: boolean; path?: string }]
    restore: [[], { ok: boolean }]
  }
}
