import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getAllAgents } from '@/lib/agents.config'
import { langSchema } from '../zod-schemas'

export function registerListAgents(server: McpServer) {
  server.registerTool(
    'list_agents',
    {
      title: 'List Reflect agents',
      description:
        'Returns the 3 Reflect wellbeing companions (Nova=Amplifier/empathy, Atlas=Documentarian/witness, Phoenix=Visionary/transformation). Call when user wants to pick a companion or asks who is available.',
      inputSchema: {
        lang: langSchema.optional(),
      },
    },
    async ({ lang }) => {
      const agents = getAllAgents().map((a) => ({
        id: a.id,
        name: a.name,
        title: a.title,
        role: a.role,
        tone: a.tone,
        description: a.description,
        externalService: a.externalService,
      }))
      console.log('[v0] mcp:list_agents', { lang: lang ?? 'es', count: agents.length })
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ lang: lang ?? 'es', agents }, null, 2),
          },
        ],
      }
    }
  )
}

