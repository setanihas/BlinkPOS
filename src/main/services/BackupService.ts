import { dialog } from 'electron'
import { copyFileSync } from 'fs'
import { closeDb, getDatabasePath, getDb } from '../db/connection'
import { runMigrations } from '../db/migrate'

/**
 * Local backup / restore by copying the SQLite file. A WAL checkpoint is forced
 * before copying so the backup is self-contained, and the connection is
 * re-opened (with migrations re-applied) after a restore.
 */
export class BackupService {
  async export(): Promise<{ ok: boolean; path?: string }> {
    const defaultName = `market-pos-backup-${new Date().toISOString().slice(0, 10)}.db`
    const result = await dialog.showSaveDialog({
      title: 'Export Backup',
      defaultPath: defaultName,
      filters: [{ name: 'SQLite Database', extensions: ['db'] }]
    })
    if (result.canceled || !result.filePath) return { ok: false }

    const db = getDb()
    db.pragma('wal_checkpoint(TRUNCATE)')
    copyFileSync(getDatabasePath(), result.filePath)
    return { ok: true, path: result.filePath }
  }

  async restore(): Promise<{ ok: boolean }> {
    const result = await dialog.showOpenDialog({
      title: 'Restore Backup',
      properties: ['openFile'],
      filters: [{ name: 'SQLite Database', extensions: ['db'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return { ok: false }

    closeDb()
    copyFileSync(result.filePaths[0], getDatabasePath())
    runMigrations()
    return { ok: true }
  }
}
