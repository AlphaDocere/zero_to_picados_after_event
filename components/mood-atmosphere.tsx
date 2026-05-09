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
}

const THEMES: Record<string, Theme> = {
  low: {
    bg: '#03060f', bgCard: '#070c1a', bgSecondary: '#0a1020',
    primary: '#4a7fe0', accent: '#3a6abf', foreground: '#a8b8d0', muted: '#4a5a72', border: '#1a2540',
    fontWeight: 300, letterSpacing: '0.04em', lineHeight: 1.8, radius: 8,
    cursorSize: 8, glowSize: 20, cursorSpeed: 0.04, glowColor: '#4a7fe0',
  },
  neutral: {
    bg: '#0a0e17', bgCard: '#111827', bgSecondary: '#1a1f32',
    primary: '#9b6dff', accent: '#7c3aed', foreground: '#e0e4f0', muted: '#6b7280', border: '#252d42',
    fontWeight: 400, letterSpacing: '0em', lineHeight: 1.65, radius: 16,
    cursorSize: 12, glowSize: 30, cursorSpeed: 0.1, glowColor: '#9b6dff',
  },
  good: {
    bg: '#0d0a16', bgCard: '#150f22', bgSecondary: '#1e1530',
    primary: '#e040fb', accent: '#c026d3', foreground: '#f0e8ff', muted: '#8b6fa0', border: '#3d2060',
    fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.55, radius: 20,
    cursorSize: 16, glowSize: 42, cursorSpeed: 0.16, glowColor: '#e040fb',
  },
  high: {
    bg: '#0f0900', bgCard: '#1a1000', bgSecondary: '#261800',
    primary: '#f59e0b', accent: '#fb923c', foreground: '#fff8e8', muted: '#92763a', border: '#4a3300',
    fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.4, radius: 28,
    cursorSize: 22, glowSize: 58, cursorSpeed: 0.28, glowColor: '#f59e0b',
  },
}

// Per-agent overlay color injected after recommendation
const AGENT_OVERLAYS: Record<string, Record<string, string>> = {
  amplifier:    { improving: '#ec489966', stable: '#ec489933', 'needs-care': '#ec489922' },
  documentarian:{ improving: '#6366f155', stable: '#6366f133', 'needs-care': '#6366f144' },
  visionary:    { improving: '#f59e0b55', stable: '#14b8a633', 'needs-care': '#14b8a644' },
}

function getTheme(mood: number): Theme {
  if (mood <= 25) return THEMES.low
  if (mood <= 50) { const t = (mood - 25) / 25; return interp(THEMES.low, THEMES.neutral, t) }
  if (mood <= 75) { const t = (mood - 50) / 25; return interp(THEMES.neutral, THEMES.good, t) }
  const t = (mood - 75) / 25; return interp(THEMES.good, THEMES.high, t)
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
  document.body.style.backgroundColor = theme.bg
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

  return (
    <>
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
            width: theme.glowSize, height: theme.glowSize, borderRadius: '50%',
            border: `1px solid ${theme.glowColor}55`,
            background: `radial-gradient(circle, ${theme.glowColor}22 0%, transparent 70%)`,
            transform: `translate(${pos.x - theme.glowSize / 2}px, ${pos.y - theme.glowSize / 2}px)`,
            opacity: active ? 1 : 0,
            transition: 'opacity 400ms, border-color 800ms ease, background 800ms ease, width 600ms ease, height 600ms ease',
          }}
        />
        <div aria-hidden className="pointer-events-none fixed z-[9999] rounded-full"
          style={{
            width: theme.cursorSize, height: theme.cursorSize, borderRadius: '50%',
            background: theme.glowColor,
            boxShadow: `0 0 ${theme.cursorSize * 1.5}px ${theme.glowColor}cc`,
            transform: `translate(${pos.x - theme.cursorSize / 2}px, ${pos.y - theme.cursorSize / 2}px)`,
            opacity: active ? 1 : 0,
            transition: 'opacity 400ms, background 800ms ease, box-shadow 800ms ease, width 600ms ease, height 600ms ease',
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
