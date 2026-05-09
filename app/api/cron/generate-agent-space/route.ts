import { NextRequest, NextResponse } from 'next/server'
import { ref, get, set } from 'firebase/database'
import { getFirebaseDatabase } from '@/lib/firebase-init'

interface AgentContext {
  userId: string
  lastCheckIn: any
  moodAverage7days: number
  checkInsCount: number
  topAgent: string
  emotionalTrend: string
  recentCities: string[]
}

interface DaytonaEnvironment {
  id: string
  status: string
}

/**
 * Genera un ambiente virtual en Daytona y ejecuta agente
 * Se ejecuta vía Cron (1x al día) o manual para testing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, agentName = 'Nova', manual = false } = body

    console.log('[v0] Generando environment para usuario:', userId, 'Agente:', agentName)

    // 1. Leer contexto emocional del usuario desde Firebase
    const context = await getEmotionalContext(userId)
    console.log('[v0] Contexto emocional:', context)

    // 2. Crear ambiente en Daytona
    const environment = await createDaytonaEnvironment(userId, agentName, context)
    console.log('[v0] Ambiente creado en Daytona:', environment.id)

    // 3. Ejecutar agente en el ambiente
    const result = await executeAgentInEnvironment(environment.id, agentName, context)
    console.log('[v0] Resultado del agente:', result)

    // 4. Guardar resultado en Firebase
    await saveAgentSpaceResult(userId, agentName, result, environment.id)
    console.log('[v0] Resultado guardado en Firebase')

    // 5. Destruir ambiente
    await destroyDaytonaEnvironment(environment.id)
    console.log('[v0] Ambiente destruido')

    return NextResponse.json({
      success: true,
      message: 'Ambiente generado y ejecutado exitosamente',
      data: {
        environmentId: environment.id,
        agentResult: result,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[v0] Error en cron:', error)
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
 * Lee contexto emocional del usuario
 */
async function getEmotionalContext(userId: string): Promise<AgentContext> {
  try {
    const db = getFirebaseDatabase()
    const userRef = ref(db, `users/${userId}`)
    const snapshot = await get(userRef)

    if (!snapshot.exists()) {
      return {
        userId,
        lastCheckIn: null,
        moodAverage7days: 50,
        checkInsCount: 0,
        topAgent: 'Nova',
        emotionalTrend: 'stable',
        recentCities: []
      }
    }

    const userData = snapshot.val()
    return {
      userId,
      lastCheckIn: userData.lastCheckIn || null,
      moodAverage7days: userData.moodAverage7days || 50,
      checkInsCount: userData.checkInsCount || 0,
      topAgent: userData.topAgent || 'Nova',
      emotionalTrend: userData.emotionalTrend || 'stable',
      recentCities: userData.recentCities || []
    }
  } catch (error) {
    console.error('[v0] Error leyendo contexto:', error)
    throw error
  }
}

/**
 * Crea un ambiente virtual en Daytona
 */
async function createDaytonaEnvironment(
  userId: string,
  agentName: string,
  context: AgentContext
): Promise<DaytonaEnvironment> {
  try {
    const response = await fetch(`${process.env.DAYTONA_API_URL}/sandboxes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DAYTONA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        alias: `reflect-${userId}-${agentName}-${Date.now()}`,
        metadata: {
          userId,
          agentName,
          emotionalContext: context,
          createdAt: new Date().toISOString()
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Daytona API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      id: data.id || data.sandbox_id,
      status: 'created'
    }
  } catch (error) {
    console.error('[v0] Error creando ambiente Daytona:', error)
    throw error
  }
}

/**
 * Ejecuta el agente en el ambiente
 */
async function executeAgentInEnvironment(
  environmentId: string,
  agentName: string,
  context: AgentContext
): Promise<any> {
  try {
    // Simulación: En producción, aquí iría la lógica real del agente
    // Por ahora, generamos un resultado de ejemplo
    const action = `Análisis profundo del estado emocional de ${context.emotionalTrend}`
    const interaction = `Reflexión basada en ${context.checkInsCount} check-ins recientes`
    const result = `Basado en los datos, el usuario mostró tendencia ${context.emotionalTrend} con promedio de ánimo ${context.moodAverage7days}/100. Ciudades evaluadas: ${context.recentCities.join(', ')}.`

    return {
      agentName,
      action,
      interaction,
      result,
      environmentId,
      executedAt: new Date().toISOString(),
      moodShift: context.lastCheckIn?.finalMood - context.lastCheckIn?.initialMood || 0
    }
  } catch (error) {
    console.error('[v0] Error ejecutando agente:', error)
    throw error
  }
}

/**
 * Guarda resultado en Firebase
 */
async function saveAgentSpaceResult(
  userId: string,
  agentName: string,
  result: any,
  environmentId: string
): Promise<void> {
  try {
    const db = getFirebaseDatabase()
    const timestamp = new Date().toISOString().split('T')[0] // Formato: 2024-05-09
    const spacePath = `agent-spaces/${userId}/${agentName}/${timestamp}`

    const spaceRef = ref(db, spacePath)
    await set(spaceRef, {
      id: `${userId}-${agentName}-${Date.now()}`,
      agentName,
      timestamp: Date.now(),
      action: result.action,
      interaction: result.interaction,
      result: result.result,
      daytoneEnvironmentId: environmentId,
      moodShift: result.moodShift,
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('[v0] Error guardando en Firebase:', error)
    throw error
  }
}

/**
 * Destruye el ambiente en Daytona
 */
async function destroyDaytonaEnvironment(environmentId: string): Promise<void> {
  try {
    const response = await fetch(`${process.env.DAYTONA_API_URL}/sandboxes/${environmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.DAYTONA_API_KEY}`
      }
    })

    if (!response.ok) {
      console.warn(`[v0] Error destruyendo ambiente: ${response.statusText}`)
    }
  } catch (error) {
    console.error('[v0] Error destruyendo ambiente:', error)
    // No throw, solo log
  }
}

/**
 * GET para ejecutar manualmente
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const agentName = searchParams.get('agent') || 'Nova'

  if (!userId) {
    return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
  }

  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ userId, agentName, manual: true })
    })
  )
}
