import Link from 'next/link'
import { ScanEye, Upload, Sparkles, MessageSquare, ArrowRight, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: <Upload className="h-5 w-5 text-blue-400" />,
    title: 'Upload CSV',
    desc: 'Drag and drop any CSV file. Parsed instantly in your browser — your data never leaves your machine.',
  },
  {
    icon: <Sparkles className="h-5 w-5 text-purple-400" />,
    title: 'AI Insights',
    desc: 'Claude analyzes your dataset and streams 5-6 specific, actionable insights in seconds.',
  },
  {
    icon: <BarChart2 className="h-5 w-5 text-green-400" />,
    title: 'Auto Charts',
    desc: 'Smart visualizations chosen based on your column types — histograms, bar charts, time series.',
  },
  {
    icon: <MessageSquare className="h-5 w-5 text-yellow-400" />,
    title: 'Ask Questions',
    desc: 'Chat with your data. Get precise answers referencing actual column names and values.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col relative">
      {/* Glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-3xl" />

      {/* Nav */}
      <nav className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <ScanEye className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-100">DataLens</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-24 text-center relative">
        <div className="flex flex-col items-center gap-6 max-w-3xl">
          <div className="flex items-center gap-2 rounded-full border border-blue-900 bg-blue-950/40 px-3 py-1 text-xs text-blue-400 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Groq AI
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-50 leading-tight">
            Your data,{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              analyzed in seconds
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
            Upload any CSV and get instant AI-powered insights, smart visualizations, and a chat interface to ask questions about your data — no code required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href="/sign-up">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8">
                Start analyzing free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 px-8">
                Sign in
              </Button>
            </Link>
          </div>
          <p className="text-xs text-gray-600">No credit card required &middot; Data parsed locally &middot; Instant results</p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-800/60 bg-gray-900/30 px-4 sm:px-6 py-16 relative">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-gray-100 mb-10">
            Everything you need to understand your data
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 flex flex-col gap-3 hover:border-gray-700 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-200 text-sm">{f.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800/60 px-4 py-6 text-center text-xs text-gray-600">
        &copy; {new Date().getFullYear()} DataLens &middot; Built with Next.js &amp; Groq AI
      </footer>
    </div>
  )
}
