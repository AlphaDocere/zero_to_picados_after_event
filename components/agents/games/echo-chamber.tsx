'use client'

import { useState, useEffect } from 'react'
import { Send, RotateCcw, Loader } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAgentAnalytics } from '@/hooks/use-agent-analytics'

interface EchoChamberState {
  userFeeling: string
  echoes: { city: string; sentiment: string; timestamp: number }[]
  isPlaying: boolean
}

const sentimentResponses = {
  es: {
    positive: ['¡Qué hermoso!', '¡Inspirador!', '¡Celebramos contigo!', '¡Qué esperanza!', '¡Gracias por compartir!'],
    neutral: ['Entendemos', 'Estamos aquí', 'Te acompañamos', 'Seguimos adelante', 'Somos uno'],
    negative: ['Te escuchamos', 'No estás solo', 'Esto pasará', 'Somos comunidad', 'Aquí estamos']
  },
  en: {
    positive: ['So beautiful!', 'Inspiring!', 'We celebrate with you!', 'What hope!', 'Thanks for sharing!'],
    neutral: ['We understand', 'We are here', 'You are not alone', 'Moving forward', 'We are one'],
    negative: ['We hear you', 'You are not alone', 'This will pass', 'We are community', 'We are here']
  }
}

interface EchoChamberProps {
  agentId: string
}

export function EchoChamber({ agentId }: EchoChamberProps) {
  const { language } = useTranslation()
  const { data: analytics, loading: analyticsLoading } = useAgentAnalytics(agentId)
  const [state, setState] = useState<EchoChamberState>({
    userFeeling: '',
    echoes: [],
    isPlaying: false
  })

  // Get real cities from analytics, fallback to defaults
  const cities = analytics?.engagementByCity?.slice(0, 6).map(item => item.city) || 
    ['Madrid', 'Buenos Aires', 'México City', 'Barcelona', 'São Paulo', 'Santiago']

  const getSentimentType = (text: string) => {
    const positive = ['feliz', 'happy', 'bien', 'good', 'excelente', 'great', 'amor', 'love', 'hermoso', 'beautiful']
    const negative = ['triste', 'sad', 'mal', 'bad', 'terrible', 'miedo', 'fear', 'solo', 'alone', 'difícil', 'hard']

    const lower = text.toLowerCase()
    if (positive.some(w => lower.includes(w))) return 'positive'
    if (negative.some(w => lower.includes(w))) return 'negative'
    return 'neutral'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.userFeeling.trim()) return

    setState(prev => ({ ...prev, isPlaying: true }))

    const sentimentType = getSentimentType(state.userFeeling)
    const responses = sentimentResponses[language as keyof typeof sentimentResponses]
    const responseSet = responses[sentimentType as keyof typeof responses]

    // Simulate echoes appearing one by one from real cities
    let delay = 0
    const newEchoes: typeof state.echoes = []

    cities.forEach((city, idx) => {
      setTimeout(() => {
        const randomResponse = responseSet[Math.floor(Math.random() * responseSet.length)]
        newEchoes.push({
          city: city,
          sentiment: randomResponse,
          timestamp: Date.now()
        })

        setState(prev => ({
          ...prev,
          echoes: [...prev.echoes, { city, sentiment: randomResponse, timestamp: Date.now() }]
        }))

        if (idx === cities.length - 1) {
          setTimeout(() => {
            setState(prev => ({ ...prev, isPlaying: false }))
          }, 500)
        }
      }, (idx + 1) * 200)
    })
  }

  const handleReset = () => {
    setState({ userFeeling: '', echoes: [], isPlaying: false })
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          {language === 'es' ? 'Comparte un sentimiento' : 'Share a feeling'}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={state.userFeeling}
            onChange={(e) => setState(prev => ({ ...prev, userFeeling: e.target.value }))}
            placeholder={language === 'es' ? 'Ej: Me siento feliz hoy...' : 'E.g: I feel happy today...'}
            className="flex-1 px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            disabled={state.isPlaying}
          />
          <button
            type="submit"
            disabled={state.isPlaying || !state.userFeeling.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 font-medium transition-all"
          >
            {state.isPlaying ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {language === 'es' ? 'Enviar' : 'Send'}
          </button>
        </div>
      </form>

      {/* Echoes Section */}
      {state.echoes.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            {language === 'es' ? 'Ecos desde el mundo' : 'Echoes from the world'}
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {state.echoes.map((echo, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 animate-in fade-in slide-in-from-bottom-2 text-white"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <p className="text-xs font-bold text-primary/80 mb-1">{echo.city}</p>
                <p className="text-sm text-white italic">"{echo.sentiment}"</p>
              </div>
            ))}
          </div>

          {!state.isPlaying && (
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {language === 'es' ? 'Nuevo eco' : 'New echo'}
            </button>
          )}
        </div>
      )}

      {/* Info */}
      {state.echoes.length === 0 && (
        <div className="p-4 rounded-lg bg-secondary/30 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            {analyticsLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-3 h-3 animate-spin" />
                {language === 'es' ? 'Cargando ciudades...' : 'Loading cities...'}
              </span>
            ) : (
              language === 'es'
                ? 'Comparte cómo te sientes y mira cómo resuena en ciudades alrededor del mundo'
                : 'Share how you feel and watch how it resonates in cities around the world'
            )}
          </p>
        </div>
      )}
    </div>
  )
}
