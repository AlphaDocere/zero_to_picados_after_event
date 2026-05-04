"use client"

import { Cloud } from "lucide-react"

interface ThemesCloudProps {
  themes: any[]
}

export function ThemesCloud({ themes }: ThemesCloudProps) {
  const maxFreq = Math.max(...themes.map(t => t.value))

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-2">Temas Emergentes</h3>
        <p className="text-xs text-muted-foreground">Palabras clave en reflexiones globales</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-8">
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {themes.map((theme, idx) => {
            const size = (theme.value / maxFreq) * 100 + 60 // 60px to 160px
            const colors = [
              'text-primary',
              'text-accent',
              'text-emerald-500',
              'text-blue-500',
              'text-purple-500',
              'text-pink-500',
              'text-orange-500',
              'text-cyan-500'
            ]
            const color = colors[idx % colors.length]

            return (
              <span
                key={idx}
                className={`${color} font-bold whitespace-nowrap transition-all hover:scale-110 cursor-pointer`}
                style={{ fontSize: `${size}px`, opacity: 0.7 + (theme.value / maxFreq) * 0.3 }}
              >
                {theme.word}
              </span>
            )
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl border border-border p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">Temas analizados</p>
        <p className="text-2xl font-bold text-foreground">{themes.length}</p>
        <p className="text-xs text-muted-foreground mt-2">Palabras clave significativas</p>
      </div>
    </div>
  )
}
