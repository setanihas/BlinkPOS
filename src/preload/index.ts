import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC } from '../shared/ipc'

/**
 * Typed bridge exposed to the renderer as `window.api`. Each namespace mirrors
 * the shared IPC contract. The renderer never touches ipcRenderer directly,
 * keeping the data boundary swappable (IPC today, HTTP later).
 */
const api = {
  product: {
    list: (query: unknown) => ipcRenderer.invoke(IPC.product.list, query),
    getByBarcode: (barcode: string) => ipcRenderer.invoke(IPC.product.getByBarcode, barcode),
    getById: (id: string) => ipcRenderer.invoke(IPC.product.getById, id),
    create: (dto: unknown) => ipcRenderer.invoke(IPC.product.create, dto),
    update: (id: string, dto: unknown) => ipcRenderer.invoke(IPC.product.update, id, dto),
    remove: (id: string) => ipcRenderer.invoke(IPC.product.remove, id),
    categories: () => ipcRenderer.invoke(IPC.product.categories)
  },
  sales: {
    create: (dto: unknown) => ipcRenderer.invoke(IPC.sales.create, dto),
    list: (query: unknown) => ipcRenderer.invoke(IPC.sales.list, query),
    getById: (id: string) => ipcRenderer.invoke(IPC.sales.getById, id)
  },
  expense: {
    list: (query: unknown) => ipcRenderer.invoke(IPC.expense.list, query),
    create: (dto: unknown) => ipcRenderer.invoke(IPC.expense.create, dto),
    update: (id: string, dto: unknown) => ipcRenderer.invoke(IPC.expense.update, id, dto),
    remove: (id: string) => ipcRenderer.invoke(IPC.expense.remove, id)
  },
  analytics: {
    dashboard: (range: unknown) => ipcRenderer.invoke(IPC.analytics.dashboard, range),
    report: (range: unknown) => ipcRenderer.invoke(IPC.analytics.report, range)
  },
  settings: {
    get: () => ipcRenderer.invoke(IPC.settings.get),
    update: (patch: unknown) => ipcRenderer.invoke(IPC.settings.update, patch)
  },
  backup: {
    export: () => ipcRenderer.invoke(IPC.backup.export),
    restore: () => ipcRenderer.invoke(IPC.backup.restore)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // Fallback when contextIsolation is disabled.
  // @ts-expect-error untyped global assignment
  window.electron = electronAPI
  // @ts-expect-error untyped global assignment
  window.api = api
}
