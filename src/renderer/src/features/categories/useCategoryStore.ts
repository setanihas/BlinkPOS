import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CategoryStore {
  productCategories: string[]   // user-managed list
  addCategory:    (name: string)           => void
  removeCategory: (name: string)           => void
  renameCategory: (old: string, next: string) => void
  mergeFrom:      (apiCategories: string[]) => void
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      productCategories: [],

      addCategory: (name) => {
        const n = name.trim()
        if (!n) return
        const exists = get().productCategories.some(c => c.toLowerCase() === n.toLowerCase())
        if (!exists)
          set(s => ({ productCategories: [...s.productCategories, n].sort() }))
      },

      removeCategory: (name) =>
        set(s => ({ productCategories: s.productCategories.filter(c => c !== name) })),

      renameCategory: (old, next) => {
        const n = next.trim()
        if (!n || n === old) return
        set(s => ({
          productCategories: s.productCategories
            .map(c => (c === old ? n : c))
            .sort()
        }))
      },

      /** Merge categories that come from the API (product.categories()) */
      mergeFrom: (api) => {
        const existing = get().productCategories
        const toAdd = api.filter(
          c => !existing.some(e => e.toLowerCase() === c.toLowerCase())
        )
        if (toAdd.length)
          set(s => ({ productCategories: [...s.productCategories, ...toAdd].sort() }))
      }
    }),
    { name: 'pos-categories-v1' }
  )
)

/** Convenience hook for just reading the list */
export const useCategories = () => useCategoryStore(s => s.productCategories)
