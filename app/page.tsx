import Link from 'next/link'
import { ScanEye, Upload, Sparkles, MessageSquare, ArrowRight, BarChart2, Zap, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: <Upload className="h-5 w-5 text-blue-400" />,
    title: 'Upload CSV',
    desc: 'Drag and drop any CSV. Parsed instantly in your browser — your raw data never leaves your machine.',
    color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
    glow: 'group-hover:shadow-blue-500/10',
  },
  {
    icon: <Sparkles className="h-5 w-5 text-violet-400" />,
    title: 'AI Insights',
    desc: 'Groq streams 5–6 specific, actionable insights about your data in under a second.',
    color: 'from-violet-500/10 to-violet-600/5 border-violet-500/20',
    glow: 'group-hover:shadow-violet-500/10',
  },
  {
    icon: <BarChart2 className="h-5 w-5 text-emerald-400" />,
    title: 'Auto Charts',
    desc: 'Smart visualizations picked by column type — histograms, bar charts, time series.',
    color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
    glow: 'group-hover:shadow-emerald-500/10',
  },
  {
    icon: <MessageSquare className="h-5 w-5 text-amber-400" />,
    title: 'Ask Anything',
    desc: 'Chat with your data. Get answers that reference actual column names and values.',
    color: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
    glow: 'group-hover:shadow-amber-500/10',
  },
]

const stats = [
  { value: '<1s', label: 'AI response time', icon: <Zap className="h-4 w-4 text-yellow-400" /> },
  { value: '100%', label: 'Client-side parsing', icon: <ShieldCheck className="h-4 w-4 text-green-400" /> },
  { value: '∞', label: 'Rows supported', icon: <BarChart2 className="h-4 w-4 text-blue-400" /> },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">

      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>
      <div className="pointer-events-none fixed top-0 left-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-border/50 bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <ScanEye className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">DataLens</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-muted-foreground">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="gap-1.5">Get started <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex flex-col items-center gap-6 max-w-3xl">

          <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs text-primary font-medium">
            <Zap className="h-3.5 w-3.5" />
            Powered by Groq — the fastest AI inference on earth
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Your data,{' '}
            <span className="bg-gradient-to-r from-primary via-violet-400 to-purple-400 bg-clip-text text-transparent">
              understood instantly
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Upload any CSV and get AI-powered insights, smart visualizations, and a chat interface — all in under a second.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2 px-8 shadow-xl shadow-primary/20">
                Start for free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="px-8">
                Sign in
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground/60">No credit card &middot; Data stays in your browser &middot; Free forever</p>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-px rounded-2xl border border-border/50 bg-border/30 overflow-hidden">
          {stats.map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1.5 bg-card px-10 py-5">
              <div className="flex items-center gap-1.5">
                {s.icon}
                <span className="text-2xl font-bold">{s.value}</span>
              </div>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 border-t border-border/50 px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Everything in one place</h2>
            <p className="text-muted-foreground mt-2">No setup. No code. Just upload and go.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(f => (
              <div
                key={f.title}
                className={`group relative rounded-2xl border bg-gradient-to-b ${f.color} p-6 flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl ${f.glow} hover:-translate-y-1`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/60 border border-border/50 shadow-inner">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-t border-border/50 px-4 py-16 text-center">
        <div className="mx-auto max-w-xl flex flex-col items-center gap-5">
          <h2 className="text-2xl font-bold">Ready to see your data differently?</h2>
          <Link href="/sign-up">
            <Button size="lg" className="gap-2 px-10 shadow-xl shadow-primary/20">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/50 px-4 py-6 text-center text-xs text-muted-foreground/50">
        &copy; {new Date().getFullYear()} DataLens &middot; Built with Next.js &amp; Groq AI
      </footer>
    </div>
  )
}
