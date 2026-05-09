'use client'

import Link from 'next/link'
import { BarChart3, Heart, Sprout, Globe, Sparkles, Zap, MapPin, Clock, Menu, X } from 'lucide-react'
import { LanguageToggle } from './LanguageToggle'
import { useState } from 'react'

export function RootNav() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Check-in', icon: Heart, color: 'primary', bgColor: 'bg-primary/10 hover:bg-primary/20', textColor: 'text-primary' },
    { href: '/agents', label: 'Agentes', icon: Sparkles, color: 'violet', bgColor: 'bg-violet-500/10 hover:bg-violet-500/20', textColor: 'text-violet-600 dark:text-violet-400' },
    { href: '/habitacion-del-tiempo', label: 'Habitación', icon: Clock, color: 'indigo', bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20', textColor: 'text-indigo-600 dark:text-indigo-400' },
    { href: '/harvest', label: 'Cosecha', icon: Sprout, color: 'accent', bgColor: 'bg-accent/10 hover:bg-accent/20', textColor: 'text-accent' },
    { href: '/insights', label: 'Insights', icon: Globe, color: 'emerald', bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20', textColor: 'text-emerald-600 dark:text-emerald-400' },
    { href: '/testament', label: 'Testamento', icon: Zap, color: 'purple', bgColor: 'bg-purple-500/10 hover:bg-purple-500/20', textColor: 'text-purple-600 dark:text-purple-400' },
    { href: '/solicita-tu-ciudad', label: 'Tu Ciudad', icon: MapPin, color: 'blue', bgColor: 'bg-blue-500/10 hover:bg-blue-500/20', textColor: 'text-blue-600 dark:text-blue-400' },
    { href: '/dashboard', label: 'Analytics', icon: BarChart3, color: 'muted', bgColor: 'bg-muted hover:bg-muted/80', textColor: 'text-foreground' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        {/* Desktop */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Reflect</h1>
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-center">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm ${link.bgColor} ${link.textColor}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              )
            })}

            <div className="border-l border-border/50 pl-3 ml-1">
              <LanguageToggle />
            </div>
          </div>
        </div>

        {/* Mobile and Tablet */}
        <div className="lg:hidden flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Reflect</h1>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 pb-3">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 text-xs ${link.bgColor} ${link.textColor}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
