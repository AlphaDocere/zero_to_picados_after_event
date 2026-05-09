import { getDatabase, ref, set, get, push, update, Database } from 'firebase/database'
import { getFirebaseDatabase } from './firebase-init'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
}

// Validate Firebase config on load
const isFirebaseConfigValid = () => {
  const required = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId']
  const missing = required.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig])
  
  if (missing.length > 0) {
    console.error('[v0] Firebase config missing keys:', missing)
    return false
  }
  return true
}

let initError: string | null = null

export function initFirebase() {
  if (initError) {
    throw new Error(initError)
  }
  
  if (!isFirebaseConfigValid()) {
    initError = 'Firebase no está configurado. Falta agregar variables de entorno: ' + 
      'NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_DATABASE_URL, ' +
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID'
    console.error('[v0]', initError)
    throw new Error(initError)
  }
  
  try {
    const db = getFirebaseDatabase()
    console.log('[v0] Firebase initialized successfully (singleton)')
    return db
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error initializing Firebase'
    initError = message
    console.error('[v0] Firebase initialization error:', err)
    throw err
  }
}

export function getFirebaseDb() {
  return getFirebaseDatabase()
}

export interface CheckInSessionMetadata {
  source?: string
  lang?: 'es' | 'en'
}

export interface CheckInSession {
  id?: string
  initialMood: number
  city: string
  news: {
    title: string
    description: string
  }
  opinion: string
  selectedAgent: string
  agentResponse: string
  agentQuestion: string
  followUpResponse: string
  finalMood: number
  moodShift?: number // finalMood - initialMood
  emotionalTransform?: 'improved' | 'declined' | 'stable'
  createdAt: number
  updatedAt: number
  status: 'in-progress' | 'completed'
  currentStep: number
  cacheMetrics?: {
    hits: number
    misses: number
    avgLatency: number
  }
  metadata?: CheckInSessionMetadata
}

export async function createCheckInSession(): Promise<string> {
  const db = getFirebaseDb()
  const sessionsRef = ref(db, 'check-in-sessions')
  const newSessionRef = push(sessionsRef)
  
  const session: CheckInSession = {
    initialMood: 0,
    city: '',
    news: { title: '', description: '' },
    opinion: '',
    selectedAgent: '',
    agentResponse: '',
    agentQuestion: '',
    followUpResponse: '',
    finalMood: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'in-progress',
    currentStep: 0
  }
  
  await set(newSessionRef, session)
  return newSessionRef.key || ''
}

export async function saveCheckInSession(
  data: Omit<CheckInSession, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'currentStep'> & {
    status?: CheckInSession['status']
    currentStep?: number
    metadata?: CheckInSessionMetadata
  }
): Promise<string> {
  const db = getFirebaseDb()
  const sessionsRef = ref(db, 'check-in-sessions')
  const newSessionRef = push(sessionsRef)
  const now = Date.now()

  const moodShift = data.finalMood - data.initialMood
  let emotionalTransform: CheckInSession['emotionalTransform']
  if (moodShift > 5) emotionalTransform = 'improved'
  else if (moodShift < -5) emotionalTransform = 'declined'
  else emotionalTransform = 'stable'

  const session: CheckInSession = {
    initialMood: data.initialMood,
    city: data.city,
    news: data.news,
    opinion: data.opinion,
    selectedAgent: data.selectedAgent,
    agentResponse: data.agentResponse,
    agentQuestion: data.agentQuestion,
    followUpResponse: data.followUpResponse,
    finalMood: data.finalMood,
    moodShift,
    emotionalTransform,
    createdAt: now,
    updatedAt: now,
    status: data.status ?? 'completed',
    currentStep: data.currentStep ?? 4,
    ...(data.metadata ? { metadata: data.metadata } : {}),
  }

  await set(newSessionRef, session)
  return newSessionRef.key || ''
}

export async function getCheckInSession(sessionId: string): Promise<CheckInSession | null> {
  const db = getFirebaseDb()
  const sessionRef = ref(db, `check-in-sessions/${sessionId}`)
  const snapshot = await get(sessionRef)
  
  if (snapshot.exists()) {
    return {
      id: sessionId,
      ...snapshot.val()
    }
  }
  return null
}

