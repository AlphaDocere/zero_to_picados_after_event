"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Minus, Heart, Sparkles, Users, PenLine, Wind, Share2, Headphones, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAgentResponse, AgentGenerativeData, AgentAction } from "@/hooks/use-agent-response"
import { useBinauralBeat } from "@/hooks/use-binaural"
import { useMood } from "@/contexts/MoodContext"
import { getAgent } from "@/lib/agents.config"

interface ResponseCardProps {
  agentId: string
  initialMood: number
  sessionId?: string
  opinion?: string
  city?: string
}

const ACTION_ICONS: Record<AgentAction['type'], React.ReactNode> = {
  reflect: <Sparkles className="w-4 h-4" />,
  share:   <Share2 className="w-4 h-4" />,
  breathe: <Wind className="w-4 h-4" />,
  write:   <PenLine className="w-4 h-4" />,
  connect: <Users className="w-4 h-4" />,
}

const ACTION_COLORS: Record<AgentAction['type'], string> = {
  reflect: 'bg-violet-500/10 border-violet-500/30 text-violet-300 hover:bg-violet-500/20',
  share:   'bg-pink-500/10 border-pink-500/30 text-pink-300 hover:bg-pink-500/20',
  breathe: 'bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20',
  write:   'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20',
  connect: 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20',
}

const FORECAST_CONFIG = {
  improving:    { icon: <TrendingUp className="w-4 h-4" />, label: 'En ascenso',      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  stable:       { icon: <Minus className="w-4 h-4" />,      label: 'Estable',         color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  'needs-care': { icon: <Heart className="w-4 h-4" />,      label: 'Necesita cuidado', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
}

const BINAURAL_LABELS: Record<string, string> = {
  improving:    'Alpha/Beta 14Hz — energía positiva',
  stable:       'Alpha 10Hz — calma enfocada',
  'needs-care': 'Theta 6Hz — sanación profunda',
}

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/10" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/10 rounded w-full" />
        <div className="h-3 bg-white/10 rounded w-5/6" />
        <div className="h-3 bg-white/10 rounded w-4/6" />
      </div>
      <div className="grid gap-3">
        <div className="h-16 bg-white/10 rounded-2xl" />
        <div className="h-16 bg-white/10 rounded-2xl" />
      </div>
    </div>
  )
}

function ActionCard({ action, onClick, selected }: { action: AgentAction; onClick: () => void; selected: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-2xl border transition-all duration-200",
        ACTION_COLORS[action.type],
        selected && "ring-2 ring-white/30 scale-[1.02]"
      )}
    >
      <div className="flex items-center gap-2 mb-1 font-semibold text-sm">
        {ACTION_ICONS[action.type]}
        {action.label}
      </div>
      <p className="text-xs opacity-70 leading-snug">{action.description}</p>
    </button>
  )
}

export function ResponseCard({ agentId, initialMood, sessionId, opinion, city }: ResponseCardProps) {
  const [data, setData] = useState<AgentGenerativeData | null>(null)
  const [selectedAction, setSelectedAction] = useState<number | null>(null)
  const [audioActive, setAudioActive] = useState(false)
  const [audioLabel, setAudioLabel] = useState('')

  const { getAgentResponse, loading } = useAgentResponse()
  const { start: startBeat, stop: stopBeat } = useBinauralBeat()
  const { setAgentState } = useMood()

  const agent = getAgent(agentId)

  // Fetch agent response
  useEffect(() => {
    if (!sessionId || !opinion || !agentId) return
    setData(null)
    setSelectedAction(null)
    setAudioActive(false)
    setAgentState(null)

    getAgentResponse(sessionId, agentId, initialMood, opinion, city).then((res) => {
      if (!res) return
      setData(res)
      // Trigger agent visual overlay
      setAgentState({ agentId, forecast: res.moodForecast })
    })
  }, [agentId, sessionId, opinion, initialMood, city, getAgentResponse, setAgentState])

  // Cleanup audio on unmount
  useEffect(() => () => { stopBeat() }, [stopBeat])

  const handleAudioToggle = () => {
    if (!data) return
    if (audioActive) {
      stopBeat()
      setAudioActive(false)
    } else {
      const label = startBeat(data.moodForecast)
      setAudioLabel(label)
      setAudioActive(true)
    }
  }

  if (!agent) {
    return (
      <div className="p-8 rounded-3xl bg-card border-2 border-dashed border-border text-center">
        <p className="text-muted-foreground">Por favor selecciona un agente primero</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-foreground">Respuesta de {agent.name}</h2>
        <p className="text-sm text-muted-foreground">Generada para ti en este momento</p>
      </div>

      <div className="p-6 rounded-3xl border-2 border-border bg-card shadow-xl space-y-5">
        {loading && <SkeletonLoader />}

        {!loading && data && (
          <>
            {/* Agent header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg bg-gradient-to-br from-primary to-accent">
                {agent.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">{agent.title}</p>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold",
                FORECAST_CONFIG[data.moodForecast].color
              )}>
                {FORECAST_CONFIG[data.moodForecast].icon}
                {FORECAST_CONFIG[data.moodForecast].label}
              </div>
            </div>

            {/* Emotional validation */}
            <div className="px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary font-medium">{data.emotionalValidation}</p>
            </div>

            {/* Main insight */}
            <div className="p-4 rounded-2xl bg-secondary">
              <p className="text-foreground leading-relaxed">{data.insight}</p>
            </div>

            {/* Binaural beat activator */}
            <button
              onClick={handleAudioToggle}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300",
                audioActive
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300",
                audioActive ? "bg-primary/30" : "bg-white/10"
              )}>
                {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">
                  {audioActive ? 'Sonido binaural activo' : 'Activar sonido binaural'}
                </p>
                <p className="text-xs opacity-60">
                  {audioActive ? audioLabel : 'Usa audífonos para la experiencia completa'}
                </p>
              </div>
              <Headphones className="w-4 h-4 opacity-50" />
            </button>

            {/* Generative action cards */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Acciones sugeridas
              </p>
              <div className="grid gap-3">
                {data.actions.map((action, i) => (
                  <ActionCard
                    key={i}
                    action={action}
                    selected={selectedAction === i}
                    onClick={() => setSelectedAction(i === selectedAction ? null : i)}
                  />
                ))}
              </div>
            </div>

            {/* Community insight */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <Users className="w-3 h-3" /> Para la comunidad
              </p>
              <blockquote className="text-sm italic text-foreground/80 pl-3 border-l-2 border-primary/40">
                "{data.communityInsight}"
              </blockquote>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
