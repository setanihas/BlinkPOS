import type Database from 'better-sqlite3'
import { v4 as uuid } from 'uuid'
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductQuery,
  Paginated
} from '@shared/domain'
import { getDb } from '../db/connection'
import { mapProduct, type ProductRow } from './mappers'

/**
 * Data-access for products. Encapsulates all SQL; services and the rest of the
 * app depend only on these typed methods, never on the table layout.
 */
export class ProductRepository {
  private get db(): Database.Database {
    return getDb()
  }

  list(query: ProductQuery): Paginated<Product> {
    const page = Math.max(1, query.page ?? 1)
    const pageSize = Math.min(200, Math.max(1, query.pageSize ?? 20))
    const offset = (page - 1) * pageSize

    const where: string[] = []
    const params: Record<string, unknown> = {}

    if (query.search) {
      where.push('(name LIKE @search OR barcode LIKE @search OR category LIKE @search)')
      params.search = `%${query.search}%`
    }
    if (query.category) {
      where.push('category = @category')
      params.category = query.category
    }
    if (query.lowStockOnly) {
      where.push('stock <= @threshold')
      params.threshold = 5
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const sortFieldMap: Record<NonNullable<ProductQuery['sortField']>, string> = {
      name: 'name',
      stock: 'stock',
      salePrice: 'sale_price',
      createdAt: 'created_at',
      purchasePrice: 'purchase_price'
    }
    const sortColumn = sortFieldMap[query.sortField ?? 'name']
    const sortDir = query.sortDirection === 'desc' ? 'DESC' : 'ASC'

    const total = (
      this.db.prepare(`SELECT COUNT(*) as c FROM products ${whereSql}`).get(params) as {
        c: number
      }
    ).c

    const rows = this.db
      .prepare(
        `SELECT * FROM products ${whereSql} ORDER BY ${sortColumn} ${sortDir} LIMIT @limit OFFSET @offset`
      )
      .all({ ...params, limit: pageSize, offset }) as ProductRow[]

    return {
      items: rows.map(mapProduct),
      total,
      page,
      pageSize
    }
  }

  getById(id: string): Product | null {
    const row = this.db.prepare('SELECT * FROM products WHERE id = ?').get(id) as
      | ProductRow
      | undefined
    return row ? mapProduct(row) : null
  }

  getByBarcode(barcode: string): Product | null {
    const row = this.db.prepare('SELECT * FROM products WHERE barcode = ?').get(barcode) as
      | ProductRow
      | undefined
    return row ? mapProduct(row) : null
  }

  create(dto: CreateProductDTO): Product {
    const now = new Date().toISOString()
    const id = uuid()
    this.db
      .prepare(
        `INSERT INTO products
          (id, barcode, name, category, purchase_price, sale_price, stock, description, created_at, updated_at)
         VALUES (@id, @barcode, @name, @category, @purchasePrice, @salePrice, @stock, @description, @createdAt, @updatedAt)`
      )
      .run({
        id,
        barcode: dto.barcode,
        name: dto.name,
        category: dto.category,
        purchasePrice: dto.purchasePrice,
        salePrice: dto.salePrice,
        stock: dto.stock,
        description: dto.description ?? null,
        createdAt: now,
        updatedAt: now
      })
    return this.getById(id) as Product
  }

  update(id: string, dto: UpdateProductDTO): Product {
    const existing = this.getById(id)
    if (!existing) throw new Error('Product not found')

    const merged = {
      barcode: dto.barcode ?? existing.barcode,
      name: dto.name ?? existing.name,
      category: dto.category ?? existing.category,
      purchasePrice: dto.purchasePrice ?? existing.purchasePrice,
      salePrice: dto.salePrice ?? existing.salePrice,
      stock: dto.stock ?? existing.stock,
      description: dto.description !== undefined ? dto.description : existing.description,
      updatedAt: new Date().toISOString(),
      id
    }

    this.db
      .prepare(
        `UPDATE products SET
          barcode=@barcode, name=@name, category=@category,
          purchase_price=@purchasePrice, sale_price=@salePrice, stock=@stock,
          description=@description, updated_at=@updatedAt
         WHERE id=@id`
      )
      .run(merged)
    return this.getById(id) as Product
  }

  remove(id: string): void {
    this.db.prepare('DELETE FROM products WHERE id = ?').run(id)
  }

  /** Decrement stock atomically; throws if insufficient. Caller wraps in a tx. */
  decrementStock(id: string, quantity: number): void {
    const result = this.db
      .prepare('UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ? AND stock >= ?')
      .run(quantity, new Date().toISOString(), id, quantity)
    if (result.changes === 0) {
      throw new Error('Insufficient stock')
    }
  }

  categories(): string[] {
    const rows = this.db
      .prepare('SELECT DISTINCT category FROM products ORDER BY category ASC')
      .all() as { category: string }[]
    return rows.map((r) => r.category)
  }
}
