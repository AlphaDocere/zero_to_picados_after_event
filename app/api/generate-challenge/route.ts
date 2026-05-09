import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { NextRequest, NextResponse } from "next/server"

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { initialMood } = await req.json()

    if (initialMood === undefined) {
      return NextResponse.json({ error: "Missing initialMood" }, { status: 400 })
    }

    const moodLabel =
      initialMood < 30 ? "muy bajo" :
      initialMood < 50 ? "bajo" :
      initialMood < 70 ? "moderado" : "alto"

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `Eres el narrador de un juego arcade de bienestar emocional para personas que trabajan en tecnología y sienten ansiedad por el avance acelerado de la IA.

El jugador tiene un estado emocional de ${initialMood}/100 (${moodLabel}).

Escribe UNA misión de juego (máximo 2 oraciones cortas) que:
- Invite directamente a recolectar hábitos emocionales en el juego para calmar la ansiedad por la IA
- Suene como una misión de videojuego, no como consejo de coach
- Termine con UNA pregunta simple: qué hábito siente que más le falta ahora

Ejemplo del tono: "Recorre el mapa y recoge los hábitos que te anclan cuando la IA te abruma. ¿Cuál es el que más te cuesta mantener hoy?"

Responde SOLO con el texto en español, máximo 2 oraciones. Sin títulos, sin markdown.`,
    })

    return NextResponse.json({ challenge: text.trim() })
  } catch (error) {
    console.error("[game] generate-challenge error:", error)
    return NextResponse.json({ error: "Error generating challenge" }, { status: 500 })
  }
}
