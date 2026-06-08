import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Save, Download, Upload, Store, Globe,
  Palette, Database, Tag, Package, CheckCircle2
} from 'lucide-react'
import { settingsSchema, type SettingsFormValues } from '@shared/schemas'
import { Topbar } from '../../components/layout/Topbar'
import { PageBody } from '../../components/layout/AppShell'
import { Button, Input, Select, Field, Spinner, ErrorState } from '../../components/ui'
import { useSettings, useUpdateSettings } from '../../hooks/useSettings'
import { useTheme } from '../../app/ThemeProvider'
import { translateError, setLanguage, type Language } from '../../i18n'
import { toast } from '../../stores/toastStore'
import { api } from '../../api/factory'
import { CategoriesManager } from '../categories/CategoriesManager'
import { useCategoryStore } from '../categories/useCategoryStore'
import { useProductCategories } from '../products/hooks'
import { useInventorySettings } from '../../stores/inventorySettingsStore'

/* ── Section wrapper ─────────────────────────────────────── */
interface SectionProps {
  icon:        React.ElementType
  title:       string
  description?: string
  children:    React.ReactNode
  tone?:       'default' | 'accent'
}

const tones = {
  default: { bg: 'var(--a-bg)',    border: 'var(--a-ring)', color: 'var(--a0)' },
  accent:  { bg: 'var(--a-bg)',    border: 'var(--a-ring)', color: 'var(--a0)' },
}

