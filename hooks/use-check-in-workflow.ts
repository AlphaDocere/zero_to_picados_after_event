import { useEffect, useState, useCallback } from 'react'
import {
  initFirebase,
  createCheckInSession,
  getCheckInSession,
  updateCheckInSession,
  completeCheckInSession,
  CheckInSession
} from '@/lib/firebase'

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('reflect_user_id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('reflect_user_id', id)
  }
  return id
}

export function useCheckInWorkflow() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [session, setSession] = useState<CheckInSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize Firebase on mount
  useEffect(() => {
    initFirebase()
  }, [])

  // Retrieve or create session
  const initializeSession = useCallback(async (existingSessionId?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('[v0] initializeSession starting...')
      
      let id = existingSessionId || sessionStorage.getItem('checkInSessionId')
      console.log('[v0] sessionId from storage:', id)
      
      if (id) {
        console.log('[v0] Attempting to load existing session:', id)
        const existingSession = await getCheckInSession(id)
        console.log('[v0] Existing session loaded:', existingSession)
        
        if (existingSession && existingSession.status === 'in-progress') {
          setSessionId(id)
          setSession(existingSession)
          console.log('[v0] Loaded existing session:', id)
          return id
        }
      }
      
      // Create new session
      console.log('[v0] Creating new session...')
      const userId = getOrCreateUserId()
      const newId = await createCheckInSession(userId)
      console.log('[v0] New session created with ID:', newId)
      
      sessionStorage.setItem('checkInSessionId', newId)
      setSessionId(newId)
      
      const newSession = await getCheckInSession(newId)
      console.log('[v0] Fetched new session data:', newSession)
      setSession(newSession)
      
      return newId
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      console.error('[v0] Session initialization failed:', {
        error: err,
        message,
        stack: err instanceof Error ? err.stack : 'No stack'
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update any field in the session
  const updateSession = useCallback(async (updates: Partial<CheckInSession>) => {
    if (!sessionId) return
    
    try {
      // Determine current step based on filled fields
      let currentStep = session?.currentStep || 0
      
      if (updates.initialMood !== undefined && updates.initialMood > 0) currentStep = Math.max(1, currentStep)
      if (updates.city && updates.city !== '') currentStep = Math.max(2, currentStep)
      if (updates.opinion && updates.opinion !== '') currentStep = Math.max(4, currentStep)
      if (updates.selectedAgent && updates.selectedAgent !== '') currentStep = Math.max(5, currentStep)
      if (updates.agentResponse && updates.agentResponse !== '') currentStep = Math.max(6, currentStep)
      if (updates.followUpResponse && updates.followUpResponse !== '') currentStep = Math.max(8, currentStep)
      if (updates.finalMood !== undefined && updates.finalMood > 0) currentStep = Math.max(9, currentStep)
      
      await updateCheckInSession(sessionId, {
        ...updates,
        currentStep
      })
      
      const updatedSession = await getCheckInSession(sessionId)
      setSession(updatedSession)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating session'
      setError(message)
      console.error('[v0] Session update error:', err)
    }
  }, [sessionId, session])

  // Complete the workflow
  const completeWorkflow = useCallback(async (finalMood: number) => {
    if (!sessionId) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('[v0] Starting workflow completion...')
      await completeCheckInSession(sessionId, finalMood)
      console.log('[v0] Session marked as completed in Firebase')
      
      sessionStorage.removeItem('checkInSessionId')
      setSessionId(null)
      setSession(null)
      console.log('[v0] Workflow completed successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error completing workflow'
      setError(message)
      console.error('[v0] Workflow completion error:', {
        error: err,
        message,
        sessionId
      })
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  return {
    sessionId,
    session,
    loading,
    error,
    initializeSession,
    updateSession,
    completeWorkflow
  }
}
