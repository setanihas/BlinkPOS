import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

let db: Database.Database | null = null

/** Absolute path to the SQLite database file in the OS user-data directory. */
export function getDatabasePath(): string {
  const dir = app.getPath('userData')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'market-pos.db')
}

/** Lazily open (or return the existing) database connection with sane pragmas. */
export function getDb(): Database.Database {
  if (db) return db
  db = new Database(getDatabasePath())
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('synchronous = NORMAL')
  return db
}

/** Close the connection (used during backup/restore swaps and app shutdown). */
export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
