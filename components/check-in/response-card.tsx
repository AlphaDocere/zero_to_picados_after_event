"use client"

import { useEffect, useState } from "react"
import { MessageCircleHeart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAgentResponse } from "@/hooks/use-agent-response"
import { getAgent } from "@/lib/agents.config"
import { CacheMetricsPanel } from "@/components/debug/cache-metrics-panel"

interface ResponseCardProps {
  agentId: string
  initialMood: number
  sessionId?: string
  opinion?: string
  city?: string
  showMetrics?: boolean
}

export function ResponseCard({ agentId, initialMood, sessionId, opinion, city, showMetrics = true }: ResponseCardProps) {
  const [agentResponse, setAgentResponse] = useState<{ response: string; agentName: string; agentId: string; tone: string; fromCache?: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { getAgentResponse, cacheMetrics, cacheSize, clearCache } = useAgentResponse()
  
  const agent = getAgent(agentId)

  useEffect(() => {
    if (agent && sessionId && opinion) {
      setIsLoading(true)
      getAgentResponse(sessionId, agentId, initialMood, opinion, city, true, true).then((response) => {
        if (response) {
          setAgentResponse(response)
        }
        setIsLoading(false)
      })
    }
  }, [agentId, sessionId, opinion, initialMood, agent, getAgentResponse, city])

  if (!agent) {
    return (
      <div className="p-8 rounded-3xl bg-card border-2 border-dashed border-border text-center">
        <p className="text-muted-foreground">Por favor selecciona un agente primero</p>
      </div>
    )
  }

  const displayResponse = agentResponse?.response || "Esperando tu reflexión..."
  const isCached = agentResponse?.fromCache === true

  return (
    <>
      <div className="space-y-6 animate-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-2">
            <MessageCircleHeart className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Respuesta de {agent.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Una reflexión solo para ti
          </p>
        </div>

        <div className={cn(
          "relative p-6 rounded-3xl border-2 border-border shadow-xl overflow-hidden transition-all duration-500",
          isLoading && "opacity-75 animate-pulse-soft"
        )}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
          
          <div className="relative space-y-5">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg text-white",
                isLoading ? "animate-float" : "",
                "bg-gradient-to-br from-primary to-accent"
              )}>
                {agent.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">{agent.title}</p>
                {isCached && (
                  <p className="text-xs text-green-600 font-semibold">Desde cache ⚡</p>
                )}
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-2xl bg-secondary transition-all duration-500"
            )}>
              <p className="text-foreground leading-relaxed min-h-20">
                {displayResponse}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${isLoading ? 60 : Math.min(100, initialMood + 20)}%` }}
                />
              </div>
              <span className={cn(
                "text-xs font-medium transition-all duration-300",
                isLoading ? "text-muted-foreground animate-pulse" : "text-emerald-500"
              )}>
                {isLoading ? "Procesando..." : "Listo"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showMetrics && (
        <CacheMetricsPanel 
          metrics={cacheMetrics} 
          cacheSize={cacheSize}
          onClear={clearCache}
        />
      )}
    </>
  )
}
