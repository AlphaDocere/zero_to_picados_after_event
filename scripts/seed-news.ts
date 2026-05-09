/**
 * Script para subir news.json a Firebase Realtime Database
 * 
 * Uso:
 *   npx ts-node scripts/seed-news.ts
 * 
 * Requiere las variables de entorno en .env.local
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set } from 'firebase/database'

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

async function seedNews() {
  // Validar config
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k)

  if (missing.length > 0) {
    console.error('❌ Faltan variables de entorno:', missing.join(', '))
    console.error('   Asegúrate de tener .env.local configurado correctamente')
    process.exit(1)
  }

  // Leer news.json
  const newsPath = path.resolve(process.cwd(), 'data', 'news.json')
  if (!fs.existsSync(newsPath)) {
    console.error('❌ No se encontró data/news.json')
    process.exit(1)
  }

  const newsArray = JSON.parse(fs.readFileSync(newsPath, 'utf-8'))
  console.log(`📰 Cargando ${newsArray.length} noticias desde data/news.json...`)

  // Inicializar Firebase
  const app = initializeApp(firebaseConfig)
  const db = getDatabase(app)

  // Agrupar noticias por ciudad
  const byCity: Record<string, object[]> = {}
  for (const item of newsArray) {
    const city = item.city
    if (!byCity[city]) byCity[city] = []
    byCity[city].push(item)
  }

  const cities = Object.keys(byCity)
  console.log(`🏙️  Ciudades encontradas: ${cities.join(', ')}`)

  // Subir a Firebase bajo /news/{ciudad}/{id}
  for (const city of cities) {
    const items = byCity[city]
    const cityRef = ref(db, `news/${city}`)
    
    // Convertir array a objeto keyed por id
    const cityData: Record<string, object> = {}
    for (const item of items as any[]) {
      cityData[String(item.id)] = item
    }

    await set(cityRef, cityData)
    console.log(`  ✅ ${city}: ${items.length} noticias subidas`)
  }

  console.log('\n🎉 ¡Seed completado exitosamente!')
  console.log('   Las noticias están en Firebase bajo: /news/{ciudad}/{id}')
  process.exit(0)
}

seedNews().catch((err) => {
  console.error('❌ Error durante el seed:', err)
  process.exit(1)
})
