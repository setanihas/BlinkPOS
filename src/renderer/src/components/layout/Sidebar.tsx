import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, ScanLine, Package,
  Receipt, BarChart3, Settings, Store
} from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { cn } from '../../lib/cn'

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'nav.dashboard', end: true },
  { to: '/pos',      icon: ScanLine,        label: 'nav.pos' },
  { to: '/products', icon: Package,         label: 'nav.products' },
  { to: '/expenses', icon: Receipt,         label: 'nav.expenses' },
  { to: '/reports',  icon: BarChart3,       label: 'nav.reports' },
  { to: '/settings', icon: Settings,        label: 'nav.settings' },
] as const

export function Sidebar(): JSX.Element {
  const { t } = useTranslation()
  const cartCount = useCartStore(s => s.lines.reduce((n, l) => n + l.quantity, 0))

  return (
    <aside className="flex flex-col shrink-0 border-r"
      style={{ width: 'var(--sidebar-w)', background: 'var(--s0)', borderColor: 'var(--b0)' }}>

      {/* macOS traffic-lights clearance */}
      <div className="drag shrink-0" style={{ height: 24 }} />

      {/* Brand */}
      <div className="drag px-3 pb-3">
        <div className="no-drag flex items-center gap-2.5 px-2.5 py-2 rounded-md"
          style={{ background: 'var(--s1)' }}>
          <div className="flex items-center justify-center w-7 h-7 rounded shrink-0"
            style={{ background: 'var(--a0)', boxShadow: '0 2px 6px rgba(93,95,239,.3)' }}>
            <Store size={14} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-t0 truncate leading-tight">{t('nav.appName')}</p>
            <p className="text-2xs text-t2 leading-tight">{t('nav.localMode')}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-px">
        <p className="px-2 mb-1 mt-0.5 text-2xs font-semibold uppercase tracking-widest text-t2">
          {t('nav.navSection')}
        </p>

        {NAV.map(({ to, icon: Icon, label, ...rest }) => (
          <NavLink key={to} to={to} end={'end' in rest ? rest.end : false}
            className={({ isActive }) => cn(
              'relative flex items-center gap-2.5 h-8 px-2.5 rounded-md text-sm font-medium',
              'transition-colors duration-100 select-none',
              isActive ? 'text-t0' : 'text-t1 hover:text-t0 hover:bg-s2'
            )}>
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute inset-0 rounded-md" style={{ background: 'var(--s3)' }} />}
                {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full" style={{ background: 'var(--a0)' }} />}
                <Icon size={14} className="relative shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="relative flex-1 leading-none">{t(label)}</span>
                {to === '/pos' && cartCount > 0 && (
                  <span className="relative flex items-center justify-center min-w-[16px] h-4 px-1 rounded text-white font-bold"
                    style={{ background: 'var(--a0)', fontSize: 10 }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--b0)' }}>
        <div className="flex items-center gap-1.5 px-2">
          <span className="flex w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--ok-t)' }} />
          <p className="text-2xs text-t2">{t('nav.offlineMode')}</p>
        </div>
      </div>
    </aside>
  )
}
