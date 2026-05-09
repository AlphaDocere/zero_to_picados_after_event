"use client"

import { Newspaper, Calendar, ExternalLink } from "lucide-react"
import newsData from "@/data/news.json"
import { useTranslation } from "@/contexts/LanguageContext"

interface NewsCardProps {
  city: string
}

export function NewsCard({ city }: NewsCardProps) {
  const { language } = useTranslation()
  const news = newsData.find((item) => item.city === city)

  if (!news) {
    return (
      <div className="p-8 rounded-3xl bg-card border-2 border-dashed border-border text-center">
        <p className="text-muted-foreground">No hay noticias disponibles para {city}</p>
      </div>
    )
  }

  // Extract text in current language
  const getText = (bilingual: any) => {
    if (typeof bilingual === 'string') return bilingual
    if (language === 'en' && bilingual.en) return bilingual.en
    return bilingual.es || ''
  }

  const headline = getText(news.headline)
  const summary = getText(news.summary)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-2">
          <Newspaper className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Noticias de {city}
        </h2>
        <p className="text-sm text-muted-foreground">Esto es lo que esta pasando en tu area</p>
      </div>

      <div className="group p-6 rounded-3xl bg-card border-2 border-border shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-4 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-md">
            {news.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(news.date).toLocaleDateString('es-ES', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>

        <h3 className="text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
          {headline}
        </h3>

        <p className="text-muted-foreground leading-relaxed">
          {summary}
        </p>

        <div className="flex items-center gap-2 text-sm text-primary font-medium pt-2">
          <span>Leer mas</span>
          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  )
}
