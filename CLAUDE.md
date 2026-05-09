# Reflect — Claude Code notes

## MCP server

Reflect expone un servidor MCP remoto en `app/api/mcp/route.ts` (Streamable HTTP, sin auth). URL pública: `https://<dominio>/api/mcp`.

Tools registradas (`lib/mcp/server.ts`):

- `list_agents` — read. Devuelve los 3 agentes (Nova/Atlas/Phoenix).
- `get_agent_response` — read. Respuesta personalizada por agente sobre `(agentId, initialMood, opinion, city?, lang?)`.
- `get_card` — read. Card de bienestar `(quote + image URL + YT video)` por mood bucket.
- `get_news` — read. News bilingües filtradas por ciudad.
- `get_insights` — read. Stats agregadas de sesiones (`getAllSessions` + `lib/insights.ts`).
- `submit_checkin` — write. Persiste sesión anónima vía `saveCheckInSession` con `metadata.source = "mcp"`.

Logs: cada tool emite `[v0] mcp:<tool_name>`.

Convenciones:

- Inputs validados con Zod (`lib/mcp/zod-schemas.ts`).
- Sólo bloques `text` en `content[]` (URLs en markdown). Sin `image`/`mcp-ui` en v1 — Claude.ai aún no soporta image-by-URL consistentemente.
- Datos curados en `data/quotes.json`, `data/videos.json`, `data/images.json` (bilingual + mood bucket).

Ver `app/api/mcp/README.md` para connector URL y ejemplos.
