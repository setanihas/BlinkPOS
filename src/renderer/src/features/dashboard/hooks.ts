import { useQuery } from '@tanstack/react-query'
import type { DashboardData, ReportBundle, DateRange } from '@shared/domain'
import { api } from '../../api/factory'
import { queryKeys } from '../../app/queryClient'

export function useDashboard(range: DateRange) {
  return useQuery<DashboardData>({
    queryKey: queryKeys.dashboard(range),
    queryFn: () => api.analytics.dashboard(range)
  })
}

export function useReport(range: DateRange) {
  return useQuery<ReportBundle>({
    queryKey: queryKeys.report(range),
    queryFn: () => api.analytics.report(range)
  })
}
