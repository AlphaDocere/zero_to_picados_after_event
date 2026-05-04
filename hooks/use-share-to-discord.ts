import { useState } from 'react'

interface ShareData {
  city: string
  initialMood: number
  finalMood: number
  opinion: string
  followUpResponse: string
  agentName: string
}

interface SupportData extends ShareData {
  supporterName: string
  supportMessage: string
}

export function useShareToDiscord() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const share = async (data: ShareData, supportData?: Omit<SupportData, keyof ShareData>) => {
    setLoading(true)
    setError(null)

    try {
      console.log('[v0] Sharing to Discord:', data.city)
      
      const payload = supportData ? { ...data, ...supportData } : data
      
      const response = await fetch('/api/share-to-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to share to Discord')
      }

      console.log('[v0] Successfully shared to Discord')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('[v0] Share error:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { share, loading, error }
}
