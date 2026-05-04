import { useState, useEffect } from 'react'
import { fetchCheckInsByAgent, calculateAnalytics } from '@/lib/firebase/agent-service'
import { getCache, setCache } from '@/lib/cache-utils'

export interface AgentAnalytics {
  sentimentTrend: number[]
  topThemes: { theme: string; count: number }[]
  engagementByCity: { city: string; count: number }[]
  moodDistribution: { range: string; count: number }[]
  lastUpdated: number
}

export function useAgentAnalytics(agentId: string) {
  const [data, setData] = useState<AgentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchAnalytics = async () => {
      try {
        setLoading(true)

        // Check cache first
        const cacheKey = `agent_analytics_${agentId}`
        const cachedData = getCache<AgentAnalytics>(cacheKey)
        
        if (cachedData && isMounted) {
          console.log('[v0] Using cached analytics for agent:', agentId)
          setData(cachedData)
          setError(null)
          setLoading(false)
          return
        }

        // Fetch from Firebase
        console.log('[v0] Calculating analytics for agent:', agentId)
        const sessions = await fetchCheckInsByAgent(agentId)
        
        if (!isMounted) return

        const baseAnalytics = calculateAnalytics(sessions)
        
        const analytics: AgentAnalytics = {
          ...baseAnalytics,
          lastUpdated: Date.now()
        }

        // Cache the result
        setCache(cacheKey, analytics, 120000) // 120s cache

        setData(analytics)
        setError(null)
      } catch (err) {
        console.error('[v0] Error fetching agent analytics:', err)
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

    fetchAnalytics()

    return () => {
      isMounted = false
    }
  }, [agentId])

  return { data, loading, error }
}
