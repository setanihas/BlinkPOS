import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'
import { api } from '../api/factory'
import { toast } from '../stores/toastStore'

/**
 * Global barcode listener.
 * - If user is NOT on /pos, scans are intercepted, the product is added to cart,
 *   and the user is redirected to /pos automatically.
 * - If user IS on /pos, the existing local handler takes over (this is a no-op).
 */
export function useGlobalScanner(): void {
  const navigate  = useNavigate()
  const location  = useLocation()
  const addProduct = useCartStore(s => s.addProduct)
  const buffer    = useRef('')
  const lastTime  = useRef(0)

  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const inField = target && (
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      )

      const now = Date.now()
      if (now - lastTime.current > 80) buffer.current = ''
      lastTime.current = now

      if (e.key === 'Enter') {
        const code = buffer.current.trim()
        buffer.current = ''

        // Only intercept when NOT on POS (POS has its own handler)
        if (code.length >= 6 && !location.pathname.startsWith('/pos')) {
          e.preventDefault()
          try {
            const product = await api.product.getByBarcode(code)
            if (product) {
              if (product.stock <= 0) {
                toast.error(`${product.name} stokta yok`)
              } else {
                addProduct(product)
                toast.success(`${product.name} sepete eklendi`)
              }
            } else {
              toast.error(`Barkod bulunamadı: ${code}`)
            }
            navigate('/pos')
          } catch {
            toast.error('Barkod okunamadı')
          }
        }
        return
      }

      if (e.key.length === 1 && /[0-9A-Za-z]/.test(e.key) && !inField) {
        buffer.current += e.key
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, location.pathname, addProduct])
}
