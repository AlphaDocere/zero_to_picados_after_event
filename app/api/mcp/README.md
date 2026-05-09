# Reflect MCP Server

Reflect expone un servidor MCP remoto en `/api/mcp` (transport: Streamable HTTP). Cualquier cliente MCP — Claude.ai Custom Connectors, Claude Desktop, Cursor, MCP Inspector — puede consumir cards de bienestar y registrar check-ins anónimos sin auth.

## Connector URL

```
https://<tu-dominio>/api/mcp
```

Para Claude.ai: Settings → Connectors → Add custom connector → pegar URL.

Para Claude Desktop / clientes stdio: usar [`mcp-remote`](https://www.npmjs.com/package/mcp-remote):

```json
{
  "mcpServers": {
    "reflect": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://<tu-dominio>/api/mcp"]
    }
  }
}
```

## Auth

Sin auth en v1 (URL pública abierta). Mitigación abuse vía rate-limit Vercel + plan upgrade en v2 con OAuth.

## Tools

| Tool | Tipo | Inputs | Devuelve |
|---|---|---|---|
| `list_agents` | read | `lang?` | Array de los 3 agentes Reflect (Nova/Atlas/Phoenix) |
| `get_agent_response` | read | `agentId, initialMood, opinion, city?, lang?` | Texto personalizado del agente |
| `get_card` | read | `mood?, bucket?, lang?, seed?` | Quote + image URL + YT video link |
| `get_news` | read | `city?, lang?, limit?` | News items filtradas |
| `get_insights` | read | `topThemes?, topCities?` | Stats agregadas (totalSessions, avgMoodChange, top cities, themes, clusters) |
| `submit_checkin` | write | `initialMood, finalMood, opinion, city, agentId, ...` | `{ sessionId, shareUrl, agent }` |

`mood` 0–100; `bucket` ∈ `low|medium|high`; `lang` ∈ `es|en`; `agentId` ∈ `amplifier|documentarian|visionary`.

## Ejemplo: get_card via MCP Inspector

```json
{ "mood": 25, "lang": "es" }
```

Devuelve frase motivacional baja, imagen reconfortante, video guiado.

## Ejemplo: submit_checkin

```json
{
  "initialMood": 30,
  "finalMood": 60,
  "opinion": "Hoy estuve agotado pero compartir me ayudó.",
  "city": "Mendoza",
  "agentId": "amplifier",
  "lang": "es"
}
```

Persiste sesión anónima en RTDB con `metadata.source = "mcp"`. Aparece en `/harvest`.

## Local dev

```bash
pnpm dev
npx @modelcontextprotocol/inspector http://localhost:3000/api/mcp
```

## Logs

Cada tool registra `[v0] mcp:<tool_name>` con id/sessionId relevantes en Vercel logs.
