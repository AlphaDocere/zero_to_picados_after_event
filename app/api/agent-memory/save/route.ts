import { saveAgentOutput, initializeAgentMemory, generateDiscordPreview, generateNotionPreview } from '@/lib/agent-memory'
import { getCheckInSession } from '@/lib/firebase'
import { getAgent } from '@/lib/agents.config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sessionId,
      agentId,
      responseText,
      outputType = 'preview',
    } = body

    if (!sessionId || !agentId || !responseText) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, agentId, responseText' },
        { status: 400 }
      )
    }

    // Validate session exists
    const session = await getCheckInSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get agent info
    const agent = getAgent(agentId)

    // Initialize agent memory if this is the first output for this agent
    await initializeAgentMemory(
      sessionId,
      agentId,
      session.initialMood,
      session.city,
      session.opinion
    ).catch(() => {
      // Memory might already exist, that's ok
    })

    // Generate previews based on output type
    let preview: any = {}

    if (outputType === 'discord' || outputType === 'preview') {
      preview.discord = generateDiscordPreview(
        agent.name,
        responseText,
        session.city
      )
    }

    if (outputType === 'notion' || outputType === 'preview') {
      preview.notion = generateNotionPreview(
        agent.name,
        responseText,
        session.initialMood,
        session.city
      )
    }

    // Save the output
    const agentOutput = await saveAgentOutput(sessionId, agentId, {
      responseText,
      outputType: outputType as any,
      preview: {
        title: `${agent.name} Response`,
        content: responseText,
        metadata: preview,
      },
      status: 'generated',
    })

    return NextResponse.json({
      success: true,
      output: agentOutput,
      previews: preview,
    })
  } catch (error) {
    console.error('[v0] Agent memory save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
