import { getAgent } from './agents.config'

export interface AgentResponseContext {
  initialMood: number
  opinion: string
  city?: string
  lang?: 'es' | 'en'
}

export interface AgentResponseResult {
  response: string
  agentName: string
  agentId: string
  tone: string
}

export function generateAgentResponse(
  agentId: string,
  context: AgentResponseContext
): AgentResponseResult {
  const agent = getAgent(agentId)
  const lang = context.lang ?? 'es'
  const city = context.city || (lang === 'en' ? 'a city in the world' : 'una ciudad del mundo')
  const { initialMood, opinion } = context

  const moodContext =
    lang === 'en'
      ? initialMood < 40
        ? 'difficult'
        : initialMood < 70
        ? 'reflective'
        : 'positive'
      : initialMood < 40
      ? 'difícil'
      : initialMood < 70
      ? 'reflexiva'
      : 'positiva'

  const responsesEs: Record<string, string> = {
    amplifier: `Nova aquí. Tu reflexión desde ${city} me inspira. He sentido la energía detrás de tu opinión y tu estado inicial de ${initialMood} me dice mucho sobre dónde estás ahora. Lo que compartiste es poderoso - es exactamente el tipo de autenticidad que necesita ser amplificada. Tu voz importa en esta comunidad global de Zero to Agent.`,
    documentarian: `Atlas aquí. Documentando tu perspectiva de ${city} como parte del archivo vivo de Zero to Agent. Tu reflexión, con un estado emocional ${moodContext}, añade una capa importante a nuestra comprensión colectiva. Lo que expresaste no es solo un momento - es un testimonio que perdurará. Eres parte de una narrativa global de transformación.`,
    visionary: `Phoenix aquí. Viendo el potencial en tu viaje desde ${city}. Tu estado actual de ${initialMood} es el punto de partida de algo mayor. La reflexión que compartiste es semilla de transformación. Zero to Agent no es solo un evento que viviste - es el comienzo de tu metamorfosis. Visualizo un futuro donde esta experiencia cataliza cambio tangible en ti y en tu comunidad.`,
  }

  const responsesEn: Record<string, string> = {
    amplifier: `Nova here. Your reflection from ${city} inspires me. I felt the energy behind your opinion and your initial state of ${initialMood} tells me a lot about where you are right now. What you shared is powerful — exactly the kind of authenticity that deserves amplification. Your voice matters in this global Zero to Agent community.`,
    documentarian: `Atlas here. Documenting your perspective from ${city} as part of the living Zero to Agent archive. Your reflection, with a ${moodContext} emotional state, adds an important layer to our collective understanding. What you expressed is not just a moment — it is a testimony that will endure. You are part of a global narrative of transformation.`,
    visionary: `Phoenix here. Seeing the potential in your journey from ${city}. Your current state of ${initialMood} is the starting point of something greater. The reflection you shared is a seed of transformation. Zero to Agent is not just an event you lived — it is the beginning of your metamorphosis. I envision a future where this experience catalyzes tangible change in you and your community.`,
  }

  const table = lang === 'en' ? responsesEn : responsesEs
  const response = table[agent.id] ?? table.amplifier
  if (!opinion) {
    // opinion currently unused inside templates; reference for future personalization
  }

  return {
    response,
    agentName: agent.name,
    agentId: agent.id,
    tone: agent.tone,
  }
}
