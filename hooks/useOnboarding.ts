'use client'

import { useEffect, useState } from 'react'
import { ONBOARDING_STEPS, type OnboardingStep } from '@/lib/onboarding-content'

export function useOnboarding(pageName: string) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  const steps = ONBOARDING_STEPS[pageName] || []
  const isComplete = completed[pageName] ?? false
  const currentStep = steps[currentStepIndex]

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('reflect_onboarding_v1')
    if (saved) {
      try {
        setCompleted(JSON.parse(saved))
      } catch {
        // Ignore invalid JSON
      }
    }
  }, [])

  const skipOnboarding = () => {
    const updated = { ...completed, [pageName]: true }
    localStorage.setItem('reflect_onboarding_v1', JSON.stringify(updated))
    setCompleted(updated)
    setCurrentStepIndex(0)
  }

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      skipOnboarding()
    }
  }

  const resetOnboarding = () => {
    setCompleted({})
    setCurrentStepIndex(0)
    localStorage.removeItem('reflect_onboarding_v1')
  }

  return {
    steps,
    currentStep: mounted ? currentStep : null,
    isComplete: mounted ? isComplete : false,
    currentStepIndex,
    skip: skipOnboarding,
    next: nextStep,
    reset: resetOnboarding,
    mounted
  }
}
