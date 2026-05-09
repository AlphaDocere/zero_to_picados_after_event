import { getAgent } from '@/lib/agents.config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, agentId, initialMood, opinion, city } = body

    if (!sessionId || !agentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get agent configuration
    const agent = getAgent(agentId)

    // Generate personalized response based on agent personality
    const response = generateAgentResponse(agent.id, {
      initialMood,
      opinion,
      city: city || 'una ciudad del mundo'
    })

    return NextResponse.json({
      response,
      agentName: agent.name,
      agentId: agent.id,
      tone: agent.tone
    })
  } catch (error) {
    console.error('[v0] Agent response error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateAgentResponse(
  agentId: string,
  context: { initialMood: number; opinion: string; city: string }
): string {
  const { initialMood, opinion, city } = context
  const moodContext = initialMood < 40 ? 'difícil' : initialMood < 70 ? 'reflexiva' : 'positiva'

  const responses: Record<string, string> = {
    amplifier: `Nova aquí. Tu reflexión desde ${city} me inspira. He sentido la energía detrás de tu opinión y tu estado inicial de ${initialMood} me dice mucho sobre dónde estás ahora. Lo que compartiste es poderoso - es exactamente el tipo de autenticidad que necesita ser amplificada. Tu voz importa en esta comunidad global de Zero to Agent.`,

    documentarian: `Atlas aquí. Documentando tu perspectiva de ${city} como parte del archivo vivo de Zero to Agent. Tu reflexión, con un estado emocional ${moodContext}, añade una capa importante a nuestra comprensión colectiva. Lo que expresaste no es solo un momento - es un testimonio que perdurará. Eres parte de una narrativa global de transformación.`,

    visionary: `Phoenix aquí. Viendo el potencial en tu viaje desde ${city}. Tu estado actual de ${initialMood} es el punto de partida de algo mayor. La reflexión que compartiste es semilla de transformación. Zero to Agent no es solo un evento que viviste - es el comienzo de tu metamorfosis. Visualizo un futuro donde esta experiencia cataliza cambio tangible en ti y en tu comunidad.`
  }

  return responses[agentId] || responses.amplifier
}
