"use client"

import { useEffect, useRef, useState, useCallback } from "react"

const CANVAS_H = 380
const GROUND_Y = 295
const PLAYER_R = 18
const PLAYER_X = 90
const GRAVITY = 0.72
const JUMP_FORCE = -13
const WORLD_LENGTH = 2800

const HABITS = [
  "Respiración", "Gratitud", "Ejercicio", "Descanso",
  "Conexión", "Meditación", "Hidratación", "Sueño", "Creatividad", "Naturaleza",
]

interface BananaObj { x: number; y: number; habit: string; collected: boolean }
interface ObstacleObj { x: number; w: number; h: number }

interface GameState {
  playerY: number
  playerVY: number
  isGrounded: boolean
  lives: number
  score: number
  invincible: number
  scrollX: number
  frameCount: number
  obstacles: ObstacleObj[]
  bananas: BananaObj[]
  collectedHabits: string[]
  scrollSpeed: number
}

export interface GameRunnerProps {
  onGameEnd: (score: number, habits: string[], won: boolean) => void
  onScoreChange?: (score: number, status: "idle" | "playing" | "dead" | "won") => void
}

export function GameRunner({ onGameEnd, onScoreChange }: GameRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GameState | null>(null)
  const animRef = useRef<number>(0)
  const onEndRef = useRef(onGameEnd)
  const onScoreRef = useRef(onScoreChange)
  onEndRef.current = onGameEnd
  onScoreRef.current = onScoreChange

  const [status, setStatus] = useState<"idle" | "playing" | "dead" | "won">("idle")
  const [hud, setHud] = useState({ lives: 3, score: 0, habits: 0 })

  // Sync canvas width to container
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const sync = () => { canvas.width = canvas.offsetWidth }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  const spawnWorld = useCallback(() => {
    const obstacles: ObstacleObj[] = []
    const bananas: BananaObj[] = []

    let ox = 440
    while (ox < WORLD_LENGTH - 350) {
      obstacles.push({ x: ox, w: 30, h: 36 + Math.random() * 44 })
      ox += 210 + Math.random() * 210
    }

    let bx = 270
    let hi = 0
    while (bx < WORLD_LENGTH - 200) {
      const high = Math.random() > 0.45
      bananas.push({
        x: bx,
        y: high ? GROUND_Y - 95 : GROUND_Y - 42,
        habit: HABITS[hi % HABITS.length],
        collected: false,
      })
      hi++
      bx += 120 + Math.random() * 95
    }

    stateRef.current = {
      playerY: GROUND_Y - PLAYER_R,
      playerVY: 0,
      isGrounded: true,
      lives: 3,
      score: 0,
      invincible: 0,
      scrollX: 0,
      frameCount: 0,
      obstacles,
      bananas,
      collectedHabits: [],
      scrollSpeed: 3.5,
    }
  }, [])

  const jump = useCallback(() => {
    const s = stateRef.current
    if (!s) return
    if (s.isGrounded) {
      s.playerVY = JUMP_FORCE
      s.isGrounded = false
    }
  }, [])

  const handleClick = useCallback(() => {
    if (status === "idle") {
      spawnWorld()
      setStatus("playing")
    } else if (status === "playing") {
      jump()
    }
  }, [status, spawnWorld, jump])

  // Spacebar support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); handleClick() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [handleClick])

  // Main game loop
  useEffect(() => {
    if (status !== "playing") return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let alive = true

    const tick = () => {
      if (!alive) return
      const s = stateRef.current
      if (!s) return
      const W = canvas.width

      // Physics
      s.frameCount++
      s.scrollSpeed = Math.min(6.5, 3.5 + s.frameCount * 0.0006)
      s.scrollX += s.scrollSpeed

      s.playerVY += GRAVITY
      s.playerY += s.playerVY
      if (s.playerY >= GROUND_Y - PLAYER_R) {
        s.playerY = GROUND_Y - PLAYER_R
        s.playerVY = 0
        s.isGrounded = true
      }
      if (s.invincible > 0) s.invincible--

      // Win
      if (s.scrollX >= WORLD_LENGTH) {
        alive = false
        s.score += 50
        setStatus("won")
        setHud({ lives: s.lives, score: s.score, habits: s.collectedHabits.length })
        onEndRef.current(s.score, s.collectedHabits, true)
        draw(ctx, W, s)
        return
      }

      // Obstacle collision
      for (const obs of s.obstacles) {
        const sx = obs.x - s.scrollX
        if (
          s.invincible === 0 &&
          PLAYER_X + PLAYER_R - 5 > sx &&
          PLAYER_X - PLAYER_R + 5 < sx + obs.w &&
          s.playerY + PLAYER_R > GROUND_Y - obs.h + 5
        ) {
          s.lives--
          s.invincible = 80
          if (s.lives <= 0) {
            alive = false
            setStatus("dead")
            setHud({ lives: 0, score: s.score, habits: s.collectedHabits.length })
            onEndRef.current(s.score, s.collectedHabits, false)
            draw(ctx, W, s)
            return
          }
          setHud(h => ({ ...h, lives: s.lives }))
        }
      }

      // Banana collection
      for (const ban of s.bananas) {
        if (ban.collected) continue
        const sx = ban.x - s.scrollX
        if (Math.hypot(sx - PLAYER_X, ban.y - s.playerY) < PLAYER_R + 15) {
          ban.collected = true
          s.score += 10
          s.collectedHabits.push(ban.habit)
          setHud(h => ({ ...h, score: h.score + 10, habits: h.habits + 1 }))
          onScoreRef.current?.(s.score, "playing")
        }
      }

      draw(ctx, W, s)
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(animRef.current)
    }
  }, [status])

  return (
    <div className="space-y-2">
      <div
        className="relative rounded-xl overflow-hidden border-2 border-purple-500/40 cursor-pointer select-none"
        onClick={handleClick}
        role="button"
        aria-label="Juego runner"
      >
        <canvas ref={canvasRef} height={CANVAS_H} className="w-full block" />

        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 gap-3">
            <p className="text-white font-black font-mono text-xl animate-pulse">▶ CLICK PARA INICIAR</p>
            <div className="flex gap-4 text-xs font-mono text-gray-400">
              <span>CLICK = saltar</span>
              <span>🍌 = +10 pts</span>
              <span>⚠️ = -1 vida</span>
            </div>
          </div>
        )}

        {(status === "dead" || status === "won") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-2">
            <p className="font-black font-mono text-2xl text-white">
              {status === "won" ? "🏆 MISIÓN COMPLETA" : "💀 GAME OVER"}
            </p>
            <p className="text-yellow-400 font-mono font-bold text-xl">⭐ {hud.score} PTS</p>
            <p className="text-gray-400 font-mono text-xs">🍌 ×{hud.habits} hábitos recolectados</p>
            <p className="text-gray-600 font-mono text-[10px] mt-1 animate-pulse">↓ Completa tu reporte abajo</p>
          </div>
        )}
      </div>

      {/* HUD strip */}
      <div className="flex justify-between items-center px-1 font-mono text-xs">
        <span>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={i < hud.lives ? "text-red-400" : "text-gray-700"}>♥ </span>
          ))}
        </span>
        <span className="text-gray-600 text-[10px]">
          {status === "idle" ? "LISTO" : status === "playing" ? "▶ EN JUEGO" : "■ FIN"}
        </span>
        <span className="text-yellow-400">⭐ {hud.score}</span>
      </div>
    </div>
  )
}

