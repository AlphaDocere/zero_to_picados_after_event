import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerListAgents } from './tools/list-agents'
import { registerGetAgentResponse } from './tools/get-agent-response'
import { registerGetCard } from './tools/get-card'
import { registerGetNews } from './tools/get-news'
import { registerGetInsights } from './tools/get-insights'
import { registerSubmitCheckin } from './tools/submit-checkin'

export function registerReflectTools(server: McpServer) {
  registerListAgents(server)
  registerGetAgentResponse(server)
  registerGetCard(server)
  registerGetNews(server)
  registerGetInsights(server)
  registerSubmitCheckin(server)
}

export const reflectServerInfo = {
  name: 'reflect',
  version: '1.2.1',
}
