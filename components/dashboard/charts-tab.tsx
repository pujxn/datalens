'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell,
} from 'recharts'
import { BarChart2, TrendingUp, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ParsedCSV, ColumnInfo } from '@/lib/csv-utils'

type Props = { data: ParsedCSV }

type ChartDef = {
  id: string
  label: string
  icon: React.ReactNode
  type: 'histogram' | 'bar' | 'line'
  col: string
  numCol?: string
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(222.2 84% 4.9%)',
  border: '1px solid hsl(217.2 32.6% 17.5%)',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'hsl(210 40% 98%)',
}

function buildHistogram(values: number[], bins = 10) {
  const clean = values.filter(v => !isNaN(v))
  if (!clean.length) return []
  const min = Math.min(...clean)
  const max = Math.max(...clean)
  if (min === max) return [{ label: String(min), count: clean.length }]
  const size = (max - min) / bins
  const buckets = Array.from({ length: bins }, (_, i) => ({
    label: (min + i * size).toFixed(1),
    count: 0,
  }))
  clean.forEach(v => {
    const i = Math.min(Math.floor((v - min) / size), bins - 1)
    buckets[i].count++
  })
  return buckets
}

function buildFrequency(values: string[], max = 12) {
  const freq: Record<string, number> = {}
  values.forEach(v => { if (v) freq[v] = (freq[v] || 0) + 1 })
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([label, count]) => ({ label: label.length > 14 ? label.slice(0, 14) + '…' : label, count }))
}

function buildTimeSeries(rows: Record<string, string>[], dateCol: string, numCol: string) {
  const grouped: Record<string, number[]> = {}
  rows.forEach(row => {
    const month = (row[dateCol] ?? '').slice(0, 7)
    const val = parseFloat(row[numCol])
    if (month && !isNaN(val)) {
      grouped[month] = grouped[month] || []
      grouped[month].push(val)
    }
  })
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, vals]) => ({
      label,
      value: parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2)),
    }))
}

function buildCharts(columns: ColumnInfo[]): ChartDef[] {
  const numeric = columns.filter(c => c.type === 'numeric')
  const categorical = columns.filter(c => c.type === 'categorical' && c.uniqueCount <= 20)
  const date = columns.filter(c => c.type === 'date')
  const charts: ChartDef[] = []

  numeric.slice(0, 2).forEach(col => {
    charts.push({ id: `hist-${col.name}`, label: col.name, icon: <Hash className="h-3.5 w-3.5" />, type: 'histogram', col: col.name })
  })
  categorical.slice(0, 2).forEach(col => {
    charts.push({ id: `bar-${col.name}`, label: col.name, icon: <BarChart2 className="h-3.5 w-3.5" />, type: 'bar', col: col.name })
  })
  if (date.length && numeric.length) {
    charts.push({ id: `line-${date[0].name}`, label: `${numeric[0].name} over time`, icon: <TrendingUp className="h-3.5 w-3.5" />, type: 'line', col: date[0].name, numCol: numeric[0].name })
  }

  return charts.slice(0, 4)
}

export function ChartsTab({ data }: Props) {
  const charts = useMemo(() => buildCharts(data.columns), [data.columns])
  const [active, setActive] = useState(0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartData: any[] = useMemo(() => {
    const c = charts[active]
    if (!c) return []
    if (c.type === 'histogram') {
      const vals = data.rows.map(r => parseFloat(r[c.col]))
      return buildHistogram(vals)
    }
    if (c.type === 'bar') {
      return buildFrequency(data.rows.map(r => r[c.col]))
    }
    if (c.type === 'line' && c.numCol) {
      return buildTimeSeries(data.rows, c.col, c.numCol)
    }
    return []
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
  const isLine = current?.type === 'line'
  const dataKey = isLine ? 'value' : 'count'
  const angleLabels = chartData.length > 7

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
        <p className="text-sm font-medium mb-5 text-foreground/80">{current?.label}</p>
        <ResponsiveContainer width="100%" height={280}>
          {isLine ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 17.5%)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(215 20.2% 65.1%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215 20.2% 65.1%)' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey={dataKey} stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 17.5%)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'hsl(215 20.2% 65.1%)' }}
                angle={angleLabels ? -35 : 0}
                textAnchor={angleLabels ? 'end' : 'middle'}
                height={angleLabels ? 55 : 30}
              />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215 20.2% 65.1%)' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
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
