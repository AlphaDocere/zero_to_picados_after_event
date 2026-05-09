"use client"

import { useEffect, useState, useCallback } from "react"
import { Newspaper, Calendar, Sparkles, RefreshCw, Heart, Zap, Sun, Moon } from "lucide-react"
import newsData from "@/data/news.json"
import { useTranslation } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

interface MoodAdaptiveNewsProps {
  city: string
  mood: number
}

interface NewsItem {
  id: number
  city: string
  headline: { es: string; en: string }
  summary: { es: string; en: string }
  category: string
  date: string
  moodAffinity: string
  moodTags: string[]
  visualTone: string
  emoji: string
}

function getMoodCategory(mood: number): string {
  if (mood < 40) return "low"
  if (mood < 70) return "medium"
  if (mood < 100) return "high"
  return "transcendent"
}

function getMoodConfig(mood: number) {
  if (mood < 20) return {
    label: "Noticias para reconfortarte",
    sublabel: "Contenido seleccionado para acompañarte",
    icon: Heart,
    gradient: "from-rose-400/20 via-amber-400/10 to-orange-400/20",
    borderColor: "border-rose-400/40",
    accentGradient: "from-rose-400 to-amber-500",
    bgGlow: "shadow-rose-500/20",
    tagBg: "bg-rose-500/20 text-rose-300",
    cardBg: "from-rose-950/40 via-amber-950/20 to-rose-950/40",
  }
  if (mood < 40) return {
    label: "Noticias que dan calma",
    sublabel: "Historias que inspiran serenidad",
    icon: Moon,
    gradient: "from-amber-400/20 via-orange-400/10 to-yellow-400/20",
    borderColor: "border-amber-400/40",
    accentGradient: "from-amber-400 to-yellow-500",
    bgGlow: "shadow-amber-500/20",
    tagBg: "bg-amber-500/20 text-amber-300",
    cardBg: "from-amber-950/40 via-orange-950/20 to-amber-950/40",
  }
  if (mood < 60) return {
    label: "Noticias para reflexionar",
    sublabel: "Perspectivas que invitan a pensar",
    icon: Sun,
    gradient: "from-sky-400/20 via-blue-400/10 to-indigo-400/20",
    borderColor: "border-sky-400/40",
    accentGradient: "from-sky-400 to-blue-500",
    bgGlow: "shadow-sky-500/20",
    tagBg: "bg-sky-500/20 text-sky-300",
    cardBg: "from-sky-950/40 via-blue-950/20 to-sky-950/40",
  }
  if (mood < 80) return {
    label: "Noticias con buena energía",
    sublabel: "Historias que amplifican tu momento",
    icon: Zap,
    gradient: "from-emerald-400/20 via-teal-400/10 to-cyan-400/20",
    borderColor: "border-emerald-400/40",
    accentGradient: "from-emerald-400 to-teal-500",
    bgGlow: "shadow-emerald-500/20",
    tagBg: "bg-emerald-500/20 text-emerald-300",
    cardBg: "from-emerald-950/40 via-teal-950/20 to-emerald-950/40",
  }
  if (mood < 100) return {
    label: "¡Noticias que celebran!",
    sublabel: "El mundo vibra contigo",
    icon: Sparkles,
    gradient: "from-violet-400/20 via-purple-400/10 to-fuchsia-400/20",
    borderColor: "border-violet-400/40",
    accentGradient: "from-violet-400 to-purple-500",
    bgGlow: "shadow-violet-500/20",
    tagBg: "bg-violet-500/20 text-violet-300",
    cardBg: "from-violet-950/40 via-purple-950/20 to-violet-950/40",
  }
  return {
    label: "✨ Noticias trascendentes",
    sublabel: "Para mentes en estado de flow",
    icon: Sparkles,
    gradient: "from-fuchsia-400/20 via-pink-400/10 to-rose-400/20",
    borderColor: "border-fuchsia-400/40",
    accentGradient: "from-fuchsia-400 via-pink-500 to-rose-500",
    bgGlow: "shadow-fuchsia-500/20",
    tagBg: "bg-fuchsia-500/20 text-fuchsia-300",
    cardBg: "from-fuchsia-950/40 via-pink-950/20 to-fuchsia-950/40",
  }
}

function filterNewsByMoodAndCity(city: string, mood: number): NewsItem[] {
  const moodCategory = getMoodCategory(mood)
  const allNewsTyped = newsData as NewsItem[]

  // 1. Get news for this city with matching mood
  const cityMoodNews = allNewsTyped.filter(
    (n) => n.city === city && n.moodAffinity === moodCategory
  )
  if (cityMoodNews.length > 0) return cityMoodNews

  // 2. Fallback: any news for this city
  const cityNews = allNewsTyped.filter((n) => n.city === city)
  if (cityNews.length > 0) return cityNews

  // 3. Fallback: any news matching mood from other cities
  const moodNews = allNewsTyped.filter((n) => n.moodAffinity === moodCategory)
  if (moodNews.length > 0) return moodNews.slice(0, 3)

  // 4. Ultimate fallback: first 3 news
  return allNewsTyped.slice(0, 3)
}

