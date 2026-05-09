import { getFirebaseDb } from './firebase'
import { ref, get, set, push } from 'firebase/database'

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
  email: string,
  message: string
): Promise<boolean> {
  try {
    const db = getFirebaseDb()
    const requestRef = ref(db, `city_requests/${Date.now()}`)
    await set(requestRef, {
      cityName,
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
