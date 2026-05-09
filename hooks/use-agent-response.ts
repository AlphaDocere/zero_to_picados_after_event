import { useCallback, useState } from 'react'

export interface AgentAction {
  label: string
  description: string
  type: 'reflect' | 'share' | 'breathe' | 'write' | 'connect'
}

export interface AgentGenerativeData {
  insight: string
  emotionalValidation: string
  actions: AgentAction[]
  moodForecast: 'improving' | 'stable' | 'needs-care'
  communityInsight: string
  agentName: string
  agentId: string
  tone: string
}

export function useAgentResponse() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAgentResponse = useCallback(async (
    sessionId: string,
    agentId: string,
    initialMood: number,
    opinion: string,
    city?: string,
  ): Promise<AgentGenerativeData | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/agent-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, agentId, initialMood, opinion, city }),
      })

      if (!response.ok) throw new Error('Failed to get agent response')

      const data: AgentGenerativeData = await response.json()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { getAgentResponse, loading, error }
}
