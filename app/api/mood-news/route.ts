import { NextRequest, NextResponse } from 'next/server'

// Mood-based reframe templates when AI is not available
const MOOD_REFRAMES: Record<string, (city: string, headline: string) => string> = {
  low: (city, headline) =>
    `Sabemos que hoy puede ser un día difícil, pero ${city} tiene algo especial para ti: "${headline}". A veces, las pequeñas cosas son las que más reconfortan. Tómate un momento para respirar y recordar que estás haciendo lo correcto al explorar cómo te sientes. 💛`,
  medium: (city, headline) =>
    `Desde ${city} llega algo interesante: "${headline}". Este tipo de iniciativas nos recuerdan que siempre hay personas construyendo cosas buenas en el mundo. ¿Cómo conecta esto con lo que sientes hoy? 🌍`,
  high: (city, headline) =>
    `¡Tu energía es contagiosa! Y desde ${city} llegan noticias que vibran en la misma frecuencia: "${headline}". ¡El mundo está lleno de razones para celebrar, y tú eres parte de esa energía! 🎉`,
  transcendent: (city, headline) =>
    `Estás en un estado extraordinario. Desde ${city}: "${headline}". Cuando alcanzamos este nivel de conexión, todo se vuelve posible. Tu estado actual puede inspirar a otros — ¿cómo quieres canalizar esta energía? ✨`,
}

function getMoodCategory(mood: number): string {
  if (mood < 40) return 'low'
  if (mood < 70) return 'medium'
  if (mood < 100) return 'high'
  return 'transcendent'
}

function getMoodContext(mood: number): { label: string; emoji: string; color: string } {
  if (mood < 20) return { label: 'Necesitas apoyo', emoji: '🫂', color: 'rose' }
  if (mood < 40) return { label: 'Momento de calma', emoji: '🌿', color: 'amber' }
  if (mood < 60) return { label: 'En equilibrio', emoji: '⚖️', color: 'sky' }
  if (mood < 80) return { label: 'Buena energía', emoji: '😊', color: 'emerald' }
  if (mood < 100) return { label: 'Radiante', emoji: '🌟', color: 'violet' }
  return { label: 'Trascendente', emoji: '✨', color: 'fuchsia' }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mood, city, headline, summary } = body

    if (typeof mood !== 'number' || !city) {
      return NextResponse.json(
        { error: 'Missing required fields: mood (number) and city (string)' },
        { status: 400 }
      )
    }

    const moodCategory = getMoodCategory(mood)
    const moodContext = getMoodContext(mood)

    // Generate reframe based on mood
    const reframeFn = MOOD_REFRAMES[moodCategory]
    const reframe = reframeFn(city, headline || 'esta iniciativa')

    // Try AI-powered reframe if Groq is configured
    let aiReframe: string | null = null
    try {
      const groqKey = process.env.GROQ_API_KEY
      if (groqKey) {
        const { generateText } = await import('ai')
        
        const result = await generateText({
          model: 'xai/grok-3' as any,
          prompt: `Eres un asistente empático de bienestar emocional en la app "Reflect". 
          
El usuario tiene un estado de ánimo de ${mood}/200 (${moodContext.label}).
Está en ${city} y acaba de leer esta noticia: "${headline}: ${summary}".

Genera un "reframe" (reencuadre) en español de 2-3 oraciones que:
- Si mood < 40: sea reconfortante, validante, y muestre cómo la noticia puede dar esperanza
- Si mood 40-70: sea reflexivo, invitando a conectar la noticia con sus propios pensamientos
- Si mood > 70: sea celebratorio, amplificando la energía positiva con la noticia
- Si mood > 100: sea trascendente, invitando a canalizar esa energía extraordinaria

Responde SOLO con el texto del reframe, sin markdown ni formatting.`,
          temperature: 0.8,
          maxOutputTokens: 200,
        })

        aiReframe = result.text?.trim() || null
      }
    } catch (aiError) {
      console.log('[mood-news] AI reframe failed, using template:', aiError)
    }

    return NextResponse.json({
      success: true,
      reframe: aiReframe || reframe,
      isAiGenerated: !!aiReframe,
      moodCategory,
      moodContext,
    })
  } catch (error) {
    console.error('[mood-news] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
