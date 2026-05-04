import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { 
      city, 
      initialMood, 
      finalMood, 
      opinion, 
      followUpResponse, 
      agentName,
      supporterName,
      supportMessage
    } = await req.json()

    console.log('[v0] Discord webhook - Received request:', { city, agentName, supporterName })

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
      console.error('[v0] Discord webhook URL not configured in env')
      return NextResponse.json(
        { error: 'Discord webhook not configured' },
        { status: 500 }
      )
    }

    console.log('[v0] Discord webhook URL found:', webhookUrl.substring(0, 50) + '...')

    const moodChange = finalMood - initialMood
    const changeEmoji = moodChange > 0 ? '📈' : moodChange < 0 ? '📉' : '➡️'
    const supportEmojis = ['💚', '🙏', '✨', '🌟', '💫', '🕯️', '🌸']
    const randomSupportEmoji = supportEmojis[Math.floor(Math.random() * supportEmojis.length)]

    const fields = [
      {
        name: '🌱 Reflexión',
        value: `> ${opinion}`,
        inline: false
      },
      {
        name: '🤖 Respuesta del Agente',
        value: followUpResponse ? `> ${followUpResponse}` : 'No hay respuesta adicional',
        inline: false
      },
      {
        name: '📊 Cambio Emocional',
        value: `${initialMood}/100 → ${finalMood}/100 ${changeEmoji} ${moodChange > 0 ? '+' : ''}${moodChange}`,
        inline: true
      },
      {
        name: '✨ Guía',
        value: agentName || 'Desconocido',
        inline: true
      },
      {
        name: '📍 Ciudad',
        value: city,
        inline: true
      }
    ]

    // Si hay apoyo, agregarlo
    if (supporterName && supportMessage) {
      fields.push({
        name: `${randomSupportEmoji} Apoyo de ${supporterName}`,
        value: `> ${supportMessage}`,
        inline: false
      })
    }

    const embed = {
      title: supporterName 
        ? `${randomSupportEmoji} Semilla Apoyada en ${city}` 
        : `🌱 Nueva Semilla Emocional - ${city}`,
      description: supporterName 
        ? `${supporterName} sumó su apoyo a esta reflexión` 
        : `Un viajero plantó una semilla en nuestra cosecha colaborativa`,
      color: supporterName ? 15416959 : (moodChange > 0 ? 5763719 : moodChange < 0 ? 15158332 : 7506394), // Purple for support, Green/Red/Gray
      fields,
      timestamp: new Date().toISOString(),
      footer: {
        text: supporterName ? `${supporterName} • Reflect - Cosecha Colaborativa` : 'Reflect - Cosecha Colaborativa del Sentir'
      }
    }

    const payload = {
      embeds: [embed],
      username: supporterName ? '✨ Reflect Apoyo' : 'Reflect Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
    }

    console.log('[v0] Sending to Discord webhook...', supporterName ? `with support from ${supporterName}` : '')
    console.log('[v0] Payload:', JSON.stringify(payload, null, 2))
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    console.log('[v0] Discord response status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('[v0] Discord webhook error:', error)
      return NextResponse.json(
        { error: 'Failed to send to Discord', details: error },
        { status: response.status }
      )
    }

    console.log('[v0] Successfully sent to Discord webhook')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[v0] API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
