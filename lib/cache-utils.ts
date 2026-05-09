/**
 * Simple localStorage cache with TTL
 * Used to avoid repeated Firebase reads
 */

const CACHE_PREFIX = 'v0_cache_'
const DEFAULT_TTL = 60000 // 60 seconds

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  try {
    const cacheKey = CACHE_PREFIX + key
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    }
    localStorage.setItem(cacheKey, JSON.stringify(entry))
  } catch (error) {
    console.warn('[v0] Cache write failed:', error)
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const cacheKey = CACHE_PREFIX + key
    const stored = localStorage.getItem(cacheKey)
    
    if (!stored) return null
    
    const entry: CacheEntry<T> = JSON.parse(stored)
    const isExpired = Date.now() - entry.timestamp > entry.ttl
    
    if (isExpired) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    return entry.data
  } catch (error) {
    console.warn('[v0] Cache read failed:', error)
    return null
  }
}

export function clearCache(key: string): void {
  try {
    const cacheKey = CACHE_PREFIX + key
    localStorage.removeItem(cacheKey)
  } catch (error) {
    console.warn('[v0] Cache clear failed:', error)
  }
}
