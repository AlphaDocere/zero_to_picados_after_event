"use client"

import { Slider } from "@/components/ui/slider"
import { useTranslation } from "@/contexts/LanguageContext"
import { useMood } from "@/contexts/MoodContext"

interface MoodSliderProps {
  value: number
  onChange: (value: number) => void
  label?: string
}

const getMoodEmoji = (value: number) => {
  if (value < 20) return "😔"
  if (value < 40) return "😕"
  if (value < 60) return "😌"
  if (value < 80) return "😊"
  if (value < 100) return "🥳"
  if (value < 150) return "🚀"
  return "✨"
}

const getMoodLabelKey = (value: number): string => {
  if (value < 20) return "checkin.mood.terrible"
  if (value < 40) return "checkin.mood.bad"
  if (value < 60) return "checkin.mood.neutral"
  if (value < 80) return "checkin.mood.good"
  if (value < 100) return "checkin.mood.excellent"
  if (value < 150) return "checkin.mood.transcendent"
  return "checkin.mood.boundless"
}

const getMoodGradient = (value: number) => {
  if (value < 20) return "from-rose-400 to-red-500"
  if (value < 40) return "from-orange-400 to-amber-500"
  if (value < 60) return "from-yellow-400 to-lime-500"
  if (value < 80) return "from-emerald-400 to-teal-500"
  if (value < 100) return "from-cyan-400 to-blue-500"
  if (value < 150) return "from-violet-400 to-purple-600"
  return "from-pink-400 via-purple-500 to-indigo-600"
}

const getMoodBg = (value: number) => {
  if (value < 20) return "bg-rose-100"
  if (value < 40) return "bg-orange-100"
  if (value < 60) return "bg-yellow-100"
  if (value < 80) return "bg-emerald-100"
  if (value < 100) return "bg-cyan-100"
  if (value < 150) return "bg-violet-100"
  return "bg-pink-100"
}

export function MoodSlider({ value, onChange }: MoodSliderProps) {
  const { t } = useTranslation()
  const { setMood } = useMood()

  const handleChange = (v: number) => {
    setMood(Math.min(100, v))
    onChange(v)
  }
  
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground text-balance">{t('checkin.mood.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('checkin.mood.description')}</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className={`w-32 h-32 rounded-3xl ${getMoodBg(value)} flex items-center justify-center transition-all duration-500 shadow-lg animate-float`}>
          <span className="text-7xl transition-all duration-300 ease-out">
            {getMoodEmoji(value)}
          </span>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className={`text-5xl font-extrabold bg-gradient-to-r ${getMoodGradient(value)} bg-clip-text text-transparent transition-all duration-300`}>
            {value}
          </div>
          <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${getMoodGradient(value)} shadow-lg`}>
            <span className="text-sm font-semibold text-white">
              {t(getMoodLabelKey(value))}
            </span>
          </div>
        </div>
      </div>

      <div className="px-2 space-y-4">
        <div className="relative">
          <div className={`absolute inset-0 h-3 rounded-full bg-gradient-to-r ${getMoodGradient(value)} opacity-20 blur-xl`} />
          <Slider
            value={[value]}
            onValueChange={(vals) => handleChange(vals[0])}
            max={200}
            min={0}
            step={1}
            className="w-full relative"
          />
        </div>
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>0</span>
          <span>50</span>
          <span>100</span>
          <span>150</span>
          <span>200</span>
        </div>
      </div>
    </div>
  )
}
