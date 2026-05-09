import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import news from '@/data/news.json'
import { citySchema, langSchema } from '../zod-schemas'
import { z } from 'zod'

interface NewsEntry {
  id: number
  city: string
  headline: { es: string; en: string }
  summary: { es: string; en: string }
  category: string
  date: string
}

export function registerGetNews(server: McpServer) {
  server.registerTool(
    'get_news',
    {
      title: 'Get comforting community news',
      description:
        'Returns curated, comforting community/culture/health news (no crime, politics, or alarming items), bilingual, optionally filtered by city. Use to lift mood, ground a low-mood user in good things happening, or open a check-in.',
      inputSchema: {
        city: citySchema.optional(),
        lang: langSchema.optional(),
        limit: z.number().int().min(1).max(20).optional(),
        category: z
          .enum(['Comunidad', 'Cultura', 'Salud', 'Educacion', 'Ambiente', 'Deportes', 'Tecnologia'])
          .optional(),
      },
    },
    async ({ city, lang, limit, category }) => {
      const resolvedLang = lang ?? 'es'
      const items = news as NewsEntry[]
      const blockedCategories = new Set(['Crimen', 'Politica', 'Conflicto'])
      let filtered = items.filter((n) => !blockedCategories.has(n.category))
      if (city) {
        filtered = filtered.filter((n) => n.city.toLowerCase() === city.toLowerCase())
      }
      if (category) {
        filtered = filtered.filter((n) => n.category === category)
      }
      const sliced = filtered.slice(0, limit ?? 5).map((n) => ({
        id: n.id,
        city: n.city,
        headline: n.headline[resolvedLang],
        summary: n.summary[resolvedLang],
        category: n.category,
        date: n.date,
      }))

      console.log('[v0] mcp:get_news', {
        city,
        lang: resolvedLang,
        category,
        count: sliced.length,
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { lang: resolvedLang, city: city ?? null, category: category ?? null, items: sliced },
              null,
              2
            ),
          },
        ],
      }
    }
  )
}
