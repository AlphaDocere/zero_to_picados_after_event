import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref, set, get, push, update, Database } from 'firebase/database'

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

let db: Database | null = null
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
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    db = getDatabase(app)
    console.log('[v0] Firebase initialized successfully')
    return db
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error initializing Firebase'
    initError = message
    console.error('[v0] Firebase initialization error:', err)
    throw err
  }
}

export function getFirebaseDb() {
  if (!db) {
    return initFirebase()
  }
  return db
}

export interface CheckInSession {
  id?: string
  source?: 'checkin' | 'ruleta'  // marca del origen
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
  moodShift?: number
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
  gameData?: {
    challenge: string
    gameScore: number
    gameWon: boolean
    habits: string[]
    motivation: string
  }
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

export interface RuletaSessionInput {
  initialMood: number
  finalMood: number
  challenge: string
  gameScore: number
  gameWon: boolean
  habits: string[]
  motivation: string
}

export async function saveRuletaSession(data: RuletaSessionInput): Promise<string> {
  const db = getFirebaseDb()
  const sessionsRef = ref(db, 'check-in-sessions')
  const newRef = push(sessionsRef)

  const moodShift = data.finalMood - data.initialMood
  const emotionalTransform: 'improved' | 'declined' | 'stable' =
    moodShift > 5 ? 'improved' : moodShift < -5 ? 'declined' : 'stable'

  const session: CheckInSession = {
    source: 'ruleta',
    initialMood: data.initialMood,
    finalMood: data.finalMood,
    moodShift,
    emotionalTransform,
    // campos compartidos vacíos para no romper queries comunes
    city: '',
    news: { title: '', description: '' },
    opinion: data.motivation,
    selectedAgent: 'ruleta-ia',
    agentResponse: data.challenge,
    agentQuestion: '',
    followUpResponse: '',
    status: 'completed',
    currentStep: 4,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    gameData: {
      challenge: data.challenge,
      gameScore: data.gameScore,
      gameWon: data.gameWon,
      habits: data.habits,
      motivation: data.motivation,
    },
  }

  await set(newRef, session)
  return newRef.key || ''
}

export async function getAllSessions(): Promise<CheckInSession[]> {
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
  return []
}
