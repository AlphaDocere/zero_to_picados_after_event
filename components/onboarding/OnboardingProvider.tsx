'use client'

import React, { createContext, useContext, ReactNode } from 'react'

interface OnboardingContextType {
  pageName: string
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function OnboardingProvider({ children, pageName }: { children: ReactNode; pageName?: string }) {
  return (
    <OnboardingContext.Provider value={{ pageName: pageName || 'default' }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboardingContext() {
  const context = useContext(OnboardingContext)
  if (!context) {
    return { pageName: 'default' }
  }
  return context
}
