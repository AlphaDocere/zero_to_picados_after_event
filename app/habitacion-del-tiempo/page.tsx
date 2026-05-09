'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface AgentInsights {
  agentName: string
  totalSessions: number
  totalUsers: number
  avgMoodShift: number
  cities: string[]
  reflection: string
  topMoodShift: number
  lowestMood: number
  highestMood: number
}

interface InsightsData {
  nova: AgentInsights
  atlas: AgentInsights
  phoenix: AgentInsights
  totalSessions: number
  totalUsers: number
  allCities: string[]
  lastUpdated: string
}

const agentColors: Record<string, { bg: string; border: string; text: string; accent: string; icon: string }> = {
  'Nova': {
    bg: 'from-rose-50 to-pink-50',
    border: 'border-rose-200',
    text: 'text-rose-900',
    accent: 'bg-rose-100 text-rose-700',
    icon: 'N'
  },
  'Atlas': {
    bg: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    accent: 'bg-blue-100 text-blue-700',
    icon: 'A'
  },
  'Phoenix': {
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    accent: 'bg-amber-100 text-amber-700',
    icon: 'P'
  }
}

export default function HabitacionDelTiempo() {
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInsights()
  }, [])

  async function fetchInsights() {
    try {
      setLoading(true)
      const response = await fetch('/api/insights/aggregate-all-agents')
      const json = await response.json()

      if (json.success) {
        setInsights(json.data)
      } else {
        setError('No hay datos disponibles aún')
      }
    } catch (err) {
      console.error('[v0] Error fetching insights:', err)
      setError('Error cargando reflexiones de los agentes')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
          <p className="text-slate-300">Cargando reflexiones de los agentes...</p>
        </div>
      </div>
    )
  }

  if (error || !insights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Habitación del Tiempo</h1>
          <p className="text-slate-300 text-lg">{error || 'Sin datos disponibles'}</p>
          <p className="text-slate-400 mt-4">Realiza algunos check-ins primero para ver las reflexiones de los agentes</p>
          <button
            onClick={fetchInsights}
            className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Recargar
          </button>
        </div>
      </div>
    )
  }

  const agents = [insights.nova, insights.atlas, insights.phoenix]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Habitación del Tiempo
          </h1>
          <p className="text-slate-300 text-lg">
            Las reflexiones de nuestros agentes sobre el viaje emocional colectivo
          </p>
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-400">{insights.totalUsers}</span>
              <span className="text-slate-300">usuarios explorando</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-400">{insights.totalSessions}</span>
              <span className="text-slate-300">sesiones completadas</span>
            </div>
            {insights.allCities.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-400">{insights.allCities.length}</span>
                <span className="text-slate-300">ciudades visitadas</span>
              </div>
            )}
          </div>
        </div>

        {/* Ciudades */}
        {insights.allCities.length > 0 && (
          <div className="mb-12 p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Ciudades Exploradas</h2>
            <div className="flex flex-wrap gap-3">
              {insights.allCities.map((city) => (
                <span key={city} className="px-4 py-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 rounded-full">
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Agentes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {agents.map((agent) => {
            const colors = agentColors[agent.agentName]
            return (
              <div
                key={agent.agentName}
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all"
              >
                {/* Agent Header */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{colors.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {agent.agentName}
                    </h2>
                    <p className="text-slate-400 text-xs">Agente Emocional</p>
                  </div>
                </div>

                {/* Reflection */}
                <div className="mb-6 pb-6 border-b border-slate-700">
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {agent.reflection}
                  </p>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Sesiones:</span>
                    <span className="font-bold text-white">{agent.totalSessions}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Usuarios:</span>
                    <span className="font-bold text-white">{agent.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Cambio Promedio:</span>
                    <span className={`font-bold ${agent.avgMoodShift > 0 ? 'text-green-400' : agent.avgMoodShift < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {agent.avgMoodShift > 0 ? '+' : ''}{agent.avgMoodShift}
                    </span>
                  </div>
                  {agent.cities.length > 0 && (
                    <div className="pt-3 border-t border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">Ciudades:</p>
                      <div className="flex flex-wrap gap-2">
                        {agent.cities.map((city) => (
                          <span key={city} className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded">
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm space-y-3">
          <p>Última actualización: {new Date(insights.lastUpdated).toLocaleString('es-ES')}</p>
          <button
            onClick={fetchInsights}
            className="inline-block bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 px-4 py-2 rounded-lg font-medium transition border border-purple-500/30"
          >
            Recargar Datos
          </button>
        </div>
      </div>
    </main>
  )
}
