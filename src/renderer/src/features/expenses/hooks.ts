import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  Expense,
  ExpenseQuery,
  Paginated,
  CreateExpenseDTO,
  UpdateExpenseDTO
} from '@shared/domain'
import { api } from '../../api/factory'
import { queryKeys } from '../../app/queryClient'

export function useExpenses(query: ExpenseQuery) {
  return useQuery<Paginated<Expense>>({
    queryKey: queryKeys.expenses(query),
    queryFn: () => api.expense.list(query),
    placeholderData: (prev) => prev
  })
}

function useInvalidateExpenses(): () => void {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['expenses'] })
    qc.invalidateQueries({ queryKey: ['dashboard'] })
    qc.invalidateQueries({ queryKey: ['report'] })
  }
}

export function useCreateExpense() {
  const invalidate = useInvalidateExpenses()
  return useMutation<Expense, Error, CreateExpenseDTO>({
    mutationFn: (dto) => api.expense.create(dto),
    onSuccess: invalidate
  })
}

export function useUpdateExpense() {
  const invalidate = useInvalidateExpenses()
  return useMutation<Expense, Error, { id: string; dto: UpdateExpenseDTO }>({
    mutationFn: ({ id, dto }) => api.expense.update(id, dto),
    onSuccess: invalidate
  })
}

export function useDeleteExpense() {
  const invalidate = useInvalidateExpenses()
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.expense.remove(id),
    onSuccess: invalidate
  })
}
