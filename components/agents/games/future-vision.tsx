'use client'

import { useState } from 'react'
import { RotateCcw, TrendingUp } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAgentAnalytics } from '@/hooks/use-agent-analytics'

interface DataPoint {
  day: string
  sentiment: number
}

const mockTrajectory: DataPoint[] = [
  { day: '1', sentiment: 45 },
  { day: '2', sentiment: 48 },
  { day: '3', sentiment: 52 },
  { day: '4', sentiment: 58 },
  { day: '5', sentiment: 62 },
  { day: '6', sentiment: 68 },
  { day: '7', sentiment: 75 }
]

const potentialOutcomes = {
  es: {
    positive: [
      'Continuarás creciendo con confianza',
      'Descubrirás nuevas oportunidades',
      'Tu comunidad te apoyará',
      'Alcanzarás tus metas'
    ],
    neutral: [
      'Habrá altibajos en el camino',
      'Necesitarás paciencia y enfoque',
      'El apoyo comunitario será clave',
      'La reflexión te guiará'
    ],
    negative: [
      'Encontrarás fuerza en la comunidad',
      'Este es un tiempo de aprendizaje',
      'Las cosas mejorarán con el tiempo',
      'Tu resiliencia te llevará adelante'
    ]
  },
  en: {
    positive: [
      'You will continue to grow with confidence',
      'You will discover new opportunities',
      'Your community will support you',
      'You will reach your goals'
    ],
    neutral: [
      'There will be ups and downs ahead',
      'You will need patience and focus',
      'Community support will be key',
      'Reflection will guide you'
    ],
    negative: [
      'You will find strength in community',
      'This is a time of learning',
      'Things will improve with time',
      'Your resilience will carry you forward'
    ]
  }
}

interface FutureVisionProps {
  agentId: string
}

export function FutureVision({ agentId }: FutureVisionProps) {
  const { language } = useTranslation()
  const { data: analytics } = useAgentAnalytics(agentId)
  const [currentSentiment, setCurrentSentiment] = useState(analytics?.sentimentTrend?.[0] || 50)
  const [prediction, setPrediction] = useState<string | null>(null)
  const [trajectory, setTrajectory] = useState<DataPoint[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  const getSentimentType = (value: number) => {
    if (value >= 65) return 'positive'
    if (value <= 40) return 'negative'
    return 'neutral'
  }

  const handlePredict = () => {
    setIsAnimating(true)

    // Calculate trajectory based on current sentiment and real trend data
    const type = getSentimentType(currentSentiment)
    const trendSlope = analytics?.sentimentTrend && analytics.sentimentTrend.length > 1
      ? (analytics.sentimentTrend[analytics.sentimentTrend.length - 1] - analytics.sentimentTrend[0]) / analytics.sentimentTrend.length
      : 0

    const newTrajectory = mockTrajectory.map(point => ({
      ...point,
      sentiment: Math.max(20, Math.min(100, currentSentiment + (parseInt(point.day) * (type === 'positive' ? 3 : type === 'negative' ? -2 : 1)) + trendSlope * parseInt(point.day)))
    }))

    // Animate trajectory
    let delay = 0
    newTrajectory.forEach((point, idx) => {
      setTimeout(() => {
        setTrajectory(prev => [...prev, point])

        if (idx === newTrajectory.length - 1) {
          setTimeout(() => {
            const outcomes = potentialOutcomes[language as keyof typeof potentialOutcomes]
            const outcomeSet = outcomes[type as keyof typeof outcomes]
            const randomOutcome = outcomeSet[Math.floor(Math.random() * outcomeSet.length)]
            setPrediction(randomOutcome)
            setIsAnimating(false)
          }, 500)
        }
      }, (idx + 1) * 150)
    })
  }

  const handleReset = () => {
    setCurrentSentiment(50)
    setPrediction(null)
    setTrajectory([])
  }

  const sentimentType = getSentimentType(currentSentiment)

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          {language === 'es' ? 'Tu sentimiento hoy' : 'Your feeling today'}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            value={currentSentiment}
            onChange={(e) => setCurrentSentiment(Number(e.target.value))}
            className="flex-1 h-2 bg-gradient-to-r from-rose-500 via-yellow-500 to-emerald-500 rounded-lg appearance-none cursor-pointer accent-primary"
            disabled={isAnimating}
          />
          <span className="text-2xl font-bold text-primary w-12 text-right">{currentSentiment}</span>
        </div>
      </div>

      {/* Chart Area */}
      {trajectory.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {language === 'es' ? 'Tu trayectoria proyectada' : 'Your projected trajectory'}
          </h3>

          {/* Simple Chart */}
          <div className="h-40 bg-white/20 rounded-lg p-4 flex items-end gap-1 border border-white/30">
            {trajectory.map((point, idx) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-primary to-accent rounded-t-lg animate-in fade-in"
                style={{
                  height: `${(point.sentiment / 100) * 100}%`,
                  animationDelay: `${idx * 150}ms`
                }}
              />
            ))}
          </div>

          {/* Data Points */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {trajectory.map((point, idx) => (
              <div key={idx} className="p-1 rounded bg-white/20">
                <p className="font-semibold text-white">{point.sentiment}</p>
                <p className="text-white/60 text-xs">{point.day}d</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prediction */}
      {prediction && (
        <div className={`p-4 rounded-lg border-2 space-y-2 ${
          sentimentType === 'positive'
            ? 'bg-emerald-500/20 border-emerald-400'
            : sentimentType === 'negative'
            ? 'bg-rose-500/20 border-rose-400'
            : 'bg-yellow-500/20 border-yellow-400'
        }`}>
          <p className="text-sm font-bold text-white">
            {language === 'es' ? 'Tu visión del futuro' : 'Your vision of the future'}
          </p>
          <p className="text-base text-white italic">"{prediction}"</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handlePredict}
          disabled={isAnimating || trajectory.length > 0}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium transition-all flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          {language === 'es' ? 'Predecir' : 'Predict'}
        </button>
        {trajectory.length > 0 && (
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-white/30 text-white rounded-lg hover:bg-white/40 font-medium transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'es' ? 'Nuevo' : 'New'}
          </button>
        )}
      </div>

      {/* Info */}
      {trajectory.length === 0 && (
        <div className="p-3 rounded-lg bg-white/20 border border-white/30 text-center text-sm text-white">
          {language === 'es'
            ? 'Ajusta tu sentimiento y descubre tu trayectoria potencial'
            : 'Adjust your feeling and discover your potential trajectory'}
        </div>
      )}
    </div>
  )
}
