'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { ScanEye, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
import { CSVUploader } from '@/components/dashboard/csv-uploader'
import { DataTable } from '@/components/dashboard/data-table'
import { InsightsTab } from '@/components/dashboard/insights-tab'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ParsedCSV } from '@/lib/csv-utils'

const TABS = ['Insights', 'Charts', 'Ask'] as const
type Tab = typeof TABS[number]

export default function DashboardPage() {
  const [data, setData] = useState<ParsedCSV | null>(null)
  const [tab, setTab] = useState<Tab>('Insights')

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">

      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl shrink-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <ScanEye className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight">DataLens</span>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      {/* Body */}
      <div className="flex flex-1 min-h-0">

        {/* Left — upload + table */}
        <div className="w-[44%] min-w-[320px] flex flex-col border-r border-border/50 min-h-0">
          <div className="p-4 shrink-0">
            <CSVUploader onDataParsed={setData} hasData={!!data} />
          </div>

          {data ? (
            <>
              <Separator className="shrink-0" />
              <div className="flex-1 overflow-y-auto p-4">
                <DataTable data={data} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8 text-muted-foreground">
              <FileSpreadsheet className="h-10 w-10 opacity-20" />
              <p className="text-sm">Upload a CSV to see a preview and column stats</p>
            </div>
          )}
        </div>

        {/* Right — analysis */}
        <div className="flex-1 flex flex-col min-h-0">
          {data ? (
            <>
              {/* Tab bar */}
              <div className="px-4 pt-4 pb-0 shrink-0">
                <div className="flex gap-1 rounded-lg bg-muted p-1">
                  {TABS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={cn(
                        'flex-1 rounded-md py-1.5 text-sm font-medium transition-all',
                        tab === t
                          ? 'bg-background text-foreground shadow'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {tab === 'Insights' && <InsightsTab data={data} />}
                {tab === 'Charts' && (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Charts coming next…
                  </div>
                )}
                {tab === 'Ask' && (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Chat coming soon…
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-8 text-muted-foreground">
              <p className="text-sm">Insights, charts &amp; chat will appear here after upload</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