export function MoodAdaptiveNews({ city, mood }: MoodAdaptiveNewsProps) {
  const { language } = useTranslation()
  const [reframe, setReframe] = useState<string | null>(null)
  const [loadingReframe, setLoadingReframe] = useState(false)
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const config = getMoodConfig(mood)
  const IconComponent = config.icon
  const news = filterNewsByMoodAndCity(city, mood)
  const currentNews = news[currentNewsIndex] || news[0]

  const getText = useCallback((bilingual: { es: string; en: string } | string) => {
    if (typeof bilingual === "string") return bilingual
    if (language === "en" && bilingual.en) return bilingual.en
    return bilingual.es || ""
  }, [language])

  // Fetch AI reframe
  useEffect(() => {
    if (!currentNews) return
    
    const fetchReframe = async () => {
      setLoadingReframe(true)
      try {
        const res = await fetch("/api/mood-news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mood,
            city,
            headline: getText(currentNews.headline),
            summary: getText(currentNews.summary),
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setReframe(data.reframe)
        }
      } catch {
        // Silently fail — template reframe is built-in
      } finally {
        setLoadingReframe(false)
      }
    }

    fetchReframe()
  }, [currentNews?.id, mood, city, language, getText])

  const handleNextNews = () => {
    if (news.length <= 1) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % news.length)
      setReframe(null)
      setIsAnimating(false)
    }, 300)
  }

  if (!currentNews) {
    return (
      <div className="p-8 rounded-3xl bg-card border-2 border-dashed border-border text-center">
        <p className="text-muted-foreground">No hay noticias disponibles para {city}</p>
      </div>
    )
  }

  const headline = getText(currentNews.headline)
  const summary = getText(currentNews.summary)

  return (
    <div className="space-y-6">
      {/* Header with mood-adaptive styling */}
      <div className="text-center space-y-2">
        <div className={cn(
          "inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-2",
          "bg-gradient-to-br",
          config.accentGradient,
          "shadow-lg",
          config.bgGlow,
          "transition-all duration-700"
        )}>
          <IconComponent className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {config.label}
        </h2>
        <p className="text-sm text-muted-foreground">{config.sublabel} · {city}</p>
      </div>

      {/* Mood indicator pill */}
      <div className="flex justify-center">
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold",
          "bg-gradient-to-r",
          config.gradient,
          "border",
          config.borderColor,
          "backdrop-blur-sm transition-all duration-500"
        )}>
          <span className="text-base">{getMoodEmoji(mood)}</span>
          <span className="text-white/80">Tu ánimo: {mood}</span>
          <span className="text-white/50">→</span>
          <span className="text-white/80">Noticias adaptadas</span>
        </div>
      </div>

      {/* News card with adaptive design */}
      <div className={cn(
        "group p-6 rounded-3xl border-2 shadow-lg transition-all duration-500",
        "bg-gradient-to-br",
        config.cardBg,
        config.borderColor,
        config.bgGlow,
        isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
      )}>
        {/* Category + date + mood tags row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentNews.emoji}</span>
            <span className={cn(
              "px-3 py-1 text-xs font-bold rounded-full",
              "bg-gradient-to-r",
              config.accentGradient,
              "text-white shadow-md"
            )}>
              {currentNews.category}
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(currentNews.date).toLocaleDateString('es-ES', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-xl font-bold text-foreground leading-snug mb-3">
          {headline}
        </h3>

        {/* Summary */}
        <p className="text-muted-foreground leading-relaxed text-sm mb-4">
          {summary}
        </p>

        {/* Mood tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {currentNews.moodTags.map((tag, i) => (
            <span
              key={i}
              className={cn(
                "px-2.5 py-0.5 text-[10px] font-semibold rounded-full",
                config.tagBg,
                "transition-all duration-300"
              )}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* AI Reframe section */}
        <div className={cn(
          "p-4 rounded-2xl border transition-all duration-500",
          "bg-white/5 border-white/10",
          "backdrop-blur-sm"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={cn(
              "w-4 h-4",
              loadingReframe ? "animate-spin text-purple-400" : "text-purple-300"
            )} />
            <span className="text-xs font-bold text-purple-300/80 uppercase tracking-wider">
              Reflexión Adaptada a Ti
            </span>
          </div>
          {loadingReframe ? (
            <div className="space-y-2">
              <div className="h-3 bg-white/10 rounded-full animate-pulse w-full" />
              <div className="h-3 bg-white/10 rounded-full animate-pulse w-4/5" />
              <div className="h-3 bg-white/10 rounded-full animate-pulse w-3/5" />
            </div>
          ) : reframe ? (
            <p className="text-sm text-white/70 leading-relaxed italic">
              {reframe}
            </p>
          ) : (
            <p className="text-sm text-white/50 leading-relaxed italic">
              Generando reflexión personalizada...
            </p>
          )}
        </div>
      </div>

      {/* Navigation between news */}
      {news.length > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleNextNews}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold",
              "border transition-all duration-300",
              "hover:scale-[1.03] active:scale-[0.97]",
              config.borderColor,
              "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Otra noticia ({currentNewsIndex + 1}/{news.length})
          </button>
        </div>
      )}
    </div>
  )
}

function getMoodEmoji(mood: number): string {
  if (mood < 20) return "😔"
  if (mood < 40) return "😕"
  if (mood < 60) return "😌"
  if (mood < 80) return "😊"
  if (mood < 100) return "🥳"
  if (mood < 150) return "🚀"
  return "✨"
}
