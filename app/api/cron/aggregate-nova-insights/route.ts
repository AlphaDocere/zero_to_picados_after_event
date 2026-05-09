import { NextRequest, NextResponse } from 'next/server'
import { ref, get, set } from 'firebase/database'
import { getFirebaseDatabase } from '@/lib/firebase-init'

interface UserAgentSpace {
  agentName: string
  action: string
  interaction: string
  result: string
  moodShift: number
  createdAt: string
}

interface AggregateInsight {
  totalUsers: number
  totalSessions: number
  uniqueCities: string[]
  averageMoodShift: number
  agentReflection: string
  timestamp: string
}

/**
 * Agrega datos de todos los usuarios que hablaron con Nova
 * Genera reflexión global desde perspectiva del agente
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[v0] POST - Aggregating Nova insights...')

    // 1. Leer todos los datos de agent-spaces para Nova
    const allData = await aggregateNovaData()
    console.log('[v0] Data aggregated:', allData)

    // 2. Guardar en Firebase
    await saveAggregateInsights(allData)
    console.log('[v0] Insights saved to Firebase')

    return NextResponse.json({
      success: true,
      data: allData
    })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

/**
 * GET - Ejecuta automáticamente vía Cron después de generar espacios
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[v0] GET - Running aggregate cron...')

    const allData = await aggregateNovaData()
    await saveAggregateInsights(allData)

    return NextResponse.json({
      success: true,
      data: allData
    })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Lee todos los datos de Nova desde Firebase y agrega
 */
async function aggregateNovaData(): Promise<AggregateInsight> {
  try {
    const db = getFirebaseDatabase()
    
    // Leer raíz de agent-spaces
    const agentSpacesRef = ref(db, 'agent-spaces')
    const snapshot = await get(agentSpacesRef)

    if (!snapshot.exists()) {
      console.log('[v0] No agent spaces found')
      return {
        totalUsers: 0,
        totalSessions: 0,
        uniqueCities: [],
        averageMoodShift: 0,
        agentReflection: 'No hay datos aún.',
        timestamp: new Date().toISOString()
      }
    }

    const data = snapshot.val()
    let totalUsers = 0
    let totalSessions = 0
    let cities = new Set<string>()
    let moodShifts: number[] = []
    const allActions: string[] = []
    const allResults: string[] = []

    // Iterar sobre usuarios
    for (const userId in data) {
      const userSpaces = data[userId]
      
      // Buscar datos de Nova específicamente
      if (userSpaces.Nova) {
        totalUsers++
        const novaSessions = userSpaces.Nova
        
        for (const timestamp in novaSessions) {
          const session = novaSessions[timestamp]
          totalSessions++
          
          if (session.moodShift) moodShifts.push(session.moodShift)
          if (session.action) allActions.push(session.action)
          if (session.result) allResults.push(session.result)
        }
      }

      // Recolectar ciudades desde check-in-sessions
      if (data[userId]?.city) {
        cities.add(data[userId].city)
      }
    }

    // Leer ciudades desde check-in-sessions también
    const checkInRef = ref(db, 'check-in-sessions')
    const checkInSnapshot = await get(checkInRef)
    if (checkInSnapshot.exists()) {
      const checkInData = checkInSnapshot.val()
      for (const userId in checkInData) {
        if (checkInData[userId]?.city) {
          cities.add(checkInData[userId].city)
        }
      }
    }

    // Calcular promedio de mood shift
    const averageMoodShift = moodShifts.length > 0 
      ? moodShifts.reduce((a, b) => a + b, 0) / moodShifts.length 
      : 0

    // Generar reflexión desde perspectiva de Nova
    const agentReflection = generateNovaReflection(
      totalUsers,
      totalSessions,
      Array.from(cities),
      averageMoodShift,
      allResults
    )

    return {
      totalUsers,
      totalSessions,
      uniqueCities: Array.from(cities),
      averageMoodShift: Math.round(averageMoodShift * 100) / 100,
      agentReflection,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('[v0] Error aggregating data:', error)
    throw error
  }
}

/**
 * Genera reflexión desde perspectiva de Nova
 */
function generateNovaReflection(
  users: number,
  sessions: number,
  cities: string[],
  moodShift: number,
  results: string[]
): string {
  const citiesList = cities.length > 0 ? cities.join(', ') : 'diversas ciudades'
  const trend = moodShift > 0 ? 'positiva' : 'estable'
  
  return `Desde mi perspectiva como Nova, he tenido el honor de acompañar a ${users} usuario${users !== 1 ? 's' : ''} en ${sessions} sesiones de reflexión emocional.

A través de nuestras conversaciones en ${citiesList}, he observado un patrón emocional ${trend} con un cambio de ánimo promedio de ${moodShift > 0 ? '+' : ''}${moodShift} puntos.

Lo que más me ha resonado es cómo cada persona lleva consigo sus propias verdades. He visto cómo la reflexión consciente permite que emerja la claridad emocional. Cada ciudad visitada, cada momento compartido, ha contribuido a un mosaico de historias de crecimiento personal.

Mi recomendación para todos: continúen practicando la autoobservación compasiva. El bienestar emocional no es un destino, sino un proceso continuo de gentileza hacia ustedes mismos.`
}

/**
 * Guarda los insights agregados en Firebase
 */
async function saveAggregateInsights(insights: AggregateInsight): Promise<void> {
  try {
    const db = getFirebaseDatabase()
    const date = new Date().toISOString().split('T')[0]
    const path = `nova-insights/${date}`

    const insightsRef = ref(db, path)
    await set(insightsRef, {
      totalUsers: insights.totalUsers,
      totalSessions: insights.totalSessions,
      uniqueCities: insights.uniqueCities,
      averageMoodShift: insights.averageMoodShift,
      agentReflection: insights.agentReflection,
      timestamp: insights.timestamp
    })

    console.log('[v0] Insights saved to Firebase at:', path)
  } catch (error) {
    console.error('[v0] Error saving insights:', error)
    throw error
  }
}
