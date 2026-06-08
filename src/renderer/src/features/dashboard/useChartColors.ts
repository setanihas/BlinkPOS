import { useEffect, useState } from 'react'

function css(v: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#888'
}

export function useChartColors() {
  const [c, setC] = useState({
    accent: '#5d5fef', ok: '#16b364', er: '#f04438',
    wa: '#f79009', inn: '#2563eb', t1: '#9090aa',
    grid: 'rgba(255,255,255,.03)',
  })
  useEffect(() => {
    const update = () => setC({
      accent: css('--a0'), ok: css('--ok'), er: css('--er'),
      wa: css('--wa'), inn: css('--in'), t1: css('--t1'),
      grid: css('--grid'),
    })
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])
  return c
}
