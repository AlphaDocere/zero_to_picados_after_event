'use client'

import Link from 'next/link'
import { Heart, Home, Sprout, ArrowRight, Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 bg-background text-foreground" id="not-found-container">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Animated Brand Graphic */}
        <div className="relative">
          <div className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-primary via-purple-500 to-accent flex items-center justify-center shadow-2xl shadow-primary/30 animate-pulse">
            <span className="text-4xl font-extrabold text-white tracking-widest">404</span>
          </div>
          <div className="absolute -top-3 -right-3">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
          </div>
          <div className="absolute -bottom-3 -left-3">
            <Heart className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary via-purple-300 to-accent bg-clip-text text-transparent">
            Ruta Perdida en el Tiempo
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Parece que te has desviado del camino. Nuestros agentes emocionales no pudieron encontrar este espacio, pero siempre puedes regresar para continuar tu viaje de reflexión.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Link href="/" id="btn-return-home" className="block w-full">
            <Button
              className="w-full rounded-xl h-12 text-base font-bold gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Regresar al Check-in
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/harvest" id="btn-goto-harvest" className="block w-full">
              <Button
                variant="outline"
                className="w-full rounded-xl h-12 text-sm font-semibold border-border hover:bg-secondary/40 text-foreground gap-1.5 transition-all duration-300 cursor-pointer"
              >
                <Sprout className="w-4 h-4 text-accent" />
                Ver Cosecha
              </Button>
            </Link>

            <Link href="/insights" id="btn-goto-insights" className="block w-full">
              <Button
                variant="outline"
                className="w-full rounded-xl h-12 text-sm font-semibold border-border hover:bg-secondary/40 text-foreground gap-1.5 transition-all duration-300 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Ver Insights
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
