"use client"

import { useState, useEffect, useMemo } from "react"
import { Newspaper, Calendar, Sparkles, RotateCw } from "lucide-react"
import newsData from "@/data/news.json"
import { useTranslation } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

interface MoodAdaptiveNewsProps {
  city: string
  mood: number
  onEmotionsReady?: (emotions: { label: string; emoji: string }[]) => void
}

interface NewsItem {
  id: number
  city: string
  headline: { es: string; en: string }
  summary: { es: string; en: string }
  category: string
  date: string
  moodAffinity?: string
  moodTags?: string[]
  emoji?: string
}

// Mood-based emotion templates (8 per range)
const MOOD_EMOTIONS: Record<string, { label: string; emoji: string }[]> = {
  low: [
    { label: "Reconfortado/a", emoji: "🫂" },
    { label: "Esperanzado/a", emoji: "🌟" },
    { label: "Reflexivo/a", emoji: "🤔" },
    { label: "Agradecido/a", emoji: "🙏" },
    { label: "Sereno/a", emoji: "🕊️" },
    { label: "Vulnerable", emoji: "💧" },
    { label: "Nostálgico/a", emoji: "🌅" },
    { label: "Comprendido/a", emoji: "💛" },
  ],
  medium: [
    { label: "Curioso/a", emoji: "🔍" },
    { label: "Inspirado/a", emoji: "💡" },
    { label: "Pensativo/a", emoji: "💭" },
    { label: "Conectado/a", emoji: "🤝" },
    { label: "Contemplativo/a", emoji: "🌊" },
    { label: "Determinado/a", emoji: "🎯" },
    { label: "Abierto/a", emoji: "🌻" },
    { label: "Intrigado/a", emoji: "🧩" },
  ],
  high: [
    { label: "Energético/a", emoji: "⚡" },
    { label: "Motivado/a", emoji: "🚀" },
    { label: "Entusiasmado/a", emoji: "🎉" },
    { label: "Empoderado/a", emoji: "💪" },
    { label: "Radiante", emoji: "🌞" },
    { label: "Creativo/a", emoji: "🎨" },
    { label: "Imparable", emoji: "🔥" },
    { label: "Pleno/a", emoji: "✨" },
  ],
}

