import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Table({ children }: { children: ReactNode }): JSX.Element {
  return <div className="overflow-x-auto"><table className="w-full border-collapse">{children}</table></div>
}
export function THead({ children }: { children: ReactNode }): JSX.Element {
  return <thead style={{ borderBottom: '1px solid var(--b1)' }}><tr>{children}</tr></thead>
}
export function TH({ children, align = 'left', className }: { children?: ReactNode; align?: 'left'|'right'|'center'; className?: string }): JSX.Element {
  return (
    <th className={cn('h-9 px-3 text-xs font-medium text-t2 whitespace-nowrap',
      align === 'right' && 'text-right', align === 'center' && 'text-center', className)}>
      {children}
    </th>
  )
}
export function TBody({ children }: { children: ReactNode }): JSX.Element {
  return <tbody>{children}</tbody>
}
export function TR({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }): JSX.Element {
  return (
    <tr onClick={onClick}
      style={{ borderBottom: '1px solid var(--b0)' }}
      className={cn('transition-colors', onClick && 'cursor-pointer hover:bg-s1', className)}>
      {children}
    </tr>
  )
}
export function TD({ children, align = 'left', className }: { children?: ReactNode; align?: 'left'|'right'|'center'; className?: string }): JSX.Element {
  return (
    <td className={cn('h-12 px-3 text-sm text-t0',
      align === 'right' && 'text-right', align === 'center' && 'text-center', className)}>
      {children}
    </td>
  )
}
