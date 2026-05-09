'use client'

import { useEffect, useState } from 'react'
import { getFirebaseDatabase } from '@/lib/firebase-init'
import { ref, get } from 'firebase/database'

interface NovaInsight {
  totalUsers: number
  totalSessions: number
  uniqueCities: string[]
  averageMoodShift: number
  agentReflection: string
  timestamp: string
}

export default function HabitacionDelTiempo() {
  const [insights, setInsights] = useState<NovaInsight | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInsights()
  }, [])

  async function loadInsights() {
    try {
      setLoading(true)
      const db = getFirebaseDatabase()
      
      // Obtener insights más recientes
      const insightsRef = ref(db, 'nova-insights')
      const snapshot = await get(insightsRef)

      if (!snapshot.exists()) {
        setError('No hay datos aún. Ejecuta el cron para generar insights.')
        setLoading(false)
        return
      }

      // Obtener el más reciente
      const data = snapshot.val()
      const dates = Object.keys(data).sort().reverse()
      
      if (dates.length > 0) {
        const latestData = data[dates[0]]
        setInsights(latestData)
      }
    } catch (err) {
      console.error('[v0] Error loading insights:', err)
      setError('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  async function triggerAggregation() {
    try {
      setLoading(true)
      const response = await fetch('/api/cron/aggregate-nova-insights', {
        method: 'POST'
      })
      
      const result = await response.json()
      if (result.success) {
        setInsights(result.data)
        setError(null)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('[v0] Error triggering aggregation:', err)
      setError('Error ejecutando agregación')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (error && !insights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg p-8 max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={triggerAggregation}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Generar Insights
          </button>
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg p-8 max-w-md text-center">
          <p className="text-white mb-4">No hay datos disponibles aún</p>
          <button
            onClick={triggerAggregation}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Generar Insights
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Habitación del Tiempo
          </h1>
          <p className="text-slate-400 text-lg">
            Reflexión de Nova sobre nuestro viaje emocional colectivo
          </p>
        </div>

        {/* Nova's Reflection */}
        <div className="bg-gradient-to-br from-purple-900 to-slate-800 rounded-2xl p-8 sm:p-12 mb-8 border border-purple-500/20">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Nova</h2>
              <p className="text-purple-300">Agente Compasivo</p>
            </div>
          </div>

          <p className="text-slate-100 text-lg leading-relaxed whitespace-pre-wrap">
            {insights.agentReflection}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Users */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition">
            <p className="text-slate-400 text-sm font-medium mb-2">Usuarios</p>
            <p className="text-3xl font-bold text-white">
              {insights.totalUsers}
            </p>
          </div>

          {/* Total Sessions */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-green-500/30 transition">
            <p className="text-slate-400 text-sm font-medium mb-2">Sesiones</p>
            <p className="text-3xl font-bold text-white">
              {insights.totalSessions}
            </p>
          </div>

          {/* Mood Shift */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-amber-500/30 transition">
            <p className="text-slate-400 text-sm font-medium mb-2">Cambio Promedio</p>
            <p className={`text-3xl font-bold ${insights.averageMoodShift > 0 ? 'text-green-400' : 'text-slate-400'}`}>
              {insights.averageMoodShift > 0 ? '+' : ''}{insights.averageMoodShift}
            </p>
          </div>

          {/* Cities Count */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-pink-500/30 transition">
            <p className="text-slate-400 text-sm font-medium mb-2">Ciudades</p>
            <p className="text-3xl font-bold text-white">
              {insights.uniqueCities.length}
            </p>
          </div>
        </div>

        {/* Cities Section */}
        {insights.uniqueCities.length > 0 && (
          <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              Ciudades Evaluadas
            </h3>
            <div className="flex flex-wrap gap-3">
              {insights.uniqueCities.map((city) => (
                <div
                  key={city}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition"
                >
                  {city}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-center text-slate-500 text-sm">
          <p>
            Última actualización:{' '}
            {new Date(insights.timestamp).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={triggerAggregation}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            {loading ? 'Actualizando...' : 'Actualizar Insights'}
          </button>
        </div>
      </div>
    </div>
  )
}
