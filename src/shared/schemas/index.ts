import { z } from 'zod'

/**
 * Zod schemas — the single validation source for React Hook Form (renderer)
 * and service-boundary guards (main process). Keep field shapes aligned with
 * the DTOs in `domain/dto.ts`.
 */

const price = z
  .number({ invalid_type_error: 'validation.number' })
  .min(0, 'validation.negative')
  .finite()

const nonNegativeInt = z
  .number({ invalid_type_error: 'validation.number' })
  .int('validation.integer')
  .min(0, 'validation.negative')

// EAN-13 / UPC-A are 8, 12 or 13 numeric digits. Allow 8–13 to be lenient.
export const barcodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6,14}$/, 'validation.barcode')

export const productSchema = z
  .object({
    barcode: barcodeSchema,
    name: z.string().trim().min(1, 'validation.nameRequired').max(120),
    category: z.string().trim().min(1, 'validation.categoryRequired').max(60),
    purchasePrice: price,
    salePrice: price,
    stock: nonNegativeInt,
    description: z.string().trim().max(500).nullish()
  })
  .refine((data) => data.salePrice >= data.purchasePrice, {
    message: 'validation.salePriceMin',
    path: ['salePrice']
  })

export type ProductFormValues = z.infer<typeof productSchema>

export const expenseCategorySchema = z.enum([
  'rent',
  'electricity',
  'salary',
  'supplier',
  'transportation',
  'misc'
])

export const expenseSchema = z.object({
  title: z.string().trim().min(1, 'validation.titleRequired').max(120),
  amount: z.number({ invalid_type_error: 'validation.number' }).positive('validation.amountPositive'),
  category: expenseCategorySchema,
  description: z.string().trim().max(500).nullish()
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>

export const settingsSchema = z.object({
  currencyCode: z.string().trim().min(1).max(8),
  currencySymbol: z.string().trim().min(1).max(4),
  taxRate: z.number().min(0, 'validation.negative').max(100, 'validation.maxPercent'),
  storeName: z.string().trim().max(120),
  storeAddress: z.string().trim().max(200),
  storePhone: z.string().trim().max(40),
  lowStockThreshold: nonNegativeInt,
  theme: z.enum(['system', 'dark', 'light']),
  language: z.enum(['tr', 'en'])
})

export type SettingsFormValues = z.infer<typeof settingsSchema>