// Visual mood mapping
function getMoodVisuals(mood: number) {
  if (mood < 20) return { gradient: "from-rose-500/20 to-pink-500/20", border: "border-rose-400/40", accent: "text-rose-400", pill: "bg-rose-500/20 text-rose-300", icon: "😔" }
  if (mood < 40) return { gradient: "from-amber-500/20 to-orange-500/20", border: "border-amber-400/40", accent: "text-amber-400", pill: "bg-amber-500/20 text-amber-300", icon: "😐" }
  if (mood < 55) return { gradient: "from-sky-500/20 to-cyan-500/20", border: "border-sky-400/40", accent: "text-sky-400", pill: "bg-sky-500/20 text-sky-300", icon: "🙂" }
  if (mood < 70) return { gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-400/40", accent: "text-emerald-400", pill: "bg-emerald-500/20 text-emerald-300", icon: "😊" }
  if (mood < 85) return { gradient: "from-violet-500/20 to-purple-500/20", border: "border-violet-400/40", accent: "text-violet-400", pill: "bg-violet-500/20 text-violet-300", icon: "😄" }
  return { gradient: "from-fuchsia-500/20 to-pink-500/20", border: "border-fuchsia-400/40", accent: "text-fuchsia-400", pill: "bg-fuchsia-500/20 text-fuchsia-300", icon: "🤩" }
}

function getMoodCategory(mood: number): string {
  if (mood < 40) return "low"
  if (mood <= 70) return "medium"
  return "high"
}

export function MoodAdaptiveNews({ city, mood, onEmotionsReady }: MoodAdaptiveNewsProps) {
  const { language } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)

  const moodCategory = getMoodCategory(mood)
  const visuals = getMoodVisuals(mood)

  // Filter and sort news by city and mood affinity
  const filteredNews = useMemo(() => {
    const cityNews = (newsData as NewsItem[]).filter((item) => item.city === city)
    
    if (cityNews.length === 0) return []

    // Prioritize matching mood affinity, then include others
    const prioritized = cityNews.sort((a, b) => {
      const aMatch = a.moodAffinity === moodCategory ? 1 : 0
      const bMatch = b.moodAffinity === moodCategory ? 1 : 0
      return bMatch - aMatch
    })

    return prioritized.slice(0, 3) // Show max 3 news items
  }, [city, moodCategory])

  const currentNews = filteredNews[currentIndex]

  // Generate and pass dynamic emotions scaled by mood percentage
  useEffect(() => {
    if (filteredNews.length > 0 && onEmotionsReady) {
      const allEmotions = MOOD_EMOTIONS[moodCategory] || MOOD_EMOTIONS.medium
      let count: number
      if (mood < 25) count = 3
      else if (mood < 40) count = 4
      else if (mood < 55) count = 4
      else if (mood < 70) count = 5
      else if (mood < 85) count = 5
      else count = 6
      
      onEmotionsReady(allEmotions.slice(0, count))
    }
  }, [filteredNews, moodCategory, mood, onEmotionsReady])

  const getText = (bilingual: { es: string; en: string }) => {
    if (language === "en" && bilingual.en) return bilingual.en
    return bilingual.es || ""
  }

  // Tap card to flip to next news
  const handleFlip = () => {
    if (isFlipping || filteredNews.length <= 1) return
    setIsFlipping(true)

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredNews.length)
    }, 250) // Switch content at peak of flip

    setTimeout(() => setIsFlipping(false), 500)
  }

  if (filteredNews.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-2">
            <Newspaper className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Noticias de {city}</h2>
          <p className="text-sm text-muted-foreground">No hay noticias disponibles para tu ubicación</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-2">
          <Newspaper className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Noticias de {city}</h2>
        <p className="text-sm text-muted-foreground">Contenido adaptado a cómo te sientes</p>
      </div>

      {/* Mood Indicator Pill */}
      <div className="flex justify-center">
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500",
          visuals.pill
        )}>
          <Sparkles className="w-4 h-4" />
          <span>{visuals.icon} Ánimo: {mood}/100</span>
          <span className="opacity-60">·</span>
          <span className="opacity-80">Noticias adaptadas</span>
        </div>
      </div>

      {/* Flip Card — tap to rotate */}
      {currentNews && (
        <div
          style={{ perspective: "1000px" }}
        >
          <div
            onClick={handleFlip}
            className={cn(
              "group p-6 rounded-3xl bg-gradient-to-br border-2 shadow-lg space-y-4 transition-transform duration-500 cursor-pointer",
              visuals.gradient,
              visuals.border,
              filteredNews.length > 1 ? "active:scale-[0.97]" : "",
              isFlipping ? "[transform:rotateY(90deg)]" : "[transform:rotateY(0deg)]"
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Top row: emoji + category + date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentNews.emoji || "📰"}</span>
                <span className={cn(
                  "px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-md"
                )}>
                  {currentNews.category}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(currentNews.date).toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Headline */}
            <h3 className={cn(
              "text-xl font-bold leading-snug transition-colors",
              visuals.accent
            )}>
              {getText(currentNews.headline)}
            </h3>

            {/* Summary */}
            <p className="text-muted-foreground leading-relaxed">
              {getText(currentNews.summary)}
            </p>

            {/* Mood Tags */}
            {currentNews.moodTags && currentNews.moodTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentNews.moodTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs rounded-full bg-white/10 text-muted-foreground border border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Tap hint */}
            {filteredNews.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
                <RotateCw className="w-3.5 h-3.5 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground/50">
                  Toca para ver otra noticia · {currentIndex + 1}/{filteredNews.length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dots indicator */}
      {filteredNews.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {filteredNews.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === currentIndex
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
