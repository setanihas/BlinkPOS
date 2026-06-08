import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface InventorySettings {
  defaultStock: number
  setDefaultStock: (n: number) => void
}

export const useInventorySettings = create<InventorySettings>()(
  persist(
    set => ({
      defaultStock: 0,
      setDefaultStock: (n) => set({ defaultStock: Math.max(0, Math.floor(n)) }),
    }),
    { name: 'pos-inventory-settings-v1' }
  )
)
