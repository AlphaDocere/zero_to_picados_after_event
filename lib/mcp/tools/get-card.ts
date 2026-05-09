import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import quotes from '@/data/quotes.json'
import images from '@/data/images.json'
import videos from '@/data/videos.json'
import {
  langSchema,
  moodBucketSchema,
  moodSchema,
  moodToBucket,
} from '../zod-schemas'
import { z } from 'zod'

interface QuoteEntry {
  id: number
  mood: 'low' | 'medium' | 'high'
  text: { es: string; en: string }
  tags: string[]
}
interface ImageEntry {
  id: number
  url: string
  mood: 'low' | 'medium' | 'high'
  alt: { es: string; en: string }
  tags: string[]
}
interface VideoEntry {
  id: number
  url: string
  mood: 'low' | 'medium' | 'high'
  title: { es: string; en: string }
  tags: string[]
}

function pickRandom<T>(arr: T[], seed?: number): T {
  if (typeof seed === 'number') {
    const idx = Math.abs(Math.floor(seed)) % arr.length
    return arr[idx]
  }
  return arr[Math.floor(Math.random() * arr.length)]
}

export function registerGetCard(server: McpServer) {
  server.registerTool(
    'get_card',
    {
      title: 'Get wellbeing card',
      description:
        'Returns a comforting card: motivational quote + curated photo URL + uplifting YouTube video, tuned to user mood (0-100) or bucket (low/medium/high). Use whenever user feels something — sad, anxious, grateful, joyful — to offer immediate support. Bilingual es/en.',
      inputSchema: {
        mood: moodSchema.optional(),
        bucket: moodBucketSchema.optional(),
        lang: langSchema.optional(),
        seed: z.number().int().optional(),
      },
    },
    async ({ mood, bucket, lang, seed }) => {
      const resolvedLang = lang ?? 'es'
      const resolvedBucket = bucket ?? (mood !== undefined ? moodToBucket(mood) : 'medium')

      const qs = (quotes as QuoteEntry[]).filter((q) => q.mood === resolvedBucket)
      const imgs = (images as ImageEntry[]).filter((i) => i.mood === resolvedBucket)
      const vids = (videos as VideoEntry[]).filter((v) => v.mood === resolvedBucket)

      const quote = pickRandom(qs.length ? qs : (quotes as QuoteEntry[]), seed)
      const image = pickRandom(imgs.length ? imgs : (images as ImageEntry[]), seed)
      const video = pickRandom(vids.length ? vids : (videos as VideoEntry[]), seed)

      const quoteText = quote.text[resolvedLang]
      const altText = image.alt[resolvedLang]
      const videoTitle = video.title[resolvedLang]

      console.log('[v0] mcp:get_card', {
        bucket: resolvedBucket,
        lang: resolvedLang,
        quoteId: quote.id,
        imageId: image.id,
        videoId: video.id,
        moodInput: mood,
      })

      const recommendedLabel = resolvedLang === 'en' ? 'Recommended video' : 'Video recomendado'
      const bucketLabel = resolvedBucket.toUpperCase()
      const moodLabel = mood ?? resolvedBucket

      const cardText = [
        `![${altText}](${image.url})`,
        '',
        `> ${quoteText}`,
        '',
        `#${bucketLabel} · mood ${moodLabel}`,
        '',
        `${recommendedLabel}: [${videoTitle}](${video.url})`,
      ].join('\n')

      return {
        content: [
          { type: 'text', text: cardText },
          {
            type: 'text',
            text: JSON.stringify(
              {
                bucket: resolvedBucket,
                lang: resolvedLang,
                quote: { id: quote.id, text: quoteText, tags: quote.tags },
                image: { id: image.id, url: image.url, alt: altText, tags: image.tags },
                video: { id: video.id, title: videoTitle, url: video.url, tags: video.tags },
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
