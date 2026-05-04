'use client'

import React, { useEffect, useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import type { OnboardingStep } from '@/lib/onboarding-content'

interface TooltipProps {
  step: OnboardingStep
  onNext: () => void
  onSkip: () => void
  stepNumber: number
  totalSteps: number
}

export function Tooltip({ step, onNext, onSkip, stepNumber, totalSteps }: TooltipProps) {
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!step.target) {
      setPosition({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 150 })
      setVisible(true)
      return
    }

    const element = document.querySelector(step.target)
    if (element) {
      const rect = element.getBoundingClientRect()
      let top = rect.top + window.scrollY
      let left = rect.left + window.scrollX

      // Adjust position based on placement preference
      switch (step.position) {
        case 'bottom':
          top += rect.height + 16
          left += rect.width / 2 - 150
          break
        case 'top':
          top -= 200
          left += rect.width / 2 - 150
          break
        case 'left':
          top += rect.height / 2 - 100
          left -= 320
          break
        case 'right':
        default:
          top += rect.height / 2 - 100
          left += rect.width + 16
      }

      setPosition({ top: Math.max(16, top), left: Math.max(16, left) })
      setVisible(true)
    }
  }, [step])

  if (!visible) return null

  return (
    <div
      className="fixed z-50 w-80 rounded-2xl bg-gradient-to-br from-purple-900/95 to-purple-900/90 border-2 border-purple-500/50 p-6 shadow-2xl shadow-purple-500/30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: '400px'
      }}
    >
      {/* Close button */}
      <button
        onClick={onSkip}
        className="absolute top-3 right-3 text-purple-300/60 hover:text-purple-200 transition-colors"
        aria-label="Close tooltip"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-purple-100 mb-1">{step.title}</h3>
          <p className="text-sm text-purple-200/80 leading-relaxed">{step.description}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between text-xs text-purple-300/60 pt-2">
          <span>
            Step {stepNumber + 1} of {totalSteps}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 w-2 rounded-full transition-colors ${
                  i === stepNumber ? 'bg-purple-400' : 'bg-purple-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-purple-500/30">
        <button
          onClick={onSkip}
          className="flex-1 text-sm font-semibold text-purple-300 hover:text-purple-100 transition-colors"
        >
          Skip
        </button>
        <button
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50 active:scale-95"
        >
          {stepNumber === totalSteps - 1 ? 'Done' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
