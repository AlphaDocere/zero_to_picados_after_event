import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const cities = ['Buenos Aires', 'Mexico City', 'Bogotá', 'Lima', 'Santiago', 'São Paulo', 'Madrid', 'Barcelona', 'Lagos', 'Dubai', 'Singapore', 'Tokyo', 'Mumbai', 'São Paulo', 'Toronto']
const agents = ['amplifier', 'documentarian', 'visionary']

const opinions = [
  'Este evento cambió completamente mi perspectiva sobre la colaboración global y la inteligencia artificial.',
  'Aprendí que la transformación digital no es solo tecnología, sino conexión humana.',
  'Zero to Agent me mostró que somos más capaces de lo que creemos cuando nos atrevemos a intentar.',
  'La experiencia fue desafiante pero extraordinariamente enriquecedora.',
  'Descubrí que mis miedos sobre IA eran infundados; es una herramienta para potenciar, no reemplazar.',
  'Este viaje emocional me preparó para los próximos desafíos de mi carrera.',
  'Siento que ahora soy parte de una comunidad global de innovadores.',
  'Lo más importante fue darme cuenta de que el cambio comienza dentro de uno mismo.',
  'Cada interacción con otros participantes amplificó mi aprendizaje exponencialmente.',
  'Ahora entiendo que el futuro no es algo que ocurra, sino algo que construimos juntos.',
]

interface TestSession {
  userId: string
  initialMood: number
  finalMood: number
  city: string
  selectedAgent: string
  opinion: string
  checkInData: {
    emotions: string[]
    thoughts: string
    physicalState: string
    environment: string
  }
  harvestData?: {
    whatChanged: string
    keyInsight: string
    nextStep: string
  }
  agentResponses?: {
    response: string
    timestamp: number
  }
}

function generateTestSession(index: number): TestSession {
  const mood1 = Math.floor(Math.random() * 100)
  const moodShift = Math.random() > 0.5 ? Math.random() * 40 - 20 : Math.random() * 50 - 10
  const mood2 = Math.max(1, Math.min(100, mood1 + moodShift))
  
  return {
    userId: `test_user_${index}`,
    initialMood: mood1,
    finalMood: mood2,
    city: cities[Math.floor(Math.random() * cities.length)],
    selectedAgent: agents[Math.floor(Math.random() * agents.length)],
    opinion: opinions[Math.floor(Math.random() * opinions.length)],
    checkInData: {
      emotions: ['curiosidad', 'entusiasmo', 'incertidumbre', 'inspiración', 'confianza'].sort(() => Math.random() - 0.5).slice(0, 3),
      thoughts: 'Reflexionando sobre el impacto de este evento en mi vida',
      physicalState: ['energético', 'enfocado', 'reflexivo', 'motivado'][Math.floor(Math.random() * 4)],
      environment: ['virtual', 'presencial', 'híbrido'][Math.floor(Math.random() * 3)],
    },
    harvestData: {
      whatChanged: `Mi perspectiva sobre ${['la IA', 'la colaboración', 'la innovación', 'el futuro'][Math.floor(Math.random() * 4)]} cambió significativamente.`,
      keyInsight: 'La conexión humana es la base para cualquier transformación tecnológica exitosa.',
      nextStep: 'Aplicar estos aprendizajes en mi proyecto actual y compartir con mi equipo.',
    },
    agentResponses: {
      response: opinions[Math.floor(Math.random() * opinions.length)],
      timestamp: Date.now(),
    },
  }
}

async function seedTestData() {
  try {
    console.log('Starting seed data generation...')
    const batch = writeBatch(db)
    const sessionCount = 30

    for (let i = 0; i < sessionCount; i++) {
      const session = generateTestSession(i)
      const sessionRef = doc(collection(db, 'check_in_sessions'))
      
      batch.set(sessionRef, {
        ...session,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Crear memory entry para el agente
      const memoryRef = doc(collection(db, `agents/${session.selectedAgent}/outputs`))
      batch.set(memoryRef, {
        sessionId: sessionRef.id,
        responseText: session.opinion,
        outputType: 'preview',
        status: 'pending',
        createdAt: serverTimestamp(),
      })
    }

    await batch.commit()
    console.log(`Successfully seeded ${sessionCount} test sessions with agent memory entries`)
  } catch (error) {
    console.error('Error seeding test data:', error)
    process.exit(1)
  }
}

seedTestData()
