"use client"

import { useEffect, useState } from "react"
import { Loader2, RotateCcw, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Verdict {
  score: number
  title: string
  narrative: string
  badge: string
}

interface GameVerdictProps {
  initialMood: number
  finalMood: number
  challenge: string
  reflection: string
  gameScore?: number
  gameHabits?: string[]
  onRestart: () => void
  onScore?: (score: number) => void
}

function Stars({ score }: { score: number }) {
  const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-8 h-8 transition-all duration-300",
            i < stars ? "text-yellow-400 fill-yellow-400 scale-110" : "text-gray-700"
          )}
        />
      ))}
    </div>
  )
}

export function GameVerdict({ initialMood, finalMood, challenge, reflection, gameScore = 0, gameHabits = [], onRestart, onScore }: GameVerdictProps) {
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [delta, setDelta] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/game/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initialMood, finalMood, challenge, reflection }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.verdict) {
          setVerdict(data.verdict)
          setDelta(data.delta)
          onScore?.(data.verdict.score)
        } else {
          setError("No se pudo evaluar el resultado")
        }
      })
      .catch(() => setError("Error de conexión"))
      .finally(() => setLoading(false))
  }, [initialMood, finalMood, challenge, reflection])

  const scoreColor =
    !verdict ? "text-white" :
    verdict.score >= 75 ? "text-emerald-400" :
    verdict.score >= 50 ? "text-yellow-400" : "text-rose-400"

  const rankLabel =
    !verdict ? "" :
    verdict.score >= 80 ? "S RANK" :
    verdict.score >= 60 ? "A RANK" :
    verdict.score >= 40 ? "B RANK" : "C RANK"

  return (
    <div className="space-y-5 animate-in fade-in pb-6">

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 p-10 rounded-xl bg-black/60 border border-yellow-500/20">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
          <p className="text-gray-400 font-mono text-sm text-center">
            ANALIZANDO RECORRIDO EMOCIONAL...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-red-900/20 border border-red-500/30 text-center">
          <p className="text-red-400 font-mono text-sm">{error}</p>
        </div>
      ) : verdict && (
        <>
          {/* Score screen header */}
          <div className="text-center p-6 rounded-xl bg-black/60 border-2 border-yellow-500/30 space-y-4">
            <p className="text-yellow-400 font-mono text-xs font-bold tracking-widest">MISSION COMPLETE</p>

            <div className="text-7xl">{verdict.badge}</div>

            <Stars score={verdict.score} />

            <div>
              <div className={cn("text-5xl font-black font-mono", scoreColor)}>
                {verdict.score}
              </div>
              <div className="text-gray-600 font-mono text-xs">/ 100 PTS</div>
            </div>

            <div className={cn("inline-block px-4 py-1 rounded-full font-black font-mono text-sm tracking-widest border",
              verdict.score >= 80 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" :
              verdict.score >= 60 ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" :
              verdict.score >= 40 ? "text-blue-400 bg-blue-400/10 border-blue-400/30" :
              "text-gray-400 bg-gray-400/10 border-gray-400/30"
            )}>
              {rankLabel}
            </div>

            <p className="text-white font-bold text-lg">{verdict.title}</p>
          </div>

          {/* Delta bar */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700/40">
            <p className="text-gray-500 font-mono text-xs mb-3 tracking-wider">RECORRIDO EMOCIONAL</p>
            <div className="flex items-center gap-3">
              <div className="text-center w-10">
                <div className="text-purple-300 font-mono font-bold text-lg">{initialMood}</div>
                <div className="text-gray-600 font-mono text-[10px]">INICIO</div>
              </div>
              <div className="flex-1 relative h-4 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000",
                    delta >= 0 ? "bg-gradient-to-r from-purple-500 to-emerald-400" : "bg-gradient-to-r from-purple-500 to-rose-400"
                  )}
                  style={{ width: `${Math.max(10, finalMood)}%` }}
                />
              </div>
              <div className="text-center w-10">
                <div className={cn("font-mono font-bold text-lg", delta >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {finalMood}
                </div>
                <div className="text-gray-600 font-mono text-[10px]">FINAL</div>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className={cn("font-mono font-bold text-sm",
                delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-gray-500"
              )}>
                {delta > 0 ? `↑ +${delta}` : delta < 0 ? `↓ ${delta}` : "→ SIN CAMBIO"}
              </span>
            </div>
          </div>

          {/* Narrative */}
          <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20">
            <p className="text-gray-500 font-mono text-[10px] mb-1.5 tracking-wider">JUEZ IA</p>
            <p className="text-gray-300 text-sm leading-relaxed">{verdict.narrative}</p>
          </div>
        </>
      )}

      {/* Runner stats */}
      {(gameScore > 0 || gameHabits.length > 0) && (
        <div className="p-4 rounded-xl bg-black/40 border border-yellow-500/20 space-y-2">
          <p className="text-yellow-400 font-mono text-[10px] font-bold tracking-wider">STATS DEL RUNNER</p>
          <div className="flex justify-between font-mono text-xs">
            <span className="text-gray-500">Puntaje en juego</span>
            <span className="text-yellow-300 font-bold">⭐ {gameScore} PTS</span>
          </div>
          {gameHabits.length > 0 && (
            <div>
              <span className="text-gray-500 font-mono text-xs">Hábitos: </span>
              <span className="text-yellow-300 font-mono text-xs">{[...new Set(gameHabits)].join(", ")}</span>
            </div>
          )}
        </div>
      )}

      {/* Invite a friend */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border-2 border-indigo-500/30 space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">🤝</span>
          <div>
            <p className="text-white font-bold text-sm leading-snug">
              ¿Tienes un amigo en tech que siente que la IA avanza más rápido de lo que puede aprender?
            </p>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              Comparte este check-in. A veces nombrar la ansiedad colectiva ya es el primer paso para no sentirla solos.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            const url = typeof window !== "undefined" ? window.location.origin + "/game" : ""
            if (navigator.share) {
              navigator.share({
                title: "Ruleta Emocional — Reflect",
                text: "Estoy usando esto para hacer check-in de cómo me siento con el avance de la IA. Pruébalo.",
                url,
              }).catch(() => {})
            } else {
              navigator.clipboard.writeText(url).catch(() => {})
            }
          }}
          className="w-full py-3 rounded-xl font-bold font-mono text-sm tracking-wider bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>📩</span>
          INVITAR A UN AMIGO
        </button>
      </div>

      <Button
        onClick={onRestart}
        className="w-full h-14 rounded-xl font-black font-mono tracking-widest bg-yellow-500 hover:bg-yellow-400 text-black border-2 border-yellow-400 shadow-lg shadow-yellow-500/20"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        JUGAR DE NUEVO
      </Button>
    </div>
  )
}
