import { NextRequest, NextResponse } from 'next/server'
import { ref, get, set } from 'firebase/database'
import { getFirebaseDatabase } from '@/lib/firebase-init'
import { Daytona } from '@daytonaio/sdk'

interface AgentContext {
  userId: string
  lastMood: number
  moodTrend: string
  city: string
  sentiment: string
}

/**
 * POST - Ejecuta generación de ambiente de agente
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

    // 2. Crear sandbox con Daytona SDK
    const sandbox = await createDaytonaSandbox(userId, agentName)
    console.log('[v0] Sandbox creado:', sandbox.id)

    // 3. Ejecutar agente
    const result = await executeAgentInSandbox(sandbox, agentName, context)
    console.log('[v0] Resultado:', result)

    // 4. Guardar en Firebase
    await saveToFirebase(userId, agentName, result, sandbox.id)
    console.log('[v0] Guardado en Firebase')

    // 5. Destruir sandbox
    await sandbox.destroy()
    console.log('[v0] Sandbox destruido')

    return NextResponse.json({
      success: true,
      data: result
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

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] GET - Cron automático ejecutándose')

    // Por ahora, ejecutamos para usuarios de prueba
    const testUsers = ['test-user-001']
    const agents = ['Nova']

    const results = []

    for (const userId of testUsers) {
      for (const agent of agents) {
        try {
          const context = await getEmotionalContext(userId)
          const sandbox = await createDaytonaSandbox(userId, agent)
          const result = await executeAgentInSandbox(sandbox, agent, context)
          await saveToFirebase(userId, agent, result, sandbox.id)
          await sandbox.destroy()
          
          results.push({ userId, agent, status: 'success' })
        } catch (err) {
          console.error(`[v0] Error ${userId}-${agent}:`, err)
          results.push({ userId, agent, status: 'error' })
        }
      }
    }

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('[v0] Error Cron:', error)
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
    console.error('[v0] Error contexto:', error)
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
 * Crea un sandbox en Daytona usando el SDK
 */
async function createDaytonaSandbox(userId: string, agentName: string) {
  try {
    const daytona = new Daytona({
      apiKey: process.env.DAYTONA_API_KEY
    })

    console.log('[v0] Creando sandbox...')
    
    const sandbox = await daytona.sandboxes.create({
      alias: `reflect-${userId}-${agentName}-${Date.now()}`
    })

    console.log('[v0] Sandbox creado:', sandbox.id)
    return sandbox
  } catch (error) {
    console.error('[v0] Error creando sandbox:', error)
    throw error
  }
}

/**
 * Ejecuta el agente en el sandbox
 */
async function executeAgentInSandbox(
  sandbox: any,
  agentName: string,
  context: AgentContext
) {
  try {
    const prompt = `Eres ${agentName}, un agente emocional.
    
Contexto del usuario (${context.userId}):
- Ánimo: ${context.lastMood}/100
- Tendencia: ${context.moodTrend}  
- Ciudad: ${context.city}
- Sentimiento: ${context.sentiment}

Genera una reflexión breve en JSON:
{
  "action": "qué harías como agente",
  "interaction": "cómo interactuarías",
  "result": "recomendación final"
}`

    console.log('[v0] Ejecutando comando en sandbox...')
    
    const execution = await sandbox.executeCommand(
      `echo '${prompt}' | node -e "const fs = require('fs'); const input = require('fs').readFileSync(0, 'utf-8'); console.log(input)"`
    )

    console.log('[v0] Ejecución completada')

    // Parsear resultado
    let parsed = {
      action: `Análisis de ${agentName}`,
      interaction: 'Reflexión personalizada',
      result: 'Recomendación: mantener el bienestar emocional'
    }

    try {
      const match = execution.stdout.match(/\{[\s\S]*\}/)
      if (match) {
        parsed = JSON.parse(match[0])
      }
    } catch (e) {
      console.warn('[v0] No se pudo parsear JSON')
    }

    return {
      agentName,
      ...parsed,
      moodShift: context.lastMood - 50,
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('[v0] Error ejecutando agente:', error)
    throw error
  }
}

/**
 * Guarda resultado en Firebase
 */
async function saveToFirebase(
  userId: string,
  agentName: string,
  result: any,
  sandboxId: string
) {
  try {
    const db = getFirebaseDatabase()
    const date = new Date().toISOString().split('T')[0]
    const path = `agent-spaces/${userId}/${agentName}/${date}`

    const spaceRef = ref(db, path)
    await set(spaceRef, {
      id: sandboxId,
      agentName,
      action: result.action,
      interaction: result.interaction,
      result: result.result,
      moodShift: result.moodShift,
      timestamp: result.timestamp,
      createdAt: result.createdAt
    })

    console.log('[v0] Guardado en:', path)
  } catch (error) {
    console.error('[v0] Error guardando:', error)
    throw error
  }
}
