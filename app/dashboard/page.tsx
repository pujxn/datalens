'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { ScanEye, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
import { CSVUploader } from '@/components/dashboard/csv-uploader'
import { DataTable } from '@/components/dashboard/data-table'
import { InsightsTab } from '@/components/dashboard/insights-tab'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ParsedCSV } from '@/lib/csv-utils'

export default function DashboardPage() {
  const [data, setData] = useState<ParsedCSV | null>(null)

  return (
    <div className="flex flex-col h-screen bg-background">

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

      {/* Split layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left — upload + table */}
        <div className="w-[44%] min-w-[320px] flex flex-col border-r border-border/50 overflow-hidden">
          <div className="p-4 shrink-0">
            <CSVUploader onDataParsed={setData} hasData={!!data} />
          </div>

          {data ? (
            <>
              <Separator className="shrink-0" />
              <div className="flex-1 overflow-auto p-4">
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

        {/* Right — tabs */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {data ? (
            <Tabs defaultValue="insights" className="flex flex-col h-full">
              <div className="px-4 pt-4 shrink-0">
                <TabsList className="w-full">
                  <TabsTrigger value="insights" className="flex-1">Insights</TabsTrigger>
                  <TabsTrigger value="charts" className="flex-1">Charts</TabsTrigger>
                  <TabsTrigger value="ask" className="flex-1">Ask</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="insights" className="flex-1 overflow-auto mt-0">
                <InsightsTab data={data} />
              </TabsContent>
              <TabsContent value="charts" className="flex-1 overflow-auto mt-0 flex items-center justify-center text-sm text-muted-foreground">
                Charts coming next…
              </TabsContent>
              <TabsContent value="ask" className="flex-1 overflow-auto mt-0 flex items-center justify-center text-sm text-muted-foreground">
                Chat coming soon…
              </TabsContent>
            </Tabs>
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
