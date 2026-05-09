import * as fs from 'fs'
import * as path from 'path'
import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

/**
 * One-time translation script - run during build to translate external content
 * If GROQ_API_KEY is not set, uses demo mode (copies Spanish to EN)
 * Usage: node -r tsx scripts/translate-external-content.ts
 */

const DATA_DIR = path.join(process.cwd(), 'data')
const USE_DEMO_MODE = !process.env.GROQ_API_KEY && !process.env.AI_GATEWAY_API_KEY

interface BilingualField {
  es: string
  en: string
}

interface TranslatedAgents {
  id: string
  name: BilingualField
  role: BilingualField
  avatar: string
  color: string
  bgColor: string
  description: BilingualField
  style: string
  responses: {
    low: BilingualField
    medium: BilingualField
    high: BilingualField
  }
  followUpQuestions: {
    low: BilingualField
    medium: BilingualField
    high: BilingualField
  }
}

interface TranslatedNews {
  id: number
  city: string
  headline: BilingualField
  summary: BilingualField
  category: string
  date: string
}

async function translateText(text: string): Promise<string> {
  if (!text) return ''

  if (USE_DEMO_MODE) {
    // In demo mode, return the same text
    return text
  }

  try {
    const { text: translated } = await generateText({
      model: groq('mixtral-8x7b-32768'),
      prompt: `Translate the following Spanish text to English. Keep the tone, style, and meaning intact. Only return the translation, no explanations.

Spanish text:
${text}

English translation:`,
      temperature: 0.3,
      maxTokens: 500,
    })

    return translated.trim()
  } catch (error) {
    console.error(`Failed to translate: ${text.substring(0, 50)}...`)
    throw error
  }
}

async function translateAgents(): Promise<void> {
  const agentsPath = path.join(DATA_DIR, 'agents.json')
  const originalAgents = JSON.parse(fs.readFileSync(agentsPath, 'utf-8'))

  console.log('Translating agents content...')

  const translatedAgents: TranslatedAgents[] = []

  for (const agent of originalAgents) {
    const agentName = typeof agent.name === 'string' ? agent.name : agent.name.es
    console.log(`Translating agent: ${agentName}`)

    const getEsText = (field: string | { es: string; en: string }) =>
      typeof field === 'string' ? field : field.es

    const translatedAgent: TranslatedAgents = {
      ...agent,
      name: { es: getEsText(agent.name), en: await translateText(getEsText(agent.name)) },
      role: { es: getEsText(agent.role), en: await translateText(getEsText(agent.role)) },
      description: {
        es: getEsText(agent.description),
        en: await translateText(getEsText(agent.description)),
      },
      responses: {
        low: {
          es: getEsText(agent.responses.low),
          en: await translateText(getEsText(agent.responses.low)),
        },
        medium: {
          es: getEsText(agent.responses.medium),
          en: await translateText(getEsText(agent.responses.medium)),
        },
        high: {
          es: getEsText(agent.responses.high),
          en: await translateText(getEsText(agent.responses.high)),
        },
      },
      followUpQuestions: {
        low: {
          es: getEsText(agent.followUpQuestions.low),
          en: await translateText(getEsText(agent.followUpQuestions.low)),
        },
        medium: {
          es: getEsText(agent.followUpQuestions.medium),
          en: await translateText(getEsText(agent.followUpQuestions.medium)),
        },
        high: {
          es: getEsText(agent.followUpQuestions.high),
          en: await translateText(getEsText(agent.followUpQuestions.high)),
        },
      },
    }

    translatedAgents.push(translatedAgent)
  }

  fs.writeFileSync(agentsPath, JSON.stringify(translatedAgents, null, 2))
  console.log(`Agents translated and saved to ${agentsPath}`)
}

async function translateNews(): Promise<void> {
  const newsPath = path.join(DATA_DIR, 'news.json')
  const originalNews = JSON.parse(fs.readFileSync(newsPath, 'utf-8'))

  console.log('Translating news content...')

  const translatedNews: TranslatedNews[] = []

  for (const newsItem of originalNews) {
    // Handle both string and object formats
    const headlineText = typeof newsItem.headline === 'string' 
      ? newsItem.headline 
      : newsItem.headline.es || newsItem.headline.en || ''
    const summaryText = typeof newsItem.summary === 'string'
      ? newsItem.summary
      : newsItem.summary.es || newsItem.summary.en || ''

    console.log(
      `Translating news: ${headlineText.substring(0, 50)}...`
    )

    const translatedItem: TranslatedNews = {
      ...newsItem,
      headline: {
        es: typeof newsItem.headline === 'string' ? newsItem.headline : newsItem.headline.es,
        en: await translateText(headlineText),
      },
      summary: {
        es: typeof newsItem.summary === 'string' ? newsItem.summary : newsItem.summary.es,
        en: await translateText(summaryText),
      },
    }

    translatedNews.push(translatedItem)
  }

  fs.writeFileSync(newsPath, JSON.stringify(translatedNews, null, 2))
  console.log(`News translated and saved to ${newsPath}`)
}

async function main(): Promise<void> {
  const apiKey = process.env.GROQ_API_KEY || process.env.AI_GATEWAY_API_KEY

  try {
    if (USE_DEMO_MODE) {
      console.log('Running in DEMO MODE (no API key found)')
      console.log('Spanish content is copied to EN fields')
      console.log('For production: Set GROQ_API_KEY environment variable')
    } else {
      console.log('Starting one-time translation of external content...')
      console.log(`Using API key: ${apiKey?.substring(0, 10)}...`)
    }

    await translateAgents()
    console.log('---')
    await translateNews()

    console.log('')
    if (USE_DEMO_MODE) {
      console.log('✓ Demo mode complete!')
      console.log('All external content now has bilingual ES/EN structure')
      console.log('IMPORTANT: For production deployment, translate with real API:')
      console.log('  GROQ_API_KEY=gsk_... npm run build:translate')
    } else {
      console.log('✓ Translation complete!')
      console.log('All external content translated to English via Groq')
    }
  } catch (error) {
    console.error('Translation failed:', error)
    process.exit(1)
  }
}

main()
