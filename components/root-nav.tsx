import Link from 'next/link'
import { BarChart3, Heart, Sprout, Globe, Sparkles } from 'lucide-react'
import { LanguageToggle } from './LanguageToggle'

export function RootNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Reflect</h1>
        </div>
        
        <div className="flex gap-3 items-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-all duration-300 text-sm"
          >
            <Heart className="w-4 h-4" />
            Check-in
          </Link>
          
          <Link
            href="/agents"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 font-medium transition-all duration-300 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Agentes
          </Link>
          
          <Link
            href="/harvest"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent font-medium transition-all duration-300 text-sm"
          >
            <Sprout className="w-4 h-4" />
            Cosecha
          </Link>

          <Link
            href="/insights"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium transition-all duration-300 text-sm"
          >
            <Globe className="w-4 h-4" />
            Insights
          </Link>
          
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium transition-all duration-300 text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Link>

          <div className="border-l border-border/50 pl-3">
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
