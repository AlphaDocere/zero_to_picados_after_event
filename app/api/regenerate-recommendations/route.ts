import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'

// Agentes con sus personalidades
const AGENTS = {
  amplifier: {
    name: 'Nova',
    personality: 'Amplificadora de conexiones comunitarias',
    focus: 'Energía, comunidad, voz amplificada'
  },
  documentarian: {
    name: 'Atlas',
    personality: 'Documentadora de narrativas emocionales',
    focus: 'Reflexión, contexto, narrativa personal'
  },
  visionary: {
    name: 'Phoenix',
    personality: 'Visionaria de transformación',
    focus: 'Futuro, potencial, transformación'
  }
}

const CORE_CITIES = ['Mendoza', 'Santiago']
const SECONDARY_CITIES = ['Buenos Aires', 'Bogotá', 'Madrid', 'Barcelona', 'México City', 'São Paulo']

async function generateRecommendationsForAgent(agentId: string, agentConfig: any) {
  try {
    const prompt = `Eres un experto en narrativas emocionales y contexto cultural. 
    
Agente: ${agentConfig.name}
Personalidad: ${agentConfig.personality}
Enfoque: ${agentConfig.focus}

Genera recomendaciones para este agente:

1. **Ciudades**: Incluye SIEMPRE al menos una de [Mendoza, Santiago] (donde ocurre Aiweekend de Vercel), más otras ciudades latinoamericanas variadas. Retorna un array JSON de 5 ciudades diferentes.

2. **Noticias/Eventos**: Tres noticias POSITIVAS relacionadas a eventos tech comunitarios, Zero to Agent, AI innovation, community building en el contexto de Vercel/Aiweekend. Deben ser inspiradores y realistas.

3. **Emociones Recomendadas**: Tres estados emocionales que este agente inspira naturalmente en la comunidad.

Retorna SOLO un JSON válido (sin markdown) con esta estructura exacta:
{
  "cities": ["ciudad1", "ciudad2", "ciudad3", "ciudad4", "ciudad5"],
  "news": [
    { "title": "...", "description": "...", "emoji": "🚀" },
    { "title": "...", "description": "...", "emoji": "💡" },
    { "title": "...", "description": "...", "emoji": "🌟" }
  ],
  "emotions": ["emoción1", "emoción2", "emoción3"]
}`

    const result = await generateText({
      model: 'xai/grok-3',
      prompt,
      temperature: 0.7,
      maxTokens: 1000
    })

    console.log('[v0] Grok response for', agentId, ':', result.text)

    // Parse JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in Grok response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    // Validate structure
    if (!parsed.cities || !parsed.news || !parsed.emotions) {
      throw new Error('Invalid structure in parsed JSON')
    }

    // Ensure Mendoza or Santiago is included
    const hasCoreCity = parsed.cities.some((c: string) => CORE_CITIES.includes(c))
    if (!hasCoreCity) {
      parsed.cities = [CORE_CITIES[0], ...parsed.cities.slice(1)]
    }

    return {
      agentId,
      agentName: agentConfig.name,
      ...parsed,
      generatedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('[v0] Error generating recommendations for', agentId, ':', error)
    // Return fallback
    return {
      agentId,
      agentName: agentConfig.name,
      cities: [CORE_CITIES[0], ...SECONDARY_CITIES.slice(0, 4)],
      news: [
        { title: 'Evento', description: 'Celebrando innovación en IA', emoji: '🚀' },
        { title: 'Comunidad', description: 'Conectando builders latinoamericanos', emoji: '💡' },
        { title: 'Aprendizaje', description: 'Sharing de experiencias Zero to Agent', emoji: '🌟' }
      ],
      emotions: ['Inspiración', 'Conexión', 'Esperanza'],
      generatedAt: new Date().toISOString(),
      fallback: true
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('[v0] Regenerating recommendations...')

    // Generate for all agents
    const recommendations = await Promise.all(
      Object.entries(AGENTS).map(([id, config]) =>
        generateRecommendationsForAgent(id, config)
      )
    )

    // Write to public folder
    const fs = await import('fs').then(m => m.promises)
    const path = await import('path')
    
    const publicPath = path.join(process.cwd(), 'public', 'agent-recommendations.json')
    await fs.writeFile(
      publicPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          agents: recommendations
        },
        null,
        2
      )
    )

    console.log('[v0] Recommendations generated and saved')

    return NextResponse.json({
      success: true,
      count: recommendations.length,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('[v0] Error in regenerate-recommendations:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
