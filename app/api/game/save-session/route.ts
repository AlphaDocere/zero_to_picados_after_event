import { saveRuletaSession } from "@/lib/firebase"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { initialMood, finalMood, challenge, gameScore, gameWon, habits, motivation } = body

    if (initialMood === undefined || finalMood === undefined || !challenge) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sessionId = await saveRuletaSession({
      initialMood,
      finalMood,
      challenge,
      gameScore: gameScore ?? 0,
      gameWon: gameWon ?? false,
      habits: habits ?? [],
      motivation: motivation ?? "",
    })

    return NextResponse.json({ sessionId })
  } catch (error) {
    console.error("[game] save-session error:", error)
    return NextResponse.json({ error: "Error saving session" }, { status: 500 })
  }
}
