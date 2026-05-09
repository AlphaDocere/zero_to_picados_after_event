import { updateCheckInSession } from '@/lib/firebase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sessionId,
      initialMood,
      city,
      opinion,
      selectedAgent,
      agentResponse,
      agentQuestion,
      followUpResponse,
      finalMood,
    } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      )
    }

    await updateCheckInSession(sessionId, {
      initialMood,
      city,
      opinion,
      selectedAgent,
      agentResponse,
      agentQuestion,
      followUpResponse,
      finalMood,
      status: 'completed',
    })

    return NextResponse.json({ success: true, sessionId })
  } catch (error) {
    console.error('[v0] Session save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
