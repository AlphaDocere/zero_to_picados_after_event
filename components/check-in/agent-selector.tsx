"use client"

import Image from "next/image"
import { Sparkles, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllAgents } from "@/lib/agents.config"
import { useTranslation } from "@/contexts/LanguageContext"

interface AgentSelectorProps {
  value: string
  onChange: (value: string) => void
}

const AGENT_AVATARS: Record<string, string> = {
  amplifier: "/characters/nova-avatar.jpg",
  documentarian: "/characters/atlas-avatar.jpg",
  visionary: "/characters/phoenix-avatar.jpg",
  compassionate: "/characters/nova-avatar.jpg",
  analytical: "/characters/atlas-avatar.jpg",
  reflective: "/characters/phoenix-avatar.jpg",
  motivational: "/characters/phoenix-avatar.jpg",
  nova: "/characters/nova-avatar.jpg",
  atlas: "/characters/atlas-avatar.jpg",
  phoenix: "/characters/phoenix-avatar.jpg"
}

function getAgentAvatar(agentId: string, agentName: string): string {
  const lowerId = (agentId || "").toLowerCase()
  if (AGENT_AVATARS[lowerId]) return AGENT_AVATARS[lowerId]

  const lowerName = (agentName || "").toLowerCase()
  if (AGENT_AVATARS[lowerName]) return AGENT_AVATARS[lowerName]

  return "/characters/nova-avatar.jpg"
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
        {agents.map((agent) => {
          const isSelected = value === agent.id
          const avatarSrc = getAgentAvatar(agent.id, agent.name)

          return (
            <button
              key={agent.id}
              onClick={() => onChange(agent.id)}
              className={cn(
                "w-full relative overflow-hidden rounded-3xl border-2 text-left transition-all duration-300",
                "hover:scale-[1.02] active:scale-[0.98]",
                isSelected
                  ? "border-primary shadow-xl shadow-primary/20 bg-card"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-lg"
              )}
            >
              <div className="relative p-5 flex items-center gap-4">
                {/* Character Photo / Avatar */}
                <div
                  className={cn(
                    "relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shadow-md transition-transform duration-300",
                    isSelected
                      ? "border-primary scale-105 shadow-primary/30 ring-2 ring-primary/40 animate-float"
                      : "border-border/80 group-hover:border-primary/50"
                  )}
                >
                  <Image
                    src={avatarSrc}
                    alt={agent.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3
                        className={cn(
                          "font-bold text-lg",
                          isSelected ? "text-primary" : "text-foreground"
                        )}
                      >
                        {agent.name}
                      </h3>
                      <p className="text-xs font-medium text-muted-foreground">
                        {agent.title}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs font-medium text-muted-foreground/90 mt-1">
                    {agent.role}
                  </p>
                  <p className="text-sm text-foreground/75 mt-1.5 line-clamp-2">
                    {agent.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
