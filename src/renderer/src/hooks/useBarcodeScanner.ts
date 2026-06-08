import { useEffect, useRef } from 'react'

/**
 * Captures input from USB/Bluetooth barcode scanners that emulate a keyboard
 * (HID mode). Scanners type very fast and finish with Enter. We buffer rapid
 * keystrokes globally and, on Enter, emit the accumulated barcode — unless the
 * user is actively typing in a text field (so manual entry still works).
 *
 * @param onScan   called with the scanned barcode string
 * @param enabled  toggle capture (e.g. disable while a modal/form is open)
 */
export function useBarcodeScanner(onScan: (code: string) => void, enabled = true): void {
  const buffer = useRef('')
  const lastTime = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement | null
      const isTextField =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      const now = Date.now()
      // Reset the buffer if too much time passed between keystrokes (human typing).
      if (now - lastTime.current > 80) {
        buffer.current = ''
      }
      lastTime.current = now

      if (e.key === 'Enter') {
        const code = buffer.current.trim()
        buffer.current = ''
        if (code.length >= 6) {
          // Only intercept rapid scanner input; ignore Enter from manual fields.
          if (!isTextField) {
            e.preventDefault()
          }
          onScan(code)
        }
        return
      }

      if (e.key.length === 1 && /[0-9A-Za-z]/.test(e.key)) {
        if (!isTextField) {
          buffer.current += e.key
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onScan, enabled])
}
