import type {
  Expense,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  ExpenseQuery,
  Paginated
} from '@shared/domain'
import { expenseSchema } from '@shared/schemas'
import { ExpenseRepository } from '../repositories/ExpenseRepository'

/** Business logic for income/expense records. */
export class ExpenseService {
  constructor(private readonly repo: ExpenseRepository = new ExpenseRepository()) {}

  list(query: ExpenseQuery): Paginated<Expense> {
    return this.repo.list(query)
  }

  create(dto: CreateExpenseDTO): Expense {
    const parsed = expenseSchema.parse(dto)
    return this.repo.create({ ...parsed, description: parsed.description ?? null })
  }

  update(id: string, dto: UpdateExpenseDTO): Expense {
    return this.repo.update(id, dto)
  }

  remove(id: string): void {
    this.repo.remove(id)
  }
}
