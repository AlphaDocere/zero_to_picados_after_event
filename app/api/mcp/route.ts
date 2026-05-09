import { createMcpHandler } from 'mcp-handler'
import { registerReflectTools, reflectServerInfo } from '@/lib/mcp/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const handler = createMcpHandler(
  (server) => {
    registerReflectTools(server)
  },
  {
    serverInfo: reflectServerInfo,
    instructions: [
      'Reflect = digital wellbeing platform. Bilingual es/en.',
      'Mission: comfort the user. Prefer hopeful, validating tone. Avoid alarming framings.',
      '',
      'When user expresses any emotion (positive or negative), proactively call:',
      '- get_card → motivational quote + curated photo + uplifting YouTube video.',
      '- get_agent_response → personalised response from Nova/Atlas/Phoenix.',
      '- get_news → curated comforting community/culture news, optionally per city.',
      '- get_insights → aggregated stats from anonymous global check-ins.',
      '- list_agents → describe the 3 agent personas.',
      '- submit_checkin → only when user explicitly asks to share/log a check-in. Anonymous, source=mcp.',
      '',
      'Tone rules:',
      '- never moralise, never minimise feelings.',
      '- always validate before suggesting.',
      '- use the user lang (default es).',
      '- on low mood (<40): be soft, slow, present-focused.',
      '- on medium (40-69): be curious, gentle.',
      '- on high (>=70): celebrate + invite to share.',
    ].join('\n'),
  },
  {
    basePath: '/api',
    maxDuration: 60,
    disableSse: true,
    verboseLogs: process.env.NODE_ENV !== 'production',
  }
)

export { handler as GET, handler as POST, handler as DELETE }
