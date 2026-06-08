import { Suspense, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Spinner } from '../ui/Feedback'
import { useGlobalScanner } from '../../hooks/useGlobalScanner'

function GlobalScannerProvider(): null {
  useGlobalScanner()
  return null
}

export function AppShell(): JSX.Element {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <GlobalScannerProvider />
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}

export function PageBody({ children, className = '' }: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={`flex-1 overflow-y-auto px-5 py-5 ${className}`}>{children}</div>
}
