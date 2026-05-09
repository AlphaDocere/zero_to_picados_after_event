/**
 * Seed script: sube data/news.json a Firebase Realtime Database
 * Ejecutar con: node scripts/seed-news.mjs
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set } from 'firebase/database'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Cargar .env.local
config({ path: resolve(__dirname, '..', '.env.local') })

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL:       process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

async function seedNews() {
  // Validar config
  const missing = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k)
  if (missing.length > 0) {
    console.error('❌ Faltan variables de entorno:', missing.join(', '))
    console.error('   Revisa tu archivo .env.local')
    process.exit(1)
  }

  // Leer news.json
  const newsPath = resolve(__dirname, '..', 'data', 'news.json')
  if (!existsSync(newsPath)) {
    console.error('❌ No se encontró data/news.json')
    process.exit(1)
  }

  const newsArray = JSON.parse(readFileSync(newsPath, 'utf-8'))
  console.log(`📰 ${newsArray.length} noticias cargadas desde data/news.json`)

  // Inicializar Firebase
  const app = initializeApp(firebaseConfig)
  const db = getDatabase(app)

  // Agrupar por ciudad
  const byCity = {}
  for (const item of newsArray) {
    if (!byCity[item.city]) byCity[item.city] = {}
    byCity[item.city][String(item.id)] = item
  }

  const cities = Object.keys(byCity)
  console.log(`🏙️  Ciudades: ${cities.join(', ')}\n`)

  // Subir a Firebase: /news/{ciudad}/{id}
  for (const city of cities) {
    const cityRef = ref(db, `news/${city}`)
    await set(cityRef, byCity[city])
    console.log(`  ✅ ${city}: ${Object.keys(byCity[city]).length} noticias subidas`)
  }

  console.log('\n🎉 ¡Seed completado! Las noticias están en Firebase bajo /news/{ciudad}/')
  process.exit(0)
}

seedNews().catch((err) => {
  console.error('❌ Error:', err.message || err)
  process.exit(1)
})
