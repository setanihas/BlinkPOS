import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import type { Product } from '@shared/domain'
import { productSchema, type ProductFormValues } from '@shared/schemas'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Field } from '../../components/ui/Field'
import { translateError } from '../../i18n'
import { useCreateProduct, useUpdateProduct, useProductCategories } from './hooks'
import { useCategories, useCategoryStore } from '../categories/useCategoryStore'
import { useInventorySettings } from '../../stores/inventorySettingsStore'
import { toast } from '../../stores/toastStore'

interface Props {
  open: boolean
  onClose: () => void
  product?: Product | null
  initialBarcode?: string
  onCreated?: (product: Product) => void
}

const COLORS = ['#5d5fef','#7c3aed','#db2777','#b45309','#047857','#0369a1','#c2410c','#4338ca']
function catColor(name: string): string {
  let h = 0; for (const c of name) h = (h << 5) - h + c.charCodeAt(0)
  return COLORS[Math.abs(h) % COLORS.length]
}

export function ProductFormModal({ open, onClose, product, initialBarcode, onCreated }: Props): JSX.Element {
  const { t } = useTranslation()
  const isEdit = Boolean(product)
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()

  const storedCats = useCategories()
  const { mergeFrom, addCategory } = useCategoryStore()
  const { data: apiCats } = useProductCategories()
  const { defaultStock } = useInventorySettings()

  const [catOpen, setCatOpen] = useState(false)
  const catRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (apiCats?.length) mergeFrom(apiCats) }, [apiCats])

  const emptyValues: ProductFormValues = {
    barcode: '', name: '', category: '',
    purchasePrice: 0, salePrice: 0,
    stock: defaultStock,            // ← use defaultStock
    description: '',
  }

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema), defaultValues: emptyValues,
  })
  const catValue = watch('category')

  useEffect(() => {
    if (!open) return
    if (product) {
      reset({
        barcode: product.barcode, name: product.name, category: product.category,
        purchasePrice: product.purchasePrice, salePrice: product.salePrice,
        stock: product.stock, description: product.description ?? '',
      })
    } else {
      reset({ ...emptyValues, barcode: initialBarcode ?? '' })
    }
  }, [open, product, initialBarcode, defaultStock])

  // Close dropdown on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const onSubmit = handleSubmit(async values => {
    try {
      if (values.category) addCategory(values.category)
      if (isEdit && product) {
        await updateMutation.mutateAsync({ id: product.id, dto: values })
        toast.success(t('products.productUpdated'))
      } else {
        const created = await createMutation.mutateAsync(values)
        toast.success(t('products.productCreated'))
        onCreated?.(created)
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('products.saveFailed'))
    }
  })

  const saving = createMutation.isPending || updateMutation.isPending

  const selectCat = (cat: string) => {
    setValue('category', cat, { shouldValidate: true })
    setCatOpen(false)
  }

  const filtered = storedCats.filter(c =>
    !catValue || c.toLowerCase().includes(catValue.toLowerCase())
  )

  return (
    <Modal open={open} onClose={onClose}
      title={isEdit ? t('products.editProduct') : t('products.createProduct')}
      size="md"
      footer={<>
        <Button variant="secondary" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
        <Button size="sm" onClick={onSubmit} loading={saving}>
          {isEdit ? t('common.saveChanges') : t('products.createProduct')}
        </Button>
      </>}
    >
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
        <Field label={t('products.fieldBarcode')} required
          error={translateError(errors.barcode?.message)} className="col-span-2">
          <Input {...register('barcode')} invalid={!!errors.barcode}
            placeholder={t('products.barcodePlaceholder')} autoFocus={!isEdit} />
        </Field>

        <Field label={t('products.fieldName')} required
          error={translateError(errors.name?.message)} className="col-span-2">
          <Input {...register('name')} invalid={!!errors.name}
            placeholder={t('products.namePlaceholder')} />
        </Field>

        {/* Category combobox */}
        <Field label={t('products.fieldCategory')} required
          error={translateError(errors.category?.message)}>
          <div ref={catRef} className="relative">
            <Input {...register('category')} invalid={!!errors.category}
              placeholder={t('products.categoryPlaceholder')}
              onFocus={() => setCatOpen(true)} autoComplete="off" />
            <button type="button" onClick={() => setCatOpen(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-t2 hover:text-t0 transition-colors">
              <ChevronDown size={12} className={catOpen ? 'rotate-180 transition-transform duration-150' : 'transition-transform duration-150'} />
            </button>
            {catOpen && filtered.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border overflow-hidden"
                style={{ background: 'var(--s0)', borderColor: 'var(--b1)', boxShadow: 'var(--sh3)' }}>
                {filtered.map(cat => (
                  <button key={cat} type="button" onMouseDown={() => selectCat(cat)}
                    className="w-full text-left px-3 py-2 text-sm text-t0 hover:bg-s2 transition-colors flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-md text-2xs font-bold text-white"
                      style={{ background: catColor(cat) }}>{cat[0]?.toUpperCase()}</span>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        {/* Stock with default indicator */}
        <Field label={t('products.fieldStock')} required
          error={translateError(errors.stock?.message)}>
          <Input type="number" step="1" min="0"
            {...register('stock', { valueAsNumber: true })} invalid={!!errors.stock} />
        </Field>

        <Field label={t('products.fieldPurchasePrice')} required
          error={translateError(errors.purchasePrice?.message)}>
          <Input type="number" step="0.01" min="0"
            {...register('purchasePrice', { valueAsNumber: true })} invalid={!!errors.purchasePrice} />
        </Field>

        <Field label={t('products.fieldSalePrice')} required
          error={translateError(errors.salePrice?.message)}>
          <Input type="number" step="0.01" min="0"
            {...register('salePrice', { valueAsNumber: true })} invalid={!!errors.salePrice} />
        </Field>

        <Field label={t('products.fieldDescription')}
          error={translateError(errors.description?.message)} className="col-span-2">
          <Input {...register('description')} placeholder={t('common.optional')} />
        </Field>
      </form>
    </Modal>
  )
}
