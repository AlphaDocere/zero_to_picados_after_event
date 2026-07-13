import { getFirebaseDb } from './firebase'
import { ref, get, set, push } from 'firebase/database'

// ─── Tipos para el formato enriquecido (news.json) ───────────────────────────

export interface MoodNews {
  id: number
  city: string
  headline: { es: string; en: string }
  summary: { es: string; en: string }
  category: string
  date: string
  moodAffinity: 'low' | 'medium' | 'high'
  moodTags: string[]
  emoji: string
}

/**
 * Obtiene todas las noticias de una ciudad desde Firebase (/news/{city}).
 * Si Firebase no está disponible, cae al archivo local data/news.json.
 */
export async function getMoodNewsForCity(cityName: string): Promise<MoodNews[]> {
  // 1. Intentar desde Firebase
  try {
    const db = getFirebaseDb()
    const newsRef = ref(db, `news/${cityName}`)
    const snapshot = await get(newsRef)

    if (snapshot.exists()) {
      const data = snapshot.val()
      const items: MoodNews[] = Object.values(data) as MoodNews[]
      console.log(`[news-service] Firebase: ${items.length} noticias para ${cityName}`)
      return items
    }
  } catch (err) {
    console.warn('[news-service] Firebase no disponible, usando datos locales:', err)
  }

  // 2. Fallback: leer desde data/news.json (solo en Node/SSR)
  //    En el cliente, el import dinámico carga el JSON directamente.
  try {
    const allNews: MoodNews[] = (await import('@/data/news.json')).default as MoodNews[]
    const filtered = allNews.filter((n) => n.city === cityName)
    console.log(`[news-service] Local JSON: ${filtered.length} noticias para ${cityName}`)
    return filtered
  } catch (err) {
    console.error('[news-service] Error cargando datos locales:', err)
  }

  return []
}

export interface News {
  id?: string
  title: string
  description: string
  sentiment: 'positive' | 'neutral' | 'negative'
  category: string
}

export interface CityNews {
  cityName: string
  news: News[]
}

/**
 * Obtiene noticias aleatorias de una ciudad
 */
export async function getRandomNewsForCity(cityName: string): Promise<News | null> {
  try {
    const db = getFirebaseDb()
    const newsRef = ref(db, `cities/${cityName}/news`)
    const snapshot = await get(newsRef)

    if (snapshot.exists()) {
      const newsData = snapshot.val()
      const newsArray = Array.isArray(newsData) ? newsData : Object.values(newsData)

      if (newsArray.length > 0) {
        const randomIndex = Math.floor(Math.random() * newsArray.length)
        return newsArray[randomIndex] as News
      }
    }
  } catch (error) {
    console.error('[v0] Error fetching news for city:', error)
  }

  return null
}

/**
 * Obtiene todas las noticias de una ciudad
 */
export async function getNewsForCity(cityName: string): Promise<News[]> {
  try {
    const db = getFirebaseDb()
    const newsRef = ref(db, `cities/${cityName}/news`)
    const snapshot = await get(newsRef)

    if (snapshot.exists()) {
      const newsData = snapshot.val()
      return Array.isArray(newsData) ? newsData : Object.values(newsData) as News[]
    }
  } catch (error) {
    console.error('[v0] Error fetching news:', error)
  }

  return []
}

/**
 * Agrega una nueva noticia a una ciudad
 */
export async function addNewsToCity(cityName: string, news: Omit<News, 'id'>): Promise<string | null> {
  try {
    const db = getFirebaseDb()
    const newsRef = ref(db, `cities/${cityName}/news`)
    const newNewsRef = push(newsRef, news)
    return newNewsRef.key
  } catch (error) {
    console.error('[v0] Error adding news:', error)
  }

  return null
}

/**
 * Solicita agregar una nueva ciudad
 */
export async function requestNewCity(
  cityName: string,
  country: string,
  email: string,
  message: string
): Promise<boolean> {
  try {
    const db = getFirebaseDb()
    const requestRef = ref(db, `city_requests/${Date.now()}`)
    await set(requestRef, {
      cityName,
      country,
      email,
      message,
      timestamp: new Date().toISOString(),
      status: 'pending',
    })
    return true
  } catch (error) {
    console.error('[v0] Error requesting new city:', error)
  }

  return false
}

/**
 * Obtiene todas las ciudades disponibles
 */
export async function getAvailableCities(): Promise<string[]> {
  try {
    const db = getFirebaseDb()
    const citiesRef = ref(db, 'cities')
    const snapshot = await get(citiesRef)

    if (snapshot.exists()) {
      return Object.keys(snapshot.val())
    }
  } catch (error) {
    console.error('[v0] Error fetching cities:', error)
  }

  return []
}
