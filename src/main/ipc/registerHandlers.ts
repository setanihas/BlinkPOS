import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc'
import { ProductService } from '../services/ProductService'
import { SalesService } from '../services/SalesService'
import { ExpenseService } from '../services/ExpenseService'
import { AnalyticsService } from '../services/AnalyticsService'
import { SettingsService } from '../services/SettingsService'
import { BackupService } from '../services/BackupService'

/**
 * Registers all IPC handlers. Each handler delegates to a service and surfaces
 * errors as serialisable messages so the renderer can present them. Channel
 * names and payload types come from the shared IPC contract.
 */
export function registerIpcHandlers(): void {
  const products = new ProductService()
  const sales = new SalesService()
  const expenses = new ExpenseService()
  const analytics = new AnalyticsService()
  const settings = new SettingsService()
  const backup = new BackupService()

  // Products
  ipcMain.handle(IPC.product.list, (_e, query) => products.list(query))
  ipcMain.handle(IPC.product.getByBarcode, (_e, barcode: string) => products.getByBarcode(barcode))
  ipcMain.handle(IPC.product.getById, (_e, id: string) => products.getById(id))
  ipcMain.handle(IPC.product.create, (_e, dto) => products.create(dto))
  ipcMain.handle(IPC.product.update, (_e, id: string, dto) => products.update(id, dto))
  ipcMain.handle(IPC.product.remove, (_e, id: string) => products.remove(id))
  ipcMain.handle(IPC.product.categories, () => products.categories())

  // Sales
  ipcMain.handle(IPC.sales.create, (_e, dto) => sales.create(dto))
  ipcMain.handle(IPC.sales.list, (_e, query) => sales.list(query))
  ipcMain.handle(IPC.sales.getById, (_e, id: string) => sales.getById(id))

  // Expenses
  ipcMain.handle(IPC.expense.list, (_e, query) => expenses.list(query))
  ipcMain.handle(IPC.expense.create, (_e, dto) => expenses.create(dto))
  ipcMain.handle(IPC.expense.update, (_e, id: string, dto) => expenses.update(id, dto))
  ipcMain.handle(IPC.expense.remove, (_e, id: string) => expenses.remove(id))

  // Analytics
  ipcMain.handle(IPC.analytics.dashboard, (_e, range) => analytics.dashboard(range))
  ipcMain.handle(IPC.analytics.report, (_e, range) => analytics.report(range))

  // Settings
  ipcMain.handle(IPC.settings.get, () => settings.get())
  ipcMain.handle(IPC.settings.update, (_e, patch) => settings.update(patch))

  // Backup
  ipcMain.handle(IPC.backup.export, () => backup.export())
  ipcMain.handle(IPC.backup.restore, () => backup.restore())
}
