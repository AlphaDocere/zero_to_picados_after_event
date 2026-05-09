import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { saveCheckInSession } from '@/lib/firebase'
import { generateAgentResponse } from '@/lib/agent-response'
import { agentIdSchema, citySchema, langSchema, moodSchema } from '../zod-schemas'
import { z } from 'zod'

export function registerSubmitCheckin(server: McpServer) {
  server.registerTool(
    'submit_checkin',
    {
      title: 'Submit anonymous wellbeing check-in',
      description:
        'Persists a fully anonymous check-in (initial+final mood, opinion, city, chosen companion) to the public Reflect harvest. Returns sessionId + shareable URL. Tagged source=mcp. Only call when user explicitly asks to log/share/save their check-in. Never auto-call. No identity stored.',
      inputSchema: {
        initialMood: moodSchema,
        finalMood: moodSchema,
        opinion: z.string().min(1).max(2000),
        city: citySchema,
        agentId: agentIdSchema,
        followUpResponse: z.string().max(2000).optional(),
        newsTitle: z.string().max(280).optional(),
        newsDescription: z.string().max(2000).optional(),
        lang: langSchema.optional(),
        baseUrl: z.string().url().optional(),
      },
    },
    async (input) => {
      const lang = input.lang ?? 'es'
      const agent = generateAgentResponse(input.agentId, {
        initialMood: input.initialMood,
        opinion: input.opinion,
        city: input.city,
        lang,
      })

      try {
        const sessionId = await saveCheckInSession({
          initialMood: input.initialMood,
          finalMood: input.finalMood,
          city: input.city,
          opinion: input.opinion,
          selectedAgent: input.agentId,
          agentResponse: agent.response,
          agentQuestion: '',
          followUpResponse: input.followUpResponse ?? '',
          news: {
            title: input.newsTitle ?? '',
            description: input.newsDescription ?? '',
          },
          metadata: { source: 'mcp', lang },
        })

        const base = input.baseUrl?.replace(/\/$/, '') ?? ''
        const shareUrl = base ? `${base}/harvest?session=${sessionId}` : `/harvest?session=${sessionId}`

        console.log('[v0] mcp:submit_checkin', {
          sessionId,
          city: input.city,
          agentId: input.agentId,
          lang,
        })

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  ok: true,
                  sessionId,
                  shareUrl,
                  agent: {
                    id: agent.agentId,
                    name: agent.agentName,
                    tone: agent.tone,
                    response: agent.response,
                  },
                },
                null,
                2
              ),
            },
          ],
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('[v0] mcp:submit_checkin error', message)
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `submit_checkin failed: ${message}`,
            },
          ],
        }
      }
    }
  )
}
