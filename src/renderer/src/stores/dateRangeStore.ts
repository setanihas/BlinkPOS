import { create } from 'zustand'
import type { DateRange } from '@shared/domain'
import { presetToRange, type DateRangePreset } from '../lib/dateRange'

interface DateRangeState {
  preset: DateRangePreset
  range: DateRange
  setPreset: (preset: Exclude<DateRangePreset, 'custom'>) => void
  setCustom: (range: DateRange) => void
}

/** Global, app-wide date filter consumed by the dashboard, analytics & reports. */
export const useDateRangeStore = create<DateRangeState>((set) => ({
  preset: 'month',
  range: presetToRange('month'),
  setPreset: (preset) => set({ preset, range: presetToRange(preset) }),
  setCustom: (range) => set({ preset: 'custom', range })
}))
