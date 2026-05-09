'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Sparkles, Zap, BookOpen, Flame } from 'lucide-react'
import { getAllAgents } from '@/lib/agents.config'
import { AgentCard } from '@/components/agents/agent-card'
import { useTranslation } from '@/contexts/LanguageContext'
import { CHARACTER_THEMES } from '@/lib/character-system'

const CHARACTER_IMAGES: Record<string, string> = {
  amplifier: '/characters/nova-avatar.jpg',
  documentarian: '/characters/atlas-avatar.jpg',
  visionary: '/characters/phoenix-avatar.jpg'
}

export default function AgentsPage() {
  const { t, language } = useTranslation()
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const agentsList = getAllAgents()
      setAgents(agentsList)
      setLoading(false)
    } catch (error) {
      console.error('[v0] Error loading agents:', error)
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">{t('common.next')}...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-transparent">
      {/* Hero Section with Character System Overview */}
      <section className="relative overflow-hidden px-6 py-16 border-b border-border/50">
        {/* Background gradient elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-5xl font-bold text-foreground">{t('agents.title')}</h1>
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('agents.subtitle')}</p>
            <p className="text-sm text-muted-foreground/80 max-w-3xl mx-auto">{t('agents.description')}</p>
          </div>

          {/* Character Grid Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(CHARACTER_THEMES).map(([key, theme]) => (
              <div key={key} className="group relative">
                {/* Glow */}
                <div
                  className="absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ background: `radial-gradient(circle, ${theme.colors.primary} 0%, transparent 70%)` }}
                ></div>

                {/* Card */}
                <div
                  className="relative p-6 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 group-hover:shadow-lg space-y-4"
                  style={{
                    borderColor: theme.colors.primary + '80',
                    background: `${theme.colors.primary}08`
                  }}
                >
                  {/* Character Image */}
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/20">
                    <Image
                      src={CHARACTER_IMAGES[key as keyof typeof CHARACTER_IMAGES]}
                      alt={theme.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100%, 300px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none"></div>
                  </div>

                  {/* Icon and name */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{theme.name}</h3>
                    <p className="text-xs text-muted-foreground">{theme.displayName[language as keyof typeof theme.displayName]}</p>
                  </div>

                  {/* Traits */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{language === 'es' ? 'Personalidad' : 'Personality'}</p>
                      <p className="text-sm font-medium">{theme.personality[language as keyof typeof theme.personality]}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{language === 'es' ? 'Rol' : 'Role'}</p>
                      <p className="text-sm font-medium">{theme.role[language as keyof typeof theme.role]}</p>
                    </div>
                  </div>

                  {/* Color palette preview */}
                  <div className="flex gap-2 pt-2">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white/30"
                      style={{ background: theme.colors.primary }}
                      title="Primary"
                    ></div>
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white/30"
                      style={{ background: theme.colors.secondary }}
                      title="Secondary"
                    ></div>
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white/30"
                      style={{ background: theme.colors.light }}
                      title="Light"
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              {language === 'es' ? 'Conoce a los Agentes' : 'Meet the Agents'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'es'
                ? 'Cada agente ofrece una experiencia única con juegos interactivos y análisis de memoria'
                : 'Each agent offers a unique experience with interactive games and memory analytics'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {agents.map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl p-12 text-center">
          {/* Background blur elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
          </div>

          <div className="relative space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              {language === 'es' ? 'Empieza tu Viaje' : 'Start Your Journey'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'es'
                ? 'Interactúa con cada agente, descubre patrones en tus emociones y conecta con una comunidad global.'
                : 'Interact with each agent, discover patterns in your emotions, and connect with a global community.'}
            </p>
            <div className="pt-4">
              <button
                onClick={() => document.querySelector('[data-scroll-to]')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3 rounded-full font-medium transition-all bg-primary text-primary-foreground hover:shadow-lg"
              >
                {language === 'es' ? 'Explorar Agentes' : 'Explore Agents'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
