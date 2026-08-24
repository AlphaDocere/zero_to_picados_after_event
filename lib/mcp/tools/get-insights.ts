import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getAllSessions } from '@/lib/firebase'
import {
  analyzeCityPatterns,
  extractThemes,
  getEmotionalClusters,
} from '@/lib/insights'
import { z } from 'zod'

export function registerGetInsights(server: McpServer) {
  server.registerTool(
    'get_insights',
    {
      title: 'Get aggregated wellbeing insights',
      description:
        'Returns anonymous aggregated stats from the Reflect community: total sessions, average mood improvement, top cities, emotional clusters (rising/stable/declining), recurring themes. Read-only. Use to remind a user they are not alone, or to surface global patterns.',
      inputSchema: {
        topThemes: z.number().int().min(1).max(30).optional(),
        topCities: z.number().int().min(1).max(20).optional(),
      },
    },
    async ({ topThemes, topCities }) => {
      const allSessions = await getAllSessions()
      const sessions = allSessions.filter((s) => s.status === 'completed')
      const cityPatterns = analyzeCityPatterns(sessions)
      const themes = extractThemes(sessions.map((s) => s.opinion).filter(Boolean))
      const clusters = getEmotionalClusters(cityPatterns)

      const totalSessions = sessions.length
      const avgMoodChange =
        sessions.length === 0
          ? 0
          : Math.round(
              (sessions.reduce(
                (acc, s) => acc + (Number(s.finalMood ?? 0) - Number(s.initialMood ?? 0)),
                0
              ) /
                sessions.length) *
                10
            ) / 10

      const sortedCities = [...cityPatterns]
        .sort((a, b) => b.count - a.count)
        .slice(0, topCities ?? 5)
        .map((c) => ({ city: c.city, count: c.count, avgMood: c.avgMood, avgChange: c.avgChange }))

      console.log('[v0] mcp:get_insights', {
        totalSessions,
        avgMoodChange,
        cities: sortedCities.length,
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                totalSessions,
                avgMoodChange,
                topCities: sortedCities,
                topThemes: themes.slice(0, topThemes ?? 10),
                clusters: {
                  rising: clusters.rising.length,
                  stable: clusters.stable.length,
                  declining: clusters.declining.length,
                },
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
