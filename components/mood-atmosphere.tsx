'use client'

import { useEffect, useRef, useState } from 'react'
import { useMood } from '@/contexts/MoodContext'

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function lerpHex(a: string, b: string, t: number): string {
  const ah = parseInt(a.replace('#', ''), 16)
  const bh = parseInt(b.replace('#', ''), 16)
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff
  const r = Math.round(lerp(ar, br, t))
  const g = Math.round(lerp(ag, bg, t))
  const b2 = Math.round(lerp(ab, bb, t))
  return `#${((1 << 24) | (r << 16) | (g << 8) | b2).toString(16).slice(1)}`
}

type Theme = {
  bg: string; bgCard: string; bgSecondary: string
  primary: string; accent: string; foreground: string; muted: string; border: string
  fontWeight: number; letterSpacing: string; lineHeight: number; radius: number
  cursorSize: number; glowSize: number; cursorSpeed: number; glowColor: string
  cursorRadius: number; cursorRotation: number;
}

const THEMES: Record<string, Theme> = {
  low: {
    bg: '#01040a', bgCard: '#050914', bgSecondary: '#080d1f',
    primary: '#2563eb', accent: '#1d4ed8', foreground: '#bfdbfe', muted: '#3b82f6', border: '#1e3a8a',
    fontWeight: 300, letterSpacing: '0.04em', lineHeight: 1.8, radius: 8,
    cursorSize: 8, glowSize: 20, cursorSpeed: 0.04, glowColor: '#3b82f6',
    cursorRadius: 2, cursorRotation: 45,
  },
  neutral: {
    bg: '#09090b', bgCard: '#0f111a', bgSecondary: '#16192b',
    primary: '#8b5cf6', accent: '#7c3aed', foreground: '#e0e4f0', muted: '#6b7280', border: '#2e224d',
    fontWeight: 400, letterSpacing: '0em', lineHeight: 1.65, radius: 16,
    cursorSize: 12, glowSize: 30, cursorSpeed: 0.1, glowColor: '#a78bfa',
    cursorRadius: 10, cursorRotation: 0,
  },
  good: {
    bg: '#170514', bgCard: '#21071d', bgSecondary: '#2e0a29',
    primary: '#d946ef', accent: '#c026d3', foreground: '#fdf4ff', muted: '#a21caf', border: '#701a75',
    fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.55, radius: 20,
    cursorSize: 16, glowSize: 42, cursorSpeed: 0.16, glowColor: '#e879f9',
    cursorRadius: 100, cursorRotation: 0,
  },
  high: {
    bg: '#1a0d00', bgCard: '#261400', bgSecondary: '#331a00',
    primary: '#f59e0b', accent: '#ea580c', foreground: '#fffbeb', muted: '#b45309', border: '#78350f',
    fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.4, radius: 28,
    cursorSize: 22, glowSize: 58, cursorSpeed: 0.28, glowColor: '#fbbf24',
    cursorRadius: 100, cursorRotation: 90,
  },
}

// Per-agent overlay color injected after recommendation
const AGENT_OVERLAYS: Record<string, Record<string, string>> = {
  amplifier:    { improving: '#ec489966', stable: '#ec489933', 'needs-care': '#ec489922' },
  documentarian:{ improving: '#6366f155', stable: '#6366f133', 'needs-care': '#6366f144' },
  visionary:    { improving: '#f59e0b55', stable: '#14b8a633', 'needs-care': '#14b8a644' },
}

type BgOpacities = { low: number; neutral: number; good: number; high: number }

// Agent × forecast → specific landscape
// Each agent has a distinct visual personality regardless of the mood slider
const AGENT_SCENE_MAP: Record<string, Record<string, BgOpacities>> = {
  // Nova / Amplifier — emotion & energy. Storm for catharsis, prairie for warmth, canyon for peak state
  amplifier: {
    'needs-care': { low: 1,   neutral: 0, good: 0, high: 0 }, // Tormenta oceánica — catarsis emocional
    'stable':     { low: 0,   neutral: 0, good: 1, high: 0 }, // Pradera — calidez equilibrada
    'improving':  { low: 0,   neutral: 0, good: 0, high: 1 }, // Cañón dorado — energía en ascenso
  },
  // Atlas / Documentarian — memory & reflection. Forest for all states, shifting intensity
  documentarian: {
    'needs-care': { low: 0,   neutral: 1, good: 0, high: 0 }, // Bosque — introspección profunda
    'stable':     { low: 0,   neutral: 1, good: 0, high: 0 }, // Bosque — contemplación serena
    'improving':  { low: 0,   neutral: 0, good: 1, high: 0 }, // Pradera — claridad mental, horizonte
  },
  // Phoenix / Visionary — growth & possibility. Canyon for ambition, prairie for openness, forest for roots
  visionary: {
    'needs-care': { low: 0,   neutral: 1, good: 0, high: 0 }, // Bosque — volver a las raíces
    'stable':     { low: 0,   neutral: 0, good: 1, high: 0 }, // Pradera — horizonte abierto
    'improving':  { low: 0,   neutral: 0, good: 0, high: 1 }, // Cañón — grandeza posible
  },
}

