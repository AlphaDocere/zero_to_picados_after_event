export interface OnboardingStep {
  id: string
  title: string
  subtitle?: string
  description: string
  tip?: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

export const ONBOARDING_STEPS: Record<string, OnboardingStep[]> = {
  home: [
    {
      id: 'mood-initial',
      title: 'Paso 1: ¿Cómo te sientes?',
      subtitle: 'Calibración de Ánimo Inicial',
      description: 'Desliza el indicador para registrar tu estado emocional actual en una escala de 0 (muy bajo) a 100 (excelente). Sé honesto contigo mismo.',
      tip: 'Tu ánimo inicial nos ayuda a entender tu punto de partida antes de la reflexión.',
      position: 'center'
    },
    {
      id: 'city-selection',
      title: 'Paso 2: Selecciona tu Ciudad',
      subtitle: 'Ubicación Geográfica',
      description: 'Elige la ciudad desde la que te conectas. Esto permite construir el mapa emocional colectivo y conectar con realidades similares a la tuya.',
      tip: 'Si no encuentras tu ciudad, puedes solicitar agregarla desde el menú superior.',
      position: 'center'
    },
    {
      id: 'adaptive-news',
      title: 'Paso 3: Contexto y Noticias',
      subtitle: 'Sincronización de Noticias Adaptativas',
      description: 'Explora noticias y eventos locales adaptados especialmente a tu estado de ánimo para inspirarte o darte perspectiva.',
      tip: 'Las noticias cambian según tu nivel de energía y ánimo registrado.',
      position: 'center'
    },
    {
      id: 'opinion-input',
      title: 'Paso 4: Expresa tu Sentir',
      subtitle: 'Tu Espacio de Reflexión',
      description: 'Escribe libremente lo que estás sintiendo o pensando en este momento. Puedes usar los disparadores emocionales sugeridos si te cuesta empezar.',
      tip: 'Tus palabras son tu semilla emocional; exprésate sin juzgarte.',
      position: 'center'
    },
    {
      id: 'agent-selector',
      title: 'Paso 5: Elige tu Guía Emocional',
      subtitle: 'Selección de Compañero IA',
      description: 'Selecciona el estilo de agente con el que más resuenas hoy: Nova (Cálida y Compasiva), Atlas (Analítico y Práctico) o Phoenix (Inspirador y Energético).',
      tip: 'Cada agente tiene una personalidad única y un enfoque diferente de escucha.',
      position: 'center'
    },
    {
      id: 'agent-response',
      title: 'Paso 6: Respuesta de tu Guía',
      subtitle: 'Perspectiva Personalizada',
      description: 'Lee la reflexión personalizada que tu agente ha elaborado especialmente a partir de tu sentir y tu contexto.',
      tip: 'Tómate un momento para respirar y absorber la perspectiva que te ofrece.',
      position: 'center'
    },
    {
      id: 'agent-followup',
      title: 'Paso 7: Profundización',
      subtitle: 'Pregunta de Acompañamiento',
      description: 'Tu guía te plantea una pregunta clave para ayudarte a descubrir nuevas perspectivas o acciones positivas.',
      tip: 'Escribe lo primero que venga a tu mente; no hay respuestas correctas ni incorrectas.',
      position: 'center'
    },
    {
      id: 'mood-final',
      title: 'Paso 8: ¿Cómo te sientes ahora?',
      subtitle: 'Medición de Transformación',
      description: 'Vuelve a evaluar tu estado de ánimo tras haber completado la reflexión y haber conectado con tu guía.',
      tip: 'Aquí podrás ver el cambio o estabilidad en tu energía emocional.',
      position: 'center'
    },
    {
      id: 'summary-web3',
      title: 'Paso 9: Resumen y Cosecha',
      subtitle: 'Cierre y Registro Inmutable',
      description: 'Revisa el resumen completo de tu viaje emocional. Opcionalmente, puedes registrar tu check-in en la blockchain de Solana Devnet como un testimonio inmutable.',
      tip: 'Al pulsar "Completar Check-in", tu reflexión se sumará a la Cosecha comunitaria.',
      position: 'center'
    }
  ],
  harvest: [
    {
      id: 'harvest-intro',
      title: 'Cosecha Comunitaria de Emociones',
      subtitle: 'Sabiduría Colectiva',
      description: 'Explora cómo fluyen las emociones en nuestra comunidad. Cada tarjeta representa una semilla y reflexión de un usuario.',
      tip: 'Puedes apoyar y compartir las reflexiones que más resuenen contigo.',
      position: 'center'
    },
    {
      id: 'harvest-stats',
      title: 'Métricas Globales',
      subtitle: 'Tendencias en Tiempo Real',
      description: 'Observa el promedio de ánimo, la tendencia de cambio y el total de participantes de la comunidad.',
      tip: 'Estos datos demuestran el impacto positivo de la reflexión colectiva.',
      position: 'center'
    }
  ]
}
