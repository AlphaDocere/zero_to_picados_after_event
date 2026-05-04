# System Architecture - UML Diagram

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
├─────────────────────────────────────────────────────────────┤
│  Home (/)  │  Harvest (/harvest)  │  Insights (/insights)   │
│ Dashboard  │  Navigation          │                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP ROUTER                        │
├─────────────────────────────────────────────────────────────┤
│ • Server Components        • API Routes                      │
│ • Client Components        • Middleware                      │
│ • Layouts & Pages          • Utility Functions              │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  FIREBASE RTDB   │ │  DISCORD WEBHOOK │ │   AGENT SYSTEM   │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ • Sessions       │ │ • Embeds         │ │ • Nova           │
│ • Real-time Sync │ │ • Community Amp  │ │ • Atlas          │
│ • Query Builder  │ │ • Notifications  │ │ • Phoenix        │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

## Data Flow Diagram

```
User Check-in
    │
    ↓
[Step 1] Mood Input (0-100)
    ↓
[Step 2] City Selection (20 cities)
    ↓
[Step 3] News Display (localized)
    ↓
[Step 4] Opinion Input
    ↓
[Step 5] Agent Selection (Nova/Atlas/Phoenix)
    ↓
[Step 6] Agent Response (via API)
    ↓
[Step 7] Follow-up Question
    ↓
[Step 8] Final Mood (0-100)
    ↓
[Step 9] Summary & Share
    ↓
    ├─→ Save to Firebase RTDB
    │
    ├─→ Send to Discord Webhook
    │
    └─→ Add to Harvest Gallery
           │
           ↓
    [Optional] +1 Support Modal
           │
           ↓
    Send Support to Discord
```

## Component Hierarchy

```
RootLayout
├── RootNav (Fixed Navigation)
│   ├── Link: Home
│   ├── Link: Harvest
│   ├── Link: Insights
│   └── Link: Dashboard
│
├── HomePage (/)
│   └── CheckInForm
│       ├── MoodSlider (Step 1)
│       ├── CitySelector (Step 2)
│       ├── NewsCard (Step 3)
│       ├── OpinionInput (Step 4)
│       ├── AgentSelector (Step 5)
│       ├── ResponseDisplay (Step 6)
│       ├── FollowUpInput (Step 7)
│       ├── FinalMood (Step 8)
│       └── SummaryCard (Step 9)
│
├── HarvestPage (/harvest)
│   ├── StatsPanel
│   │   ├── TotalSessions
│   │   ├── AvgMoodChange
│   │   └── ActiveCities
│   ├── SessionGallery
│   │   └── SessionCard (repeating)
│   │       ├── Opinion Display
│   │       ├── Agent Response
│   │       ├── Share Button
│   │       └── SupportModal
│   └── Filters
│
├── InsightsPage (/insights)
│   ├── GlobalStats
│   ├── CityMap (bar chart)
│   ├── CityComparator (dropdown selector)
│   ├── EmotionalClusters (grouped view)
│   ├── ConnectionsNetwork (line chart)
│   └── ThemesCloud (word cloud)
│
├── DashboardPage (/dashboard)
│   ├── OverviewCards
│   ├── MoodTimeline
│   └── AgentPerformance
│
└── Analytics Component
```

## Database Relations

```
┌─────────────────────────────────────────┐
│         CHECK_IN_SESSIONS               │
├─────────────────────────────────────────┤
│ id (primary key)                        │
│ initialMood: 0-100                      │
│ finalMood: 0-100                        │
│ city: string (foreign key to CITIES)    │
│ opinion: string                         │
│ selectedAgent: enum                     │
│ agentResponse: string                   │
│ followUpResponse: string                │
│ status: enum (completed/draft)          │
│ createdAt: timestamp                    │
│ updatedAt: timestamp                    │
│ supportCount: integer (soft count)      │
└─────────────────────────────────────────┘
         │
         ├─→ ┌──────────────────────┐
         │   │      CITIES          │
         │   ├──────────────────────┤
         │   │ id                   │
         │   │ name                 │
         │   │ country              │
         │   │ icon                 │
         │   └──────────────────────┘
         │
         └─→ ┌──────────────────────┐
             │    AGENTS            │
             ├──────────────────────┤
             │ id                   │
             │ name                 │
             │ personality          │
             │ responsePattern      │
             └──────────────────────┘
```

## API Endpoints Architecture

```
┌───────────────────────────────────────────────────────────┐
│                 API ROUTES (/api)                         │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  POST /share-to-discord                                   │
│  ├── Input: Session data + optional support              │
│  ├── Process: Format embed, validate webhook             │
│  └── Output: Discord embed notification                  │
│                                                            │
│  POST /agent-response                                     │
│  ├── Input: Opinion + mood + selected agent              │
│  ├── Process: Generate contextual response               │
│  └── Output: Agent message                               │
│                                                            │
│  GET /get-sessions                                        │
│  ├── Input: Optional city filter                          │
│  ├── Process: Query Firebase, aggregate data             │
│  └── Output: JSON array of sessions                       │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

## State Management Flow

```
Session State (useCheckInWorkflow hook)
│
├── currentStep (1-9)
├── formData {
│   ├── initialMood
│   ├── city
│   ├── opinion
│   ├── selectedAgent
│   ├── agentResponse
│   ├── followUpResponse
│   └── finalMood
├── sessionId (Firebase ID)
├── status (loading/success/error)
└── error (if any)

Shared Sessions State (global)
│
├── sessions: Session[]
├── filteredSessions: Session[]
├── selectedCity: string
├── sortBy: "date" | "mood_change"
└── searchQuery: string

Insights State (useInsights hook)
│
├── cities: CityStats[]
├── similarities: SimilarityMap
├── themes: Theme[]
├── clusters: ClusterGroup[]
└── selectedComparison: [city1, city2]
```

## Security & Privacy

```
┌──────────────────────────────────────────┐
│     ENVIRONMENT VARIABLES (Secure)       │
├──────────────────────────────────────────┤
│ Public (exposed to client):              │
│ • NEXT_PUBLIC_FIREBASE_*                 │
│ • Used for authentication & read access  │
│                                          │
│ Private (server-side only):              │
│ • DISCORD_WEBHOOK_URL                    │
│ • API_KEYS (future)                      │
└──────────────────────────────────────────┘

Firebase Security:
• RTDB rules restrict to authenticated reads
• Write access only through API endpoints
• Validation at both client and server
```

## Deployment Architecture

```
GitHub (AlphaDocere/zero_to_agent_animomemtro)
│
└─→ Vercel (CI/CD Pipeline)
    │
    ├─→ Build (pnpm install, pnpm build)
    │
    ├─→ Test (linting, type checking)
    │
    ├─→ Deploy (to Vercel Edge Network)
    │
    └─→ Live at https://v0-emotional-check-in-app-self.vercel.app/
```

## Performance Optimization

```
Code Splitting:
• Pages lazy-loaded by Next.js
• Components code-split by route

Caching Strategy:
• Firebase: Real-time sync (no cache TTL)
• Static assets: 1 year CDN cache
• API responses: SWR for client cache

Bundle Optimization:
• Tree-shaking enabled
• Recharts only loaded on /insights
• Modal components lazy-loaded
```

---

**Architecture v1.0 - Final**
**Designed for**: Scalability, real-time sync, global reach
**Next Phase**: Theme customization, character integration
