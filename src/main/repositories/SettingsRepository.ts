import type Database from 'better-sqlite3'
import type { AppSettings } from '@shared/domain'
import { getDb } from '../db/connection'

const DEFAULTS: AppSettings = {
  currencyCode: 'TRY',
  currencySymbol: '₺',
  taxRate: 0,
  storeName: 'My Market',
  storeAddress: '',
  storePhone: '',
  lowStockThreshold: 5,
  theme: 'system',
  language: 'tr'
}

/**
 * Key/value backed settings store. Persists the single AppSettings document
 * across rows so individual keys can evolve without schema changes.
 */
export class SettingsRepository {
  private get db(): Database.Database {
    return getDb()
  }

  get(): AppSettings {
    const rows = this.db.prepare('SELECT key, value FROM settings').all() as {
      key: string
      value: string
    }[]
    const stored: Record<string, string> = {}
    for (const row of rows) stored[row.key] = row.value

    return {
      currencyCode: stored.currencyCode ?? DEFAULTS.currencyCode,
      currencySymbol: stored.currencySymbol ?? DEFAULTS.currencySymbol,
      taxRate: stored.taxRate !== undefined ? Number(stored.taxRate) : DEFAULTS.taxRate,
      storeName: stored.storeName ?? DEFAULTS.storeName,
      storeAddress: stored.storeAddress ?? DEFAULTS.storeAddress,
      storePhone: stored.storePhone ?? DEFAULTS.storePhone,
      lowStockThreshold:
        stored.lowStockThreshold !== undefined
          ? Number(stored.lowStockThreshold)
          : DEFAULTS.lowStockThreshold,
      theme: (stored.theme as AppSettings['theme']) ?? DEFAULTS.theme,
      language: (stored.language as AppSettings['language']) ?? DEFAULTS.language
    }
  }

  update(patch: Partial<AppSettings>): AppSettings {
    const stmt = this.db.prepare(
      `INSERT INTO settings (key, value) VALUES (@key, @value)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    )
    const tx = this.db.transaction((entries: [string, string][]) => {
      for (const [key, value] of entries) stmt.run({ key, value })
    })
    const entries = Object.entries(patch).map(
      ([k, v]) => [k, String(v)] as [string, string]
    )
    tx(entries)
    return this.get()
  }
}
