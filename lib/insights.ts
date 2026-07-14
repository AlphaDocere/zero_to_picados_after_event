// Analyze similarities between cities based on mood changes and keywords
export function analyzeCityPatterns(sessions: any[]) {
  const cityData: Record<string, any> = {}

  sessions.forEach(session => {
    // Skip sessions that don't have a valid city or are not completed
    if (!session.city || session.status !== 'completed') return

    const initial = Number(session.initialMood)
    const final = Number(session.finalMood)
    if (isNaN(initial) || isNaN(final)) return

    if (!cityData[session.city]) {
      cityData[session.city] = {
        city: session.city,
        moods: [],
        opinions: [],
        changes: [],
        agents: {},
        count: 0
      }
    }

    cityData[session.city].moods.push(initial)
    if (session.opinion) {
      cityData[session.city].opinions.push(session.opinion)
    }
    cityData[session.city].changes.push(final - initial)
    
    if (session.selectedAgent) {
      cityData[session.city].agents[session.selectedAgent] = 
        (cityData[session.city].agents[session.selectedAgent] || 0) + 1
    }
    cityData[session.city].count++
  })

  // Calculate aggregates
  return Object.entries(cityData).map(([_, data]: any) => {
    const avgMood = data.moods.length > 0 
      ? Math.round(data.moods.reduce((a: number, b: number) => a + b, 0) / data.moods.length)
      : 0
    const avgChange = data.changes.length > 0
      ? Math.round(data.changes.reduce((a: number, b: number) => a + b, 0) / data.changes.length * 10) / 10
      : 0

    return {
      city: data.city,
      avgMood,
      avgChange,
      count: data.count,
      topAgent: Object.entries(data.agents).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'none',
      opinions: data.opinions,
      changes: data.changes
    }
  })
}

// Extract keywords and themes from opinions
export function extractThemes(opinions: string[]) {
  const stopwords = new Set(['el', 'la', 'de', 'que', 'y', 'a', 'en', 'es', 'un', 'una', 'por', 'para', 'con', 'del', 'al'])
  const wordFreq: Record<string, number> = {}

  opinions.forEach(opinion => {
    const words = opinion
      .toLowerCase()
      .replace(/[.,!?;:]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopwords.has(w))

    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    })
  })

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, freq]) => ({ word, value: freq }))
}

// Calculate similarity between two cities
export function calculateCitySimilarity(city1Data: any, city2Data: any) {
  const moodDiff = Math.abs(city1Data.avgMood - city2Data.avgMood)
  const changeDiff = Math.abs(city1Data.avgChange - city2Data.avgChange)
  
  // Similarity score 0-100
  return Math.round((1 - (moodDiff + changeDiff) / 200) * 100)
}

// Get city connections (similar cities)
export function getCityConnections(cities: any[], threshold = 50) {
  const connections: any[] = []

  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const similarity = calculateCitySimilarity(cities[i], cities[j])
      if (similarity >= threshold) {
        connections.push({
          source: cities[i].city,
          target: cities[j].city,
          similarity
        })
      }
    }
  }

  return connections
}

// Get mood evolution timeline
export function getGlobalTimeline(sessions: any[]) {
  return sessions
    .sort((a: any, b: any) => a.createdAt - b.createdAt)
    .map((session: any) => ({
      city: session.city,
      mood: session.finalMood,
      change: session.finalMood - session.initialMood,
      timestamp: session.createdAt,
      agent: session.selectedAgent
    }))
}

// Get emotional clusters
export function getEmotionalClusters(cities: any[]) {
  const clusters = {
    rising: cities.filter(c => c.avgChange > 5),
    stable: cities.filter(c => c.avgChange >= -5 && c.avgChange <= 5),
    declining: cities.filter(c => c.avgChange < -5)
  }

  return clusters
}
