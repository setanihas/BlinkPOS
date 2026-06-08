import type { DateRange, DashboardData, ReportBundle, RevenueSummary } from '@shared/domain'
import { AnalyticsRepository } from '../repositories/AnalyticsRepository'
import { SettingsRepository } from '../repositories/SettingsRepository'

/** Returns the inclusive ISO bounds for a named period anchored on `now`. */
function boundsFor(period: 'today' | 'week' | 'month' | 'year', now = new Date()): DateRange {
  const end = now.toISOString()
  const start = new Date(now)
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'week': {
      const day = start.getDay()
      const diff = (day + 6) % 7 // Monday as first day
      start.setDate(start.getDate() - diff)
      start.setHours(0, 0, 0, 0)
      break
    }
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    case 'year':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      break
  }
  return { from: start.toISOString(), to: end }
}

/** Aggregates read models for the dashboard, analytics charts and reports. */
export class AnalyticsService {
  constructor(
    private readonly repo: AnalyticsRepository = new AnalyticsRepository(),
    private readonly settingsRepo: SettingsRepository = new SettingsRepository()
  ) {}

  private buildSummary(range: DateRange): RevenueSummary {
    const today = boundsFor('today')
    const week = boundsFor('week')
    const month = boundsFor('month')
    const year = boundsFor('year')

    const rangeRevenue = this.repo.revenueBetween(range.from, range.to)
    const rangeExpenses = this.repo.expensesBetween(range.from, range.to)

    return {
      todayRevenue: this.repo.revenueBetween(today.from, today.to).revenue,
      weekRevenue: this.repo.revenueBetween(week.from, week.to).revenue,
      monthRevenue: this.repo.revenueBetween(month.from, month.to).revenue,
      yearRevenue: this.repo.revenueBetween(year.from, year.to).revenue,
      rangeRevenue: rangeRevenue.revenue,
      rangeProfit: rangeRevenue.profit,
      rangeExpenses,
      rangeNet: rangeRevenue.profit - rangeExpenses,
      salesCount: rangeRevenue.count
    }
  }

  dashboard(range: DateRange): DashboardData {
    const threshold = this.settingsRepo.get().lowStockThreshold
    return {
      summary: this.buildSummary(range),
      revenueTrend: this.repo.revenueTrend(range),
      topProducts: this.repo.topProducts(range, 5),
      expenseBreakdown: this.repo.expenseBreakdown(range),
      stockMovement: this.repo.stockMovement(range),
      lowStockProducts: this.repo.lowStockProducts(threshold)
    }
  }

  report(range: DateRange): ReportBundle {
    const products = this.repo.allProductsForInventory()
    return {
      summary: this.buildSummary(range),
      topProducts: this.repo.topProducts(range, 50),
      revenueTrend: this.repo.revenueTrend(range),
      expenseBreakdown: this.repo.expenseBreakdown(range),
      expenses: [],
      inventory: products.map((product) => ({
        product,
        stockValue: product.purchasePrice * product.stock,
        potentialRevenue: product.salePrice * product.stock
      }))
    }
  }
}
