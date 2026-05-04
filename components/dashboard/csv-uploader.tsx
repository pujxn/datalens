'use client'

import { useCallback, useState } from 'react'
import Papa from 'papaparse'
import { Upload, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { analyzeColumns, type ParsedCSV } from '@/lib/csv-utils'
import { cn } from '@/lib/utils'

type Props = {
  onDataParsed: (data: ParsedCSV) => void
  hasData: boolean
}

export function CSVUploader({ onDataParsed, hasData }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }
    setError(null)
    setIsLoading(true)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      quoteChar: '"',
      escapeChar: '"',
      complete: (result) => {
        const headers = result.meta.fields ?? []
        const rows = result.data as Record<string, string>[]
        const columns = analyzeColumns(headers, rows)
        onDataParsed({ fileName: file.name, headers, rows, columns })
        setIsLoading(false)
      },
      error: (err) => {
        setError(err.message)
        setIsLoading(false)
      },
    })
  }, [onDataParsed])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  return (
    <div className="flex flex-col gap-3">
      <label
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : hasData
            ? 'border-border/50 bg-card/30 hover:border-border hover:bg-card/50 py-5'
            : 'border-border bg-card/50 hover:border-primary/50 hover:bg-card'
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <input type="file" accept=".csv" className="sr-only" onChange={e => {
          const file = e.target.files?.[0]
          if (file) processFile(file)
          e.target.value = ''
        }} />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Parsing…</span>
          </div>
        ) : hasData ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileSpreadsheet className="h-4 w-4" />
            Drop a new CSV to replace
          </div>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Drop your CSV here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
            </div>
            <p className="text-xs text-muted-foreground/60">Parsed entirely in your browser — data stays private</p>
          </>
        )}
      </label>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
