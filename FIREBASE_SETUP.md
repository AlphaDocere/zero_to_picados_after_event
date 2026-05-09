# Firebase Setup Guide

## Overview

Firebase is now initialized as a **singleton** to prevent multiple initializations that cause warnings and errors.

## Architecture

### Centralized Initialization

- **`lib/firebase-init.ts`** - Singleton factories for all Firebase services
  - `getFirebaseApp()` - App instance
  - `getFirebaseDatabase()` - Realtime Database
  - `getFirestoreDb()` - Firestore
  - `getFirebaseAuth()` - Authentication

### Usage Pattern

```typescript
// ❌ WRONG - Don't initialize directly
import { initializeApp } from 'firebase/app'
const app = initializeApp(config)

// ✅ CORRECT - Use singleton
import { getFirebaseDatabase } from '@/lib/firebase-init'
const db = getFirebaseDatabase()
```

## Required Environment Variables

Add these to `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Service Modules

### 1. **lib/firebase.ts**
Main Firebase functions for check-in sessions:
- `createCheckInSession()` - Create new session
- `getCheckInSession()` - Retrieve session
- `updateCheckInSession()` - Update session
- `completeCheckInSession()` - Mark as completed
- `getAllSessions()` - Get all sessions (with mock fallback)

### 2. **lib/firebase/agent-service.ts**
Agent-specific queries:
- `fetchCheckInsByAgent()` - Get sessions by agent ID
- Uses singleton internally

### 3. **lib/news-service.ts**
News and city management:
- `getRandomNewsForCity()` - Get random news per city
- `getNewsForCity()` - Get all news
- `addNewsToCity()` - Add news (admin)
- `requestNewCity()` - User city requests

## Best Practices

### For Team Members

1. **Always use singleton imports:**
   ```typescript
   import { getFirebaseDatabase } from '@/lib/firebase-init'
   const db = getFirebaseDatabase()
   ```

2. **Never import initializeApp:**
   ```typescript
   // ❌ Wrong
   import { initializeApp } from 'firebase/app'
   ```

3. **Use existing services:**
   ```typescript
   // ✅ Correct
   import { getFirebaseDb } from '@/lib/firebase'
   import { fetchCheckInsByAgent } from '@/lib/firebase/agent-service'
   import { getRandomNewsForCity } from '@/lib/news-service'
   ```

### Creating New Firebase Services

```typescript
// lib/firebase/my-new-service.ts
import { getFirebaseDatabase } from '../firebase-init'
import { ref, get } from 'firebase/database'

export async function myNewFunction() {
  const db = getFirebaseDatabase() // Use singleton!
  const myRef = ref(db, 'my-path')
  const snapshot = await get(myRef)
  return snapshot.val()
}
```

## Firebase Realtime Database Structure

```
/
├── check-in-sessions/
│   ├── {sessionId}/
│   │   ├── initialMood: number
│   │   ├── finalMood: number
│   │   ├── city: string
│   │   ├── selectedAgent: string
│   │   ├── opinion: string
│   │   ├── status: 'in-progress' | 'completed'
│   │   └── ...
│   └── ...
│
├── cities/
│   ├── {cityName}/
│   │   └── news/
│   │       ├── {newsId}: { title, description, type, ... }
│   │       └── ...
│   └── ...
│
└── city_requests/
    ├── {timestamp}/
    │   ├── cityName: string
    │   ├── email: string
    │   ├── message: string
    │   └── status: 'pending' | 'approved'
    └── ...
```

## Debugging

### Check if Firebase is initialized properly

```typescript
import { getFirebaseApp } from '@/lib/firebase-init'

try {
  const app = getFirebaseApp()
  console.log('[v0] Firebase initialized:', app.name)
} catch (err) {
  console.error('[v0] Firebase error:', err)
}
```

### Mock Data Mode

If Firebase is unavailable, the app automatically falls back to mock data:
```typescript
// In lib/firebase.ts
getAllSessions() // Returns mock data if Firebase fails
```

## Multiple Visualizations Ready

The singleton architecture supports multiple visualizations:
- Timeline views
- Map views
- Statistics dashboards
- City comparisons
- Sentiment analysis
- Agent performance metrics

All using the same centralized Firebase instance.
