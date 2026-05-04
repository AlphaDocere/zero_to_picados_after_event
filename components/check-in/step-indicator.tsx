"use client"

import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-2 rounded-full transition-all duration-500",
            index === currentStep
              ? "w-6 bg-gradient-to-r from-primary to-accent shadow-md shadow-primary/30"
              : index < currentStep
              ? "w-2 bg-primary"
              : "w-2 bg-border"
          )}
        />
      ))}
    </div>
  )
}
