"use client"

import { useEffect, useState } from "react"
import { Heart, Sprout, Share2, ChevronRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SupportModal } from "@/components/support-modal"
import Link from "next/link"
import { getAllSessions } from "@/lib/firebase"
import { useShareToDiscord } from "@/hooks/use-share-to-discord"
import { useTranslation } from "@/contexts/LanguageContext"

interface Session {
  id: string
  initialMood: number
  finalMood: number
  city: string
  opinion: string
  followUpResponse: string
  selectedAgent: string
  createdAt: number
}

export default function HarvestPage() {
  const { t } = useTranslation()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [sharedSessionIds, setSharedSessionIds] = useState<Set<string>>(new Set())
  const [supportModal, setSupportModal] = useState<{ isOpen: boolean; sessionId?: string; city?: string }>({
    isOpen: false
  })
  const { share, loading: shareLoading } = useShareToDiscord()
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgMoodChange: 0,
    avgInitialMood: 0,
    avgFinalMood: 0
  })

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        console.log('[v0] Fetching all sessions for harvest...')
        const allSessions = await getAllSessions()
        console.log('[v0] Sessions fetched:', allSessions.length)
        
        const completedSessions = allSessions.filter(s => s.status === 'completed')
        setSessions(completedSessions)

        if (completedSessions.length > 0) {
          const moodChanges = completedSessions.map(s => (s.finalMood || 0) - (s.initialMood || 0))
          const avgChange = moodChanges.reduce((a, b) => a + b, 0) / completedSessions.length
          const avgInitial = completedSessions.reduce((a, b) => a + (b.initialMood || 0), 0) / completedSessions.length
          const avgFinal = completedSessions.reduce((a, b) => a + (b.finalMood || 0), 0) / completedSessions.length

          setStats({
            totalSessions: completedSessions.length,
            avgMoodChange: Math.round(avgChange * 10) / 10,
            avgInitialMood: Math.round(avgInitial),
            avgFinalMood: Math.round(avgFinal)
          })
        }
      } catch (err) {
        console.error('[v0] Error fetching sessions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const handleShare = async (session: Session) => {
    setSupportModal({
      isOpen: true,
      sessionId: session.id,
      city: session.city
    })
  }

  const handleSubmitSupport = async (name: string, message: string) => {
    if (!supportModal.sessionId) return

    const session = sessions.find(s => s.id === supportModal.sessionId)
    if (!session) return

    const agentNames: Record<string, string> = {
      compassionate: 'Nova',
      analytical: 'Atlas',
      reflective: 'Phoenix'
    }

    const agentName = agentNames[session.selectedAgent] || session.selectedAgent

    const success = await share({
      city: session.city,
      initialMood: session.initialMood,
      finalMood: session.finalMood,
      opinion: session.opinion,
      followUpResponse: session.followUpResponse,
      agentName
    }, {
      supporterName: name,
      supportMessage: message
    })

    if (success) {
      setSharedSessionIds(prev => new Set([...prev, supportModal.sessionId!]))
      setSupportModal({ isOpen: false })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
        <div className="text-center space-y-4">
          <Sprout className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Recolectando semillas emocionales...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent pb-12">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('harvest.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('harvest.subtitle')}</p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              {t('common.next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-6 rounded-3xl bg-card border-2 border-border shadow-lg">
            <div className="text-sm text-muted-foreground font-medium mb-2">{t('harvest.labels.totalParticipants')}</div>
            <div className="text-4xl font-extrabold text-primary">{stats.totalSessions}</div>
          </div>

          <div className="p-6 rounded-3xl bg-card border-2 border-border shadow-lg">
            <div className="text-sm text-muted-foreground font-medium mb-2">{t('harvest.labels.averageMood')}</div>
            <div className="text-4xl font-extrabold text-accent">{stats.avgFinalMood}</div>
            <div className="text-xs text-muted-foreground mt-1">de 100</div>
          </div>

          <div className="p-6 rounded-3xl bg-card border-2 border-border shadow-lg">
            <div className="text-sm text-muted-foreground font-medium mb-2">{t('harvest.labels.moodTrend')}</div>
            <div className={`text-4xl font-extrabold ${stats.avgMoodChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {stats.avgMoodChange > 0 ? '+' : ''}{stats.avgMoodChange}
            </div>
            <div className="text-xs text-muted-foreground mt-1">puntos</div>
          </div>

          <div className="p-6 rounded-3xl bg-card border-2 border-border shadow-lg">
            <div className="text-sm text-muted-foreground font-medium mb-2">Inicio Promedio</div>
            <div className="text-4xl font-extrabold text-primary">{stats.avgInitialMood}</div>
            <div className="text-xs text-muted-foreground mt-1">de 100</div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-primary" />
              Semillas Emocionales
            </h2>
          </div>

          {sessions.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card border-2 border-border text-center space-y-3">
              <Sprout className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-muted-foreground">
                {t('harvest.empty')}
              </p>
              <Link href="/">
                <Button className="mt-4">{t('checkin.title')}</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session, idx) => (
                <div
                  key={session.id}
                  className="group p-6 rounded-3xl bg-card border-2 border-border hover:border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{session.city}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(session.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-foreground leading-relaxed mb-4 italic">
                        "{session.opinion}"
                      </p>

                      {session.followUpResponse && (
                        <div className="p-3 rounded-2xl bg-secondary/50 border border-border mb-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Reflexión adicional:</p>
                          <p className="text-sm text-foreground">"{session.followUpResponse}"</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground font-medium">Cambio</div>
                        <div className={`text-2xl font-bold ${(session.finalMood || 0) - (session.initialMood || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {(session.finalMood || 0) - (session.initialMood || 0) >= 0 ? '+' : ''}
                          {(session.finalMood || 0) - (session.initialMood || 0)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground font-medium">Ánimo Final</div>
                        <div className="text-2xl font-bold text-primary">{session.finalMood || 0}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground capitalize font-medium">
                      Guía: {session.selectedAgent === 'compassionate' ? 'Nova' : session.selectedAgent === 'analytical' ? 'Atlas' : 'Phoenix'}
                    </div>
                    {sharedSessionIds.has(session.id) ? (
                      <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Compartido
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleShare(session)}
                        disabled={shareLoading}
                      >
                        <Share2 className="w-3 h-3" />
                        {shareLoading ? 'Compartiendo...' : 'Compartir'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 text-center space-y-4">
          <h3 className="text-lg font-bold text-foreground">Siembra tu propia semilla</h3>
          <p className="text-sm text-muted-foreground">Cada reflexión contribuye a la sabiduría colectiva de nuestra comunidad</p>
          <Link href="/">
            <Button className="gap-2 mx-auto">
              <Sprout className="w-4 h-4" />
              {t('checkin.title')}
            </Button>
          </Link>
        </div>
      </main>

      <SupportModal
        isOpen={supportModal.isOpen}
        onClose={() => setSupportModal({ isOpen: false })}
        onSubmit={handleSubmitSupport}
        isLoading={shareLoading}
        sessionCity={supportModal.city || ''}
      />
    </div>
  )
}
