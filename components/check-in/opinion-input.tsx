"use client"

import { PenLine, Sparkles } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation } from "@/contexts/LanguageContext"

interface OpinionInputProps {
  value: string
  onChange: (value: string) => void
  dynamicEmotions?: { label: string; emoji: string }[]
}

const defaultEmotionTags = [
  { label: "Esperanzado/a", emoji: "🌟" },
  { label: "Preocupado/a", emoji: "😟" },
  { label: "Inspirado/a", emoji: "💡" },
  { label: "Curioso/a", emoji: "🤔" },
  { label: "Tranquilo/a", emoji: "😌" },
  { label: "Energico/a", emoji: "⚡" },
]

export function OpinionInput({ value, onChange, dynamicEmotions }: OpinionInputProps) {
  const { t } = useTranslation()
  const characterCount = value.length
  const maxCharacters = 500

  const emotionTags = dynamicEmotions && dynamicEmotions.length > 0 
    ? dynamicEmotions 
    : defaultEmotionTags

  const isPersonalized = dynamicEmotions && dynamicEmotions.length > 0

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-2">
          <PenLine className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t('checkin.opinion.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('checkin.opinion.description')}
        </p>
      </div>

      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxCharacters))}
          placeholder={t('checkin.opinion.placeholder')}
          className="min-h-[160px] resize-none rounded-2xl border-2 border-border bg-card p-5 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-sm focus:shadow-lg"
        />
        <div className="absolute bottom-4 right-4 px-2 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {characterCount}/{maxCharacters}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            O selecciona cómo te sientes:
          </p>
          {isPersonalized && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              Personalizado
            </span>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {emotionTags.map((tag) => (
            <button
              key={tag.label}
              onClick={() => onChange(value + (value ? " " : "") + `Me siento ${tag.label.toLowerCase()}.`)}
              className="group flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-card border-2 border-border text-foreground hover:border-primary hover:bg-primary/5 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">{tag.emoji}</span>
              <span>{tag.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