function Section({ icon: Icon, title, description, children }: SectionProps): JSX.Element {
  const c = tones.default
  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--s0)', borderColor: 'var(--b0)' }}>
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b"
        style={{ borderColor: 'var(--b0)', background: 'var(--s1)' }}>
        <div className="flex items-center justify-center w-7 h-7 rounded border shrink-0"
          style={{ background: c.bg, borderColor: c.border, color: c.color }}>
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-t0 leading-tight">{title}</p>
          {description && <p className="text-xs text-t2 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

/* ── Field row — label + helper on left, input on right ──── */
function FieldRow({ label, helper, children }: {
  label: string; helper?: string; children: React.ReactNode
}): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-6 py-3 border-b last:border-b-0"
      style={{ borderColor: 'var(--b0)' }}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-sm font-medium text-t0">{label}</p>
        {helper && <p className="text-xs text-t2 leading-tight">{helper}</p>}
      </div>
      <div className="shrink-0 w-52">{children}</div>
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────── */
export default function SettingsPage(): JSX.Element {
  const { t } = useTranslation()
  const { settings, isLoading, isError, refetch } = useSettings()
  const updateMutation = useUpdateSettings()
  const { setPreference } = useTheme()
  const qc = useQueryClient()
  const [backingUp, setBackingUp] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [saveOk,    setSaveOk]    = useState(false)

  const { defaultStock, setDefaultStock } = useInventorySettings()
  const { mergeFrom } = useCategoryStore()
  const { data: apiCats } = useProductCategories()
  useEffect(() => { if (apiCats?.length) mergeFrom(apiCats) }, [apiCats])

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  })
  useEffect(() => { if (settings) reset(settings) }, [settings, reset])

  const onSubmit = handleSubmit(async values => {
    try {
      await updateMutation.mutateAsync(values)
      setPreference(values.theme)
      setLanguage(values.language as Language)
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 2500)
      toast.success(t('settings.settingsSaved'))
      reset(values)
    } catch (e) { toast.error(e instanceof Error ? e.message : t('settings.saveFailed')) }
  })

  const doBackup = async () => {
    setBackingUp(true)
    try { const r = await api.backup.export(); if (r.ok) toast.success(t('settings.backupExported')) }
    catch (e) { toast.error(e instanceof Error ? e.message : t('settings.backupFailed')) }
    finally { setBackingUp(false) }
  }
  const doRestore = async () => {
    setRestoring(true)
    try {
      const r = await api.backup.restore()
      if (r.ok) { await qc.invalidateQueries(); toast.success(t('settings.databaseRestored')) }
    } catch (e) { toast.error(e instanceof Error ? e.message : t('settings.restoreFailed')) }
    finally { setRestoring(false) }
  }

  const SaveBtn = () => (
    <Button size="sm" onClick={onSubmit} loading={updateMutation.isPending}
      leftIcon={saveOk ? <CheckCircle2 size={13} /> : <Save size={13} />}
      style={saveOk ? { background: 'var(--ok)' } : undefined}>
      {saveOk ? t('settings.settingsSaved') : t('common.saveChanges')}
      {isDirty && !saveOk && (
        <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-white/60 inline-block" />
      )}
    </Button>
  )

  return (
    <>
      <Topbar title={t('nav.settings')} subtitle={t('settings.subtitle')} actions={<SaveBtn />} />
      <PageBody>
        {isError ? (
          <ErrorState title={t('common.loadError')} description={t('common.loadErrorDesc')}
            retryLabel={t('common.retry')} onRetry={() => refetch()} />
        ) : isLoading || !settings ? (
          <Spinner />
        ) : (
          <form onSubmit={onSubmit}>
            <div className="max-w-2xl flex flex-col gap-4">

              {/* Store information */}
              <Section icon={Store} title={t('settings.storeInformation')} description={t('settings.storeDesc')}>
                <div className="flex flex-col -mt-1">
                  <FieldRow label={t('settings.storeName')}>
                    <Input {...register('storeName')} invalid={!!errors.storeName}
                      placeholder="örn. Ahmet'in Marketi" />
                  </FieldRow>
                  <FieldRow label={t('settings.address')}>
                    <Input {...register('storeAddress')} invalid={!!errors.storeAddress} />
                  </FieldRow>
                  <FieldRow label={t('settings.phone')}>
                    <Input {...register('storePhone')} invalid={!!errors.storePhone}
                      placeholder="+90 5XX XXX XX XX" />
                  </FieldRow>
                </div>
                {(errors.storeName || errors.storeAddress || errors.storePhone) && (
                  <p className="text-xs mt-2" style={{ color: 'var(--er-t)' }}>
                    {translateError(errors.storeName?.message || errors.storeAddress?.message || errors.storePhone?.message)}
                  </p>
                )}
              </Section>

              {/* Sales & currency */}
              <Section icon={Globe} title={t('settings.salesCurrency')} description={t('settings.salesCurrencyDesc')}>
                <div className="flex flex-col -mt-1">
                  <FieldRow label={t('settings.currencyCode')}>
                    <Input {...register('currencyCode')} invalid={!!errors.currencyCode} placeholder="TRY" />
                  </FieldRow>
                  <FieldRow label={t('settings.currencySymbol')}>
                    <Input {...register('currencySymbol')} invalid={!!errors.currencySymbol} placeholder="₺" />
                  </FieldRow>
                  <FieldRow label={t('settings.taxRate')}>
                    <Input type="number" step="0.01" min="0" max="100"
                      {...register('taxRate', { valueAsNumber: true })} invalid={!!errors.taxRate} />
                  </FieldRow>
                </div>
              </Section>

              {/* Inventory defaults */}
              <Section icon={Package} title={t('settings.inventory')} description={t('settings.inventoryDesc')}>
                <div className="flex flex-col -mt-1">
                  <FieldRow label={t('settings.lowStockThreshold')} helper={t('settings.lowStockThresholdDesc')}>
                    <Input type="number" step="1" min="0"
                      {...register('lowStockThreshold', { valueAsNumber: true })}
                      invalid={!!errors.lowStockThreshold} />
                  </FieldRow>
                  <FieldRow label={t('settings.defaultStock')} helper={t('settings.defaultStockDesc')}>
                    <div className="flex flex-col gap-2">
                      <Input type="number" step="1" min="0"
                        value={defaultStock}
                        onChange={e => setDefaultStock(Number(e.target.value))}
                      />
                      {/* Quick presets */}
                      <div className="flex items-center gap-1.5">
                        {[0, 10, 20, 50].map(n => (
                          <button key={n} type="button" onClick={() => setDefaultStock(n)}
                            className="flex-1 h-6 rounded border text-xs font-medium transition-all"
                            style={{
                              background: defaultStock === n ? 'var(--a-bg)' : 'var(--s2)',
                              borderColor: defaultStock === n ? 'var(--a0)' : 'var(--b1)',
                              color: defaultStock === n ? 'var(--a0)' : 'var(--t1)',
                            }}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </FieldRow>
                </div>
              </Section>

              {/* Appearance & Language */}
              <Section icon={Palette} title={t('settings.appearanceLanguage')} description={t('settings.appearanceDesc')}>
                <div className="flex flex-col -mt-1">
                  <FieldRow label={t('settings.theme')}>
                    <Select {...register('theme')} invalid={!!errors.theme}>
                      <option value="system">{t('settings.followSystem')}</option>
                      <option value="dark">{t('settings.dark')}</option>
                      <option value="light">{t('settings.light')}</option>
                    </Select>
                  </FieldRow>
                  <FieldRow label={t('settings.language')}>
                    <Select {...register('language')} invalid={!!errors.language}>
                      <option value="tr">{t('settings.languageTurkish')}</option>
                      <option value="en">{t('settings.languageEnglish')}</option>
                    </Select>
                  </FieldRow>
                </div>
              </Section>

              {/* Categories — outside form submit */}
              <Section icon={Tag} title={t('settings.categoriesTitle')} description={t('settings.categoriesDesc')}>
                <CategoriesManager />
              </Section>

              {/* Backup & restore */}
              <Section icon={Database} title={t('settings.backupRestore')} description={t('settings.backupRestoreDesc')}>
                <div className="flex items-center gap-3 pt-1">
                  <Button type="button" variant="secondary" size="sm"
                    onClick={doBackup} loading={backingUp} leftIcon={<Download size={13} />}>
                    {t('settings.exportBackup')}
                  </Button>
                  <Button type="button" variant="secondary" size="sm"
                    onClick={doRestore} loading={restoring} leftIcon={<Upload size={13} />}>
                    {t('settings.restoreBackup')}
                  </Button>
                </div>
              </Section>

              {/* Floating save bar when dirty */}
              {isDirty && (
                <div className="sticky bottom-4 flex items-center justify-between px-4 py-3 rounded-lg border shadow-3"
                  style={{ background: 'var(--s0)', borderColor: 'var(--b1)' }}>
                  <p className="text-sm text-t1">Kaydedilmemiş değişiklikler var.</p>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => reset()}>
                      Geri al
                    </Button>
                    <SaveBtn />
                  </div>
                </div>
              )}

            </div>
          </form>
        )}
      </PageBody>
    </>
  )
}
