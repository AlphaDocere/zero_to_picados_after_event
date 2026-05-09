# Reflect - Cosecha Colaborativa del Sentir

**Estado**: Listo para deploy en Vercel

## Descripción

App de check-in emocional colaborativa donde:
1. Usuarios hacen un viaje de 9 pasos reflexionando sobre sus emociones
2. Sus respuestas se guardan en Firebase
3. Comparten sus reflexiones en una "cosecha colaborativa"
4. Otros usuarios pueden sumar su apoyo (+1)
5. Todo se integra en Discord para amplificar la comunidad

## Tecnología

- **Frontend**: React 19 + Next.js 16 + TypeScript
- **Styling**: Tailwind CSS v4 + DM Sans/Nunito fonts
- **Database**: Firebase RTDB (real-time)
- **Backend**: Next.js API Routes (serverless)
- **Integración Social**: Discord Webhooks
- **Hosting**: Vercel (optimizado)

## Rutas Principales

| Ruta | Descripción |
|------|-------------|
| `/` | Formulario de 9 pasos (check-in) |
| `/harvest` | Galería colaborativa de reflexiones |
| `/dashboard` | Analytics de sesiones |
| `/api/agent-response` | Respuestas de agentes IA |
| `/api/share-to-discord` | Envío a Discord |
| `/api/get-sessions` | Obtiene historial |

## Features Implementados

### Flujo de Check-in (9 pasos)
- [x] Mood Slider inicial (0-100)
- [x] Selector de ciudad (8 ciudades)
- [x] Noticia local dinámica
- [x] Textarea de opinión
- [x] Selector de 3 agentes IA (Nova, Atlas, Phoenix)
- [x] Respuesta del agente
- [x] Pregunta de seguimiento (agent follow-up)
- [x] Mood Slider final
- [x] Pantalla de resumen

### Persistencia & Workflow
- [x] Firebase RTDB para guardar sesiones
- [x] Session recovery (puede retomar en paso anterior)
- [x] Debounce en inputs para evitar spam de updates
- [x] Error handling y logging detallado

### Cosecha Colaborativa
- [x] Galería de reflexiones (`/harvest`)
- [x] Estadísticas agregadas (ánimos, cambios promedio)
- [x] Modal de apoyo (+1) - cualquiera puede apoyar
- [x] Emojis celebratorios dinámicos
- [x] Integración Discord (embeds bonitos)
- [x] Mostrar apoyo en tarjeta ("Compartido")

### UI/UX
- [x] Diseño premium con gradientes y sombras
- [x] Animaciones suaves (fade-in, float, pulse)
- [x] Mobile-first responsive
- [x] Step indicator (progreso visual)
- [x] Feedback visual en todas las acciones
- [x] Emojis contextuales
- [x] Loading states y error messages

### Security
- [x] Variables de entorno (.env.local)
- [x] Firebase config validation
- [x] No hardcoding de credenciales
- [x] Webhook Discord privado (server-side only)

## Credenciales (Temporales - Base de Prueba)

```
Firebase Project: zero-to-agent-interface
Discord Webhook: Configurado (privado)
```

Están en `.env.local`. Cuando cambien, actualizar:
1. `.env.local` (local)
2. Vercel Settings → Environment Variables (producción)
3. Mi memoria de seguridad

## Datos en Firebase

Estructura RTDB:
```
/check-in-sessions/{sessionId}
  ├── initialMood: 45
  ├── finalMood: 62
  ├── city: "Santiago"
  ├── opinion: "..."
  ├── selectedAgent: "compassionate"
  ├── agentResponse: "..."
  ├── followUpResponse: "..."
  ├── status: "completed"
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

## Documenación Disponible

- `README.md` - Overview general
- `QUICK_START.md` - Inicio rápido local
- `DEBUG_GUIDE.md` - Debugging con F12
- `DEPLOY_GUIDE.md` - Deploy en Vercel (deprecated, ver DEPLOY_TO_VERCEL.md)
- `DEPLOY_TO_VERCEL.md` - Instrucciones actuales
- `IMPLEMENTATION.md` - Detalles técnicos
- `VERCEL_DEPLOYMENT.md` - Guía completa Vercel

## Para Deploy Rápido

```bash
# 1. Repositorio ya conectado:
# AlphaDocere/zero_to_agent_animomemtro

# 2. En Vercel (cuando importes):
# - Agrega las 9 variables de .env.local
# - Selecciona "Deploy"
# - Espera 2-3 minutos

# 3. Listo!
# Tu app estará en: https://[proyecto].vercel.app
```

## Próximas Mejoras (Post-MVP)

- [ ] Agregar AI real (Groq/Claude) para respuestas dinámicas
- [ ] MCP para noticias en tiempo real por ciudad
- [ ] Auth de usuarios (para rastrear históricos)
- [ ] Análisis de patrones emocionales (PostHog)
- [ ] ChatSDK para Slack/Discord/Teams
- [ ] Exportar reflexiones como PDF
- [ ] Sistema de badges/logros
- [ ] Notificaciones de apoyos recibidos

## Estado de Compilación

✅ Build: Exitoso
✅ TypeScript: Sin errores
✅ Firebase Config: Validado
✅ Discord Webhook: Configurado
✅ Entorno Local: Funcionando
✅ GitHub: Conectado

## Contacto & Soporte

Para cambiar credenciales, reportar bugs, o actualizar features:
- Actualizar `.env.local` localmente
- Hacer push a GitHub
- Vercel desplegará automáticamente

---

**Última actualización**: 5/3/2026
**Versión**: 1.0.0 (MVP)
