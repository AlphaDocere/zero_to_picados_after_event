import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyCwgAbtOuFB9AcOkV3v4zcY1LLJspV0ymA",
  authDomain: "zero-to-agent-interface.firebaseapp.com",
  databaseURL: "https://zero-to-agent-interface-default-rtdb.firebaseio.com",
  projectId: "zero-to-agent-interface",
  storageBucket: "zero-to-agent-interface.firebasestorage.app",
  messagingSenderId: "304353011330",
  appId: "1:304353011330:web:61e9ac08abbf9479c2f69b",
  measurementId: "G-2EDRCN2F3N"
}

let app: any = null
let db: any = null

function initFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig)
    db = getDatabase(app)
  }
  return db
}

export interface CheckInSession {
  id: string
  initialMood: number
  finalMood: number
  city: string
  opinion: string
  selectedAgent: string
  agentResponse: string
  agentQuestion: string
  followUpResponse: string
  createdAt: number
  status: 'in-progress' | 'completed'
  moodShift?: number
  emotionalTransform?: 'improved' | 'declined' | 'stable'
}

/**
 * Fetch real CheckIn sessions from Firebase
 * Filters by completed sessions for the specific agent
 */
export async function fetchCheckInsByAgent(agentId: string): Promise<CheckInSession[]> {
  try {
    console.log('[v0] Fetching real CheckIn sessions for agent:', agentId)
    const database = initFirebase()
    const sessionsRef = ref(database, 'check-in-sessions')
    
    const snapshot = await get(sessionsRef)
    
    if (!snapshot.exists()) {
      console.log('[v0] No CheckIn data found in Firebase, using fallback mock data')
      return getMockCheckInsForAgent(agentId)
    }
    
    const data = snapshot.val()
    const sessions: CheckInSession[] = []
    
    // Transform Firebase object to array and filter by agent + completed status
    Object.entries(data).forEach(([id, session]: [string, any]) => {
      // Only include completed sessions for this agent
      if (session.status === 'completed' && session.selectedAgent === agentId) {
        sessions.push({
          id,
          initialMood: session.initialMood || 0,
          finalMood: session.finalMood || 0,
          city: session.city || 'Unknown',
          opinion: session.opinion || '',
          selectedAgent: session.selectedAgent,
          agentResponse: session.agentResponse || '',
          agentQuestion: session.agentQuestion || '',
          followUpResponse: session.followUpResponse || '',
          createdAt: session.createdAt || Date.now(),
          status: session.status,
          moodShift: session.moodShift,
          emotionalTransform: session.emotionalTransform
        })
      }
    })
    
    // Sort by timestamp descending (newest first)
    const sorted = sessions.sort((a, b) => b.createdAt - a.createdAt)
    
    if (sorted.length === 0) {
      console.log('[v0] No completed sessions found for agent:', agentId, '- using mock data')
      return getMockCheckInsForAgent(agentId)
    }
    
    console.log('[v0] Loaded', sorted.length, 'REAL CheckIn sessions for agent:', agentId)
    return sorted
  } catch (error) {
    console.error('[v0] Error fetching CheckIn sessions:', error)
    return getMockCheckInsForAgent(agentId)
  }
}

/**
 * Calculate analytics from CheckIn sessions
 */
