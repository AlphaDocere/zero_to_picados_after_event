export interface CharacterTheme {
  id: string
  name: string
  displayName: { es: string; en: string }
  personality: { es: string; en: string }
  role: { es: string; en: string }
  icon: string
  colors: {
    primary: string
    secondary: string
    dark: string
    light: string
    gradientFrom: string
    gradientTo: string
  }
  border: string
  bgGradient: string
  textColor: string
  accentColor: string
  glowColor: string
}

export const CHARACTER_THEMES: Record<string, CharacterTheme> = {
  amplifier: {
    id: 'amplifier',
    name: 'Nova',
    displayName: { es: 'El Amplificador', en: 'The Amplifier' },
    personality: { es: 'Vibrante, conectora, energética', en: 'Vibrant, connector, energetic' },
    role: { es: 'Amplifica voces y crea comunidad', en: 'Amplifies voices and builds community' },
    icon: '⚡',
    colors: {
      primary: '#ec4899',
      secondary: '#06b6d4',
      dark: '#3d1e4a',
      light: '#f472b6',
      gradientFrom: '#ec4899',
      gradientTo: '#06b6d4'
    },
    border: 'border-pink-500/50',
    bgGradient: 'from-pink-900/20 to-cyan-900/20',
    textColor: 'text-white',
    accentColor: '#f472b6',
    glowColor: 'rgba(236, 72, 153, 0.5)'
  },
  documentarian: {
    id: 'documentarian',
    name: 'Atlas',
    displayName: { es: 'El Documentalista', en: 'The Documentarian' },
    personality: { es: 'Profunda, reflexiva, contemplativa', en: 'Deep, thoughtful, contemplative' },
    role: { es: 'Documenta historias y contextos', en: 'Documents stories and context' },
    icon: '📚',
    colors: {
      primary: '#7c3aed',
      secondary: '#a855f7',
      dark: '#2e1065',
      light: '#c4b5fd',
      gradientFrom: '#7c3aed',
      gradientTo: '#a855f7'
    },
    border: 'border-purple-500/50',
    bgGradient: 'from-purple-900/20 to-purple-800/20',
    textColor: 'text-white',
    accentColor: '#c4b5fd',
    glowColor: 'rgba(124, 58, 237, 0.5)'
  },
  visionary: {
    id: 'visionary',
    name: 'Phoenix',
    displayName: { es: 'El Visionario', en: 'The Visionary' },
    personality: { es: 'Transformadora, moderna, futurista', en: 'Transformative, modern, forward-thinking' },
    role: { es: 'Visualiza el futuro y transforma', en: 'Envisions future and transforms' },
    icon: '🔥',
    colors: {
      primary: '#14b8a6',
      secondary: '#ec4899',
      dark: '#0d3d36',
      light: '#5eead4',
      gradientFrom: '#14b8a6',
      gradientTo: '#ec4899'
    },
    border: 'border-teal-500/50',
    bgGradient: 'from-teal-900/20 to-pink-900/20',
    textColor: 'text-white',
    accentColor: '#5eead4',
    glowColor: 'rgba(20, 184, 166, 0.5)'
  }
}

export function getCharacterTheme(agentId: string): CharacterTheme {
  return CHARACTER_THEMES[agentId] || CHARACTER_THEMES.amplifier
}

export const CHARACTER_TYPOGRAPHY = {
  heading: 'font-bold tracking-tight',
  subheading: 'font-semibold text-lg',
  body: 'font-normal text-base',
  small: 'text-sm font-medium',
  tiny: 'text-xs font-medium'
}

export const CHARACTER_SPACING = {
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6'
}

export const CHARACTER_SHADOWS = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  glow: 'drop-shadow-lg'
}
