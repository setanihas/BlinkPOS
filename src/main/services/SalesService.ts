import { v4 as uuid } from 'uuid'
import type { Sale, SaleItem, CreateSaleDTO, SaleQuery, Paginated } from '@shared/domain'
import { getDb } from '../db/connection'
import { SalesRepository } from '../repositories/SalesRepository'
import { ProductRepository } from '../repositories/ProductRepository'

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100

/**
 * Business logic for sales. Completing a sale is a single SQLite transaction:
 * stock is decremented for every line and the sale + items are persisted
 * atomically, so a mid-sale failure leaves inventory untouched.
 */
export class SalesService {
  constructor(
    private readonly salesRepo: SalesRepository = new SalesRepository(),
    private readonly productRepo: ProductRepository = new ProductRepository()
  ) {}

  create(dto: CreateSaleDTO): Sale {
    if (dto.items.length === 0) {
      throw new Error('Cannot complete an empty sale')
    }

    const saleId = uuid()
    const createdAt = new Date().toISOString()

    const items: SaleItem[] = dto.items.map((line) => {
      const lineSubtotal = round2(line.unitPrice * line.quantity)
      const lineProfit = round2((line.unitPrice - line.purchasePrice) * line.quantity)
      return {
        id: uuid(),
        saleId,
        productId: line.productId,
        name: line.name,
        barcode: line.barcode,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        purchasePrice: line.purchasePrice,
        subtotal: lineSubtotal,
        profit: lineProfit
      }
    })

    const subtotal = round2(items.reduce((sum, i) => sum + i.subtotal, 0))
    const discount = round2(Math.max(0, dto.discount))
    const taxedBase = Math.max(0, subtotal - discount)
    const tax = round2((taxedBase * Math.max(0, dto.taxRate)) / 100)
    const total = round2(taxedBase + tax)
    const profit = round2(items.reduce((sum, i) => sum + i.profit, 0) - discount)
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

    const sale: Sale = {
      id: saleId,
      subtotal,
      tax,
      discount,
      total,
      profit,
      itemCount,
      createdAt,
      items
    }

    const db = getDb()
    const tx = db.transaction(() => {
      for (const item of items) {
        if (item.productId) {
          this.productRepo.decrementStock(item.productId, item.quantity)
        }
      }
      this.salesRepo.insertSale(sale)
    })
    tx()

    return sale
  }

  list(query: SaleQuery): Paginated<Sale> {
    return this.salesRepo.list(query)
  }

  getById(id: string): Sale | null {
    return this.salesRepo.getById(id)
  }
}
