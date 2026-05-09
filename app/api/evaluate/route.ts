import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { NextRequest, NextResponse } from "next/server"

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { initialMood, finalMood, challenge, reflection } = await req.json()

    if (initialMood === undefined || finalMood === undefined || !challenge) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const delta = finalMood - initialMood
    const direction = delta > 0 ? "subió" : delta < 0 ? "bajó" : "se mantuvo"
    const deltaAbs = Math.abs(delta)

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `Eres el juez de la "Ruleta Emocional", un juego de check-in emocional.

DATOS DEL JUGADOR:
- Mood inicial: ${initialMood}/100
- Mood final: ${finalMood}/100
- Delta: ${direction} ${deltaAbs} puntos
- Reto asignado: "${challenge}"
- Reflexión del jugador: "${reflection || "(sin reflexión escrita)"}"

Tu tarea: genera un veredicto en JSON con exactamente esta estructura:
{
  "score": <número del 0 al 100 que representa qué tan bien completó el reto>,
  "title": "<título del veredicto en 3-5 palabras, creativo>",
  "narrative": "<1 oración breve y directa evaluando el recorrido emocional>",
  "badge": "<un emoji que represente el resultado>"
}

Criterios de score:
- Si el mood mejoró mucho (delta > 15): base alta (70-100)
- Si el mood mejoró poco (delta 1-15): base media (50-70)
- Si el mood no cambió: base (40-55)
- Si el mood bajó: base baja (20-40), pero puede subir si la reflexión fue profunda
- La calidad de la reflexión puede sumar o restar hasta 20 puntos al score base

Responde SOLO con el JSON válido, sin markdown, sin explicaciones.`,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON in response")

    const verdict = JSON.parse(jsonMatch[0])

    return NextResponse.json({ verdict, delta, direction })
  } catch (error) {
    console.error("[game] evaluate error:", error)
    return NextResponse.json({ error: "Error evaluating result" }, { status: 500 })
  }
}
