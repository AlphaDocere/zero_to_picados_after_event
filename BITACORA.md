# Bitácora — Hackathon Generative UI
**Proyecto:** Reflect — Emotional Check-in Platform  
**Evento:** AI Tinkerers Global Hackathon: Agentic Interfaces  
**Rama de trabajo:** `feature/generative-ui`  
**Fecha:** 9 de mayo de 2026  
**Stack:** Next.js 16 · Firebase Realtime DB · Groq (llama-3.3-70b) · Web Audio API  

---

## Contexto del hackathon

**Tema:** Generative UI — Build AI agents that don't just return text, they render complete interactive interfaces on the fly.

**Stack permitido:** A2UI (Google DeepMind), AG-UI (CopilotKit), CopilotKit, MCP Apps.

**Rama asignada:** UX / Interfaz dinámica.

**Decisión de arquitectura:** No se usó CopilotKit (overhead de setup). Se utilizó el Vercel AI SDK (`ai` + `@ai-sdk/groq`) que ya estaba incluido en el proyecto pero sin activar. Esto permitió tener Generative UI real en tiempo mínimo.

---

## Setup inicial

### 1. Clonar y configurar el proyecto

```bash
git clone https://github.com/AlphaDocere/zero_to_picados_after_event.git
cd zero_to_picados_after_event
npm install
cp .env.local.example .env.local
```

**Stack identificado:**
- Next.js 16.2.4 con App Router y Turbopack
- Firebase Realtime Database (no Firestore)
- Vercel AI SDK v6 (`ai`, `@ai-sdk/groq`) — instalado pero sin uso
- Groq como proveedor LLM (sin key configurada)
- `pnpm-lock.yaml` presente pero `pnpm` con conflictos de build scripts → se usó `npm`

### 2. Variables de entorno configuradas

Archivo: `.env.local`

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=zero-to-agent-interface.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://zero-to-agent-interface-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=zero-to-agent-interface
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=zero-to-agent-interface.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
GROQ_API_KEY=...
```

### 3. Rama de trabajo

```bash
git checkout -b feature/generative-ui
```

---

## Problemas encontrados y soluciones

| Problema | Causa | Solución |
|----------|-------|----------|
| `pnpm: command not found` | pnpm no instalado | `npm install -g pnpm` → aún con errores de build scripts → cambio a `npm install` |
| API retornaba error 500 | Servidor no reiniciado con `GROQ_API_KEY` | `pkill -f "next dev"` + relaunch |
| `generateObject` falla con 400 | `llama-3.3-70b-versatile` no soporta `json_schema` response format | Cambio a `generateText` con JSON manual en el prompt |

---

## Intervenciones de código

### Archivos MODIFICADOS

#### `app/api/agent-response/route.ts`
**Estado previo:** Respuestas de agente hardcodeadas, strings predefinidos por agentId.  
**Cambio:** Reescritura completa. Usa `generateText` de Vercel AI SDK con Groq. El prompt instruye al modelo a retornar JSON estructurado con:
- `insight` — reflexión personalizada 2-3 oraciones
- `emotionalValidation` — validación del estado emocional
- `actions[]` — 2-3 acciones interactivas con tipo y descripción
- `moodForecast` — predicción de trayectoria emocional (`improving` / `stable` / `needs-care`)
- `communityInsight` — frase para compartir con la comunidad

```typescript
// Modelo usado
groq('llama-3.3-70b-versatile')

// Técnica: generateText + JSON.parse manual
// (generateObject bloqueado por Groq en este modelo)
const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
const parsed = JSON.parse(clean)
```

---

#### `app/layout.tsx`
**Cambios:**
- Importa `MoodProvider` y `MoodAtmosphere`
- Envuelve la app en `<MoodProvider>` para propagar estado de mood globalmente
- Monta `<MoodAtmosphere />` como componente global de efectos visuales
- Elimina background hardcodeado `#0a0e17` para permitir control dinámico

---

