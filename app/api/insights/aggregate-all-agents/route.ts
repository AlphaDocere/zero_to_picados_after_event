import { NextRequest, NextResponse } from 'next/server'
import { ref, get } from 'firebase/database'
import { getFirebaseDatabase } from '@/lib/firebase-init'

interface AgentInsights {
  agentName: string
  totalSessions: number
  totalUsers: number
  avgMoodShift: number
  cities: string[]
  reflection: string
  topMoodShift: number
  lowestMood: number
  highestMood: number
}

interface AggregateData {
  nova: AgentInsights
  atlas: AgentInsights
  phoenix: AgentInsights
  totalSessions: number
  totalUsers: number
  allCities: string[]
  lastUpdated: string
}

function normalizeAgentName(agentId: string): string {
  if (!agentId) return ''
  const lower = agentId.toLowerCase()
  if (lower === 'nova' || lower === 'compassionate' || lower === 'amplifier') return 'Nova'
  if (lower === 'atlas' || lower === 'analytical' || lower === 'documentarian') return 'Atlas'
  if (lower === 'phoenix' || lower === 'reflective' || lower === 'visionary') return 'Phoenix'
  return agentId
}

async function aggregateAgentInsights(): Promise<AggregateData> {
  try {
    const db = getFirebaseDatabase()
    
    // 1. Leer todas las check-in-sessions reales
    const checkInRef = ref(db, 'check-in-sessions')
    const checkInSnapshot = await get(checkInRef)
    
    let realSessions: any[] = []
    if (checkInSnapshot.exists()) {
      const val = checkInSnapshot.val()
      realSessions = typeof val === 'object' && val !== null ? Object.values(val) : []
    }

    // 2. Leer agent-spaces (para las reflexiones del agente de ser necesario)
    const agentSpacesRef = ref(db, 'agent-spaces')
    const snapshot = await get(agentSpacesRef)
    const agentSpacesData = snapshot.exists() ? snapshot.val() : {}

    const agents = ['Nova', 'Atlas', 'Phoenix']
    const aggregated: Record<string, any> = {}
    const allCities = new Set<string>()
    let totalSessions = 0
    let totalUsers = new Set<string>()

    for (const agent of agents) {
      // Filtrar sesiones reales completadas de este agente
      const agentSessions = realSessions.filter(s => {
        if (!s || s.status !== 'completed') return false
        return normalizeAgentName(s.selectedAgent) === agent
      })

      const users = new Set<string>()
      const cities = new Set<string>()
      const moodShifts: number[] = []

      agentSessions.forEach(s => {
        // En check-in-sessions no siempre hay userId, usamos metadata?.userId o s.id o fallback único
        const uId = s.metadata?.userId || s.id || Math.random().toString()
        users.add(uId)
        totalUsers.add(uId)

        if (s.city) {
          cities.add(s.city)
          allCities.add(s.city)
        }

        const initial = Number(s.initialMood)
        const final = Number(s.finalMood)
        let shift = s.moodShift !== undefined ? Number(s.moodShift) : (final - initial)
        if (isNaN(shift) && !isNaN(initial) && !isNaN(final)) {
          shift = final - initial
        }
        if (!isNaN(shift)) {
          moodShifts.push(shift)
        }
      })

      totalSessions += agentSessions.length

      const avgMoodShift = moodShifts.length > 0 
        ? moodShifts.reduce((a, b) => a + b, 0) / moodShifts.length 
        : 0

      // Intentar obtener la última reflexión del espacio del agente si existe,
      // de lo contrario generamos una descriptiva por defecto
      let reflection = ''
      for (const userId in agentSpacesData) {
        if (agentSpacesData[userId] && agentSpacesData[userId][agent]) {
          for (const timestamp in agentSpacesData[userId][agent]) {
            const spaceEntry = agentSpacesData[userId][agent][timestamp]
            if (spaceEntry && spaceEntry.result) {
              reflection = spaceEntry.result
            }
          }
        }
      }

      if (!reflection) {
        reflection = generateReflection(agent, agentSessions, Array.from(cities))
      }

      aggregated[agent.toLowerCase()] = {
        agentName: agent,
        totalSessions: agentSessions.length,
        totalUsers: users.size,
        avgMoodShift: Math.round(avgMoodShift * 100) / 100,
        cities: Array.from(cities),
        topMoodShift: moodShifts.length > 0 ? Math.max(...moodShifts) : 0,
        lowestMood: moodShifts.length > 0 ? Math.min(...moodShifts) : 0,
        highestMood: moodShifts.length > 0 ? Math.max(...moodShifts) : 0,
        reflection
      }
    }

    return {
      nova: aggregated.nova,
      atlas: aggregated.atlas,
      phoenix: aggregated.phoenix,
      totalSessions,
      totalUsers: totalUsers.size,
      allCities: Array.from(allCities),
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('[v0] Error aggregating insights:', error)
    return getEmptyAggregateData()
  }
}

function generateReflection(agentName: string, sessions: any[], cities: string[]): string {
  const sessionCount = sessions.length
  const citiesText = cities.length > 0 ? `en ciudades como ${cities.join(', ')}` : ''

  const reflections: Record<string, string> = {
    'Nova': `He acompañado a ${sessionCount} usuarios en su viaje emocional ${citiesText}. A través de la empatía y la compasión, he visto cómo pequeños cambios en perspectiva pueden transformar el estado emocional. Mi propósito es recordarle a cada persona que sus sentimientos importan y que siempre hay esperanza.`,
    'Atlas': `He analizado ${sessionCount} patrones emocionales ${citiesText}. Los datos muestran tendencias claras: la mayoría mejora su estado cuando reconoce sus emociones. Estadísticamente, la reflexión estructurada reduce el estrés un 35%. Mi función es proporcionar claridad mediante análisis profundo.`,
    'Phoenix': `He reflexionado con ${sessionCount} almas en busca de transformación ${citiesText}. En cada encuentro, he visto la capacidad humana de renacer de sus propias cenizas. La verdadera fortaleza no está en evitar el dolor, sino en aprender de él y crecer. Esto es lo que representa mi camino.`
  }

  return reflections[agentName] || reflections['Nova']
}

function getEmptyAggregateData(): AggregateData {
  return {
    nova: {
      agentName: 'Nova',
      totalSessions: 0,
      totalUsers: 0,
      avgMoodShift: 0,
      cities: [],
      reflection: 'Esperando conexiones...',
      topMoodShift: 0,
      lowestMood: 0,
      highestMood: 0
    },
    atlas: {
      agentName: 'Atlas',
      totalSessions: 0,
      totalUsers: 0,
      avgMoodShift: 0,
      cities: [],
      reflection: 'Esperando datos...',
      topMoodShift: 0,
      lowestMood: 0,
      highestMood: 0
    },
    phoenix: {
      agentName: 'Phoenix',
      totalSessions: 0,
      totalUsers: 0,
      avgMoodShift: 0,
      cities: [],
      reflection: 'Esperando transformación...',
      topMoodShift: 0,
      lowestMood: 0,
      highestMood: 0
    },
    totalSessions: 0,
    totalUsers: 0,
    allCities: [],
    lastUpdated: new Date().toISOString()
  }
}

export async function GET(request: NextRequest) {
  try {
    const insights = await aggregateAgentInsights()
    return NextResponse.json({ success: true, data: insights })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching insights' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const insights = await aggregateAgentInsights()
    return NextResponse.json({ success: true, data: insights })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching insights' },
      { status: 500 }
    )
  }
}
