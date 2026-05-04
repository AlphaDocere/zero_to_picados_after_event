'use client'

import Image from 'next/image'
import { getCharacterTheme } from '@/lib/character-system'
import { useTranslation } from '@/contexts/LanguageContext'

interface AgentShowcaseProps {
  agentId: string
}

export function AgentShowcase({ agentId }: AgentShowcaseProps) {
  const { language } = useTranslation()
  const theme = getCharacterTheme(agentId)

  const characterImages: Record<string, string> = {
    amplifier: '/characters/nova-avatar.jpg',
    documentarian: '/characters/atlas-avatar.jpg',
    visionary: '/characters/phoenix-avatar.jpg'
  }

  const image = characterImages[agentId]

  return (
    <div className="relative w-full max-w-xs mx-auto">
      {/* Glow effect */}
      <div
        className="absolute inset-0 blur-3xl rounded-full opacity-30"
        style={{ background: `radial-gradient(circle, ${theme.colors.primary} 0%, transparent 70%)` }}
      ></div>

      {/* Character image */}
      <div className="relative rounded-2xl overflow-hidden border-2" style={{ borderColor: theme.colors.primary }}>
        <Image
          src={image}
          alt={theme.name}
          width={300}
          height={300}
          className="w-full h-auto object-cover"
          priority
        />

        {/* Character name overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
        >
          <p className="text-white font-bold text-xl">{theme.name}</p>
          <p className="text-sm opacity-80">{theme.displayName[language as keyof typeof theme.displayName]}</p>
        </div>
      </div>

      {/* Character traits */}
      <div className="mt-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-3 rounded-lg text-center"
            style={{ background: `${theme.colors.primary}20` }}
          >
            <p className="text-xs opacity-70 mb-1">{language === 'es' ? 'Personalidad' : 'Personality'}</p>
            <p className="text-sm font-semibold">
              {theme.personality[language as keyof typeof theme.personality]}
            </p>
          </div>
          <div
            className="p-3 rounded-lg text-center"
            style={{ background: `${theme.colors.secondary}20` }}
          >
            <p className="text-xs opacity-70 mb-1">{language === 'es' ? 'Rol' : 'Role'}</p>
            <p className="text-sm font-semibold">
              {theme.role[language as keyof typeof theme.role]}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