#### `app/globals.css`
**Cambios:**
- `cursor: none !important` en desktop para ocultar cursor nativo (el custom lo reemplaza)
- Reglas CSS que leen variables `--mood-font-weight`, `--mood-tracking`, `--mood-line-height` inyectadas por JS
- Transiciones de 1.2s en `background-color`, `color`, `font-weight`, `letter-spacing`
- Override de `border-radius` utilitarios de Tailwind para que respondan a `--radius`

---

#### `components/check-in/mood-slider.tsx`
**Cambio:** Conecta al `MoodContext` con `useMood()`. Cada cambio del slider llama `setMood(value)`, propagando el estado a `MoodAtmosphere` y a toda la app.

---

#### `components/check-in/response-card.tsx`
**Estado previo:** Mostraba texto plano de respuesta del agente.  
**Cambio:** Reescritura completa. Ahora renderiza UI dinámica generada por el agente:
- Skeleton loader animado durante la llamada a Groq
- Badge de `moodForecast` con color e icono
- Tarjeta de validación emocional
- Insight personalizado
- **Botón de audio binaural** — activa/desactiva tonos binaurales con fade
- Action cards interactivas (clickeables, cada una con color propio por tipo)
- Cita para la comunidad

Además: llama a `setAgentState()` al recibir la respuesta, disparando la transformación visual post-agente en `MoodAtmosphere`.

---

#### `hooks/use-agent-response.ts`
**Estado previo:** Hook con sistema de caché complejo (TTL 24h, similitud semántica por word overlap).  
**Cambio:** Simplificación total. El hook ahora es stateless respecto a caché — solo hace el fetch y retorna el tipo `AgentGenerativeData`.

**Razón:** La caché del hook anterior era incompatible con el nuevo tipo de respuesta estructurado. Para el contexto del hackathon (evento en vivo, sesiones únicas) la caché no aportaba valor.

---

### Archivos CREADOS

#### `contexts/MoodContext.tsx`
Contexto global de React con dos estados:
- `mood: number` — valor actual del slider (0-100)
- `agentState: { agentId, forecast } | null` — estado activado tras la respuesta del agente

Permite que cualquier componente de la app lea o modifique el mood sin prop drilling.

---

#### `components/mood-atmosphere.tsx`
Componente visual global montado en el layout. Responsable de toda la experiencia ambiental:

**Sistema de temas por mood (4 rangos interpolados):**

| Mood | Nombre | Fondo | Color primario | Tipografía | Bordes |
|------|--------|-------|----------------|-----------|--------|
| 0–25 | `low` | `#03060f` azul casi negro | `#4a7fe0` azul | 300 weight, tracking +0.04em | 8px angular |
| 26–50 | `neutral` | `#0a0e17` navy oscuro | `#9b6dff` violeta | 400 weight, tracking 0 | 16px |
| 51–75 | `good` | `#0d0a16` cálido oscuro | `#e040fb` magenta | 500 weight, tracking -0.01em | 20px |
| 76–100 | `high` | `#0f0900` negro dorado | `#f59e0b` ámbar | 700 weight, tracking -0.02em | 28px muy redondo |

**Cursor custom:**
- Dos capas: punto sólido interior + anillo exterior difuso
- Color = color primario del mood actual
- Velocidad de seguimiento interpolada: 0.04x (mood bajo, pesado) → 0.28x (mood alto, rápido)
- Solo visible en desktop (`@media hover: hover`)

**Glow ambiental por agente (post-recomendación):**
- Nova (amplifier): rosa `#ec4899`
- Atlas (documentarian): índigo `#6366f1`
- Phoenix (visionary): dorado `#f59e0b` / teal `#14b8a6`

El overlay de agente aparece desde abajo con animación `agentGlowIn`, creando un sandwich cromático con el glow del mood desde arriba. Un `pulse` de 4s hace que la atmósfera respire.

