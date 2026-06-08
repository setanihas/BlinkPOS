/**
 * Storage abstraction. Today this is backed by SQLite (see SqliteStorage),
 * but the interface is intentionally transport-agnostic so a future
 * implementation could be a REST/remote KV store without touching callers.
 *
 * Repositories use the lower-level `Database` directly for relational queries,
 * while this key/value adapter backs simple document storage such as settings.
 */
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
}
