'use client'

import { createContext, useContext, useState } from 'react'

export type AgentState = {
  agentId: string
  forecast: 'improving' | 'stable' | 'needs-care'
} | null

type MoodContextType = {
  mood: number
  setMood: (m: number) => void
  agentState: AgentState
  setAgentState: (s: AgentState) => void
}

const MoodContext = createContext<MoodContextType>({
  mood: 50,
  setMood: () => {},
  agentState: null,
  setAgentState: () => {},
})

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMood] = useState(50)
  const [agentState, setAgentState] = useState<AgentState>(null)
  return (
    <MoodContext.Provider value={{ mood, setMood, agentState, setAgentState }}>
      {children}
    </MoodContext.Provider>
  )
}

export const useMood = () => useContext(MoodContext)
