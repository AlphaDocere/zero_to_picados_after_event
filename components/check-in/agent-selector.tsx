"use client"

import { Sparkles, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllAgents } from "@/lib/agents.config"
import { useTranslation } from "@/contexts/LanguageContext"

interface AgentSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function AgentSelector({ value, onChange }: AgentSelectorProps) {
  const { t } = useTranslation()
  const agents = getAllAgents()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-2">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t('checkin.agent.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('checkin.agent.description')}
        </p>
      </div>

      <div className="space-y-4">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onChange(agent.id)}
            className={cn(
              "w-full relative overflow-hidden rounded-3xl border-2 text-left transition-all duration-300",
              "hover:scale-[1.02] active:scale-[0.98]",
              value === agent.id
                ? "border-primary shadow-xl shadow-primary/20 bg-card"
                : "border-border bg-card hover:border-primary/50 hover:shadow-lg"
            )}
          >
            <div className="relative p-5 flex items-start gap-4">
              <div className={cn(
                "flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg transition-transform duration-300",
                "bg-gradient-to-br from-primary to-accent text-white",
                value === agent.id && "scale-110 animate-float"
              )}>
                {agent.name.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div>
                    <h3 className={cn(
                      "font-bold text-lg",
                      value === agent.id ? "text-primary" : "text-foreground"
                    )}>
                      {agent.name}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground">
                      {agent.title}
                    </p>
                  </div>
                  {value === agent.id && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {agent.role}
                </p>
                <p className="text-sm text-foreground/70 mt-2 line-clamp-2">
                  {agent.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
