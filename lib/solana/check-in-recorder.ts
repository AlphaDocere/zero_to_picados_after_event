/**
 * Solana Check-In Recorder - MVP Version
 * Almacena firmas reales de Solana
 */

export interface CheckInRecord {
  city: string
  initialMood: number
  finalMood: number
  moodShift: number
  agentUsed: string
  sentiment: string
  timestamp: number
}

export interface CheckInEntry extends CheckInRecord {
  signature: string
  recordedAt: string
}

const STORAGE_KEY = 'reflect_solana_signatures'

/**
 * Guarda una firma real de Solana
 */
export function saveSolanaSignature(
  signature: string,
  checkInData: Omit<CheckInRecord, 'timestamp'>
): CheckInEntry {
  const entry: CheckInEntry = {
    ...checkInData,
    timestamp: Date.now(),
    recordedAt: new Date().toISOString(),
    signature,
  }

  // Guardar en localStorage
  const stored = localStorage.getItem(STORAGE_KEY)
  const entries = stored ? JSON.parse(stored) : []
  entries.push(entry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))

  return entry
}

/**
 * Obtiene el historial de firmas de Solana
 */
export function getCheckInHistory(): CheckInEntry[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

/**
 * Obtiene estadísticas de check-ins
 */
export function getCheckInStats() {
  const entries = getCheckInHistory()

  if (entries.length === 0) {
    return {
      totalCheckIns: 0,
      averageMoodShift: 0,
      bestMoodDay: null,
      favoriteAgent: null,
    }
  }

  const totalMoodShift = entries.reduce((sum, e) => sum + e.moodShift, 0)
  const averageMoodShift = (totalMoodShift / entries.length).toFixed(1)

  const bestMoodDay = entries.reduce((best, current) =>
    current.moodShift > (best?.moodShift || -Infinity) ? current : best
  )

  const agentCounts = entries.reduce(
    (acc, e) => {
      acc[e.agentUsed] = (acc[e.agentUsed] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const favoriteAgent = Object.entries(agentCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0] as 'compassionate' | 'analytical' | 'reflective' | null

  return {
    totalCheckIns: entries.length,
    averageMoodShift,
    bestMoodDay,
    favoriteAgent,
  }
}

/**
 * Genera una firma simulada para MVP
 * Se reemplazará con firma real de Solana después
 */
function generateSignature(): string {
  return 'SOL_' + Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
}

/**
 * Limpia todo el historial (útil para testing)
 */
export function clearCheckInHistory(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}
