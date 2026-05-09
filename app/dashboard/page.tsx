'use client'

import { useEffect, useState } from 'react'
import { Heart, TrendingUp, Users, Calendar } from 'lucide-react'
import { CheckInSession } from '@/lib/firebase'
import { useTranslation } from '@/contexts/LanguageContext'

export default function DashboardPage() {
  const { t } = useTranslation()
  const [sessions, setSessions] = useState<CheckInSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch('/api/get-sessions')
        const data = await response.json()
        setSessions(data)
      } catch (error) {
        console.error('[v0] Error loading sessions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [])

  const avgInitialMood = sessions.length
    ? Math.round(
        sessions.reduce((sum, s) => sum + s.initialMood, 0) / sessions.length
      )
    : 0

  const avgFinalMood = sessions.length
    ? Math.round(
        sessions.reduce((sum, s) => sum + s.finalMood, 0) / sessions.length
      )
    : 0

  const totalImprovement = avgFinalMood - avgInitialMood

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {t('dashboard.labels.totalSessions')}
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground">{sessions.length}</div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">
                {t('checkin.finalMood.title')} {t('common.back')}
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground">{avgInitialMood}/100</div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {t('checkin.finalMood.title')}
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground">{avgFinalMood}/100</div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-muted-foreground">
                {t('dashboard.labels.averageMoodChange')}
              </span>
            </div>
            <div className={`text-3xl font-bold ${totalImprovement >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {totalImprovement >= 0 ? '+' : ''}{totalImprovement}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando sesiones...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-2xl bg-card border border-border">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {t('dashboard.empty')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">{t('dashboard.sections.history')}</h2>
            <div className="grid gap-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-6 rounded-2xl bg-card border border-border shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          {session.city}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-4 items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Ánimo Inicial</p>
                          <p className="text-2xl font-bold text-foreground">{session.initialMood}</p>
                        </div>
                        <div className="text-2xl text-muted-foreground">→</div>
                        <div>
                          <p className="text-sm text-muted-foreground">Ánimo Final</p>
                          <p className="text-2xl font-bold text-foreground">{session.finalMood}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cambio</p>
                          <p className={`text-2xl font-bold ${session.finalMood >= session.initialMood ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {session.finalMood >= session.initialMood ? '+' : ''}{session.finalMood - session.initialMood}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {session.opinion && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-foreground italic">{session.opinion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
