"use client"

interface ThemesCloudProps {
  themes: any[]
}

export function ThemesCloud({ themes }: ThemesCloudProps) {
  const safeThemes = themes || []
  const maxFreq = Math.max(...safeThemes.map(t => t?.value || 1), 1)

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-2">Temas Emergentes</h3>
        <p className="text-xs text-muted-foreground">Palabras clave en reflexiones globales</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-8">
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {safeThemes.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No hay suficientes temas recopilados aún</p>
          ) : (
            safeThemes.map((theme, idx) => {
              const freq = theme?.value || 1
              const size = (freq / maxFreq) * 100 + 60 // 60px to 160px
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
              const word = theme?.word || `tema-${idx}`

              return (
                <span
                  key={`theme-word-${word}-${idx}`}
                  className={`${color} font-bold whitespace-nowrap transition-all hover:scale-110 cursor-pointer`}
                  style={{ fontSize: `${size}px`, opacity: 0.7 + (freq / maxFreq) * 0.3 }}
                >
                  {word}
                </span>
              )
            })
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl border border-border p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">Temas analizados</p>
        <p className="text-2xl font-bold text-foreground">{safeThemes.length}</p>
        <p className="text-xs text-muted-foreground mt-2">Palabras clave significativas</p>
      </div>
    </div>
  )
}
