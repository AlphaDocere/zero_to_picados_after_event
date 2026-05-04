export interface OnboardingStep {
  id: string
  title: string
  description: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const ONBOARDING_STEPS: Record<string, OnboardingStep[]> = {
  home: [
    {
      id: 'mood-intro',
      title: 'Welcome to Reflect',
      description: 'Start by checking in with your current emotional state. Rate your mood from 0 (low) to 100 (high).',
      target: '.mood-slider',
      position: 'bottom'
    },
    {
      id: 'agent-select',
      title: 'Choose Your AI Companion',
      description: 'Select an AI agent who resonates with you: Psychologist, Life Coach, Therapist, or Friend.',
      target: '.agent-selector',
      position: 'top'
    },
    {
      id: 'opinion-input',
      title: 'Share Your Thoughts',
      description: 'Express what\'s on your mind. This helps your AI companion provide better guidance.',
      target: '.opinion-input',
      position: 'top'
    }
  ],
  harvest: [
    {
      id: 'harvest-intro',
      title: 'Community Mood Harvest',
      description: 'Explore how emotions flow across our community. Each circle represents a check-in session.',
      target: '.harvest-container',
      position: 'right'
    },
    {
      id: 'harvest-insights',
      title: 'Collective Wisdom',
      description: 'Your mood data (anonymized) helps us understand emotional patterns and build a more empathetic community.',
      target: '.harvest-stats',
      position: 'left'
    }
  ]
}
