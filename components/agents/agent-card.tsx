'use client'

import Image from 'next/image'
import { Heart, TrendingUp, Sparkles } from 'lucide-react'
import { useAgentMemory } from '@/hooks/use-agent-memory'
import { useAgentAnalytics } from '@/hooks/use-agent-analytics'
import { useTranslation } from '@/contexts/LanguageContext'
import { Agent } from '@/lib/types/agent'
import { AgentGame } from './agent-game'
import { getCharacterTheme } from '@/lib/character-system'

interface AgentCardProps {
  agent: Agent
  index: number
}

const AGENT_IMAGES: Record<string, string> = {
  amplifier: '/characters/nova-avatar.jpg',
  documentarian: '/characters/atlas-avatar.jpg',
  visionary: '/characters/phoenix-avatar.jpg'
}

export function AgentCard({ agent, index }: AgentCardProps) {
  const { t, language } = useTranslation()
  const { data: memory, loading: memoryLoading } = useAgentMemory(agent.id)
  const { data: analytics, loading: analyticsLoading } = useAgentAnalytics(agent.id)
  const theme = getCharacterTheme(agent.id)
  const agentImage = AGENT_IMAGES[agent.id] || AGENT_IMAGES.amplifier

  const getTranslatedTitle = () => {
    if (agent.id === 'amplifier') return t('agents.nova.title')
    if (agent.id === 'documentarian') return t('agents.atlas.title')
    if (agent.id === 'visionary') return t('agents.phoenix.title')
    return agent.title
  }

  const getTranslatedDescription = () => {
    if (agent.id === 'amplifier') return t('agents.nova.description')
    if (agent.id === 'documentarian') return t('agents.atlas.description')
    if (agent.id === 'visionary') return t('agents.phoenix.description')
    return agent.description
  }

  return (
    <div
      className={`relative group animate-in fade-in slide-in-from-bottom-4 duration-500`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Glow background */}
      <div
        className="absolute inset-0 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle, ${theme.colors.primary} 0%, transparent 70%)` }}
      ></div>

      {/* Card content */}
      <div
        className={`relative bg-gradient-to-br ${theme.bgGradient} border-2 ${theme.border} rounded-3xl p-8 space-y-6 ${theme.textColor} backdrop-blur-md hover:shadow-lg transition-all duration-300 group-hover:border-opacity-100 border-opacity-70`}
      >
        {/* Header with character image */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-6">
            {/* Character Image */}
            <div className="relative w-40 h-40 flex-shrink-0 rounded-2xl overflow-hidden border-2" style={{ borderColor: theme.colors.primary + '80' }}>
              <Image
                src={agentImage}
                alt={theme.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100px, 160px"
              />
              {/* Image overlay shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            </div>

            {/* Character Info */}
            <div className="flex-1 space-y-2">
              <div>
                <h2 className="text-3xl font-bold">{theme.name}</h2>
                <p className="text-sm font-medium opacity-80">{theme.displayName[language as keyof typeof theme.displayName]}</p>
              </div>
              <p className="text-base font-semibold opacity-90">{getTranslatedTitle()}</p>
              <p className="text-sm leading-relaxed opacity-90">{getTranslatedDescription()}</p>
            </div>
          </div>

          {/* Personality & Role */}
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="text-xs">
              <span className="opacity-60">{language === 'es' ? 'Personalidad' : 'Personality'}</span>
              <p className="font-medium">{theme.personality[language as keyof typeof theme.personality]}</p>
            </div>
            <div className="text-xs">
              <span className="opacity-60">{language === 'es' ? 'Rol' : 'Role'}</span>
              <p className="font-medium">{theme.role[language as keyof typeof theme.role]}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid with character colors */}
        {memoryLoading || analyticsLoading ? (
          <div className="grid grid-cols-2 gap-3 animate-pulse">
            <div className="h-20 bg-white/10 rounded-xl"></div>
            <div className="h-20 bg-white/10 rounded-xl"></div>
            <div className="h-20 bg-white/10 rounded-xl"></div>
            <div className="h-20 bg-white/10 rounded-xl"></div>
          </div>
        ) : memory ? (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div
              className="rounded-xl p-3 space-y-1 border-l-2"
              style={{
                background: `${theme.colors.primary}20`,
                borderColor: theme.colors.primary
              }}
            >
              <p className="text-xs opacity-70 font-medium">{language === 'es' ? 'Conversaciones' : 'Conversations'}</p>
              <p className="text-2xl font-bold">{memory.totalConversations}</p>
            </div>
            <div
              className="rounded-xl p-3 space-y-1 border-l-2"
              style={{
                background: `${theme.colors.secondary}20`,
                borderColor: theme.colors.secondary
              }}
            >
              <p className="text-xs opacity-70 font-medium">{language === 'es' ? 'Sentimiento' : 'Sentiment'}</p>
              <p className="text-2xl font-bold">{memory.averageSentiment}/100</p>
            </div>
            <div
              className="rounded-xl p-3 space-y-1 border-l-2"
              style={{
                background: `${theme.colors.light}20`,
                borderColor: theme.colors.light
              }}
            >
              <p className="text-xs opacity-70 font-medium">{language === 'es' ? 'Activo' : 'Last Active'}</p>
              <p className="text-xs font-semibold">
                {Math.round((Date.now() - memory.lastActivity) / 1000)}s {language === 'es' ? 'atrás' : 'ago'}
              </p>
            </div>
            <div
              className="rounded-xl p-3 space-y-1 border-l-2"
              style={{
                background: `${theme.colors.primary}20`,
                borderColor: theme.colors.primary
              }}
            >
              <p className="text-xs opacity-70 font-medium">{language === 'es' ? 'Tema' : 'Top Theme'}</p>
              <p className="text-xs font-semibold">{memory.themes[0] || '—'}</p>
            </div>
          </div>
        ) : null}

        {/* Memory Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Heart className="w-4 h-4" style={{ color: theme.colors.primary }} />
            {t('agents.memory.title')}
          </h3>
          {memoryLoading ? (
            <div className="space-y-2">
              <div className="h-12 bg-white/10 rounded-lg animate-pulse"></div>
              <div className="h-12 bg-white/10 rounded-lg animate-pulse"></div>
            </div>
          ) : memory && memory.recentConversations.length > 0 ? (
            <div className="space-y-2">
              {memory.recentConversations.slice(0, 2).map((conv) => (
                <div
                  key={conv.id}
                  className="rounded-lg p-3 space-y-1 border border-white/10 hover:border-white/20 transition-colors"
                  style={{ background: `${theme.colors.primary}10` }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold opacity-80">{conv.city}</p>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{
                        background: theme.colors.primary,
                        color: '#000'
                      }}
                    >
                      {conv.sentiment}/100
                    </span>
                  </div>
                  <p className="text-sm italic opacity-90">"{conv.userInput.slice(0, 50)}..."</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-70">{t('agents.memory.noConversations')}</p>
          )}
        </div>

        {/* Analytics Preview */}
        {analytics && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: theme.colors.secondary }} />
              {t('agents.analytics.title')}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className="rounded-lg p-2 text-center"
                style={{ background: `${theme.colors.secondary}20` }}
              >
                <p className="opacity-70">{language === 'es' ? 'Tendencia' : 'Trend'}</p>
                <p
                  className="font-bold text-lg"
                  style={{ color: theme.colors.light }}
                >
                  +{Math.round((analytics.sentimentTrend[analytics.sentimentTrend.length - 1] - analytics.sentimentTrend[0]) * 10) / 10}
                </p>
              </div>
              <div
                className="rounded-lg p-2 text-center"
                style={{ background: `${theme.colors.primary}20` }}
              >
                <p className="opacity-70">{language === 'es' ? 'Ciudades' : 'Cities'}</p>
                <p className="font-bold text-lg">{analytics.engagementByCity.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Game Section */}
        <AgentGame agentId={agent.id} agentName={agent.name} />

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
          <Sparkles className="w-6 h-6" style={{ color: theme.colors.primary }} />
        </div>
      </div>
    </div>
  )
}
