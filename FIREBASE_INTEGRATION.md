# Firebase Integration - CheckIn Sessions

## Overview
Real-time integration with Firebase Realtime Database to fetch user CheckIn sessions and calculate agent-specific analytics.

## Architecture

### Simple Fetch + Cache Pattern
- **No external state management** - Just hooks
- **No complex listeners** - Simple async/await
- **localStorage caching** - 60s-120s TTL per agent
- **Graceful fallback** - Shows cached data if Firebase unavailable

### File Structure
```
lib/
├── firebase/
│   └── agent-service.ts      # Firebase read logic + analytics calculation
└── cache-utils.ts            # localStorage cache with TTL

hooks/
├── use-agent-memory.ts       # Fetch + transform CheckIns → AgentMemorySummary
└── use-agent-analytics.ts    # Fetch + calculate → AgentAnalytics
```

## Data Flow

### 1. Component Mounts → Hook Initializes
```
AgentCard mounts
  ↓
useAgentMemory(agentId) runs
  ↓
Check cache for `agent_memory_${agentId}`
  ├─ Hit: Return cached data
  └─ Miss: Fetch from Firebase
```

### 2. Fetch from Firebase
```
fetchCheckInsByAgent(agentId)
  ↓
Query: 'checkIns' ordered by timestamp, limit 50
  ↓
Filter by agentId (or show all if not stored)
  ↓
Sort by timestamp DESC (newest first)
  ↓
Return [CheckInSession[], [], []]
```

### 3. Transform to UI Format
```
CheckInSession[] 
  ├─ reflection → userInput
  ├─ moodAfter → sentiment
  ├─ city → city
  └─ timestamp → timestamp
  ↓
AgentMemorySummary
  ├─ totalConversations: sessions.length
  ├─ averageSentiment: avg(moodAfter)
  ├─ recentConversations: sessions[0:3]
  └─ themes: [] (future enhancement)
```

### 4. Cache & Return
```
setCache(cacheKey, data, 60000)  // 60s TTL
  ↓
setState(data)
  ↓
Component re-renders with real data
```

## CheckIn Session Structure
```typescript
interface CheckInSession {
  id: string              // Firebase key
  userId: string          // User identifier
  reflection: string      // User's reflection text
  moodBefore: number      // 0-100
  moodAfter: number       // 0-100 (displayed as sentiment)
  city: string            // User's city
  timestamp: number       // When created
  agentId: string         // Optional: agent used
}
```

## Analytics Calculation
```
calculateAnalytics(sessions)
  ├─ sentimentTrend: last 7 sessions' moodAfter
  ├─ moodDistribution: count by ranges (0-25, 26-50, 51-75, 76-100)
  ├─ engagementByCity: top 5 cities by count
  └─ topThemes: [] (future: NLP extraction)
```

## Performance

### Database Reads
- First load: 1 read (fetch 50 CheckIns)
- Cache hit: 0 reads (for 60-120s)
- Per user: ~12-14 reads/day (if cache expires every ~5-7 minutes)
- Monthly estimate: 144-168 reads/user/day

### Benefits
✓ No subscriptions = no real-time listeners burning reads  
✓ Cache layer = predictable costs  
✓ Simple error handling = robust fallback  
✓ No state management = minimal complexity  

## Error Handling

### If Firebase Down
```
catch (error) {
  console.error('[v0] Error fetching...', error)
  
  // Try to get stale cache (fallback)
  const staleCache = getCache(key)
  if (staleCache) {
    return staleCache  // Show old data
  }
  
  // If no cache, show empty state
  setState(null)
}
```

### Empty Data
```
No sessions → {
  totalConversations: 0,
  averageSentiment: 0,
  lastActivity: now,
  recentConversations: [],
  themes: []
}
```

## Usage in Components

### Basic
```tsx
const { data, loading, error } = useAgentMemory('amplifier')

if (loading) return <Skeleton />
if (error) return <Error message={error.message} />
if (!data) return <Empty />

return (
  <div>
    <h2>{data.totalConversations} conversations</h2>
    {data.recentConversations.map(conv => (
      <Conversation key={conv.id} {...conv} />
    ))}
  </div>
)
```

## Future Enhancements

1. **Theme Extraction** - Use NLP to extract themes from reflections
2. **Real-time Updates** - Add listeners for live updates when needed
3. **User-level Filtering** - Filter CheckIns by user ID
4. **Advanced Analytics** - Mood trajectory, sentiment correlation
5. **Pagination** - Load more CheckIns with pagination

## Firebase Structure Expected
```
checkIns/
├── sessionId1: {
│   userId: "user123",
│   reflection: "Hoy fue un buen día",
│   moodBefore: 60,
│   moodAfter: 85,
│   city: "Madrid",
│   timestamp: 1714876543000,
│   agentId: "amplifier"  // optional
│ }
├── sessionId2: { ... }
└── sessionId3: { ... }
```

## Testing

```bash
# Clear cache during development
localStorage.clear()

# Check console logs for:
# "[v0] Fetching CheckIn sessions for agent: amplifier"
# "[v0] Using cached memory for agent: amplifier"
```
