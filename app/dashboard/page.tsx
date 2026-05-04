import { UserButton } from '@clerk/nextjs'
import { ScanEye } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border/50 bg-background/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <ScanEye className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight">DataLens</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center text-muted-foreground">
        Dashboard coming soon…
      </main>
    </div>
  )
}
