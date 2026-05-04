import { useCallback, useState, useRef } from 'react'

interface AgentResponseData {
  response: string
  agentName: string
  agentId: string
  tone: string
  fromCache?: boolean
  cacheKey?: string
}

interface CacheEntry {
  data: AgentResponseData
  timestamp: number
  hitCount: number
}

interface CacheMetrics {
  hits: number
  misses: number
  totalRequests: number
  hitRate: number
  avgLatency: number
}

// Global cache with TTL of 24 hours
const responseCache = new Map<string, CacheEntry>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
const SIMILARITY_THRESHOLD = 0.75

// Simple semantic similarity (word overlap)
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3))
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3))
  
  const intersection = new Set([...words1].filter(w => words2.has(w)))
  const union = new Set([...words1, ...words2])
  
  return intersection.size / (union.size || 1)
}

// Find cached response with semantic similarity
function findCachedResponse(agentId: string, opinion: string, mood: number): CacheEntry | null {
  let bestMatch: CacheEntry | null = null
  let bestSimilarity = SIMILARITY_THRESHOLD
  
  for (const [key, entry] of responseCache.entries()) {
    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      responseCache.delete(key)
      continue
    }
    
    // Parse key: agentId_moodBucket_hash
    const [cachedAgentId] = key.split('_')
    if (cachedAgentId !== agentId) continue
    
    // Check mood similarity (within +/- 10 points)
    const [, moodBucket] = key.split('_')
    const cachedMood = parseInt(moodBucket)
    if (Math.abs(cachedMood - mood) > 10) continue
    
    // Check opinion similarity
    const similarity = calculateSimilarity(opinion, entry.data.response)
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity
      bestMatch = entry
    }
  }
  
  return bestMatch
}

// Generate cache key
function generateCacheKey(agentId: string, mood: number): string {
  const moodBucket = Math.round(mood / 10) * 10 // Bucket by 10s
  return `${agentId}_${moodBucket}`
}

export function useAgentResponse() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const metricsRef = useRef<CacheMetrics>({
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    avgLatency: 0,
  })

  const getAgentResponse = useCallback(async (
    sessionId: string,
    agentId: string,
    initialMood: number,
    opinion: string,
    city?: string,
    saveToMemory?: boolean,
    useCache: boolean = true
  ): Promise<AgentResponseData | null> => {
    setLoading(true)
    setError(null)
    const startTime = Date.now()
    const metrics = metricsRef.current

    try {
      metrics.totalRequests++

      // Try to find cached response
      if (useCache) {
        const cachedEntry = findCachedResponse(agentId, opinion, initialMood)
        if (cachedEntry) {
          metrics.hits++
          metrics.hitRate = (metrics.hits / metrics.totalRequests) * 100
          const latency = Date.now() - startTime
          metrics.avgLatency = (metrics.avgLatency * (metrics.totalRequests - 1) + latency) / metrics.totalRequests
          
          console.log('[v0] Cache HIT: agentId=%s, similarity=%.2f, latency=%dms', 
            agentId, calculateSimilarity(opinion, cachedEntry.data.response), latency)
          
          cachedEntry.hitCount++
          return {
            ...cachedEntry.data,
            fromCache: true,
          }
        }
      }

      metrics.misses++
      metrics.hitRate = (metrics.hits / metrics.totalRequests) * 100

      // Fetch new response
      const response = await fetch('/api/agent-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          agentId,
          initialMood,
          opinion,
          city,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get agent response')
      }

      const data: AgentResponseData = await response.json()
      
      const latency = Date.now() - startTime
      metrics.avgLatency = (metrics.avgLatency * (metrics.totalRequests - 1) + latency) / metrics.totalRequests

      // Cache the response
      const cacheKey = generateCacheKey(agentId, initialMood)
      responseCache.set(cacheKey, {
        data: { ...data, fromCache: false },
        timestamp: Date.now(),
        hitCount: 0,
      })

      console.log('[v0] Cache MISS and stored: agentId=%s, key=%s, latency=%dms', 
        agentId, cacheKey, latency)

      // Save to agent memory if requested
      if (saveToMemory && data.response) {
        await fetch('/api/agent-memory/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            agentId,
            responseText: data.response,
            outputType: 'preview',
          }),
        }).catch((err) => {
          console.error('[v0] Failed to save agent memory:', err)
        })
      }

      return { ...data, fromCache: false }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('[v0] Agent response error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { 
    getAgentResponse, 
    loading, 
    error,
    cacheMetrics: metricsRef.current,
    cacheSize: responseCache.size,
    clearCache: () => responseCache.clear()
  }
}

