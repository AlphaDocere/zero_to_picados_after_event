'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import es from '@/lib/translations/es.json'
import en from '@/lib/translations/en.json'

type Language = 'es' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, any> = {
  es,
  en
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reflect_language') as Language | null
      if (saved && (saved === 'es' || saved === 'en')) {
        setLanguageState(saved)
      }
      setMounted(true)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('reflect_language', lang)
    }
  }

  // Translation function with dot notation (e.g., "checkin.mood.title")
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to English if key not found
        value = translations['en']
        for (const fallbackK of keys) {
          if (value && typeof value === 'object' && fallbackK in value) {
            value = value[fallbackK]
          } else {
            return key // Return key if not found in any language
          }
        }
        break
      }
    }

    return typeof value === 'string' ? value : key
  }

  const contextValue: LanguageContextType = { language, setLanguage, t }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Fallback for SSR/prerendering - return a dummy implementation
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: (key: string) => key
    }
  }
  return context
}
