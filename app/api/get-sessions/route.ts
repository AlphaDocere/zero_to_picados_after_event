import { getAllSessions } from '@/lib/firebase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const sessions = await getAllSessions()
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('[v0] Error getting sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