export function calculateAnalytics(sessions: CheckInSession[]) {
  if (sessions.length === 0) {
    return {
      sentimentTrend: [],
      topThemes: [],
      engagementByCity: [],
      moodDistribution: [
        { range: '0-25', count: 0 },
        { range: '26-50', count: 0 },
        { range: '51-75', count: 0 },
        { range: '76-100', count: 0 }
      ]
    }
  }

  // Sentiment trend (last 7 data points)
  const sentimentTrend = sessions
    .slice(0, 7)
    .reverse()
    .map(s => s.finalMood)

  // Engagement by city (top 5)
  const cityMap = new Map<string, number>()
  sessions.forEach(s => {
    cityMap.set(s.city, (cityMap.get(s.city) || 0) + 1)
  })
  const engagementByCity = Array.from(cityMap.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Mood distribution
  const moodDistribution = [
    { range: '0-25', count: 0 },
    { range: '26-50', count: 0 },
    { range: '51-75', count: 0 },
    { range: '76-100', count: 0 }
  ]
  sessions.forEach(s => {
    const mood = s.finalMood
    if (mood <= 25) moodDistribution[0].count++
    else if (mood <= 50) moodDistribution[1].count++
    else if (mood <= 75) moodDistribution[2].count++
    else moodDistribution[3].count++
  })

  // Top themes (from emotional transform)
  const themeMap = new Map<string, number>()
  const emotionalThemes: Record<string, string[]> = {
    improved: ['Transformación', 'Esperanza', 'Crecimiento'],
    declined: ['Reflexión', 'Procesamiento', 'Aprendizaje'],
    stable: ['Equilibrio', 'Continuidad', 'Estabilidad']
  }

  sessions.forEach(s => {
    const transform = s.emotionalTransform || 'stable'
    const themes = emotionalThemes[transform] || ['Experiencia']
    themes.forEach(theme => {
      themeMap.set(theme, (themeMap.get(theme) || 0) + 1)
    })
  })

  const topThemes = Array.from(themeMap.entries())
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return {
    sentimentTrend: sentimentTrend.length > 0 ? sentimentTrend : [50],
    topThemes,
    engagementByCity,
    moodDistribution
  }
}

/**
 * Mock data fallback for development/demo
 */
function getMockCheckInsForAgent(agentId: string): CheckInSession[] {
  const mockData: Record<string, CheckInSession[]> = {
    amplifier: [
      {
        id: 'mock1',
        initialMood: 60,
        finalMood: 85,
        city: 'Madrid',
        opinion: 'Me sentí muy conectado con mi comunidad',
        selectedAgent: 'amplifier',
        agentResponse: 'Tu energía es contagiosa',
        agentQuestion: '¿Cómo te sientes ahora?',
        followUpResponse: 'Mucho mejor, gracias Nova',
        createdAt: Date.now() - 1000 * 60 * 5,
        status: 'completed',
        moodShift: 25,
        emotionalTransform: 'improved'
      },
      {
        id: 'mock2',
        initialMood: 55,
        finalMood: 78,
        city: 'Barcelona',
        opinion: 'Necesitaba expresarme',
        selectedAgent: 'amplifier',
        agentResponse: 'Tu voz importa',
        agentQuestion: '¿Qué querías compartir?',
        followUpResponse: 'Siento que fui escuchado',
        createdAt: Date.now() - 1000 * 60 * 15,
        status: 'completed',
        moodShift: 23,
        emotionalTransform: 'improved'
      }
    ],
    documentarian: [
      {
        id: 'mock3',
        initialMood: 50,
        finalMood: 72,
        city: 'Buenos Aires',
        opinion: 'Quería entender mis emociones',
        selectedAgent: 'documentarian',
        agentResponse: 'Documentemos este momento',
        agentQuestion: '¿Cuál es la raíz?',
        followUpResponse: 'Ahora veo más claro',
        createdAt: Date.now() - 1000 * 60 * 10,
        status: 'completed',
        moodShift: 22,
        emotionalTransform: 'improved'
      }
    ],
    visionary: [
      {
        id: 'mock4',
        initialMood: 55,
        finalMood: 88,
        city: 'Santiago',
        opinion: 'Quería ver posibilidades',
        selectedAgent: 'visionary',
        agentResponse: 'Tu futuro es brillante',
        agentQuestion: '¿Qué ves?',
        followUpResponse: 'Veo nuevas posibilidades',
        createdAt: Date.now() - 1000 * 60 * 8,
        status: 'completed',
        moodShift: 33,
        emotionalTransform: 'improved'
      }
    ]
  }

  const agentMock = mockData[agentId]
  console.log('[v0] Using MOCK CheckIn data for agent:', agentId)
  return agentMock || []
}
