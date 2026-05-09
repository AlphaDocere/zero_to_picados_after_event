import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { NextRequest, NextResponse } from "next/server"

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { habits, score, won } = await req.json()

    const habitsList = habits.length > 0
      ? [...new Set(habits as string[])].join(", ")
      : "el esfuerzo de intentarlo"

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `Eres un coach emocional cálido y energético para un juego de bienestar.

El jugador acaba de completar una misión de check-in emocional. Sus resultados:
- Hábitos que recolectó en el juego: ${habitsList}
- Puntaje: ${score} puntos
- ¿Llegó a la meta?: ${won ? "Sí, completó el nivel" : "No llegó a la meta, pero lo intentó"}

Genera UNA frase motivacional (máximo 2 oraciones cortas) que:
- Mencione 1 o 2 de los hábitos que recolectó de forma natural
- Sea cálida, directa y personal (tutéalo)
- Conecte el hábito con cómo puede sentirse mejor
- Si no llegó a la meta, igual sea muy alentadora

Responde SOLO con la frase en español. Sin comillas, sin títulos, sin explicaciones.`,
    })

    return NextResponse.json({ message: text.trim() })
  } catch (error) {
    console.error("[game] motivate error:", error)
    return NextResponse.json({ error: "Error generating message" }, { status: 500 })
  }
}
