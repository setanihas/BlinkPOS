import { format, parseISO } from 'date-fns'
import { tr, enUS } from 'date-fns/locale'
import type { Locale } from 'date-fns'

let currencySymbol = '$'
let dateLocale: Locale = tr
let numberLocale = 'tr-TR'

/** Update the symbol used by `formatMoney` (called when settings load/change). */
export function setCurrencySymbol(symbol: string): void {
  currencySymbol = symbol
}

export function getCurrencySymbol(): string {
  return currencySymbol
}

/** Switch the locale used for date and number formatting. */
export function setLocale(language: string): void {
  dateLocale = language === 'en' ? enUS : tr
  numberLocale = language === 'en' ? 'en-US' : 'tr-TR'
}

export function formatMoney(value: number): string {
  const formatted = Math.abs(value).toLocaleString(numberLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `${value < 0 ? '-' : ''}${currencySymbol}${formatted}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString(numberLocale)
}

export function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), 'dd MMM yyyy', { locale: dateLocale })
  } catch {
    return iso
  }
}

export function formatDateTime(iso: string): string {
  try {
    return format(parseISO(iso), 'dd MMM yyyy, HH:mm', { locale: dateLocale })
  } catch {
    return iso
  }
}

export function formatShortDate(iso: string): string {
  try {
    return format(parseISO(iso), 'dd MMM', { locale: dateLocale })
  } catch {
    return iso
  }
}