function getTheme(mood: number): Theme {
  if (mood <= 25) return THEMES.low
  if (mood <= 50) { const t = (mood - 25) / 25; return interp(THEMES.low, THEMES.neutral, t) }
  if (mood <= 75) { const t = (mood - 50) / 25; return interp(THEMES.neutral, THEMES.good, t) }
  const t = (mood - 75) / 25; return interp(THEMES.good, THEMES.high, t)
}

function getOpacities(mood: number) {
  if (mood <= 25) return { low: 1, neutral: 0, good: 0, high: 0 }
  if (mood <= 50) { const t = (mood - 25) / 25; return { low: 1 - t, neutral: t, good: 0, high: 0 } }
  if (mood <= 75) { const t = (mood - 50) / 25; return { low: 0, neutral: 1 - t, good: t, high: 0 } }
  const t = (mood - 75) / 25; return { low: 0, neutral: 0, good: 1 - t, high: t }
}

function interp(a: Theme, b: Theme, t: number): Theme {
  return {
    bg: lerpHex(a.bg, b.bg, t), bgCard: lerpHex(a.bgCard, b.bgCard, t), bgSecondary: lerpHex(a.bgSecondary, b.bgSecondary, t),
    primary: lerpHex(a.primary, b.primary, t), accent: lerpHex(a.accent, b.accent, t),
    foreground: lerpHex(a.foreground, b.foreground, t), muted: lerpHex(a.muted, b.muted, t), border: lerpHex(a.border, b.border, t),
    fontWeight: Math.round(lerp(a.fontWeight, b.fontWeight, t)),
    letterSpacing: `${lerp(parseFloat(a.letterSpacing), parseFloat(b.letterSpacing), t).toFixed(3)}em`,
    lineHeight: lerp(a.lineHeight, b.lineHeight, t),
    radius: lerp(a.radius, b.radius, t),
    cursorSize: lerp(a.cursorSize, b.cursorSize, t), glowSize: lerp(a.glowSize, b.glowSize, t),
    cursorSpeed: lerp(a.cursorSpeed, b.cursorSpeed, t), glowColor: lerpHex(a.glowColor, b.glowColor, t),
    cursorRadius: lerp(a.cursorRadius, b.cursorRadius, t),
    cursorRotation: lerp(a.cursorRotation, b.cursorRotation, t),
  }
}

function injectTheme(theme: Theme) {
  const r = document.documentElement
  r.style.setProperty('--background', theme.bg)
  r.style.setProperty('--card', theme.bgCard)
  r.style.setProperty('--secondary', theme.bgSecondary)
  r.style.setProperty('--popover', theme.bgCard)
  r.style.setProperty('--primary', theme.primary)
  r.style.setProperty('--accent', theme.accent)
  r.style.setProperty('--foreground', theme.foreground)
  r.style.setProperty('--muted-foreground', theme.muted)
  r.style.setProperty('--border', theme.border)
  r.style.setProperty('--input', theme.border)
  r.style.setProperty('--mood-font-weight', String(theme.fontWeight))
  r.style.setProperty('--mood-tracking', theme.letterSpacing)
  r.style.setProperty('--mood-line-height', String(theme.lineHeight))
  r.style.setProperty('--radius', `${theme.radius}px`)
  document.body.style.backgroundColor = 'transparent'
}

