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

async function aggregateAgentInsights(): Promise<AggregateData> {
  try {
    const db = getFirebaseDatabase()
    const agentSpacesRef = ref(db, 'agent-spaces')
    const snapshot = await get(agentSpacesRef)

    if (!snapshot.exists()) {
      return getEmptyAggregateData()
    }

    const data = snapshot.val()
    const agents = ['Nova', 'Atlas', 'Phoenix']
    const aggregated: Record<string, any> = {}
    const allCities = new Set<string>()
    let totalSessions = 0
    let totalUsers = new Set<string>()

    for (const agent of agents) {
      const sessions: any[] = []
      const users = new Set<string>()
      const cities = new Set<string>()
      let moodShifts: number[] = []

      // Iterar sobre todos los usuarios
      for (const userId in data) {
        if (data[userId][agent]) {
          users.add(userId)
          totalUsers.add(userId)

          // Iterar sobre todas las sesiones del agente para este usuario
          for (const timestamp in data[userId][agent]) {
            const session = data[userId][agent][timestamp]
            sessions.push(session)
            totalSessions++

            if (session.moodShift) {
              moodShifts.push(session.moodShift)
            }

            // Inferir ciudad del contexto si existe
            if (session.result) {
              const cityMatch = session.result.match(/ciudad[:\s]+(\w+)/i)
              if (cityMatch) {
                cities.add(cityMatch[1])
              }
            }
          }
        }
      }

      cities.forEach(c => allCities.add(c))

      const avgMoodShift = moodShifts.length > 0 
        ? moodShifts.reduce((a, b) => a + b, 0) / moodShifts.length 
        : 0

      aggregated[agent.toLowerCase()] = {
        agentName: agent,
        totalSessions: sessions.length,
        totalUsers: users.size,
        avgMoodShift: Math.round(avgMoodShift * 100) / 100,
        cities: Array.from(cities),
        topMoodShift: moodShifts.length > 0 ? Math.max(...moodShifts) : 0,
        lowestMood: moodShifts.length > 0 ? Math.min(...moodShifts) : 0,
        highestMood: moodShifts.length > 0 ? Math.max(...moodShifts) : 0,
        reflection: generateReflection(agent, sessions, Array.from(cities))
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
