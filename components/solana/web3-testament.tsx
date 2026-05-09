'use client'

import { useEffect, useState } from 'react'
import { Heart, TrendingUp, Zap, Calendar, MapPin, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getCheckInHistory, getCheckInStats } from '@/lib/solana/check-in-recorder'

interface CheckInEntry {
  signature: string
  city: string
  initialMood: number
  finalMood: number
  moodShift: number
  agentUsed: string
  sentiment: string
  recordedAt: string
}

export function Web3Testament() {
  const [entries, setEntries] = useState<CheckInEntry[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      setLoading(true)
      const history = getCheckInHistory()
      const statsData = getCheckInStats()
      setEntries(history.reverse())
      setStats(statsData)
    } catch (error) {
      console.error('[v0] Error loading testament data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="inline-block animate-spin">
            <Zap className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-sm text-muted-foreground">Cargando testamento...</p>
        </div>
      </div>
    )
  }

  const agentIcons: Record<string, string> = {
    compassionate: '💜',
    analytical: '🧠',
    reflective: '✨',
  }

  const getMoodColor = (shift: number) => {
    if (shift > 15) return 'text-emerald-400'
    if (shift > 0) return 'text-green-400'
    if (shift > -15) return 'text-orange-400'
    return 'text-red-400'
  }

  const getMoodBg = (shift: number) => {
    if (shift > 15) return 'bg-emerald-950/30 border-emerald-500/30'
    if (shift > 0) return 'bg-green-950/30 border-green-500/30'
    if (shift > -15) return 'bg-orange-950/30 border-orange-500/30'
    return 'bg-red-950/30 border-red-500/30'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Testamento Colectivo</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Cada check-in es una huella permanente en Web3. Tu viaje emocional, registrado en la blockchain.
        </p>
      </div>

      {/* Stats */}
      {stats && stats.totalCheckIns > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 border-purple-500/20">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" /> Total Registros
              </p>
              <p className="text-2xl font-bold text-purple-400">
                {stats.totalCheckIns}
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-pink-500/20">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Cambio Promedio
              </p>
              <p className={`text-2xl font-bold ${getMoodColor(parseFloat(stats.averageMoodShift))}`}>
                +{stats.averageMoodShift}
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-green-500/20">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Heart className="w-3 h-3" /> Mejor Día
              </p>
              <p className="text-2xl font-bold text-green-400">
                +{stats.bestMoodDay?.moodShift}
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-blue-500/20">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" /> Guía Favorita
              </p>
              <p className="text-xl font-bold text-blue-400">
                {stats.favoriteAgent && agentIcons[stats.favoriteAgent]}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Timeline */}
      {entries.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground">
            No hay registros en Web3 aún. Completa un check-in para dejar tu primera huella.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Historial de Huellas
          </h2>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {entries.map((entry, idx) => (
              <Card
                key={entry.signature}
                className={`p-4 border transition-all hover:border-purple-500/50 ${getMoodBg(entry.moodShift)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Índice y Agent Icon */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-2xl">
                        {agentIcons[entry.agentUsed] || '🌟'}
                      </div>
                      <span className="text-xs text-muted-foreground">#{entries.length - idx}</span>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 space-y-1">
                      {/* Encabezado: Ciudad, Fecha */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">
                          {entry.city}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.recordedAt).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Cambio de ánimo */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {entry.initialMood}
                        </span>
                        <div className="w-16 h-1 bg-background rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getMoodColor(entry.moodShift).replace('text-', 'bg-')}`}
                            style={{
                              width: `${((entry.finalMood - entry.initialMood) + 50) / 100 * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {entry.finalMood}
                        </span>
                      </div>

                      {/* Sentimiento */}
                      <p className="text-xs text-muted-foreground italic">
                        "{entry.sentiment}"
                      </p>
                    </div>
                  </div>

                  {/* Cambio prominente */}
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getMoodColor(entry.moodShift)}`}>
                      {entry.moodShift > 0 ? '+' : ''}
                      {entry.moodShift}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono break-all max-w-xs">
                      {entry.signature.substring(0, 16)}...
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Este testamento es inmutable. Cada entrada representa un momento de tu viaje emocional,
          permanentemente registrado.
        </p>
      </div>
    </div>
  )
}
