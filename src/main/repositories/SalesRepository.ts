import type Database from 'better-sqlite3'
import type { Sale, SaleItem, SaleQuery, Paginated } from '@shared/domain'
import { getDb } from '../db/connection'

interface SaleRow {
  id: string
  subtotal: number
  tax: number
  discount: number
  total: number
  profit: number
  item_count: number
  created_at: string
}

interface SaleItemRow {
  id: string
  sale_id: string
  product_id: string | null
  name: string
  barcode: string
  quantity: number
  unit_price: number
  purchase_price: number
  subtotal: number
  profit: number
}

function mapSaleItem(row: SaleItemRow): SaleItem {
  return {
    id: row.id,
    saleId: row.sale_id,
    productId: row.product_id,
    name: row.name,
    barcode: row.barcode,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    purchasePrice: row.purchase_price,
    subtotal: row.subtotal,
    profit: row.profit
  }
}

/** Data-access for sales and their line items. */
export class SalesRepository {
  private get db(): Database.Database {
    return getDb()
  }

  /** Persist a sale and its items. Must be called inside a transaction. */
  insertSale(sale: Sale): void {
    this.db
      .prepare(
        `INSERT INTO sales (id, subtotal, tax, discount, total, profit, item_count, created_at)
         VALUES (@id, @subtotal, @tax, @discount, @total, @profit, @itemCount, @createdAt)`
      )
      .run({
        id: sale.id,
        subtotal: sale.subtotal,
        tax: sale.tax,
        discount: sale.discount,
        total: sale.total,
        profit: sale.profit,
        itemCount: sale.itemCount,
        createdAt: sale.createdAt
      })

    const stmt = this.db.prepare(
      `INSERT INTO sale_items
        (id, sale_id, product_id, name, barcode, quantity, unit_price, purchase_price, subtotal, profit)
       VALUES (@id, @saleId, @productId, @name, @barcode, @quantity, @unitPrice, @purchasePrice, @subtotal, @profit)`
    )
    for (const item of sale.items) {
      stmt.run({
        id: item.id,
        saleId: item.saleId,
        productId: item.productId,
        name: item.name,
        barcode: item.barcode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        purchasePrice: item.purchasePrice,
        subtotal: item.subtotal,
        profit: item.profit
      })
    }
  }

  getById(id: string): Sale | null {
    const row = this.db.prepare('SELECT * FROM sales WHERE id = ?').get(id) as SaleRow | undefined
    if (!row) return null
    const items = this.db
      .prepare('SELECT * FROM sale_items WHERE sale_id = ?')
      .all(id) as SaleItemRow[]
    return this.mapSale(row, items.map(mapSaleItem))
  }

  list(query: SaleQuery): Paginated<Sale> {
    const page = Math.max(1, query.page ?? 1)
    const pageSize = Math.min(200, Math.max(1, query.pageSize ?? 20))
    const offset = (page - 1) * pageSize

    const where: string[] = []
    const params: Record<string, unknown> = {}
    if (query.from) {
      where.push('created_at >= @from')
      params.from = query.from
    }
    if (query.to) {
      where.push('created_at <= @to')
      params.to = query.to
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const total = (
      this.db.prepare(`SELECT COUNT(*) as c FROM sales ${whereSql}`).get(params) as { c: number }
    ).c

    const rows = this.db
      .prepare(
        `SELECT * FROM sales ${whereSql} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`
      )
      .all({ ...params, limit: pageSize, offset }) as SaleRow[]

    const items = rows.map((row) => {
      const lineItems = this.db
        .prepare('SELECT * FROM sale_items WHERE sale_id = ?')
        .all(row.id) as SaleItemRow[]
      return this.mapSale(row, lineItems.map(mapSaleItem))
    })

    return { items, total, page, pageSize }
  }

  private mapSale(row: SaleRow, items: SaleItem[]): Sale {
    return {
      id: row.id,
      subtotal: row.subtotal,
      tax: row.tax,
      discount: row.discount,
      total: row.total,
      profit: row.profit,
      itemCount: row.item_count,
      createdAt: row.created_at,
      items
    }
  }
}
