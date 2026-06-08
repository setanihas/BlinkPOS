import { lazy } from 'react'
import { createHashRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'

const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'))
const PosPage = lazy(() => import('../features/pos/PosPage'))
const ProductsPage = lazy(() => import('../features/products/ProductsPage'))
const ExpensesPage = lazy(() => import('../features/expenses/ExpensesPage'))
const ReportsPage = lazy(() => import('../features/reports/ReportsPage'))
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'))

/** Hash router (works under file:// in production Electron builds). */
export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'pos', element: <PosPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'expenses', element: <ExpensesPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  }
])
