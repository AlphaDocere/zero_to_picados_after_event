import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

// Fallback data if generation fails
const FALLBACK_RECOMMENDATIONS = {
  "generatedAt": new Date().toISOString(),
  "agents": [
    {
      "agentId": "amplifier",
      "agentName": "Nova",
      "cities": ["Mendoza", "Santiago", "Buenos Aires", "Lima", "Bogotá"],
      "news": [
        { "title": "Zero to Agent Summit", "description": "Connectando builders en Latinoamérica", "emoji": "🚀" },
        { "title": "Aiweekend Mendoza", "description": "Comunidad IA crece en Argentina", "emoji": "💡" },
        { "title": "Open Source Ecosystem", "description": "Nuevos proyectos comunitarios", "emoji": "🌟" }
      ],
      "emotions": ["Inspiración", "Conexión", "Esperanza"]
    },
    {
      "agentId": "documentarian",
      "agentName": "Atlas",
      "cities": ["Santiago", "Mendoza", "Bogotá", "Buenos Aires", "México City"],
      "news": [
        { "title": "Documentation Summit", "description": "Compartiendo mejores prácticas", "emoji": "📚" },
        { "title": "Community Stories", "description": "Historias de builders reales", "emoji": "✍️" },
        { "title": "Learning Together", "description": "Recursos educativos abiertos", "emoji": "🎓" }
      ],
      "emotions": ["Reflexión", "Claridad", "Aprendizaje"]
    },
    {
      "agentId": "visionary",
      "agentName": "Phoenix",
      "cities": ["Santiago", "Mendoza", "São Paulo", "Lima", "Mexico City"],
      "news": [
        { "title": "Future of AI", "description": "Tendencias emergentes en IA", "emoji": "🔮" },
        { "title": "Innovation Sprint", "description": "Hackathons y desafíos creativo", "emoji": "⚡" },
        { "title": "Transformation Stories", "description": "Cómo IA está cambiando vidas", "emoji": "🦋" }
      ],
      "emotions": ["Visión", "Transformación", "Posibilidad"]
    }
  ]
}

export async function GET(req: NextRequest) {
  try {
    const publicPath = path.join(process.cwd(), 'public', 'agent-recommendations.json')
    
    try {
      const data = await fs.readFile(publicPath, 'utf-8')
      const recommendations = JSON.parse(data)
      
      return NextResponse.json({
        success: true,
        message: 'Recommendations loaded',
        data: recommendations,
        cached: true
      })
    } catch (err) {
      console.log('[v0] Recommendations file not found, using fallback')
      return NextResponse.json({
        success: true,
        message: 'Using fallback recommendations',
        data: FALLBACK_RECOMMENDATIONS,
        cached: false
      })
    }
  } catch (error) {
    console.error('[v0] Error in get-recommendations:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Just return fallback for now - regeneration happens via separate API
    return NextResponse.json({
      success: true,
      message: 'Use /api/regenerate-recommendations to generate new data'
    })
  } catch (error) {
    console.error('[v0] Error in get-recommendations POST:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
