'use client'

import { useState } from 'react'
import { Heart, Zap, BarChart3 } from 'lucide-react'
import { EchoChamber } from './games/echo-chamber'
import { MemoryQuest } from './games/memory-quest'
import { FutureVision } from './games/future-vision'
import { useTranslation } from '@/contexts/LanguageContext'

interface AgentGameProps {
  agentId: string
  agentName: string
}

type GameType = 'echo' | 'memory' | 'vision'

interface GameConfig {
  icon: React.ReactNode
  label: string
  component: React.ComponentType<{ agentId: string }>
}

const gameConfig: Record<string, Record<string, GameConfig>> = {
  amplifier: {
    echo: {
      icon: <Zap className="w-4 h-4" />,
      label: 'Cámara de Eco',
      component: EchoChamber
    }
  },
  documentarian: {
    memory: {
      icon: <Heart className="w-4 h-4" />,
      label: 'Búsqueda de Memoria',
      component: MemoryQuest
    }
  },
  visionary: {
    vision: {
      icon: <BarChart3 className="w-4 h-4" />,
      label: 'Visión del Futuro',
      component: FutureVision
    }
  }
}

export function AgentGame({ agentId, agentName }: AgentGameProps) {
  const { language } = useTranslation()
  const [activeGame, setActiveGame] = useState<GameType | null>(null)

  const games = gameConfig[agentId] || gameConfig.amplifier
  const gameId = Object.keys(games)[0] as GameType
  const game = games[gameId]
  const GameComponent = game.component

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        {game.icon}
        {language === 'es' ? 'Juega' : 'Play'}: {game.label}
      </h3>

      {!activeGame && (
        <button
          onClick={() => setActiveGame(gameId)}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          {language === 'es' ? 'Comenzar Juego' : 'Start Game'}
        </button>
      )}

      {activeGame && (
        <div className="bg-white/40 backdrop-blur rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{game.label}</p>
            <button
              onClick={() => setActiveGame(null)}
              className="text-xs px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 transition-all"
            >
              {language === 'es' ? 'Cerrar' : 'Close'}
            </button>
          </div>
          <GameComponent agentId={agentId} />
        </div>
      )}
    </div>
  )
}
