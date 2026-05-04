'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { ParsedCSV } from '@/lib/csv-utils'

type Props = {
  data: ParsedCSV
}

export function InsightsTab({ data }: Props) {
  const [text, setText] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const run = async () => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setText('')
    setError(null)
    setStreaming(true)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema: data.columns,
          sampleRows: data.rows,
          datasetName: data.fileName,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error(`Error ${res.status}`)
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setText(full)
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setError(e.message)
      }
    } finally {
      setStreaming(false)
    }
  }

  useEffect(() => {
    run()
    return () => abortRef.current?.abort()
  }, [data.fileName]) // re-run when a new file is uploaded

  const bullets = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'))
    .map(l => l.replace(/^[•\-*]\s*/, ''))

  return (
    <div className="flex flex-col gap-4 p-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">AI Insights</span>
          {streaming && (
            <span className="text-xs text-primary animate-pulse">Analyzing…</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={run}
          disabled={streaming}
          className="h-7 gap-1.5 text-xs text-muted-foreground"
        >
          <RefreshCw className={`h-3 w-3 ${streaming ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Skeleton while waiting for first bullet */}
      {streaming && bullets.length === 0 && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-3 w-3 rounded-full mt-1 shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className={`h-3 ${i % 2 === 0 ? 'w-4/5' : 'w-3/5'}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bullets */}
      {bullets.length > 0 && (
        <ul className="flex flex-col gap-4">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="text-primary shrink-0 mt-0.5 font-bold">•</span>
              <span className="text-foreground/90">{b}</span>
            </li>
          ))}
          {streaming && (
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span className="inline-block h-4 w-1.5 bg-primary animate-pulse rounded-sm" />
            </li>
          )}
        </ul>
      )}

      {/* Fallback: non-bulleted raw text */}
      {!streaming && text && bullets.length === 0 && (
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{text}</p>
      )}
    </div>
  )
}
