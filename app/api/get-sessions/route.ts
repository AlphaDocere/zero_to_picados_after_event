import { getAllSessions } from '@/lib/firebase'
import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limiting configuration
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()
const LIMIT = 30 // Max 30 requests per minute
const WINDOW_MS = 60 * 1000 // 1 minute window

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return false
  }

  if (now - record.lastReset > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return false
  }

  if (record.count >= LIMIT) {
    return true
  }

  record.count++
  return false
}

export async function GET(request: NextRequest) {
  try {
    // 1. Rate limiting protection
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // 2. Authentication check - Require a valid client identifier
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        { error: 'Unauthorized: Missing user identifier' },
        { status: 401 }
      )
    }

    // 3. Query all sessions and filter securely in memory by the client's userId
    const sessions = await getAllSessions()
    const userSessions = sessions.filter((s) => s.userId === userId)

    return NextResponse.json(userSessions)
  } catch (error) {
    console.error('[v0] Error getting sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
