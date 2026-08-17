'use client'

import { useState } from 'react'
import { Heart, Zap, BarChart3, X, Sparkles, Gamepad2 } from 'lucide-react'
import { EchoChamber } from './games/echo-chamber'
import { MemoryQuest } from './games/memory-quest'
import { FutureVision } from './games/future-vision'
import { useTranslation } from '@/contexts/LanguageContext'
import { getCharacterTheme } from '@/lib/character-system'

interface AgentGameProps {
  agentId: string
  agentName: string
}

type GameType = 'echo' | 'memory' | 'vision'

interface GameConfig {
  icon: React.ReactNode
  label: string
  subtitle: string
  description: string
  component: React.ComponentType<{ agentId: string }>
}

const gameConfig: Record<string, Record<string, GameConfig>> = {
  amplifier: {
    echo: {
      icon: <Zap className="w-5 h-5 text-pink-400" />,
      label: 'Cámara de Eco',
      subtitle: 'Resonancia Colectiva con Nova',
      description: 'Envía un pensamiento y observa cómo hace eco y resuena en diferentes ciudades del mundo en tiempo real.',
      component: EchoChamber
    }
  },
  documentarian: {
    memory: {
      icon: <Heart className="w-5 h-5 text-indigo-400" />,
      label: 'Búsqueda de Memoria',
      subtitle: 'Entrenamiento Cognitivo con Atlas',
      description: 'Pon a prueba tu memoria emparejando ciudades y estados de ánimo registrados por la comunidad.',
      component: MemoryQuest
    }
  },
  visionary: {
    vision: {
      icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
      label: 'Visión del Futuro',
      subtitle: 'Proyección Emocional con Phoenix',
      description: 'Modela tu trayectoria emocional esperada y desbloquea perspectivas predictivas orientadas a la acción.',
      component: FutureVision
    }
  }
}

export function AgentGame({ agentId, agentName }: AgentGameProps) {
  const { language } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const theme = getCharacterTheme(agentId)

  const games = gameConfig[agentId] || gameConfig.amplifier
  const gameId = Object.keys(games)[0] as GameType
  const game = games[gameId]
  const GameComponent = game.component

  return (
    <div className="pt-2 border-t border-white/10">
      {/* Trigger in Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" style={{ color: theme.colors.primary }} />
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-80">
              {language === 'es' ? 'Minijuego Interactivo' : 'Interactive Mini-game'}
            </h3>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 font-semibold">
            {game.label}
          </span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
          }}
        >
          {game.icon}
          <span>{language === 'es' ? `Jugar ${game.label}` : `Play ${game.label}`}</span>
        </button>
      </div>

      {/* Spacious Immersive Game Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border-2 p-6 sm:p-8 shadow-2xl space-y-6 text-foreground animate-in zoom-in-95 duration-300"
            style={{ borderColor: theme.colors.primary + '80' }}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                  }}
                >
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">{game.label}</h3>
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full font-semibold border"
                      style={{
                        background: `${theme.colors.primary}15`,
                        borderColor: `${theme.colors.primary}40`,
                        color: theme.colors.primary
                      }}
                    >
                      {agentName}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{game.subtitle}</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border"
                aria-label="Cerrar juego"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Game Description Banner */}
            <div
              className="p-4 rounded-2xl border text-sm leading-relaxed"
              style={{
                background: `${theme.colors.primary}10`,
                borderColor: `${theme.colors.primary}30`
              }}
            >
              <p className="text-xs text-foreground/80">{game.description}</p>
            </div>

            {/* Game Core Component */}
            <div className="pt-2">
              <GameComponent agentId={agentId} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
