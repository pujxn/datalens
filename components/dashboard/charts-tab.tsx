'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, Cell,
} from 'recharts'
import { BarChart2, TrendingUp, Hash, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ParsedCSV, ColumnInfo } from '@/lib/csv-utils'

type Props = { data: ParsedCSV }

type ChartDef = {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  build: (rows: Record<string, string>[]) => unknown[]
  chartType: 'bar' | 'line' | 'histogram'
  dataKey: string
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(222.2 84% 4.9%)',
  border: '1px solid hsl(217.2 32.6% 17.5%)',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'hsl(210 40% 98%)',
}

// --- data builders ---

function aggregateByCategory(
  rows: Record<string, string>[],
  catCol: string,
  numCol: string,
  agg: 'sum' | 'avg',
  maxBars = 12
) {
  const groups: Record<string, number[]> = {}
  rows.forEach(r => {
    const key = r[catCol]?.trim()
    const val = parseFloat(r[numCol])
    if (key && !isNaN(val)) {
      groups[key] = groups[key] || []
      groups[key].push(val)
    }
  })
  return Object.entries(groups)
    .map(([label, vals]) => ({
      label: label.length > 14 ? label.slice(0, 14) + '…' : label,
      value: agg === 'sum'
        ? parseFloat(vals.reduce((a, b) => a + b, 0).toFixed(2))
        : parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, maxBars)
}

function buildTimeSeries(
  rows: Record<string, string>[],
  dateCol: string,
  numCol: string,
  agg: 'sum' | 'avg'
) {
  const groups: Record<string, number[]> = {}
  rows.forEach(r => {
    const month = (r[dateCol] ?? '').slice(0, 7)
    const val = parseFloat(r[numCol])
    if (month && !isNaN(val)) {
      groups[month] = groups[month] || []
      groups[month].push(val)
    }
  })
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, vals]) => ({
      label,
      value: agg === 'sum'
        ? parseFloat(vals.reduce((a, b) => a + b, 0).toFixed(2))
        : parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)),
    }))
}

function buildHistogram(rows: Record<string, string>[], col: string) {
  const vals = rows.map(r => parseFloat(r[col])).filter(v => !isNaN(v))
  if (!vals.length) return []
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  if (min === max) return [{ label: String(min), value: vals.length }]
  // bin count: sqrt of n, capped 5–15
  const bins = Math.min(15, Math.max(5, Math.round(Math.sqrt(vals.length))))
  const size = (max - min) / bins
  const buckets = Array.from({ length: bins }, (_, i) => ({
    label: (min + i * size).toFixed(1),
    value: 0,
  }))
  vals.forEach(v => {
    const i = Math.min(Math.floor((v - min) / size), bins - 1)
    buckets[i].value++
  })
  return buckets
}

// --- chart selection logic ---

function buildCharts(columns: ColumnInfo[], rows: Record<string, string>[]): ChartDef[] {
  const numeric = columns.filter(c => c.type === 'numeric')
  const lowCard = columns.filter(c => c.type === 'categorical' && c.uniqueCount <= 15)
  const highCard = columns.filter(c => c.type === 'categorical' && c.uniqueCount > 15)
  const dates = columns.filter(c => c.type === 'date')
  const charts: ChartDef[] = []

  // 1. Categorical × Numeric aggregations (most insightful)
  lowCard.forEach(cat => {
    numeric.slice(0, 2).forEach(num => {
      const agg = num.name.toLowerCase().includes('count') || num.name.toLowerCase().includes('unit') ? 'sum' : 'sum'
      charts.push({
        id: `agg-${cat.name}-${num.name}`,
        label: `${num.name} by ${cat.name}`,
        description: `Total ${num.name} grouped by ${cat.name}`,
        icon: <BarChart2 className="h-3.5 w-3.5" />,
        chartType: 'bar',
        dataKey: 'value',
        build: (r) => aggregateByCategory(r, cat.name, num.name, agg),
      })
    })
  })

  // 2. Time series: date × numeric
  if (dates.length) {
    numeric.forEach(num => {
      charts.push({
        id: `time-${dates[0].name}-${num.name}`,
        label: `${num.name} over time`,
        description: `${num.name} aggregated by month`,
        icon: <TrendingUp className="h-3.5 w-3.5" />,
        chartType: 'line',
        dataKey: 'value',
        build: (r) => buildTimeSeries(r, dates[0].name, num.name, 'sum'),
      })
    })
  }

  // 3. Histograms for numeric distributions (only if enough rows)
  if (rows.length >= 20) {
    numeric.forEach(num => {
      charts.push({
        id: `hist-${num.name}`,
        label: `${num.name} distribution`,
        description: `Frequency distribution of ${num.name}`,
        icon: <Hash className="h-3.5 w-3.5" />,
        chartType: 'histogram',
        dataKey: 'value',
        build: (r) => buildHistogram(r, num.name),
      })
    })
  }

  // 4. High-cardinality categoricals — frequency only if cardinality is reasonable
  highCard.filter(c => c.uniqueCount <= 50).forEach(cat => {
    charts.push({
      id: `freq-${cat.name}`,
      label: `${cat.name} frequency`,
      description: `How often each ${cat.name} appears`,
      icon: <PieChart className="h-3.5 w-3.5" />,
      chartType: 'bar',
      dataKey: 'value',
      build: (r) => {
        const freq: Record<string, number> = {}
        r.forEach(row => { const v = row[cat.name]; if (v) freq[v] = (freq[v] || 0) + 1 })
        return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15)
          .map(([label, value]) => ({ label: label.length > 14 ? label.slice(0, 14) + '…' : label, value }))
      },
    })
  })

  // Deduplicate and cap
  const seen = new Set<string>()
  return charts.filter(c => {
    if (seen.has(c.id)) return false
    seen.add(c.id)
    return true
  }).slice(0, 6)
}

export function ChartsTab({ data }: Props) {
  const charts = useMemo(() => buildCharts(data.columns, data.rows), [data.columns, data.rows])
  const [active, setActive] = useState(0)

  const chartData = useMemo(() => {
    const c = charts[active]
    return c ? c.build(data.rows) as { label: string; value: number }[] : []
  }, [active, charts, data.rows])

  if (!charts.length) {
    return (
      <div className="flex flex-col gap-2 p-5 text-sm text-muted-foreground">
        <p>No suitable columns detected. Column types:</p>
        {data.columns.map(c => (
          <p key={c.name}>{c.name}: <strong>{c.type}</strong> ({c.uniqueCount} unique)</p>
        ))}
      </div>
    )
  }

  const current = charts[active]
  const angleLabels = chartData.length > 6

  return (
    <div className="flex flex-col gap-5 p-5">

      {/* Chart picker */}
      <div className="flex flex-wrap gap-2">
        {charts.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActive(i)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
              active === i
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border/50 bg-card text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {c.icon}
            {c.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="mb-5">
          <p className="text-sm font-medium text-foreground">{current?.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{current?.description}</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          {current?.chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 17.5%)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(215 20.2% 65.1%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215 20.2% 65.1%)' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(215 20.2% 65.1%)' }} />
              <Line type="monotone" dataKey="value" name={current.label} stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 17.5%)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'hsl(215 20.2% 65.1%)' }}
                angle={angleLabels ? -35 : 0}
                textAnchor={angleLabels ? 'end' : 'middle'}
                height={angleLabels ? 60 : 30}
              />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215 20.2% 65.1%)' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(215 20.2% 65.1%)' }} />
              <Bar dataKey="value" name={current?.label} radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