// ─── Pure canvas drawing ───────────────────────────────────────────────────────

function draw(ctx: CanvasRenderingContext2D, W: number, s: GameState) {
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
  sky.addColorStop(0, "#050514")
  sky.addColorStop(1, "#1a0a2e")
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, CANVAS_H)

  // Stars (parallax slow layer)
  ctx.fillStyle = "rgba(255,255,255,0.55)"
  for (let i = 0; i < 35; i++) {
    const sx = ((i * 197 + s.scrollX * 0.06) % (W + 10))
    const sy = (i * 83) % (GROUND_Y - 20)
    ctx.fillRect(sx, sy, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1)
  }

  // Ground fill
  ctx.fillStyle = "#1e1b4b"
  ctx.fillRect(0, GROUND_Y, W, CANVAS_H - GROUND_Y)

  // Ground glow line
  const gl = ctx.createLinearGradient(0, 0, W, 0)
  gl.addColorStop(0, "#4c1d95")
  gl.addColorStop(0.5, "#7c3aed")
  gl.addColorStop(1, "#4c1d95")
  ctx.fillStyle = gl
  ctx.fillRect(0, GROUND_Y, W, 3)

  // Ground grid
  ctx.strokeStyle = "rgba(124,58,237,0.07)"
  ctx.lineWidth = 1
  for (let lx = (-(s.scrollX % 50)); lx < W; lx += 50) {
    ctx.beginPath(); ctx.moveTo(lx, GROUND_Y); ctx.lineTo(lx, CANVAS_H); ctx.stroke()
  }

  // Progress bar
  const p = Math.min(1, s.scrollX / WORLD_LENGTH)
  ctx.fillStyle = "#312e81"
  ctx.fillRect(0, GROUND_Y + 3, W, 5)
  ctx.fillStyle = "#7c3aed"
  ctx.fillRect(0, GROUND_Y + 3, W * p, 5)

  // Finish line
  const fx = WORLD_LENGTH - s.scrollX
  if (fx > -10 && fx < W + 10) {
    ctx.fillStyle = "#22c55e"
    ctx.fillRect(fx - 2, GROUND_Y - 90, 4, 90)
    const fs = 8
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? "#fff" : "#111"
      ctx.fillRect(fx + c * fs, GROUND_Y - 90 + r * fs, fs, fs)
    }
    ctx.font = "bold 10px monospace"; ctx.fillStyle = "#4ade80"; ctx.textAlign = "center"
    ctx.fillText("META", fx + 16, GROUND_Y - 95)
  }

  // Obstacles
  for (const obs of s.obstacles) {
    const sx = obs.x - s.scrollX
    if (sx > W + 30 || sx + obs.w < -10) continue
    const oy = GROUND_Y - obs.h
    ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 8
    const og = ctx.createLinearGradient(sx, oy, sx, GROUND_Y)
    og.addColorStop(0, "#ef4444"); og.addColorStop(1, "#7f1d1d")
    ctx.fillStyle = og
    ctx.fillRect(sx, oy, obs.w, obs.h)
    ctx.shadowBlur = 0
    ctx.fillStyle = "#fca5a5"; ctx.fillRect(sx, oy, obs.w, 3)
    ctx.font = "14px sans-serif"; ctx.textAlign = "center"
    ctx.fillText("⚠️", sx + obs.w / 2, oy - 5)
  }

  // Bananas
  for (const ban of s.bananas) {
    if (ban.collected) continue
    const sx = ban.x - s.scrollX
    if (sx > W + 30 || sx < -30) continue
    const fl = Math.sin(s.frameCount * 0.08 + ban.x * 0.02) * 3
    ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 12
    ctx.font = "22px sans-serif"; ctx.textAlign = "center"
    ctx.fillText("🍌", sx, ban.y + fl)
    ctx.shadowBlur = 0
    ctx.font = "bold 8px monospace"; ctx.fillStyle = "#fde68a"
    ctx.fillText(ban.habit.substring(0, 9).toUpperCase(), sx, ban.y + fl + 19)
  }

  // ─── Player ───
  const visible = s.invincible === 0 || Math.sin(s.frameCount * 0.8) > 0
  ctx.globalAlpha = visible ? 1 : 0.15

  // Shadow on ground
  const shadowScale = Math.max(0.2, 1 - (GROUND_Y - PLAYER_R - s.playerY) / 130)
  ctx.fillStyle = "rgba(0,0,0,0.3)"
  ctx.beginPath()
  ctx.ellipse(PLAYER_X, GROUND_Y + 4, 14 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body
  ctx.shadowColor = "#7c3aed"; ctx.shadowBlur = 12
  const pg = ctx.createRadialGradient(PLAYER_X - 4, s.playerY - 4, 2, PLAYER_X, s.playerY, PLAYER_R)
  pg.addColorStop(0, "#c4b5fd"); pg.addColorStop(1, "#5b21b6")
  ctx.fillStyle = pg
  ctx.beginPath(); ctx.arc(PLAYER_X, s.playerY, PLAYER_R, 0, Math.PI * 2); ctx.fill()
  ctx.shadowBlur = 0

  // Face
  ctx.font = "16px sans-serif"; ctx.textAlign = "center"
  ctx.fillText(s.isGrounded ? "😊" : "😮", PLAYER_X, s.playerY + 6)

  ctx.globalAlpha = 1
}
