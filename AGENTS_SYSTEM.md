# Configurable Agent System

## Overview

The agent system has been refactored to be fully configurable and extensible. Each agent now has a distinct personality shaped by the "Zero to Agent" experience across different global perspectives.

## Current Agents

### 1. Nova - The Amplifier
**Role**: Community Connector & Energy Amplifier
**Personality**: Energetic, community-first, connective
**Output Format**: Shares emotional journeys in Discord
**Service Integration**: Discord Webhook (already active)

**Sample Response**:
```
"Nova aquí. Tu reflexión desde [CITY] me inspira. He sentido la energía detrás de tu opinión 
y tu estado inicial de [MOOD] me dice mucho sobre dónde estás ahora. Lo que compartiste es 
poderoso - es exactamente el tipo de autenticidad que necesita ser amplificada."
```

### 2. Atlas - The Documentarian
**Role**: Perspective Archiver & Insights Recorder
**Personality**: Reflective, analytical, archive-minded
**Output Format**: Documents personal insights with emotional context
**Service Integration**: (Placeholder - future: Notion, database, etc.)

**Sample Response**:
```
"Atlas aquí. Documentando tu perspectiva de [CITY] como parte del archivo vivo de Zero to Agent. 
Tu reflexión, con un estado emocional [CONTEXT], añade una capa importante a nuestra comprensión 
colectiva. Lo que expresaste no es solo un momento - es un testimonio que perdurará."
```

### 3. Phoenix - The Visionary
**Role**: Growth Catalyst & Future Builder
**Personality**: Inspirational, transformative, growth-oriented
**Output Format**: Presents vision of personal transformation and impact
**Service Integration**: (Placeholder - future: Integration with impact tracking)

**Sample Response**:
```
"Phoenix aquí. Viendo el potencial en tu viaje desde [CITY]. Tu estado actual de [MOOD] 
es el punto de partida de algo mayor. La reflexión que compartiste es semilla de transformación. 
Zero to Agent no es solo un evento que viviste - es el comienzo de tu metamorfosis."
```

---

## Architecture

### Files Structure

```
lib/
├── types/
│   └── agent.ts           # Agent interface and types
├── agents.config.ts        # Agent configuration and factory
└── (other utilities)

app/api/
└── agent-response/
    └── route.ts           # Dynamic response generation

components/check-in/
└── agent-selector.tsx     # Agent selection UI

hooks/
└── use-agent-response.ts  # Hook for fetching agent responses
```

### Adding a New Agent

To add a new agent personality:

1. **Update `lib/agents.config.ts`**:
```typescript
const agents: Record<string, Agent> = {
  // ... existing agents
  newAgent: {
    id: 'new-agent',
    name: 'AgentName',
    title: 'Role Title',
    description: 'One-line description',
    tone: 'personality-tone',
    role: 'Specific role description',
    externalService: null // placeholder for future MCP integration
  }
}
```

2. **Update response template in `app/api/agent-response/route.ts`**:
```typescript
const responses: Record<string, string> = {
  // ... existing
  'new-agent': `Your agent's response template with [MOOD], [CITY], [CONTEXT]...`
}
```

3. **UI updates automatically** - The AgentSelector component will render the new agent.

### Template Variables

When writing agent responses, use these placeholders:

- `${initialMood}` - Initial emotional state (0-100)
- `${city}` - City name where check-in occurred
- `moodContext` - Calculated context ("difícil", "reflexiva", "positiva")
- `${opinion}` - User's reflection text (if needed)

### Future: External Service Integration

Each agent is designed to support future MCP connections:

```typescript
interface Agent {
  externalService?: {
    type: 'discord' | 'notion' | 'twitter' | 'linear' | null
    config?: Record<string, unknown>
  }
}
```

**Current implementations**:
- Discord: Active via webhook
- Notion, Twitter, etc.: Ready to implement

---

## Using the System

### In Components

```typescript
import { getAllAgents, getAgent } from '@/lib/agents.config'

// Get all agents
const agents = getAllAgents()

// Get specific agent
const nova = getAgent('amplifier')
```

### API Call

```typescript
const response = await fetch('/api/agent-response', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: 'session-id',
    agentId: 'amplifier',
    initialMood: 75,
    opinion: 'user text',
    city: 'Santiago'
  })
})

// Returns: { response, agentName, agentId, tone }
```

---

## Design Philosophy

1. **Personality-Driven** - Each agent has distinct tone and perspective
2. **Context-Aware** - Responses incorporate mood, location, and journey
3. **Extensible** - Easy to add new agents without code changes
4. **Service-Ready** - Infrastructure prepared for future MCP integrations
5. **Zero to Agent Theme** - Each agent represents a character perspective from the global event

---

## Next Steps

1. **Refine Response Templates** - Enhance personality in each agent's output
2. **Add Service Integrations** - Connect Notion, Twitter, Analytics as needed
3. **Track Agent Usage** - Monitor which agents resonate most
4. **Expand Agents** - Add region-specific or event-specific agents
5. **Create Agent Profiles** - Visual representations for each personality

