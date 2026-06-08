import type { ExpenseCategory } from '@shared/domain'
import { i18n } from '../../i18n'

export const EXPENSE_CATEGORY_VALUES: ExpenseCategory[] = [
  'rent',
  'electricity',
  'salary',
  'supplier',
  'transportation',
  'misc'
]

/** Localised label for an expense category. */
export function expenseCategoryLabel(value: ExpenseCategory): string {
  return i18n.t(`categories.${value}` as const)
}
