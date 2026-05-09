import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { getAgent } from '@/lib/agents.config'
import { NextRequest, NextResponse } from 'next/server'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export type AgentAction = {
  label: string
  description: string
  type: 'reflect' | 'share' | 'breathe' | 'write' | 'connect'
}

export type AgentGenerativeResponse = {
  insight: string
  emotionalValidation: string
  actions: AgentAction[]
  moodForecast: 'improving' | 'stable' | 'needs-care'
  communityInsight: string
  agentName: string
  agentId: string
  tone: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, agentId, initialMood, opinion, city } = body

    if (!sessionId || !agentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const agent = getAgent(agentId)
    const moodLabel = initialMood < 35 ? 'bajo' : initialMood < 65 ? 'neutral' : 'alto'

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: agent.systemPrompt,
      prompt: `El usuario está en ${city} con estado emocional ${initialMood}/100 (${moodLabel}).
Su reflexión: "${opinion}"

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin texto extra) con esta estructura exacta:
{
  "insight": "reflexión personal de 2-3 oraciones como ${agent.name}",
  "emotionalValidation": "validación breve del estado emocional en 1 oración",
  "actions": [
    {"label": "máx 4 palabras", "description": "1 oración", "type": "reflect"},
    {"label": "máx 4 palabras", "description": "1 oración", "type": "breathe"},
    {"label": "máx 4 palabras", "description": "1 oración", "type": "connect"}
  ],
  "moodForecast": "improving",
  "communityInsight": "frase poderosa de máx 15 palabras para compartir"
}

Tipos válidos para actions: reflect, share, breathe, write, connect
Valores válidos para moodForecast: improving, stable, needs-care
Responde en español.`,
    })

    // Parse JSON — strip markdown fences if model added them
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({
      ...parsed,
      agentName: agent.name,
      agentId: agent.id,
      tone: agent.tone,
    } satisfies AgentGenerativeResponse)
  } catch (error) {
    console.error('[generative-ui] Error:', error)
    return NextResponse.json({ error: 'Error generando respuesta' }, { status: 500 })
  }
}
