import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear
} from 'date-fns'
import type { DateRange } from '@shared/domain'

export type DateRangePreset = 'today' | 'week' | 'month' | 'year' | 'custom'

/** Compute an inclusive ISO `DateRange` for a named preset. */
export function presetToRange(preset: Exclude<DateRangePreset, 'custom'>, now = new Date()): DateRange {
  switch (preset) {
    case 'today':
      return { from: startOfDay(now).toISOString(), to: endOfDay(now).toISOString() }
    case 'week':
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        to: endOfWeek(now, { weekStartsOn: 1 }).toISOString()
      }
    case 'month':
      return { from: startOfMonth(now).toISOString(), to: endOfMonth(now).toISOString() }
    case 'year':
      return { from: startOfYear(now).toISOString(), to: endOfYear(now).toISOString() }
  }
}

/** Build a range from two yyyy-MM-dd date inputs (inclusive). */
export function customRange(fromDate: string, toDate: string): DateRange {
  return {
    from: startOfDay(new Date(fromDate)).toISOString(),
    to: endOfDay(new Date(toDate)).toISOString()
  }
}
