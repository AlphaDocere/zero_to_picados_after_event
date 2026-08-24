'use client'

import React, { useEffect } from 'react'
import { ChevronRight, ChevronLeft, X, Sparkles, Lightbulb, Check } from 'lucide-react'
import type { OnboardingStep } from '@/lib/onboarding-content'
import { Button } from '@/components/ui/button'

interface TooltipProps {
  step: OnboardingStep
  onNext: () => void
  onPrev?: () => void
  onSkip: () => void
  stepNumber: number
  totalSteps: number
}

export function Tooltip({ step, onNext, onPrev, onSkip, stepNumber, totalSteps }: TooltipProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSkip])

  if (!step) return null

  const isLastStep = stepNumber === totalSteps - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-card via-card to-secondary/40 border-2 border-primary/40 p-6 sm:p-7 shadow-2xl shadow-primary/20 animate-in zoom-in-95 duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border"
          aria-label="Cerrar ayuda"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-start gap-3.5 mb-4 pr-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-primary/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
              Guía de Ayuda
            </span>
            <h3 className="text-lg font-bold text-foreground leading-snug">
              {step.title}
            </h3>
            {step.subtitle && (
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                {step.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Description Content */}
        <div className="space-y-3.5 my-4">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {step.description}
          </p>

          {step.tip && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground/80">
              <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-primary font-semibold">Consejo: </strong>
                {step.tip}
              </span>
            </div>
          )}
        </div>

        {/* Step Dots Progress */}
        <div className="flex items-center justify-between pt-2 pb-4 border-t border-border/60">
          <span className="text-xs font-semibold text-muted-foreground">
            Paso {stepNumber + 1} de {totalSteps}
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === stepNumber
                    ? 'w-6 bg-gradient-to-r from-primary to-accent'
                    : 'w-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onSkip}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            Omitir tutorial
          </button>

          <div className="flex items-center gap-2">
            {onPrev && stepNumber > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                className="h-10 px-3 rounded-xl border-border hover:bg-secondary text-foreground text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
            )}
            <Button
              size="sm"
              onClick={onNext}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-xs font-bold shadow-md shadow-primary/25"
            >
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Entendido
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
