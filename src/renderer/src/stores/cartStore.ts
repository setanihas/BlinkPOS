import { create } from 'zustand'
import type { Product, CartLineDTO } from '@shared/domain'

export interface CartLine extends CartLineDTO {
  stock: number
}

interface CartState {
  lines: CartLine[]
  discount: number
  /** Add a scanned/selected product, incrementing quantity if already present. */
  addProduct: (product: Product, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  increment: (productId: string) => void
  decrement: (productId: string) => void
  removeLine: (productId: string) => void
  setDiscount: (value: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  discount: 0,

  addProduct: (product, quantity = 1) =>
    set((state) => {
      const existing = state.lines.find((l) => l.productId === product.id)
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.productId === product.id
              ? { ...l, quantity: Math.min(l.stock, l.quantity + quantity) }
              : l
          )
        }
      }
      const line: CartLine = {
        productId: product.id,
        barcode: product.barcode,
        name: product.name,
        quantity: Math.min(product.stock, quantity) || 1,
        unitPrice: product.salePrice,
        purchasePrice: product.purchasePrice,
        stock: product.stock
      }
      return { lines: [...state.lines, line] }
    }),

  setQuantity: (productId, quantity) =>
    set((state) => ({
      lines: state.lines.map((l) =>
        l.productId === productId
          ? { ...l, quantity: Math.max(1, Math.min(l.stock, quantity)) }
          : l
      )
    })),

  increment: (productId) =>
    set((state) => ({
      lines: state.lines.map((l) =>
        l.productId === productId ? { ...l, quantity: Math.min(l.stock, l.quantity + 1) } : l
      )
    })),

  decrement: (productId) =>
    set((state) => ({
      lines: state.lines.map((l) =>
        l.productId === productId ? { ...l, quantity: Math.max(1, l.quantity - 1) } : l
      )
    })),

  removeLine: (productId) =>
    set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),

  setDiscount: (value) => set({ discount: Math.max(0, value) }),

  clear: () => set({ lines: [], discount: 0 })
}))

/** Derive totals from the current cart given a tax rate (%). */
export function computeCartTotals(
  lines: CartLine[],
  discount: number,
  taxRate: number
): { subtotal: number; tax: number; total: number; itemCount: number } {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  const taxedBase = Math.max(0, subtotal - discount)
  const tax = (taxedBase * Math.max(0, taxRate)) / 100
  const total = taxedBase + tax
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0)
  return {
    subtotal: round2(subtotal),
    tax: round2(tax),
    total: round2(total),
    itemCount
  }
}

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100
