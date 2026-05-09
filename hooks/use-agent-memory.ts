import { useState, useEffect } from 'react'
import { fetchCheckInsByAgent } from '@/lib/firebase/agent-service'
import { getCache, setCache } from '@/lib/cache-utils'

export interface AgentConversation {
  id: string
  userInput: string
  agentResponse: string
  sentiment: number
  timestamp: number
  city: string
}

export interface AgentMemorySummary {
  totalConversations: number
  averageSentiment: number
  lastActivity: number
  recentConversations: AgentConversation[]
  themes: string[]
}

export function useAgentMemory(agentId: string) {
  const [data, setData] = useState<AgentMemorySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchMemory = async () => {
      try {
        setLoading(true)

        // Check cache first
        const cacheKey = `agent_memory_${agentId}`
        const cachedData = getCache<AgentMemorySummary>(cacheKey)
        
        if (cachedData && isMounted) {
          console.log('[v0] Using cached memory for agent:', agentId)
          setData(cachedData)
          setError(null)
          setLoading(false)
          return
        }

        // Fetch from Firebase
        console.log('[v0] Fetching CheckIn sessions for agent:', agentId)
        const sessions = await fetchCheckInsByAgent(agentId)
        
        if (!isMounted) return

        // Transform sessions to memory summary
        const averageSentiment = sessions.length > 0
          ? Math.round(sessions.reduce((sum, s) => sum + s.finalMood, 0) / sessions.length)
          : 0

        // Extract themes from emotional transform
        const themes = new Set<string>()
        sessions.forEach(s => {
          if (s.emotionalTransform === 'improved') {
            themes.add('Transformación')
            themes.add('Crecimiento')
          } else if (s.emotionalTransform === 'declined') {
            themes.add('Reflexión')
            themes.add('Procesamiento')
          } else {
            themes.add('Equilibrio')
            themes.add('Continuidad')
          }
        })

        const memorySummary: AgentMemorySummary = {
          totalConversations: sessions.length,
          averageSentiment,
          lastActivity: sessions.length > 0 ? sessions[0].createdAt : Date.now(),
          recentConversations: sessions.slice(0, 3).map(s => ({
            id: s.id,
            userInput: s.opinion,
            agentResponse: s.agentResponse,
            sentiment: s.finalMood,
            timestamp: s.createdAt,
            city: s.city
          })),
          themes: Array.from(themes)
        }

        // Cache the result
        setCache(cacheKey, memorySummary, 60000) // 60s cache

        setData(memorySummary)
        setError(null)
      } catch (err) {
        console.error('[v0] Error fetching agent memory:', err)
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setData(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMemory()

    return () => {
      isMounted = false
    }
  }, [agentId])

  return { data, loading, error }
}
