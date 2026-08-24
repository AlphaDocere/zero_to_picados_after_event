'use client'

import { useState, useEffect } from 'react'
import { RotateCcw, Check, Loader } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAgentMemory } from '@/hooks/use-agent-memory'

interface MemoryCard {
  id: string
  city: string
  feeling: string
  isFlipped: boolean
  isMatched: boolean
}

interface MemoryQuestProps {
  agentId: string
}

const defaultMemories = [
  { city: 'Madrid', feeling: 'Alegría' },
  { city: 'Buenos Aires', feeling: 'Nostalgia' },
  { city: 'México City', feeling: 'Esperanza' },
  { city: 'Barcelona', feeling: 'Conexión' },
  { city: 'São Paulo', feeling: 'Energía' },
  { city: 'Santiago', feeling: 'Paz' }
]

export function MemoryQuest({ agentId }: MemoryQuestProps) {
  const { language } = useTranslation()
  const { data: memory, loading: memoryLoading } = useAgentMemory(agentId)
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flipped, setFlipped] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)

  // Initialize game with real or mock data
  useEffect(() => {
    // Get memories from real data or use defaults
    const conversations = memory?.recentConversations || []
    const cities = conversations.slice(0, 6).map((c, idx) => ({
      city: c.city,
      feeling: ['Alegría', 'Nostalgia', 'Esperanza', 'Conexión', 'Energía', 'Paz'][idx % 6]
    }))

    const memoriesForGame = cities.length > 0 ? cities : defaultMemories

    const shuffledCards = [...memoriesForGame, ...memoriesForGame]
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({
        id: `${item.city}-${idx}`,
        city: item.city,
        feeling: item.feeling,
        isFlipped: false,
        isMatched: false
      }))
    setCards(shuffledCards)
  }, [memory])

  // Check for matches
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped
      const firstCard = cards.find(c => c.id === first)
      const secondCard = cards.find(c => c.id === second)

      if (firstCard?.feeling === secondCard?.feeling) {
        // Match found
        setMatched(prev => [...prev, first, second])
        setFlipped([])
      } else {
        // No match
        setTimeout(() => setFlipped([]), 600)
      }

      setMoves(prev => prev + 1)
    }
  }, [flipped, cards])

  // Check for win
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameWon(true)
    }
  }, [matched, cards.length])

  const handleCardClick = (cardId: string) => {
    if (flipped.includes(cardId) || matched.includes(cardId) || flipped.length >= 2) return
    setFlipped(prev => [...prev, cardId])
  }

  const handleReset = () => {
    setCards(cards.map(c => ({ ...c, isFlipped: false, isMatched: false })))
    setFlipped([])
    setMatched([])
    setMoves(0)
    setGameWon(false)
  }

  if (memoryLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-5 h-5 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/60 border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground font-medium">{language === 'es' ? 'Movimientos' : 'Moves'}</p>
          <p className="text-2xl font-bold text-primary">{moves}</p>
        </div>
        <div className="bg-secondary/60 border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground font-medium">{language === 'es' ? 'Encontrados' : 'Matched'}</p>
          <p className="text-2xl font-bold text-accent">{matched.length / 2} / {cards.length / 2}</p>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={matched.includes(card.id) || gameWon}
            className={`aspect-square rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center p-2 shadow-sm ${
              matched.includes(card.id)
                ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 cursor-default'
                : flipped.includes(card.id)
                ? 'bg-gradient-to-br from-primary to-accent text-white shadow-md'
                : 'bg-secondary/80 hover:bg-secondary border border-border text-foreground hover:scale-105 active:scale-95'
            }`}
          >
            {flipped.includes(card.id) || matched.includes(card.id) ? (
              <div className="space-y-1 text-center">
                <p className="text-[11px] opacity-80 truncate">{card.city}</p>
                <p className="text-xs font-bold leading-tight">{card.feeling}</p>
              </div>
            ) : matched.includes(card.id) ? (
              <Check className="w-6 h-6 mx-auto" />
            ) : (
              <span className="text-lg text-muted-foreground">?</span>
            )}
          </button>
        ))}
      </div>

      {/* Win State */}
      {gameWon && (
        <div className="p-5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500 text-center space-y-2 animate-in zoom-in-95">
          <p className="text-lg font-bold text-emerald-400">
            {language === 'es' ? '¡Memoria Completada con Éxito!' : 'Memory Quest Completed!'}
          </p>
          <p className="text-sm text-foreground/90">
            {language === 'es' 
              ? `Has encontrado todos los pares en ${moves} movimientos.` 
              : `Completed all pairs in ${moves} moves.`}
          </p>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md"
      >
        <RotateCcw className="w-4 h-4" />
        {language === 'es' ? 'Reiniciar Partida' : 'Reset Game'}
      </button>

      {/* Info */}
      <div className="p-3.5 rounded-xl bg-secondary/50 border border-border text-center text-xs text-muted-foreground">
        {language === 'es'
          ? 'Encuentra los pares coincidentes de ciudades y emociones registradas por la comunidad.'
          : 'Find matching pairs of cities and emotions recorded by the community.'}
      </div>
    </div>
  )
}
