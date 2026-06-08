import type {
  IProductApi,
  ISalesApi,
  IExpenseApi,
  IAnalyticsApi,
  ISettingsApi,
  IBackupApi,
  ApiClient
} from '../types'

/**
 * IPC-backed implementations of the data-access interfaces. They simply forward
 * to the typed `window.api` bridge exposed by the preload script. Swapping
 * these for HTTP clients later requires no changes anywhere else.
 */

const productApi: IProductApi = {
  list: (query) => window.api.product.list(query),
  getByBarcode: (barcode) => window.api.product.getByBarcode(barcode),
  getById: (id) => window.api.product.getById(id),
  create: (dto) => window.api.product.create(dto),
  update: (id, dto) => window.api.product.update(id, dto),
  remove: (id) => window.api.product.remove(id),
  categories: () => window.api.product.categories()
}

const salesApi: ISalesApi = {
  create: (dto) => window.api.sales.create(dto),
  list: (query) => window.api.sales.list(query),
  getById: (id) => window.api.sales.getById(id)
}

const expenseApi: IExpenseApi = {
  list: (query) => window.api.expense.list(query),
  create: (dto) => window.api.expense.create(dto),
  update: (id, dto) => window.api.expense.update(id, dto),
  remove: (id) => window.api.expense.remove(id)
}

const analyticsApi: IAnalyticsApi = {
  dashboard: (range) => window.api.analytics.dashboard(range),
  report: (range) => window.api.analytics.report(range)
}

const settingsApi: ISettingsApi = {
  get: () => window.api.settings.get(),
  update: (patch) => window.api.settings.update(patch)
}

const backupApi: IBackupApi = {
  export: () => window.api.backup.export(),
  restore: () => window.api.backup.restore()
}

export const ipcApiClient: ApiClient = {
  product: productApi,
  sales: salesApi,
  expense: expenseApi,
  analytics: analyticsApi,
  settings: settingsApi,
  backup: backupApi
}
