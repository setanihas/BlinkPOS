import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Expense } from '@shared/domain'
import { expenseSchema, type ExpenseFormValues } from '@shared/schemas'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Field } from '../../components/ui/Field'
import { translateError } from '../../i18n'
import { toast } from '../../stores/toastStore'
import { EXPENSE_CATEGORY_VALUES, expenseCategoryLabel } from './categories'
import { useCreateExpense, useUpdateExpense } from './hooks'

interface ExpenseFormModalProps {
  open: boolean
  onClose: () => void
  expense?: Expense | null
}

const emptyValues: ExpenseFormValues = {
  title: '',
  amount: 0,
  category: 'misc',
  description: ''
}

export function ExpenseFormModal({ open, onClose, expense }: ExpenseFormModalProps): JSX.Element {
  const { t } = useTranslation()
  const isEdit = Boolean(expense)
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: emptyValues
  })

  useEffect(() => {
    if (!open) return
    if (expense) {
      reset({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        description: expense.description ?? ''
      })
    } else {
      reset(emptyValues)
    }
  }, [open, expense, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit && expense) {
        await updateMutation.mutateAsync({ id: expense.id, dto: values })
        toast.success(t('expenses.expenseUpdated'))
      } else {
        await createMutation.mutateAsync(values)
        toast.success(t('expenses.expenseAdded'))
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('expenses.saveFailed'))
    }
  })

  const saving = createMutation.isPending || updateMutation.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('expenses.editExpense') : t('expenses.addExpense')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSubmit} loading={saving}>
            {isEdit ? t('common.saveChanges') : t('expenses.addExpense')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-5">
        <Field label={t('expenses.fieldTitle')} required error={translateError(errors.title?.message)} className="col-span-2">
          <Input {...register('title')} invalid={!!errors.title} placeholder={t('expenses.titlePlaceholder')} autoFocus />
        </Field>
        <Field label={t('expenses.fieldAmount')} required error={translateError(errors.amount?.message)}>
          <Input
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            invalid={!!errors.amount}
          />
        </Field>
        <Field label={t('expenses.fieldCategory')} required error={translateError(errors.category?.message)}>
          <Select {...register('category')} invalid={!!errors.category}>
            {EXPENSE_CATEGORY_VALUES.map((c) => (
              <option key={c} value={c}>
                {expenseCategoryLabel(c)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('expenses.fieldDescription')} error={translateError(errors.description?.message)} className="col-span-2">
          <Input {...register('description')} placeholder={t('common.optional')} />
        </Field>
      </form>
    </Modal>
  )
}
