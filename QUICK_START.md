# ⚡ Quick Reference - Reflect App

## URLs

| Página | URL |
|--------|-----|
| Check-in App | `http://localhost:3000` |
| Dashboard | `http://localhost:3000/dashboard` |
| Firebase DB | `https://console.firebase.google.com` → zero-to-agent-interface |

---

## Firebase Credentials

```
Project: zero-to-agent-interface
RTDB URL: https://zero-to-agent-interface-default-rtdb.firebaseio.com
API Key: AIzaSyCwgAbtOuFB9AcOkV3v4zcY1LLJspV0ymA
```

**Archivo de config:** `/lib/firebase.ts`

---

## Agentes Disponibles

| ID | Nombre | Rol | Emoji |
|----|--------|-----|-------|
| `compassionate` | Nova | Empática y solidaria | 💜 |
| `analytical` | Atlas | Lógica y estructurada | 🧠 |
| `passionate` | Phoenix | Energética e inspiradora | 🔥 |

---

## Ciudades Soportadas

- 🏙️ Santiago
- 🌴 Miami
- 🗽 Nueva York
- 🗼 París
- 🏯 Tokio
- 🎭 Barcelona
- 🕌 Estambul
- 🏔️ Medellín

---

## Estructura de Sesión

```typescript
interface CheckInSession {
  id?: string
  initialMood: number           // 0-100
  city: string
  news: { title, description }
  opinion: string
  selectedAgent: string         // "compassionate" | "analytical" | "passionate"
  agentResponse: string
  agentQuestion: string
  followUpResponse: string
  finalMood: number            // 0-100
  status: 'in-progress' | 'completed'
  currentStep: number          // 0-8 (9 pasos totales)
  createdAt: number            // timestamp
  updatedAt: number            // timestamp
}
```

---

## Hooks Principales

```typescript
// Manejo de sesiones + Firebase
useCheckInWorkflow()
  → sessionId, session, loading, error
  → initializeSession(), updateSession(), completeWorkflow()

// Llamadas a agentes
useAgentResponse()
  → getAgentResponse(sessionId, agentId, mood, opinion)
```

---

## APIs

### GET Sesiones
```bash
curl http://localhost:3000/api/get-sessions
```

### Respuesta de Agente
```bash
curl -X POST http://localhost:3000/api/agent-response \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "agentId": "compassionate",
    "initialMood": 50,
    "opinion": "Mi opinión..."
  }'
```

### Guardar Sesión
```bash
curl -X POST http://localhost:3000/api/save-session \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "finalMood": 75,
    "status": "completed"
  }'
```

---

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `app/page.tsx` | Home - renderiza CheckInForm |
| `components/check-in/check-in-form.tsx` | Orquestador de 9 pasos |
| `hooks/use-check-in-workflow.ts` | Lógica de sesiones + Firebase |
| `lib/firebase.ts` | Inicialización + CRUD |
| `app/api/agent-response/route.ts` | Genera respuestas de agentes |
| `app/dashboard/page.tsx` | Analytics del historial |

---

## Comandos Útiles

```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Preview
pnpm start

# Test
pnpm lint
```

---

## Debugging

**Ver logs de Firebase:**
```typescript
// En components/check-in/check-in-form.tsx o hooks
console.log("[v0] Session initialized:", session)
console.log("[v0] Agent response:", response)
```

**Ver datos en Firebase Console:**
1. Abre https://console.firebase.google.com
2. Selecciona proyecto `zero-to-agent-interface`
3. Ve a **Realtime Database**
4. Navega a `check-in-sessions`

---

## Pasos del Check-in

```
Paso 0: Mood Inicial (0-100)
  ↓ canProceed = true
Paso 1: Selecciona Ciudad
  ↓ canProceed = city !== ""
Paso 2: Lee Noticia
  ↓ canProceed = city !== ""
Paso 3: Expresa Opinión
  ↓ canProceed = opinion.length > 0
Paso 4: Selecciona Agente
  ↓ canProceed = selectedAgent !== ""
Paso 5: Lee Respuesta del Agente
  ↓ canProceed = true
Paso 6: Responde a Pregunta del Agente
  ↓ canProceed = followUpResponse.length > 0
Paso 7: Mood Final (0-100)
  ↓ canProceed = true
Paso 8: Revisa Resumen y Envía
  ↓ canProceed = true → Submit
```

---

## Workflow Pattern (Resumible)

**Cómo funciona:**

1. Al iniciar, `useCheckInWorkflow.initializeSession()`:
   - Busca `sessionId` en `sessionStorage`
   - Si existe, recupera sesión de Firebase
   - Si es `in-progress`, retoma el `currentStep` guardado
   - Si no existe, crea nueva sesión

2. Cada cambio (`updateSession`):
   - Actualiza campo en Firebase RTDB
   - Calcula y actualiza `currentStep`
   - Sincroniza con React state

3. Si el usuario cierra la tab y reabre:
   - El `sessionId` sigue en `sessionStorage`
   - Se recupera la sesión
   - Se navega al `currentStep` automáticamente

---

## Integraciones Futuras

**Para agregar Groq:**
```typescript
// app/api/agent-response/route.ts
import { Groq } from "@groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const message = await groq.messages.create({
  model: "mixtral-8x7b-32768",
  messages: [{ role: "user", content: opinion }]
})
```

**Para agregar MCP de Noticias:**
```typescript
// hooks/use-news-mcp.ts
const { getNews } = useNewsMCP()
const news = await getNews(city)
```

---

**¡Listo para explorar y hackear! 🚀**