export function MoodAtmosphere() {
  const { mood, agentState } = useMood()
  const [pos, setPos] = useState({ x: -300, y: -300 })
  const [active, setActive] = useState(false)
  const targetRef = useRef({ x: -300, y: -300 })
  const currentRef = useRef({ x: -300, y: -300 })
  const frameRef = useRef<number | null>(null)
  const themeRef = useRef<Theme>(getTheme(mood))

  // Inject CSS vars on mood change
  useEffect(() => {
    const theme = getTheme(mood)
    themeRef.current = theme
    injectTheme(theme)
  }, [mood])

  // RAF cursor loop
  useEffect(() => {
    const onMove = (e: MouseEvent) => { targetRef.current = { x: e.clientX, y: e.clientY }; setActive(true) }
    const onLeave = () => setActive(false)
    window.addEventListener('mousemove', onMove)
    document.documentElement.addEventListener('mouseleave', onLeave)
    const tick = () => {
      const s = themeRef.current.cursorSpeed
      currentRef.current = {
        x: currentRef.current.x + (targetRef.current.x - currentRef.current.x) * s,
        y: currentRef.current.y + (targetRef.current.y - currentRef.current.y) * s,
      }
      setPos({ ...currentRef.current })
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const theme = themeRef.current

  // Agent overlay color (bottom glow injected after recommendation)
  const agentOverlay = agentState
    ? (AGENT_OVERLAYS[agentState.agentId]?.[agentState.forecast] ?? null)
    : null

  let bgOpacities = getOpacities(mood)

  if (agentState) {
    // After recommendation: each agent selects a specific landscape based on its forecast
    const agentScene = AGENT_SCENE_MAP[agentState.agentId]?.[agentState.forecast]
    if (agentScene) bgOpacities = agentScene
  }

  return (
    <>
      {/* Hyperrealistic Background Images Layer */}
      <div className="pointer-events-none fixed inset-0 z-[-20] overflow-hidden bg-black">
        <img src="/bgs/low_mood_bg_1778357170577.png" alt="Tormenta" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out" style={{ opacity: bgOpacities.low }} />
        <img src="/bgs/neutral_mood_bg_1778357187390.png" alt="Bosque" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out" style={{ opacity: bgOpacities.neutral }} />
        <img src="/bgs/good_mood_bg_1778357201438.png" alt="Pradera" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out" style={{ opacity: bgOpacities.good }} />
        <img src="/bgs/high_mood_bg_1778357219507.png" alt="Cañón" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out" style={{ opacity: bgOpacities.high }} />
      </div>

      {/* Dark Overlay with Theme Color to keep Text Readable */}
      <div className="pointer-events-none fixed inset-0 z-[-10]" style={{ backgroundColor: theme.bg, opacity: 0.75, transition: 'background-color 1.2s ease' }} />

      {/* Mood top glow */}
      <div aria-hidden className="pointer-events-none fixed top-0 left-0 right-0 z-[1]"
        style={{
          height: '40vh',
          background: `radial-gradient(ellipse 80% 100% at 50% 0%, ${theme.glowColor}33 0%, transparent 80%)`,
          transition: 'background 1.2s ease',
        }}
      />

      {/* Agent bottom glow — appears after recommendation */}
      {agentOverlay && (
        <div aria-hidden className="pointer-events-none fixed bottom-0 left-0 right-0 z-[1]"
          style={{
            height: '50vh',
            background: `radial-gradient(ellipse 90% 100% at 50% 100%, ${agentOverlay} 0%, transparent 75%)`,
            transition: 'background 2s ease',
            animation: 'agentGlowIn 2s ease forwards',
          }}
        />
      )}

      {/* Pulsing ring when agent is active */}
      {agentOverlay && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[1]"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${agentOverlay}22 0%, transparent 70%)`,
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
      )}

      {/* Custom cursor */}
      <div className="hidden md:block">
        <div aria-hidden className="pointer-events-none fixed z-[9999]"
          style={{
            width: theme.glowSize, height: theme.glowSize, borderRadius: `${theme.cursorRadius}px`,
            border: `1px solid ${theme.glowColor}55`,
            background: `radial-gradient(circle, ${theme.glowColor}22 0%, transparent 70%)`,
            transform: `translate(${pos.x - theme.glowSize / 2}px, ${pos.y - theme.glowSize / 2}px) rotate(${theme.cursorRotation}deg)`,
            opacity: active ? 1 : 0,
            transition: 'opacity 400ms, border-color 800ms ease, background 800ms ease, width 600ms ease, height 600ms ease, border-radius 600ms ease',
          }}
        />
        <div aria-hidden className="pointer-events-none fixed z-[9999]"
          style={{
            width: theme.cursorSize, height: theme.cursorSize, borderRadius: `${theme.cursorRadius}px`,
            background: theme.glowColor,
            boxShadow: `0 0 ${theme.cursorSize * 1.5}px ${theme.glowColor}cc`,
            transform: `translate(${pos.x - theme.cursorSize / 2}px, ${pos.y - theme.cursorSize / 2}px) rotate(${theme.cursorRotation}deg)`,
            opacity: active ? 1 : 0,
            transition: 'opacity 400ms, background 800ms ease, box-shadow 800ms ease, width 600ms ease, height 600ms ease, border-radius 600ms ease',
          }}
        />
      </div>

      <style>{`
        @keyframes agentGlowIn {
          from { opacity: 0; transform: scaleY(0.5); }
          to   { opacity: 1; transform: scaleY(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
      `}</style>
    </>
  )
}
