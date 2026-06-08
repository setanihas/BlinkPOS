import type Database from 'better-sqlite3'
import { getDb } from './connection'

/**
 * Minimal forward-only migration runner. Each migration has a monotonically
 * increasing id; applied ids are tracked in `schema_migrations`. Migrations run
 * inside a transaction so a failure leaves the schema untouched.
 */
interface Migration {
  id: number
  name: string
  up: (db: Database.Database) => void
}

const migrations: Migration[] = [
  {
    id: 1,
    name: 'init',
    up: (db) => {
      db.exec(`
        CREATE TABLE products (
          id            TEXT PRIMARY KEY,
          barcode       TEXT NOT NULL UNIQUE,
          name          TEXT NOT NULL,
          category      TEXT NOT NULL,
          purchase_price REAL NOT NULL DEFAULT 0,
          sale_price    REAL NOT NULL DEFAULT 0,
          stock         INTEGER NOT NULL DEFAULT 0,
          description   TEXT,
          created_at    TEXT NOT NULL,
          updated_at    TEXT NOT NULL
        );
        CREATE INDEX idx_products_name ON products(name);
        CREATE INDEX idx_products_category ON products(category);

        CREATE TABLE sales (
          id          TEXT PRIMARY KEY,
          subtotal    REAL NOT NULL,
          tax         REAL NOT NULL DEFAULT 0,
          discount    REAL NOT NULL DEFAULT 0,
          total       REAL NOT NULL,
          profit      REAL NOT NULL,
          item_count  INTEGER NOT NULL,
          created_at  TEXT NOT NULL
        );
        CREATE INDEX idx_sales_created_at ON sales(created_at);

        CREATE TABLE sale_items (
          id             TEXT PRIMARY KEY,
          sale_id        TEXT NOT NULL,
          product_id     TEXT,
          name           TEXT NOT NULL,
          barcode        TEXT NOT NULL,
          quantity       INTEGER NOT NULL,
          unit_price     REAL NOT NULL,
          purchase_price REAL NOT NULL,
          subtotal       REAL NOT NULL,
          profit         REAL NOT NULL,
          FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        );
        CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
        CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

        CREATE TABLE expenses (
          id          TEXT PRIMARY KEY,
          title       TEXT NOT NULL,
          amount      REAL NOT NULL,
          category    TEXT NOT NULL,
          description TEXT,
          created_at  TEXT NOT NULL
        );
        CREATE INDEX idx_expenses_created_at ON expenses(created_at);
        CREATE INDEX idx_expenses_category ON expenses(category);

        CREATE TABLE settings (
          key   TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `)
    }
  }
]

export function runMigrations(): void {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `)

  const appliedIds = new Set(
    db.prepare('SELECT id FROM schema_migrations').all().map((r) => (r as { id: number }).id)
  )

  const insert = db.prepare(
    'INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)'
  )

  for (const migration of migrations) {
    if (appliedIds.has(migration.id)) continue
    const tx = db.transaction(() => {
      migration.up(db)
      insert.run(migration.id, migration.name, new Date().toISOString())
    })
    tx()
  }
}
