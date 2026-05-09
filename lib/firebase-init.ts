import { initializeApp, getApp, FirebaseApp } from 'firebase/app'
import { getDatabase, Database } from 'firebase/database'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
}

let app: FirebaseApp | null = null
let database: Database | null = null
let firestore: Firestore | null = null
let auth: Auth | null = null

/**
 * Initialize Firebase singleton
 * Call this once at app startup
 */
export function initializeFirebase(): FirebaseApp {
  try {
    // Try to get existing app first
    app = getApp()
  } catch {
    // App doesn't exist, create it
    app = initializeApp(firebaseConfig)
  }
  return app
}

/**
 * Get Firebase app instance (singleton)
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    initializeFirebase()
  }
  return app!
}

/**
 * Get Realtime Database instance (singleton)
 */
export function getFirebaseDatabase(): Database {
  if (!database) {
    const firebaseApp = getFirebaseApp()
    database = getDatabase(firebaseApp)
  }
  return database
}

/**
 * Get Firestore instance (singleton)
 */
export function getFirestoreDb(): Firestore {
  if (!firestore) {
    const firebaseApp = getFirebaseApp()
    firestore = getFirestore(firebaseApp)
  }
  return firestore
}

/**
 * Get Auth instance (singleton)
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = getFirebaseApp()
    auth = getAuth(firebaseApp)
  }
  return auth
}
