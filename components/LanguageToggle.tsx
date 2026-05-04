'use client'

import { Globe } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-purple-300" />
      <select 
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
        className="bg-purple-900/50 hover:bg-purple-900/70 border border-purple-500/50 text-purple-200 text-sm rounded-lg px-3 py-2 transition-colors focus:outline-none focus:border-purple-400 cursor-pointer"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  )
}