export async function updateCheckInSession(sessionId: string, updates: Partial<CheckInSession>) {
  const db = getFirebaseDb()
  const sessionRef = ref(db, `check-in-sessions/${sessionId}`)
  
  await update(sessionRef, {
    ...updates,
    updatedAt: Date.now()
  })
}

export async function completeCheckInSession(sessionId: string, finalMood: number) {
  const db = getFirebaseDb()
  const sessionRef = ref(db, `check-in-sessions/${sessionId}`)
  const snapshot = await get(sessionRef)
  
  if (snapshot.exists()) {
    const session = snapshot.val()
    const moodShift = finalMood - (session.initialMood || 0)
    
    let emotionalTransform: 'improved' | 'declined' | 'stable'
    if (moodShift > 5) emotionalTransform = 'improved'
    else if (moodShift < -5) emotionalTransform = 'declined'
    else emotionalTransform = 'stable'
    
    await update(sessionRef, {
      finalMood,
      moodShift,
      emotionalTransform,
      status: 'completed',
      updatedAt: Date.now()
    })
  }
}

// Mock data for demo/testing when Firebase is unavailable
const MOCK_SESSIONS_DATA: CheckInSession[] = [
  {
    id: '1',
    initialMood: 40,
    city: 'Buenos Aires',
    news: { title: 'Economic Recovery', description: 'Argentina shows positive indicators' },
    opinion: 'La economía está mejorando lentamente pero hay esperanza para el futuro',
    selectedAgent: 'compassionate',
    agentResponse: 'Entiendo tu optimismo cautela',
    agentQuestion: '¿Qué te da más confianza?',
    followUpResponse: 'Los empleos están aumentando',
    finalMood: 65,
    moodShift: 25,
    emotionalTransform: 'improved',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    status: 'completed',
    currentStep: 4
  },
  {
    id: '2',
    initialMood: 55,
    city: 'Mexico City',
    news: { title: 'Cultural Festival', description: 'Major art exhibition opens' },
    opinion: 'Me emociona ver que nuestra cultura es celebrada globalmente',
    selectedAgent: 'reflective',
    agentResponse: 'La cultura es el corazón de la identidad',
    agentQuestion: '¿Qué significado tiene para ti?',
    followUpResponse: 'Es conexión con mis raíces',
    finalMood: 78,
    moodShift: 23,
    emotionalTransform: 'improved',
    createdAt: Date.now() - 72000000,
    updatedAt: Date.now() - 72000000,
    status: 'completed',
    currentStep: 4
  },
  {
    id: '3',
    initialMood: 35,
    city: 'Lima',
    news: { title: 'Infrastructure Project', description: 'New metro line opens' },
    opinion: 'Finalmente hay inversión en transporte pero sigue siendo insuficiente',
    selectedAgent: 'analytical',
    agentResponse: 'Hay progreso pero con limitaciones reales',
    agentQuestion: '¿Qué cambios has notado?',
    followUpResponse: 'Menos tráfico en mi ruta diaria',
    finalMood: 52,
    moodShift: 17,
    emotionalTransform: 'improved',
    createdAt: Date.now() - 60000000,
    updatedAt: Date.now() - 60000000,
    status: 'completed',
    currentStep: 4
  },
  {
    id: '4',
    initialMood: 60,
    city: 'Bogotá',
    news: { title: 'Peace Agreement', description: 'New peace accord reached' },
    opinion: 'Espero que esto traiga estabilidad real a nuestro país',
    selectedAgent: 'compassionate',
    agentResponse: 'La esperanza es un primer paso importante',
    agentQuestion: '¿Cómo te gustaría que fuera?',
    followUpResponse: 'Con oportunidades para todos',
    finalMood: 70,
    moodShift: 10,
    emotionalTransform: 'improved',
    createdAt: Date.now() - 48000000,
    updatedAt: Date.now() - 48000000,
    status: 'completed',
    currentStep: 4
  },
  {
    id: '5',
    initialMood: 45,
    city: 'Santiago',
    news: { title: 'Labor Rights', description: 'New labor protections approved' },
    opinion: 'Es un paso adelante pero faltan muchas cosas',
    selectedAgent: 'analytical',
    agentResponse: 'Cada paso cuenta en el cambio social',
    agentQuestion: '¿Qué sigue siendo importante?',
    followUpResponse: 'Salarios dignos y educación',
    finalMood: 58,
    moodShift: 13,
    emotionalTransform: 'improved',
    createdAt: Date.now() - 36000000,
    updatedAt: Date.now() - 36000000,
    status: 'completed',
    currentStep: 4
  },
  {
    id: '6',
    initialMood: 50,
    city: 'Quito',
    news: { title: 'Education Reform', description: 'New school curriculum implemented' },
    opinion: 'Los cambios en educación son necesarios pero requieren paciencia',
    selectedAgent: 'reflective',
    agentResponse: 'La educación es inversión en futuro',
    agentQuestion: '¿En qué deberían enfocarse?',
    followUpResponse: 'En pensamiento crítico y creatividad',
    finalMood: 62,
    moodShift: 12,
    emotionalTransform: 'improved',
    createdAt: Date.now() - 24000000,
    updatedAt: Date.now() - 24000000,
    status: 'completed',
    currentStep: 4
  },
  {
    id: '7',
    initialMood: 38,
    city: 'Caracas',
    news: { title: 'Social Initiative', description: 'Community support program launches' },
    opinion: 'Hay pequeñas luces en medio de los tiempos difíciles',
    selectedAgent: 'compassionate',
    agentResponse: 'La comunidad es nuestra fortaleza',
    agentQuestion: '¿Cómo podemos apoyarnos?',
    followUpResponse: 'Juntos, con solidaridad',
    finalMood: 48,
    moodShift: 10,
    emotionalTransform: 'improved',
    createdAt: Date.now() - 12000000,
    updatedAt: Date.now() - 12000000,
    status: 'completed',
    currentStep: 4
  },
  {
    id: '8',
    initialMood: 55,
    city: 'Buenos Aires',
    news: { title: 'Tech Growth', description: 'Tech sector shows growth' },
    opinion: 'La tecnología está creando nuevas oportunidades',
    selectedAgent: 'analytical',
    agentResponse: 'La innovación es clave para el desarrollo',
    agentQuestion: '¿Qué impacto ves?',
    followUpResponse: 'Emprendimientos jóvenes emergiendo',
    finalMood: 72,
    moodShift: 17,
    emotionalTransform: 'improved',
    createdAt: Date.now() - 6000000,
    updatedAt: Date.now() - 6000000,
    status: 'completed',
    currentStep: 4
  },
  {
    id: '9',
    initialMood: 48,
    city: 'Mexico City',
    news: { title: 'Environmental Project', description: 'Park restoration initiative' },
    opinion: 'El cuidado del ambiente es urgente pero veo iniciativas positivas',
    selectedAgent: 'reflective',
    agentResponse: 'La naturaleza es nuestra responsabilidad',
    agentQuestion: '¿Cómo participas tú?',
    followUpResponse: 'Voluntariado en proyectos verdes',
    finalMood: 66,
    moodShift: 18,
    emotionalTransform: 'improved',
    createdAt: Date.now() - 3000000,
    updatedAt: Date.now() - 3000000,
    status: 'completed',
    currentStep: 4
  }
]

export async function getAllSessions(): Promise<CheckInSession[]> {
  try {
    const db = getFirebaseDb()
    const sessionsRef = ref(db, 'check-in-sessions')
    const snapshot = await get(sessionsRef)
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      return Object.entries(data).map(([id, session]: [string, any]) => ({
        id,
        ...session
      }))
    }
  } catch (err) {
    console.warn('[v0] Firebase unavailable, using mock data:', err)
  }
  
  // Use mock data if Firebase is not available (development/demo mode)
  console.log('[v0] Loading mock sessions for demo purposes')
  return MOCK_SESSIONS_DATA
}
