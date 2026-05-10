import { getCheckInSession } from '@/lib/firebase'
import { generateAgentResponse } from '@/lib/agent-response'
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

    const session = await getCheckInSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const result = generateAgentResponse(agentId, {
      initialMood,
      opinion,
      city,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[v0] Agent response error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
