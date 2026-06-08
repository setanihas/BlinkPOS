import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from 'recharts'

import type { TimeSeriesPoint, TopProduct, ExpenseBreakdownSlice, StockMovementPoint } from '@shared/domain'
import { useChartColors } from './useChartColors'
import { formatMoney, formatShortDate } from '../../lib/format'
import { expenseCategoryLabel } from '../expenses/categories'
import type { ExpenseCategory } from '@shared/domain'

const TIP = {
  contentStyle: {
    background: 'var(--s1)', border: '1px solid var(--b1)',
    borderRadius: 6, fontSize: 12, color: 'var(--t0)',
    boxShadow: 'var(--sh3)', padding: '6px 10px',
  },
  itemStyle: { color: 'var(--t0)' },
  labelStyle: { color: 'var(--t1)', marginBottom: 4 },
  cursor: { stroke: 'var(--b2)', strokeWidth: 1 },
}

function AreaGrad({ id, color }: { id: string; color: string }): JSX.Element {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
      <stop offset="100%" stopColor={color} stopOpacity={0} />
    </linearGradient>
  )
}

export function RevenueTrendChart({ data }: { data: TimeSeriesPoint[] }): JSX.Element {
  const c = useChartColors()
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs><AreaGrad id="grad-rev" color={c.accent} /></defs>
        <CartesianGrid strokeDasharray="2 4" stroke={c.grid} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="transparent"
          tick={{ fill: c.t1, fontSize: 11 }} tickLine={false} />
        <YAxis tickFormatter={(v: number) => formatMoney(v)} stroke="transparent"
          tick={{ fill: c.t1, fontSize: 11 }} width={72} tickLine={false} />
        <Tooltip {...TIP} formatter={(v: number) => [formatMoney(v), 'Gelir']} labelFormatter={formatShortDate} />
        <Area type="monotone" dataKey="revenue" stroke={c.accent} strokeWidth={2}
          fill="url(#grad-rev)" dot={false} activeDot={{ r: 4, fill: c.accent, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ProfitTrendChart({ data }: { data: TimeSeriesPoint[] }): JSX.Element {
  const c = useChartColors()
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs><AreaGrad id="grad-profit" color={c.ok} /></defs>
        <CartesianGrid strokeDasharray="2 4" stroke={c.grid} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="transparent"
          tick={{ fill: c.t1, fontSize: 11 }} tickLine={false} />
        <YAxis tickFormatter={(v: number) => formatMoney(v)} stroke="transparent"
          tick={{ fill: c.t1, fontSize: 11 }} width={72} tickLine={false} />
        <Tooltip {...TIP} formatter={(v: number) => [formatMoney(v), 'Kâr']} labelFormatter={formatShortDate} />
        <Area type="monotone" dataKey="profit" stroke={c.ok} strokeWidth={2}
          fill="url(#grad-profit)" dot={false} activeDot={{ r: 4, fill: c.ok, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function TopProductsChart({ data }: { data: TopProduct[] }): JSX.Element {
  const c = useChartColors()
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data.slice(0,8)} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke={c.grid} horizontal={false} />
        <XAxis type="number" stroke="transparent" tick={{ fill: c.t1, fontSize: 11 }} tickLine={false} />
        <YAxis type="category" dataKey="name" width={100} stroke="transparent"
          tick={{ fill: c.t1, fontSize: 11 }} tickLine={false} />
        <Tooltip {...TIP} formatter={(v: number) => [v, 'Satılan adet']} />
        <Bar dataKey="quantitySold" fill={c.accent} radius={[0,4,4,0]} maxBarSize={16} />
      </BarChart>
    </ResponsiveContainer>
  )
}

const PIE_COLORS = ['#5d5fef','#16a34a','#d97706','#2563eb','#dc2626','#7c3aed','#0369a1','#b45309']

export function ExpenseBreakdownChart({ data }: { data: ExpenseBreakdownSlice[] }): JSX.Element {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="amount" nameKey="category" cx="50%" cy="46%"
          outerRadius={80} innerRadius={44} paddingAngle={2} strokeWidth={0}>
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={TIP.contentStyle} itemStyle={TIP.itemStyle}
          formatter={(v: number, _: string, p: { payload?: { category?: ExpenseCategory } }) =>
            [formatMoney(v), expenseCategoryLabel(p.payload?.category ?? 'misc')]} />
        <Legend iconType="circle" iconSize={7}
          formatter={(v: string) => expenseCategoryLabel(v as ExpenseCategory)}
          wrapperStyle={{ fontSize: 11, color: 'var(--t1)' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function StockMovementChart({ data }: { data: StockMovementPoint[] }): JSX.Element {
  const c = useChartColors()
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke={c.grid} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="transparent"
          tick={{ fill: c.t1, fontSize: 11 }} tickLine={false} />
        <YAxis stroke="transparent" tick={{ fill: c.t1, fontSize: 11 }} tickLine={false} />
        <Tooltip {...TIP} formatter={(v: number) => [v, 'Satılan adet']} labelFormatter={formatShortDate} />
        <Bar dataKey="unitsSold" fill={c.accent} radius={[3,3,0,0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}
