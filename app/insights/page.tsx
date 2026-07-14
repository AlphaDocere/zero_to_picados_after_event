"use client"

import { useEffect, useState } from "react"
import { Globe, TrendingUp } from "lucide-react"
import { getAllSessions } from "@/lib/firebase"
import { 
  analyzeCityPatterns, 
  extractThemes, 
  getCityConnections, 
  getEmotionalClusters 
} from "@/lib/insights"
import { CityMap } from "@/components/insights/city-map"
import { CityComparator } from "@/components/insights/city-comparator"
import { ConnectionsNetwork } from "@/components/insights/connections-network"
import { ThemesCloud } from "@/components/insights/themes-cloud"
import { EmotionalClusters } from "@/components/insights/emotional-clusters"
import { useTranslation } from "@/contexts/LanguageContext"

export default function InsightsPage() {
  const { t } = useTranslation()
  const [cityPatterns, setCityPatterns] = useState<any[]>([])
  const [connections, setConnections] = useState<any[]>([])
  const [themes, setThemes] = useState<any[]>([])
  const [clusters, setClusters] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [totalReflections, setTotalReflections] = useState(0)

  useEffect(() => {
    async function loadInsights() {
      try {
        console.log('[v0] Loading insights from Firebase...')
        const allSessions = await getAllSessions()
        console.log('[v0] Loaded all sessions:', allSessions.length)

        const completedSessions = allSessions.filter(s => s.status === 'completed')
        console.log('[v0] Completed sessions:', completedSessions.length)

        if (completedSessions.length > 0) {
          const patterns = analyzeCityPatterns(completedSessions)
          setCityPatterns(patterns)
          setTotalReflections(completedSessions.length)

          const allOpinions = completedSessions.map(s => s.opinion).filter(Boolean)
          const extractedThemes = extractThemes(allOpinions)
          setThemes(extractedThemes)

          const connectionsList = getCityConnections(patterns, 40)
          setConnections(connectionsList)

          const emotionalClusters = getEmotionalClusters(patterns)
          setClusters(emotionalClusters)

          console.log('[v0] Insights ready:', { patterns: patterns.length, themes: extractedThemes.length })
        }
      } catch (err) {
        console.error('[v0] Error loading insights:', err)
      } finally {
        setLoading(false)
      }
    }

    loadInsights()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <Globe className="w-12 h-12 text-primary mx-auto animate-spin" />
            <p className="text-muted-foreground">Analizando reflexiones globales...</p>
          </div>
        </div>
      </main>
    )
  }

  if (cityPatterns.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <Globe className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">{t('insights.empty')}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('insights.title')}</h1>
              <p className="text-muted-foreground">{t('insights.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Reflexiones Totales</p>
              <p className="text-3xl font-bold text-primary">{totalReflections}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Ciudades Conectadas</p>
              <p className="text-3xl font-bold text-accent">{cityPatterns.length}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Conexiones Emocionales</p>
              <p className="text-3xl font-bold text-emerald-500">{connections.length}</p>
            </div>
          </div>
        </div>

        {/* Visualizations */}
        <div className="space-y-8">
          {/* City Map */}
          <section>
            <CityMap cities={cityPatterns} />
          </section>

          {/* City Comparator */}
          <section>
            <div className="bg-card rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Comparar Ciudades
              </h2>
              <CityComparator cities={cityPatterns} />
            </div>
          </section>

          {/* Emotional Clusters */}
          <section>
            <EmotionalClusters clusters={clusters} />
          </section>

          {/* Connections Network */}
          <section>
            <div className="bg-card rounded-2xl border border-border p-8">
              <ConnectionsNetwork connections={connections} />
            </div>
          </section>

          {/* Themes Cloud */}
          <section>
            <div className="bg-card rounded-2xl border border-border p-8">
              <ThemesCloud themes={themes} />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-border p-8 text-center">
          <p className="text-muted-foreground mb-2">Construyendo Juntos</p>
          <p className="text-foreground font-semibold">Cada reflexión contribuye a este tapiz global de emociones y experiencias compartidas</p>
        </div>
      </div>
    </main>
  )
}
