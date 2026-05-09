import { Timestamp } from 'firebase/database'

export interface AgentOutput {
  agentId: string
  sessionId: string
  responseText: string
  outputType: 'discord' | 'notion' | 'webhook' | 'preview'
  preview: {
    title?: string
    content: string
    metadata?: Record<string, any>
  }
  status: 'pending' | 'generated' | 'sent' | 'failed'
  createdAt: number
  sentAt?: number
  error?: string
}

export interface AgentMemory {
  agentId: string
  sessionId: string
  selectedAt: number
  outputs: AgentOutput[]
  metadata: {
    userMood: number
    userCity: string
    userOpinion: string
  }
  lastUpdated: number
}

export interface CheckInSessionWithAgentMemory {
  sessionId: string
  agentMemories: Record<string, AgentMemory> // key: agentId
  activeSessions: string[] // array of active agent sessions
}
