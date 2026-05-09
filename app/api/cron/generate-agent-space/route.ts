import { NextRequest, NextResponse } from 'next/server'
import { ref, get, set } from 'firebase/database'
import { getFirebaseDatabase } from '@/lib/firebase-init'

interface AgentContext {
  userId: string
  lastMood: number
  moodTrend: string
  city: string
  sentiment: string
}

interface AgentSpace {
  agentName: string
  action: string
  interaction: string
  result: string
  moodShift: number
  timestamp: number
  createdAt: string
}

/**
 * POST - Ejecuta generación de ambiente de agente (MANUAL TESTING)
 * GET - Se ejecuta automáticamente vía Vercel Cron (1x diario)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = 'test-user-001', agentName = 'Nova' } = body

    console.log('[v0] POST - Generando espacio para:', userId, agentName)

    // 1. Obtener contexto emocional
    const context = await getEmotionalContext(userId)
    console.log('[v0] Contexto:', context)

    // 2. Generar respuesta del agente (MOCKEADO - sin Daytona por ahora)
    const result = generateAgentResponse(agentName, context)
    console.log('[v0] Resultado del agente:', result)

    // 3. Guardar en Firebase
    await saveToFirebase(userId, agentName, result)
    console.log('[v0] Guardado en Firebase')

    return NextResponse.json({
      success: true,
      message: 'Espacio de agente generado exitosamente',
      data: result
    })
  } catch (error) {
    console.error('[v0] Error en POST:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] GET - Cron automático ejecutándose')

    // Ejecutar para usuarios de prueba
    const testUsers = ['test-user-001', 'test-user-002']
    const agents = ['Nova', 'Atlas', 'Phoenix']

    const results = []

    for (const userId of testUsers) {
      for (const agent of agents) {
        try {
          const context = await getEmotionalContext(userId)
          const result = generateAgentResponse(agent, context)
          await saveToFirebase(userId, agent, result)
          
          results.push({ userId, agent, status: 'success' })
        } catch (err) {
          console.error(`[v0] Error ${userId}-${agent}:`, err)
          results.push({ userId, agent, status: 'error' })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cron ejecutado',
      results
    })
  } catch (error) {
    console.error('[v0] Error en GET:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Lee contexto emocional del usuario desde Firebase
 */
async function getEmotionalContext(userId: string): Promise<AgentContext> {
  try {
    const db = getFirebaseDatabase()
    const userRef = ref(db, `check-in-sessions/${userId}`)
    const snapshot = await get(userRef)

    const data = snapshot.val() || {}

    return {
      userId,
      lastMood: data.finalMood || 50,
      moodTrend: data.moodShift > 0 ? 'mejorando' : 'estable',
      city: data.city || 'desconocida',
      sentiment: data.sentiment || 'neutral'
    }
  } catch (error) {
    console.error('[v0] Error leyendo contexto:', error)
    return {
      userId,
      lastMood: 50,
      moodTrend: 'estable',
      city: 'test',
      sentiment: 'neutral'
    }
  }
}

/**
 * Genera respuesta del agente basada en contexto (MOCKEADO)
 */
function generateAgentResponse(agentName: string, context: AgentContext): AgentSpace {
  // Respuestas personalizadas por agente
  const responses: Record<string, any> = {
    Nova: {
      action: 'Análisis empático del estado emocional',
      interaction: `Reflexión comprensiva sobre tu ánimo en ${context.city}`,
      result: `Tu ánimo es ${context.lastMood}/100 y está ${context.moodTrend}. Te recomiendo mantener la práctica de autocompasión.`
    },
    Atlas: {
      action: 'Análisis de datos emocionales',
      interaction: `Evaluación lógica del patrón: "${context.sentiment}"`,
      result: `Basado en datos: ánimo ${context.lastMood}/100, tendencia ${context.moodTrend}. Estrategia: estructurar rutina diaria.`
    },
    Phoenix: {
      action: 'Reflexión profunda y transformadora',
      interaction: `Meditación sobre tu viaje en ${context.city}`,
      result: `Este momento de ${context.sentiment} es una oportunidad de crecimiento. Observa sin juzgar, ánimo: ${context.lastMood}/100.`
    }
  }

  const agentResponse = responses[agentName] || responses.Nova

  return {
    agentName,
    action: agentResponse.action,
    interaction: agentResponse.interaction,
    result: agentResponse.result,
    moodShift: context.lastMood - 50,
    timestamp: Date.now(),
    createdAt: new Date().toISOString()
  }
}

/**
 * Guarda resultado en Firebase
 */
async function saveToFirebase(
  userId: string,
  agentName: string,
  result: AgentSpace
): Promise<void> {
  try {
    const db = getFirebaseDatabase()
    const date = new Date().toISOString().split('T')[0]
    const path = `agent-spaces/${userId}/${agentName}/${date}`

    const spaceRef = ref(db, path)
    await set(spaceRef, result)

    console.log('[v0] Guardado en:', path)
  } catch (error) {
    console.error('[v0] Error guardando:', error)
    throw error
  }
}
