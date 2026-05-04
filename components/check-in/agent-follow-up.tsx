"use client"

import { MessageCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { getAgent } from "@/lib/agents.config"

interface AgentFollowUpProps {
  agentId: string
  initialMood: number
  value: string
  onChange: (value: string) => void
}

export function AgentFollowUp({ agentId, initialMood, value, onChange }: AgentFollowUpProps) {
  const agent = getAgent(agentId)

  if (!agent) {
    return null
  }

  const getMoodCategory = (mood: number): "low" | "medium" | "high" => {
    if (mood < 40) return "low"
    if (mood < 70) return "medium"
    return "high"
  }

  const getMoodQuestion = (agentId: string, mood: string): string => {
    const questions: Record<string, Record<string, string>> = {
      amplifier: {
        low: "¿Qué te gustaría compartir con nuestra comunidad global de Zero to Agent?",
        medium: "¿Cómo te gustaría amplificar tu voz en este momento?",
        high: "¿Qué inspiración quieres transmitir a otros en este viaje?"
      },
      documentarian: {
        low: "¿Cuál es la lección más importante que estás aprendiendo ahora?",
        medium: "¿Qué insight documentarías sobre tu experiencia?",
        high: "¿Qué sabiduría quieres dejar registrada en el archivo?"
      },
      visionary: {
        low: "¿Qué transformación esperas para ti en los próximos meses?",
        medium: "¿Cuál es tu visión de crecimiento después de Zero to Agent?",
        high: "¿Cómo imaginas que este evento cambió tu camino?"
      }
    }

    return questions[agentId]?.[mood] || "Comparte tus reflexiones..."
  }

  const question = getMoodQuestion(agentId, getMoodCategory(initialMood))

  return (
    <div className="space-y-6 animate-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-2">
          <MessageCircle className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {agent.name} quiere saber...
        </h2>
      </div>

      <div className="relative p-5 rounded-3xl bg-card border-2 border-border shadow-lg">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-base font-bold text-white shadow-lg animate-float">
            {agent.name.charAt(0)}
          </div>
        </div>
        
        <div className="pt-6 space-y-1">
          <p className="text-foreground font-medium text-center leading-relaxed">
            {question}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe tu respuesta aqui..."
          className="min-h-[140px] text-base rounded-2xl border-2 border-border bg-card focus:border-primary focus:ring-primary/20 resize-none p-4 shadow-sm transition-all duration-300 focus:shadow-lg focus:shadow-primary/10"
        />
        <div className="flex justify-between items-center px-1">
          <span className="text-xs text-muted-foreground">
            Toma tu tiempo para reflexionar
          </span>
          <span className="text-xs text-muted-foreground">
            {value.length} caracteres
          </span>
        </div>
      </div>
    </div>
  )
}
