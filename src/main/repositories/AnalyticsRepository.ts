import type Database from 'better-sqlite3'
import type {
  DateRange,
  TimeSeriesPoint,
  TopProduct,
  ExpenseBreakdownSlice,
  StockMovementPoint,
  Product
} from '@shared/domain'
import { getDb } from '../db/connection'
import { mapProduct, type ProductRow } from './mappers'

/** Read-only aggregate queries powering the dashboard, analytics and reports. */
export class AnalyticsRepository {
  private get db(): Database.Database {
    return getDb()
  }

  revenueBetween(from: string, to: string): { revenue: number; profit: number; count: number } {
    const row = this.db
      .prepare(
        `SELECT COALESCE(SUM(total), 0) as revenue, COALESCE(SUM(profit), 0) as profit, COUNT(*) as count
         FROM sales WHERE created_at >= ? AND created_at <= ?`
      )
      .get(from, to) as { revenue: number; profit: number; count: number }
    return row
  }

  expensesBetween(from: string, to: string): number {
    const row = this.db
      .prepare(
        `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE created_at >= ? AND created_at <= ?`
      )
      .get(from, to) as { total: number }
    return row.total
  }

  revenueTrend(range: DateRange): TimeSeriesPoint[] {
    const rows = this.db
      .prepare(
        `SELECT substr(created_at, 1, 10) as date,
                COALESCE(SUM(total), 0) as revenue,
                COALESCE(SUM(profit), 0) as profit
         FROM sales
         WHERE created_at >= ? AND created_at <= ?
         GROUP BY date
         ORDER BY date ASC`
      )
      .all(range.from, range.to) as { date: string; revenue: number; profit: number }[]
    return rows.map((r) => ({ date: r.date, revenue: r.revenue, profit: r.profit }))
  }

  topProducts(range: DateRange, limit = 5): TopProduct[] {
    const rows = this.db
      .prepare(
        `SELECT si.product_id as productId, si.name as name,
                SUM(si.quantity) as quantitySold,
                SUM(si.subtotal) as revenue,
                SUM(si.profit) as profit
         FROM sale_items si
         JOIN sales s ON s.id = si.sale_id
         WHERE s.created_at >= ? AND s.created_at <= ?
         GROUP BY si.product_id, si.name
         ORDER BY quantitySold DESC
         LIMIT ?`
      )
      .all(range.from, range.to, limit) as TopProduct[]
    return rows.map((r) => ({
      productId: r.productId ?? '',
      name: r.name,
      quantitySold: r.quantitySold,
      revenue: r.revenue,
      profit: r.profit
    }))
  }

  expenseBreakdown(range: DateRange): ExpenseBreakdownSlice[] {
    const rows = this.db
      .prepare(
        `SELECT category, COALESCE(SUM(amount), 0) as total
         FROM expenses
         WHERE created_at >= ? AND created_at <= ?
         GROUP BY category
         ORDER BY total DESC`
      )
      .all(range.from, range.to) as ExpenseBreakdownSlice[]
    return rows
  }

  stockMovement(range: DateRange): StockMovementPoint[] {
    const rows = this.db
      .prepare(
        `SELECT substr(s.created_at, 1, 10) as date, SUM(si.quantity) as unitsSold
         FROM sale_items si
         JOIN sales s ON s.id = si.sale_id
         WHERE s.created_at >= ? AND s.created_at <= ?
         GROUP BY date
         ORDER BY date ASC`
      )
      .all(range.from, range.to) as StockMovementPoint[]
    return rows
  }

  lowStockProducts(threshold: number, limit = 20): Product[] {
    const rows = this.db
      .prepare(`SELECT * FROM products WHERE stock <= ? ORDER BY stock ASC LIMIT ?`)
      .all(threshold, limit) as ProductRow[]
    return rows.map(mapProduct)
  }

  allProductsForInventory(): Product[] {
    const rows = this.db.prepare('SELECT * FROM products ORDER BY name ASC').all() as ProductRow[]
    return rows.map(mapProduct)
  }
}