**Inyección de CSS variables en `:root`:**
```
--background, --card, --secondary, --popover
--primary, --accent, --foreground, --muted-foreground, --border, --input
--mood-font-weight, --mood-tracking, --mood-line-height
--radius
```

---

#### `hooks/use-binaural.ts`
Hook de Web Audio API que genera tonos binaurales en tiempo real:

**Principio:** Dos osciladores sinusoidales — uno en canal izquierdo (frecuencia base) y otro en canal derecho (base + beat). La diferencia de frecuencias entre oídos crea el efecto binaural en el cerebro.

**Frecuencias según forecast del agente:**

| Forecast | Onda | Frecuencia Beat | Efecto |
|----------|------|----------------|--------|
| `needs-care` | Theta | 6 Hz | Sanación profunda, meditación |
| `stable` | Alpha | 10 Hz | Calma enfocada, relajación |
| `improving` | Alpha/Beta | 14 Hz | Energía positiva, foco activo |

**Implementación:**
```
Base: 220 Hz (A3) — canal izquierdo
Beat: 220 + N Hz — canal derecho
Volumen: 0.06-0.07 con fade-in de 3s y fade-out de 2s
```

**Nota UX importante:** Requiere audífonos para el efecto completo. El botón en la tarjeta indica esto. El audio inicia por gesto del usuario (click) respetando la política de autoplay del browser.

---

## Flujo de experiencia resultante

```
1. Usuario llega → UI en estado neutral (mood 50)

2. Slider de ánimo →
   - Cambia fondo, color primario, tipografía, bordes, cursor en tiempo real
   - Transiciones suaves de 1.2s
   - Cursor más lento con mood bajo, más rápido con mood alto

3. Check-in completo (ciudad, noticia, opinión, agente) →
   - Agente seleccionado determina systemPrompt
   - Groq genera respuesta estructurada JSON en ~1.5s

4. Respuesta del agente aparece →
   - UI dinámica: validación + insight + forecast badge + action cards
   - Glow del color del agente emerge desde abajo (overlay ambiental)
   - Atmósfera pulsa lentamente

5. Usuario activa audio binaural →
   - Dos osciladores se activan en stereo
   - Frecuencia determinada por forecast del agente
   - Fade-in de 3 segundos

6. Resultado: experiencia sensorial completa donde el mood del usuario
   reescribe visualmente toda la interfaz y el agente añade una capa
   adicional de atmósfera + sonido.
```

---

## Archivos sin tocar (respeto a rama main)

- `app/harvest/page.tsx`
- `app/insights/page.tsx`
- `app/dashboard/page.tsx`
- `app/agents/page.tsx`
- `lib/firebase.ts`
- `lib/agents.config.ts`
- Todo el sistema de traducción
- Todos los componentes de `components/insights/`
- `components/check-in/city-selector.tsx`
- `components/check-in/news-card.tsx`
- `components/check-in/opinion-input.tsx`
- `components/check-in/agent-selector.tsx`
- `components/check-in/step-indicator.tsx`

---

## Comandos para reproducir

```bash
# Clonar
git clone https://github.com/AlphaDocere/zero_to_picados_after_event.git
cd zero_to_picados_after_event

# Cambiar a la rama del hackathon
git checkout feature/generative-ui

# Instalar
npm install

# Variables de entorno (completar con credenciales reales)
cp .env.local.example .env.local
# Editar .env.local con Firebase config + GROQ_API_KEY

# Correr
npm run dev
# → http://localhost:3000
```

---

## Estado al cierre de sesión

- ✅ Generative UI activo (Groq → JSON → componentes React)
- ✅ Sistema de temas mood-driven (4 rangos, interpolación suave)
- ✅ Cursor custom con velocidad proporcional al mood
- ✅ Tipografía y fondos reactivos al mood
- ✅ Glow ambiental post-recomendación por agente
- ✅ Sonido binaural activable por el usuario
- ✅ Rama `feature/generative-ui` sin contaminar `main`
- ⏳ Pendiente: commit y PR al repositorio del equipo
