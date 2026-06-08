import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { tr } from './locales/tr'
import { setLocale } from '../lib/format'

export type Language = 'tr' | 'en'

export const STORAGE_KEY = 'market-pos-language'
export const DEFAULT_LANGUAGE: Language = 'tr'

function initialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'en' || stored === 'tr' ? stored : DEFAULT_LANGUAGE
}

const startLanguage = initialLanguage()

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    tr: { translation: tr }
  },
  lng: startLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false
})

// Keep date/number formatting in sync with the active language.
setLocale(startLanguage)

/** Change the active UI language and persist the choice. */
export function setLanguage(language: Language): void {
  if (i18n.language !== language) {
    void i18n.changeLanguage(language)
  }
  setLocale(language)
  localStorage.setItem(STORAGE_KEY, language)
}

/** Translate a Zod validation message that may be an i18n key (e.g. `validation.*`). */
export function translateError(message?: string): string | undefined {
  if (!message) return undefined
  return message.startsWith('validation.') ? i18n.t(message as never) : message
}

export { i18n }
