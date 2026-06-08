import type Database from 'better-sqlite3'
import { v4 as uuid } from 'uuid'
import type {
  Expense,
  ExpenseCategory,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  ExpenseQuery,
  Paginated
} from '@shared/domain'
import { getDb } from '../db/connection'

interface ExpenseRow {
  id: string
  title: string
  amount: number
  category: string
  description: string | null
  created_at: string
}

function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    title: row.title,
    amount: row.amount,
    category: row.category as ExpenseCategory,
    description: row.description,
    createdAt: row.created_at
  }
}

/** Data-access for income/expense records. */
export class ExpenseRepository {
  private get db(): Database.Database {
    return getDb()
  }

  list(query: ExpenseQuery): Paginated<Expense> {
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
    if (query.category) {
      where.push('category = @category')
      params.category = query.category
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const total = (
      this.db.prepare(`SELECT COUNT(*) as c FROM expenses ${whereSql}`).get(params) as {
        c: number
      }
    ).c

    const rows = this.db
      .prepare(
        `SELECT * FROM expenses ${whereSql} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`
      )
      .all({ ...params, limit: pageSize, offset }) as ExpenseRow[]

    return { items: rows.map(mapExpense), total, page, pageSize }
  }

  getById(id: string): Expense | null {
    const row = this.db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as
      | ExpenseRow
      | undefined
    return row ? mapExpense(row) : null
  }

  create(dto: CreateExpenseDTO): Expense {
    const id = uuid()
    this.db
      .prepare(
        `INSERT INTO expenses (id, title, amount, category, description, created_at)
         VALUES (@id, @title, @amount, @category, @description, @createdAt)`
      )
      .run({
        id,
        title: dto.title,
        amount: dto.amount,
        category: dto.category,
        description: dto.description ?? null,
        createdAt: new Date().toISOString()
      })
    return this.getById(id) as Expense
  }

  update(id: string, dto: UpdateExpenseDTO): Expense {
    const existing = this.getById(id)
    if (!existing) throw new Error('Expense not found')
    const merged = {
      id,
      title: dto.title ?? existing.title,
      amount: dto.amount ?? existing.amount,
      category: dto.category ?? existing.category,
      description: dto.description !== undefined ? dto.description : existing.description
    }
    this.db
      .prepare(
        `UPDATE expenses SET title=@title, amount=@amount, category=@category, description=@description WHERE id=@id`
      )
      .run(merged)
    return this.getById(id) as Expense
  }

  remove(id: string): void {
    this.db.prepare('DELETE FROM expenses WHERE id = ?').run(id)
  }
}
