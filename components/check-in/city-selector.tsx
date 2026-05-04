"use client"

import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/contexts/LanguageContext"
import { useState, useEffect } from "react"

interface CitySelectorProps {
  value: string
  onChange: (value: string) => void
  agentId?: string
}

interface RecommendationsData {
  generatedAt: string
  lastUpdated: string
  description: string
  agents: Array<{
    agentId: string
    agentName: string
    description: string
    cities: string[]
    news: Array<{
      title: string
      description: string
      emoji: string
      theme: string
      motivationIndex: number
    }>
    emotions: string[]
    teamBuildingLessons: string[]
  }>
  events: Record<string, any>
  motivationalThemes: Record<string, string>
  cityEmojis: Record<string, string>
  fallbackNews?: Record<string, any[]>
}

export function CitySelector({ value, onChange, agentId }: CitySelectorProps) {
  const { t } = useTranslation()
  const [dynamicCities, setDynamicCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDynamicCities = async () => {
      try {
        const response = await fetch('/agent-recommendations.json')
        if (!response.ok) throw new Error('Failed to load recommendations')
        
        const data: RecommendationsData = await response.json()
        
        if (agentId && data.agents) {
          const agentRecommendations = data.agents.find(a => a.agentId === agentId)
          if (agentRecommendations?.cities && Array.isArray(agentRecommendations.cities) && agentRecommendations.cities.length > 0) {
            setDynamicCities(agentRecommendations.cities)
            console.log('[v0] Loaded dynamic cities for', agentId, ':', agentRecommendations.cities)
          } else {
            console.warn('[v0] No cities found for agent', agentId, ', using defaults')
            setDynamicCities([])
          }
        }
      } catch (error) {
        console.error('[v0] Error loading dynamic cities:', error)
        setDynamicCities([])
      } finally {
        setLoading(false)
      }
    }

    loadDynamicCities()
  }, [agentId])

  // Fallback cities if dynamic not loaded
  const defaultCities = [
    { name: "Santiago", icon: "🏔️", country: "Chile" },
    { name: "Mendoza", icon: "🍷", country: "Argentina" },
    { name: "Buenos Aires", icon: "🎭", country: "Argentina" },
    { name: "Lima", icon: "🌊", country: "Peru" },
    { name: "Bogota", icon: "🌿", country: "Colombia" },
  ]

  // Use dynamic cities if available, otherwise use defaults
  const citiesToDisplay = dynamicCities.length > 0 
    ? dynamicCities.map(name => ({
        name,
        icon: getEmojiForCity(name),
        country: getCountryForCity(name)
      }))
    : defaultCities

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-2">
          <MapPin className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t('checkin.city.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('checkin.city.description')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {citiesToDisplay.map((city) => (
          <button
            key={city.name}
            onClick={() => onChange(city.name)}
            disabled={loading}
            className={cn(
              "group relative flex flex-col items-start gap-1 p-4 rounded-2xl border-2 transition-all duration-300",
              "hover:scale-[1.03] active:scale-[0.97]",
              loading && "opacity-50 cursor-wait",
              value === city.name
                ? "border-primary bg-gradient-to-br from-primary/10 to-accent/10 shadow-xl shadow-primary/20"
                : "border-border bg-card hover:border-primary/50 hover:shadow-lg"
            )}
          >
            <span className={cn(
              "text-3xl transition-transform duration-300",
              value === city.name ? "scale-110" : "group-hover:scale-110"
            )}>
              {city.icon}
            </span>
            <div className="text-left">
              <span className={cn(
                "font-semibold text-sm block",
                value === city.name ? "text-primary" : "text-foreground"
              )}>
                {city.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {city.country}
              </span>
            </div>
            {value === city.name && (
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary animate-pulse-soft" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function getEmojiForCity(city: string): string {
  const emojiMap: Record<string, string> = {
    "Santiago": "🏔️",
    "Mendoza": "🍷",
    "Buenos Aires": "🎭",
    "Lima": "🌊",
    "Bogota": "🌿",
    "Mexico City": "🌮",
    "Madrid": "☀️",
    "Barcelona": "🏛️",
    "São Paulo": "🎆",
    "Miami": "🌴",
    "Nueva York": "🗽",
    "Londres": "👑",
    "Paris": "✨",
    "Berlin": "🏰",
    "Amsterdam": "🚲",
    "Tokyo": "🌸",
    "Bangkok": "🏯",
    "Estambul": "🕌",
    "Dubai": "🌆",
    "Sydney": "🦘",
    "Toronto": "🍁",
    "Ciudad de Mexico": "🦅",
  }
  return emojiMap[city] || "📍"
}

function getCountryForCity(city: string): string {
  const countryMap: Record<string, string> = {
    "Santiago": "Chile",
    "Mendoza": "Argentina",
    "Buenos Aires": "Argentina",
    "Lima": "Peru",
    "Bogota": "Colombia",
    "Mexico City": "Mexico",
    "Madrid": "Spain",
    "Barcelona": "Spain",
    "São Paulo": "Brazil",
    "Miami": "USA",
    "Nueva York": "USA",
    "Londres": "UK",
    "Paris": "France",
    "Berlin": "Germany",
    "Amsterdam": "Netherlands",
    "Tokyo": "Japan",
    "Bangkok": "Thailand",
    "Estambul": "Turkey",
    "Dubai": "UAE",
    "Sydney": "Australia",
    "Toronto": "Canada",
    "Ciudad de Mexico": "Mexico",
  }
  return countryMap[city] || "Unknown"
}
