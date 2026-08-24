'use client'

import { useEffect, useState, useCallback } from 'react'
import { ONBOARDING_STEPS, type OnboardingStep } from '@/lib/onboarding-content'

export function useOnboarding(pageName: string, activeStepIndex: number = 0) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [isOpen, setIsOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(activeStepIndex)
  const [mounted, setMounted] = useState(false)

  const steps = ONBOARDING_STEPS[pageName] || []
  const isComplete = completed[pageName] ?? false
  const currentStep = steps[currentStepIndex] || steps[0]

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('reflect_onboarding_v1')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCompleted(parsed)
        // If not completed yet for this page, open onboarding automatically
        if (!parsed[pageName]) {
          setIsOpen(true)
        }
      } catch {
        setIsOpen(true)
      }
    } else {
      // First time visitor, show onboarding
      setIsOpen(true)
    }
  }, [pageName])

  // Sync internal step index with external activeStepIndex when not explicitly navigating
  useEffect(() => {
    if (activeStepIndex >= 0 && activeStepIndex < steps.length) {
      setCurrentStepIndex(activeStepIndex)
    }
  }, [activeStepIndex, steps.length])

  const skipOnboarding = useCallback(() => {
    const updated = { ...completed, [pageName]: true }
    localStorage.setItem('reflect_onboarding_v1', JSON.stringify(updated))
    setCompleted(updated)
    setIsOpen(false)
  }, [completed, pageName])

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      skipOnboarding()
    }
  }, [currentStepIndex, steps.length, skipOnboarding])

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }, [currentStepIndex])

  const openHelp = useCallback((stepIdx?: number) => {
    if (typeof stepIdx === 'number' && stepIdx >= 0 && stepIdx < steps.length) {
      setCurrentStepIndex(stepIdx)
    }
    setIsOpen(true)
  }, [steps.length])

  const closeHelp = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleHelp = useCallback((stepIdx?: number) => {
    setIsOpen(prev => {
      if (!prev && typeof stepIdx === 'number') {
        setCurrentStepIndex(stepIdx)
      }
      return !prev
    })
  }, [])

  const resetOnboarding = useCallback((stepIdx?: number) => {
    setCompleted(prev => {
      const copy = { ...prev }
      delete copy[pageName]
      return copy
    })
    localStorage.removeItem('reflect_onboarding_v1')
    if (typeof stepIdx === 'number') {
      setCurrentStepIndex(stepIdx)
    }
    setIsOpen(true)
  }, [pageName])

  return {
    steps,
    currentStep: mounted ? currentStep : null,
    isComplete: mounted ? isComplete : false,
    isOpen: mounted && isOpen,
    currentStepIndex,
    openHelp,
    closeHelp,
    toggleHelp,
    skip: skipOnboarding,
    next: nextStep,
    prev: prevStep,
    reset: resetOnboarding,
    mounted
  }
}
