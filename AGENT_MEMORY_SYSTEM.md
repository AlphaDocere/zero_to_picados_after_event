# Agent Memory System Documentation

## Overview

El sistema de Agent Memory permite que cada agente (Nova, Atlas, Phoenix) recuerde y almacene información de cada sesión de check-in. Esto prepara la arquitectura para futuras integraciones con MCPs y cron jobs que podrán publicar mensajes automáticos.

## Architecture

### Firebase Structure

```
users/{userId}
  ├── sessions/{sessionId}
  │   ├── agentMemories/{agentId}
  │   │   ├── outputs[]
  │   │   │   ├── responseText
  │   │   │   ├── outputType (preview|discord_pending|notion_pending|webhook_pending|published)
  │   │   │   ├── status (pending|generated|sent|failed)
  │   │   │   └── metadata
  │   │   ├── selectedAt
  │   │   └── metadata (userMood, userCity, userOpinion)
  │
  └── agents/{agentId}
      ├── outputs/{sessionId}
      │   ├── preview
      │   ├── discord_pending
      │   ├── notion_pending
      │   └── webhook_pending
```

### Files Created

1. **lib/types/agent-memory.ts** - TypeScript interfaces for agent memory
   - `AgentOutput` - Estructura individual de cada salida del agente
   - `AgentMemory` - Memoria acumulada de un agente en una sesión
   - `CheckInSessionWithAgentMemory` - Extensión de la sesión con memoria

2. **lib/agent-memory.ts** - Core functions
   - `saveAgentOutput()` - Guarda output en Firebase
   - `getAgentMemory()` - Obtiene memoria de un agente
   - `getPendingOutputs()` - Obtiene outputs listos para publicar
   - `updateOutputStatus()` - Cambia estado de output (pending → published)

3. **app/api/agent-memory/save/route.ts** - Endpoint para guardar memoria
   - POST /api/agent-memory/save
   - Recibe: sessionId, agentId, responseText, outputType
   - Guarda en dos lugares: sesión y rama global de agentes

4. **app/api/agent-memory/pending/route.ts** - Endpoint para cron jobs
   - GET /api/agent-memory/pending?agentId=...&days=7
   - Retorna todos los outputs pendientes de una edad específica
   - Permite que workflows y cron jobs los procesen

## Data Flow

### During Check-in

1. Usuario completa check-in y selecciona agente
2. API `/api/agent-response` genera respuesta personalizada
3. Hook `useAgentResponse` llama a `/api/agent-memory/save`
4. Firebase guarda el output como `preview` status

### Preview Generation

```typescript
const response = await getAgentResponse(
  sessionId,
  agentId,
  initialMood,
  opinion,
  city,
  saveToMemory: true  // Activa guardado automático
)
```

### Future Workflow Integration

```typescript
// En un cron job o Workflow
const pending = await fetch(`/api/agent-memory/pending?agentId=amplifier&days=7`)
const outputs = await pending.json()

for (const output of outputs) {
  // Procesar con MCP correspondiente
  if (output.agentId === 'amplifier') {
    await postToDiscord(output.responseText)
  } else if (output.agentId === 'documentarian') {
    await saveToNotion(output)
  }
  
  // Actualizar status
  await updateOutputStatus(output.id, 'published')
}
```

## Output Types

- **preview** - Mensaje generado, guardado como preview
- **discord_pending** - Listo para enviarse a Discord (Nova)
- **notion_pending** - Listo para guardarse en Notion (Atlas)
- **webhook_pending** - Listo para usar en webhooks (Phoenix)
- **published** - Ya fue enviado/publicado

## Status Flow

```
pending → generated → sent → published
              ↓
            failed (optional)
```

## Integration Points

### 1. Agent Selector → ResponseCard

El agente seleccionado se guarda automáticamente cuando se genera la respuesta.

### 2. Workflow Integration (Future)

```typescript
// En Vercel Workflows
const agentOutputs = await getPendingOutputs('amplifier', 7)
for (const output of agentOutputs) {
  // Usar MCP para publicar
}
```

### 3. Cron Jobs (Future)

```
// vercel.json
{
  "crons": [{
    "path": "/api/cron/publish-agent-messages",
    "schedule": "0 9 * * *"
  }]
}
```

## Example: Adding a New Output Type

1. Agregar tipo en `OutputType` union
2. Crear función auxiliar en `lib/agent-memory.ts`
3. Actualizar API endpoint para manejar nuevo tipo
4. Usar en workflow cuando sea necesario

## Current Status

✅ Memory structure implemented
✅ Firebase integration complete
✅ API endpoints ready
✅ Auto-save on agent response
✅ Ready for Workflow/cron integration

## Next Steps

1. Connect Discord MCP to Nova
2. Connect Notion MCP to Atlas
3. Create Workflow for publishing outputs
4. Add cron job scheduler
