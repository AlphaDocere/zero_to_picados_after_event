"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface RouletteRevealProps {
  initialMood: number
  onChallengeReady: (challenge: string) => void
}

const ROULETTE_SYMBOLS = ["🎯", "🌊", "🔥", "💡", "⚡", "🌀", "🎲", "✨", "🧩", "🌈"]

export function RouletteReveal({ initialMood, onChallengeReady }: RouletteRevealProps) {
  const [phase, setPhase] = useState<"spinning" | "slowing" | "revealed">("spinning")
  const [symbolIndex, setSymbolIndex] = useState(0)
  const [challenge, setChallenge] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/game/generate-challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initialMood }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.challenge) setChallenge(data.challenge)
        else setError("No se pudo generar el reto")
      })
      .catch(() => setError("Error de conexión"))
  }, [initialMood])

  useEffect(() => {
    if (phase === "revealed") return
    const interval = setInterval(() => {
      setSymbolIndex((i) => (i + 1) % ROULETTE_SYMBOLS.length)
    }, phase === "spinning" ? 80 : 220)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (!challenge) return
    const slowTimer = setTimeout(() => setPhase("slowing"), 1500)
    const revealTimer = setTimeout(() => {
      setPhase("revealed")
      onChallengeReady(challenge)
    }, 2800)
    return () => {
      clearTimeout(slowTimer)
      clearTimeout(revealTimer)
    }
  }, [challenge, onChallengeReady])

  if (error) {
    return (
      <div className="text-center p-6 rounded-xl bg-red-900/20 border border-red-500/30">
        <p className="text-red-400 font-mono text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in py-4">

      {/* Slot machine display */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Outer frame */}
          <div className={cn(
            "w-52 h-52 rounded-2xl flex items-center justify-center border-4 transition-all duration-500",
            "bg-black shadow-2xl",
            phase === "spinning" && "border-yellow-500 shadow-yellow-500/30",
            phase === "slowing" && "border-purple-500 shadow-purple-500/30",
            phase === "revealed" && "border-emerald-500 shadow-emerald-500/40 scale-105"
          )}>
            {/* Scanline effect */}
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-20"
              style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)" }}
            />

            {/* Inner glow ring */}
            <div className={cn(
              "absolute inset-4 rounded-xl border border-dashed transition-all duration-300",
              phase === "spinning" && "border-yellow-500/40 animate-spin",
              phase === "slowing" && "border-purple-400/40",
              phase === "revealed" && "border-emerald-400/40"
            )} style={{ animationDuration: "3s" }} />

            {/* Symbol */}
            <div className={cn(
              "text-7xl transition-all duration-100 select-none z-10",
              phase === "revealed" && "animate-bounce"
            )}>
              {phase === "revealed" ? "🎯" : ROULETTE_SYMBOLS[symbolIndex]}
            </div>
          </div>

          {/* Pointer */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-yellow-400 text-2xl drop-shadow-lg">
            ▼
          </div>
        </div>
      </div>

      {/* Status terminal */}
      <div className="p-4 rounded-xl bg-black/60 border border-gray-700/40 font-mono text-xs space-y-1">
        {phase === "spinning" && (
          <>
            <p><span className="text-yellow-500">&gt;</span> CONECTANDO CON IA GROQ...</p>
            <p><span className="text-yellow-500">&gt;</span> ANALIZANDO ESTADO EMOCIONAL: <span className="text-purple-400">{initialMood}/100</span></p>
            <p><span className="text-yellow-500 animate-pulse">&gt;</span> <span className="text-white">GENERANDO MISIÓN PERSONALIZADA...</span></p>
          </>
        )}
        {phase === "slowing" && (
          <>
            <p><span className="text-emerald-500">&gt;</span> MISIÓN GENERADA <span className="text-emerald-400">✓</span></p>
            <p><span className="text-yellow-500 animate-pulse">&gt;</span> <span className="text-white">CARGANDO RETO...</span></p>
          </>
        )}
        {phase === "revealed" && (
          <>
            <p><span className="text-emerald-500">&gt;</span> RETO ASIGNADO <span className="text-emerald-400">✓</span></p>
            <p><span className="text-emerald-500">&gt;</span> <span className="text-white">PRESIONA CONTINUAR PARA INICIAR</span></p>
          </>
        )}
      </div>

      {/* Loading indicator */}
      {phase !== "revealed" && (
        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm font-mono">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>PROCESANDO...</span>
        </div>
      )}
    </div>
  )
}
