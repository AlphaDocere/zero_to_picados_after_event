export type AgentPersonality = 'amplifier' | 'documentarian' | 'visionary'

export interface Agent {
  id: AgentPersonality
  name: string
  title: string
  description: string
  tone: string
  role: string
  systemPrompt: string
  externalService?: 'discord' | 'notion' | 'zapier' | 'slack' | null
  icon?: string
}

export interface AgentResponse {
  agentId: AgentPersonality
  agentName: string
  response: string
  tone: string
}
