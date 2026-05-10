import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { generateAgentResponse } from '@/lib/agent-response'
import { agentIdSchema, citySchema, langSchema, moodSchema } from '../zod-schemas'
import { z } from 'zod'

export function registerGetAgentResponse(server: McpServer) {
  server.registerTool(
    'get_agent_response',
    {
      title: 'Get personalized companion response',
      description:
        'Generates a comforting personalized message from a Reflect companion (Nova/Atlas/Phoenix) based on the user mood (0-100), what they shared (opinion), and city. Tone always validating + hopeful. Use when user shares a feeling and wants to hear from an agent.',
      inputSchema: {
        agentId: agentIdSchema,
        initialMood: moodSchema,
        opinion: z.string().min(1).max(2000),
        city: citySchema.optional(),
        lang: langSchema.optional(),
      },
    },
    async ({ agentId, initialMood, opinion, city, lang }) => {
      const result = generateAgentResponse(agentId, {
        initialMood,
        opinion,
        city,
        lang: lang ?? 'es',
      })
      console.log('[v0] mcp:get_agent_response', { agentId, initialMood, lang })
      return {
        content: [
          { type: 'text', text: result.response },
          {
            type: 'text',
            text: JSON.stringify(
              {
                agentId: result.agentId,
                agentName: result.agentName,
                tone: result.tone,
              },
              null,
              2
            ),
          },
        ],
      }
    }
  )
}
