import type { Product, Expense } from './entities'

/** Aggregated read models returned by the analytics layer. */

export interface RevenueSummary {
  todayRevenue: number
  weekRevenue: number
  monthRevenue: number
  yearRevenue: number
  rangeRevenue: number
  rangeProfit: number
  rangeExpenses: number
  rangeNet: number
  salesCount: number
}

export interface TimeSeriesPoint {
  date: string
  revenue: number
  profit: number
}

export interface TopProduct {
  productId: string
  name: string
  quantitySold: number
  revenue: number
  profit: number
}

export interface ExpenseBreakdownSlice {
  category: string
  total: number
}

export interface StockMovementPoint {
  date: string
  unitsSold: number
}

export interface DashboardData {
  summary: RevenueSummary
  revenueTrend: TimeSeriesPoint[]
  topProducts: TopProduct[]
  expenseBreakdown: ExpenseBreakdownSlice[]
  stockMovement: StockMovementPoint[]
  lowStockProducts: Product[]
}

export interface InventoryReportRow {
  product: Product
  stockValue: number
  potentialRevenue: number
}

export interface ReportBundle {
  topProducts: TopProduct[]
  revenueTrend: TimeSeriesPoint[]
  expenseBreakdown: ExpenseBreakdownSlice[]
  expenses: Expense[]
  inventory: InventoryReportRow[]
  summary: RevenueSummary
}
