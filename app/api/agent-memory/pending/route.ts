import { getPendingAgentOutputs } from '@/lib/agent-memory'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here for cron jobs
    // For now, it's open for testing. Add secret key verification later.

    const pendingOutputs = await getPendingAgentOutputs()

    return NextResponse.json({
      success: true,
      count: pendingOutputs.length,
      outputs: pendingOutputs,
    })
  } catch (error) {
    console.error('[v0] Get pending outputs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
