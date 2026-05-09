import { getFirebaseDb } from './firebase'
import { ref, set, get, update, push } from 'firebase/database'
import { AgentMemory, AgentOutput } from './types/agent-memory'

/**
 * Initialize agent memory for a session when agent is selected
 */
export async function initializeAgentMemory(
  sessionId: string,
  agentId: string,
  userMood: number,
  userCity: string,
  userOpinion: string
): Promise<AgentMemory> {
  const db = getFirebaseDb()
  const memoryRef = ref(db, `agent-memory/${sessionId}/${agentId}`)

  const agentMemory: AgentMemory = {
    agentId,
    sessionId,
    selectedAt: Date.now(),
    outputs: [],
    metadata: {
      userMood,
      userCity,
      userOpinion,
    },
    lastUpdated: Date.now(),
  }

  await set(memoryRef, agentMemory)
  return agentMemory
}

/**
 * Save agent output (Discord message preview, Notion page preview, etc.)
 */
export async function saveAgentOutput(
  sessionId: string,
  agentId: string,
  output: Omit<AgentOutput, 'sessionId' | 'agentId' | 'createdAt'>
): Promise<AgentOutput> {
  const db = getFirebaseDb()
  const outputsRef = ref(db, `agent-memory/${sessionId}/${agentId}/outputs`)
  const newOutputRef = push(outputsRef)

  const agentOutput: AgentOutput = {
    sessionId,
    agentId,
    createdAt: Date.now(),
    ...output,
  }

  await set(newOutputRef, agentOutput)

  // Update lastUpdated timestamp
  const memoryRef = ref(db, `agent-memory/${sessionId}/${agentId}`)
  await update(memoryRef, { lastUpdated: Date.now() })

  return agentOutput
}

/**
 * Get all agent memories for a session
 */
export async function getSessionAgentMemories(
  sessionId: string
): Promise<Record<string, AgentMemory> | null> {
  const db = getFirebaseDb()
  const memoryRef = ref(db, `agent-memory/${sessionId}`)
  const snapshot = await get(memoryRef)

  if (snapshot.exists()) {
    return snapshot.val()
  }
  return null
}

/**
 * Get specific agent memory
 */
export async function getAgentMemory(
  sessionId: string,
  agentId: string
): Promise<AgentMemory | null> {
  const db = getFirebaseDb()
  const memoryRef = ref(db, `agent-memory/${sessionId}/${agentId}`)
  const snapshot = await get(memoryRef)

  if (snapshot.exists()) {
    return snapshot.val()
  }
  return null
}

/**
 * Get pending outputs for all agents (for cron jobs / background processing)
 */
export async function getPendingAgentOutputs(): Promise<AgentOutput[]> {
  const db = getFirebaseDb()
  const memoryRef = ref(db, 'agent-memory')
  const snapshot = await get(memoryRef)

  const pendingOutputs: AgentOutput[] = []

  if (snapshot.exists()) {
    const allMemories = snapshot.val()
    
    Object.values(allMemories).forEach((sessionMemories: any) => {
      Object.values(sessionMemories).forEach((agentMemory: any) => {
        if (agentMemory.outputs && Array.isArray(agentMemory.outputs)) {
          agentMemory.outputs.forEach((output: AgentOutput) => {
            if (output.status === 'pending' || output.status === 'generated') {
              pendingOutputs.push(output)
            }
          })
        }
      })
    })
  }

  return pendingOutputs
}

/**
 * Update agent output status (for marking as sent, failed, etc.)
 */
export async function updateAgentOutputStatus(
  sessionId: string,
  agentId: string,
  outputId: string,
  status: 'sent' | 'failed',
  metadata?: { sentAt?: number; error?: string }
): Promise<void> {
  const db = getFirebaseDb()
  const outputRef = ref(db, `agent-memory/${sessionId}/${agentId}/outputs/${outputId}`)

  await update(outputRef, {
    status,
    ...metadata,
  })
}

/**
 * Generate preview message for Discord
 */
export function generateDiscordPreview(
  agentName: string,
  responseText: string,
  userCity: string
): string {
  return `**${agentName} | ${userCity}**\n\n${responseText}`
}

/**
 * Generate preview message for Notion
 */
export interface NotionPreview {
  title: string
  content: string
  properties: Record<string, any>
}

export function generateNotionPreview(
  agentName: string,
  responseText: string,
  userMood: number,
  userCity: string
): NotionPreview {
  return {
    title: `${agentName} - ${userCity}`,
    content: responseText,
    properties: {
      agent: agentName,
      city: userCity,
      mood: userMood,
      timestamp: new Date().toISOString(),
    },
  }
}
