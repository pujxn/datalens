'use client'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import type { ColumnInfo, ParsedCSV } from '@/lib/csv-utils'
import { Rows, Columns, AlertCircle } from 'lucide-react'

type Props = { data: ParsedCSV }

const TYPE_STYLES: Record<ColumnInfo['type'], string> = {
  numeric:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  categorical: 'bg-violet-500/10 text-violetald-400 border-violet-500/20',
  date:        'bg-blue-500/10 text-blue-400 border-blue-500/20',
  unknown:     'bg-muted text-muted-foreground border-border',
}

export function DataTable({ data }: Props) {
  const { fileName, headers, rows, columns } = data
  const preview = rows.slice(0, 20)
  const totalNulls = columns.reduce((s, c) => s + c.nullCount, 0)

  return (
    <div className="flex flex-col gap-4">

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Rows className="h-4 w-4 text-primary" />, value: rows.length.toLocaleString(), label: 'rows' },
          { icon: <Columns className="h-4 w-4 text-violet-400" />, value: headers.length, label: 'columns' },
          { icon: <AlertCircle className="h-4 w-4 text-amber-400" />, value: totalNulls.toLocaleString(), label: 'nulls' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              {s.icon}
              <span className="font-bold text-lg leading-none">{s.value}</span>
            </div>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Column type chips */}
      <div className="flex flex-wrap gap-1.5">
        {columns.map(col => (
          <div key={col.name} className="flex items-center gap-1 rounded-lg border border-border/50 bg-card px-2 py-1">
            <span className="text-xs text-foreground/70 max-w-[90px] truncate" title={col.name}>{col.name}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 leading-none ${TYPE_STYLES[col.type]}`}>
              {col.type}
            </Badge>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="text-xs text-muted-foreground">
        Showing {Math.min(20, rows.length)} of {rows.length.toLocaleString()} rows &middot; {fileName}
      </div>

      <ScrollArea className="rounded-xl border border-border/50 bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              {headers.map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                {headers.map(h => (
                  <td key={h} className="px-3 py-2 text-xs whitespace-nowrap max-w-[180px] truncate" title={row[h]}>
                    {row[h] || <span className="text-muted-foreground/40 italic">null</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
