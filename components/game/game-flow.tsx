"use client"

import { useState, useCallback, useEffect } from "react"
import { ChevronRight, Dices, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCopilotReadable } from "@copilotkit/react-core"
import { cn } from "@/lib/utils"

import { MoodSlider } from "@/components/check-in/mood-slider"
import { RouletteReveal } from "./roulette-reveal"
import { GameVerdict } from "./game-verdict"
import { GameHUD } from "./game-hud"
import { GameRunner } from "./game-runner"
import { GameLeaderboard } from "./game-leaderboard"

const STEP_LABELS = [
  "SELECCIONA TU ESTADO",
  "GENERANDO MISIÓN",
  "MISIÓN ACTIVA",
  "RESULTADOS",
]

const STEP_SUBTITLES = [
  "¿Cómo arrancas hoy, jugador?",
  "La IA está sorteando tu reto emocional...",
  "Esquiva obstáculos · Recoge hábitos 🍌 · Llega a la meta",
  "El juez evaluó tu recorrido",
]

export function GameFlow() {
  const [step, setStep] = useState(0)
  const [initialMood, setInitialMood] = useState(50)
  const [finalMood, setFinalMood] = useState(50)
  const [challenge, setChallenge] = useState("")
  const [lives, setLives] = useState(3)
  const [points, setPoints] = useState(0)
  const [energy, setEnergy] = useState(1)

  // Runner state
  const [gameEnded, setGameEnded] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [gameScore, setGameScore] = useState(0)
  const [gameHabits, setGameHabits] = useState<string[]>([])
  const [liveScore, setLiveScore] = useState(0)
  const [runnerStatus, setRunnerStatus] = useState<"idle" | "playing" | "dead" | "won">("idle")

  // Post-game motivational message
  const [motivation, setMotivation] = useState("")
  const [motivationLoading, setMotivationLoading] = useState(false)
  const [moodAsked, setMoodAsked] = useState(false)

  useCopilotReadable({
    description: "Estado actual del juego Ruleta Emocional",
    value: {
      paso: step + 1,
      moodInicial: step >= 1 ? initialMood : null,
      reto: step >= 2 ? challenge : null,
      moodFinal: step === 3 ? finalMood : null,
      vidas: lives,
      puntos: points,
      habitosRecolectados: gameHabits,
      mensajeMotivacional: motivation || null,
    },
  })

  const handleChallengeReady = useCallback((c: string) => {
    setChallenge(c)
  }, [])

  const handleScoreChange = useCallback((score: number, status: "idle" | "playing" | "dead" | "won") => {
    setLiveScore(score)
    setRunnerStatus(status)
  }, [])

  const handleGameEnd = useCallback((score: number, habits: string[], won: boolean) => {
    setGameEnded(true)
    setGameWon(won)
    setGameScore(score)
    setGameHabits(habits)
    setPoints(score)
    setLiveScore(score)
    setRunnerStatus(won ? "won" : "dead")

    // Fetch motivational message
    setMotivationLoading(true)
    fetch("/api/game/motivate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habits, score, won }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.message) setMotivation(data.message)
      })
      .catch(() => {})
      .finally(() => setMotivationLoading(false))
  }, [])

  const handleVerdictScore = useCallback((score: number) => {
    const e = score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : score >= 20 ? 2 : 1
    setEnergy(e)
  }, [])

  const canProceed = () => {
    if (step === 0) return true
    if (step === 1) return challenge !== ""
    if (step === 2) return gameEnded && moodAsked
    return false
  }

  const handleNext = () => {
    if (!canProceed() || step >= 3) return
    // Save to Firebase when moving to verdict (all data is ready)
    if (step === 2) {
      fetch("/api/game/save-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialMood,
          finalMood,
          challenge,
          gameScore,
          gameWon,
          habits: gameHabits,
          motivation,
        }),
      }).catch(() => {}) // fire-and-forget
    }
    setStep(step + 1)
  }

  const handleRestart = () => {
    setStep(0)
    setInitialMood(50)
    setFinalMood(50)
    setChallenge("")
    setPoints(0)
    setEnergy(1)
    setGameEnded(false)
    setGameWon(false)
    setGameScore(0)
    setGameHabits([])
    setMotivation("")
    setMotivationLoading(false)
    setMoodAsked(false)
    setLives(3)
    setLiveScore(0)
    setRunnerStatus("idle")
  }

  // Once motivation is shown and user sees it, auto-reveal mood slider after 1s
  useEffect(() => {
    if (!motivation) return
    const t = setTimeout(() => setMoodAsked(true), 800)
    return () => clearTimeout(t)
  }, [motivation])

  const currentMood = step >= 3 ? finalMood : initialMood

  return (
    <div
      className="min-h-screen flex flex-col bg-[#080818]"
      style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.06) 0%, transparent 60%)" }}
    >
      <GameHUD mood={currentMood} lives={lives} energy={energy} points={points} stage={1} />

      {/* Stage header */}
      <div className="relative px-4 pt-5 pb-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-3">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-yellow-400 font-mono text-xs font-bold tracking-widest">
            STAGE {step + 1} / 4
          </span>
        </div>
        <h2 className="text-xl font-black font-mono text-white tracking-tight">{STEP_LABELS[step]}</h2>
        <p className="text-gray-500 text-sm mt-1 font-mono">{STEP_SUBTITLES[step]}</p>
        <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden max-w-xs mx-auto">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 via-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Step 2 uses full width for the game; others use max-w-md */}
        <div className={cn(
          "flex-1 mx-auto w-full",
          step === 2 ? "max-w-3xl px-2" : "max-w-md px-4"
        )}>

          {/* ── STEP 0 ── */}
          {step === 0 && (
            <div key="s0" className="animate-in fade-in space-y-5 py-4">
              <div className="p-4 rounded-xl bg-black/60 border border-yellow-500/20 font-mono text-xs text-gray-500 space-y-1">
                <p><span className="text-yellow-500">&gt;</span> SISTEMA EMOCIONAL v2.0 CARGADO</p>
                <p><span className="text-yellow-500">&gt;</span> MOTOR DE JUEGO <span className="text-emerald-400">READY</span></p>
                <p><span className="text-yellow-500">&gt;</span> VIDAS: ❤️ ❤️ ❤️</p>
                <p><span className="text-yellow-500 animate-pulse">&gt;</span> <span className="text-white">INGRESANDO ESTADO INICIAL...</span></p>
              </div>
              <div className="p-4 rounded-xl bg-gray-900/60 border border-purple-500/20">
                <MoodSlider value={initialMood} onChange={setInitialMood} label="¿Cómo estás en este momento?" />
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-gray-700/40 flex items-start gap-3">
                <Dices className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-gray-400 text-sm font-mono leading-relaxed">
                  La IA generará tu misión. Juega el runner, recoge{" "}
                  <span className="text-yellow-400">hábitos 🍌</span> y esquiva{" "}
                  <span className="text-red-400">obstáculos ⚠️</span>.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div key="s1" className="animate-in fade-in py-4">
              <RouletteReveal initialMood={initialMood} onChallengeReady={handleChallengeReady} />
            </div>
          )}

          {/* ── STEP 2: Game ── */}
          {step === 2 && (
            <div key="s2" className="animate-in fade-in py-3">
              {/* Two-column layout: game left, leaderboard right */}
              <div className="flex flex-col lg:flex-row gap-3 items-start">

                {/* Left: game content */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Mission brief */}
                  <div className="rounded-xl bg-black/60 border border-yellow-500/30 overflow-hidden">
                    <div className="px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      <span className="text-yellow-400 font-mono text-[10px] font-bold tracking-wider">OBJETIVO DE MISIÓN</span>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-gray-300 font-mono text-xs leading-relaxed">{challenge}</p>
                    </div>
                  </div>

                  {/* Game canvas */}
                  <GameRunner onGameEnd={handleGameEnd} onScoreChange={handleScoreChange} />

                  {/* Post-game: motivational message */}
                  {gameEnded && (
                    <div className="animate-in slide-in-from-bottom-4 fade-in space-y-4 pb-4">
                      {gameHabits.length > 0 && (
                        <div className="p-3 rounded-xl bg-yellow-900/20 border border-yellow-500/20">
                          <p className="text-yellow-400 font-mono text-[10px] font-bold tracking-wider mb-2">🍌 HÁBITOS RECOLECTADOS</p>
                          <div className="flex flex-wrap gap-1">
                            {[...new Set(gameHabits)].map((h) => (
                              <span key={h} className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-mono text-[10px] border border-yellow-500/30">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-500",
                        motivation
                          ? "bg-gradient-to-br from-purple-900/40 to-pink-900/20 border-purple-500/40"
                          : "bg-black/40 border-gray-700/40"
                      )}>
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <p className="text-purple-400 font-mono text-xs font-bold tracking-wider">MENSAJE DE TU COACH IA</p>
                        </div>
                        {motivationLoading ? (
                          <div className="flex items-center gap-2 text-gray-500 font-mono text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Analizando tus hábitos...</span>
                          </div>
                        ) : motivation ? (
                          <p className="text-gray-100 text-base leading-relaxed font-medium">{motivation}</p>
                        ) : null}
                      </div>

                      {moodAsked && (
                        <div className="animate-in slide-in-from-bottom-4 fade-in p-5 rounded-xl bg-gray-900/70 border-2 border-pink-500/30">
                          <p className="text-pink-400 font-mono text-xs font-bold tracking-wider mb-4 text-center">
                            ¿Y AHORA? ¿CÓMO TE SIENTES?
                          </p>
                          <MoodSlider value={finalMood} onChange={setFinalMood} label="" />
                        </div>
                      )}
                    </div>
                  )}
                </div>{/* end left col */}

                {/* Right: Leaderboard */}
                <div className="w-full lg:w-44 lg:shrink-0 lg:sticky lg:top-4">
                  <GameLeaderboard userScore={liveScore} gameStatus={runnerStatus} />
                </div>

              </div>{/* end flex row */}
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div key="s3" className="animate-in fade-in py-4">
              <GameVerdict
                initialMood={initialMood}
                finalMood={finalMood}
                challenge={challenge}
                reflection={motivation}
                gameScore={gameScore}
                gameHabits={gameHabits}
                onRestart={handleRestart}
                onScore={handleVerdictScore}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer button */}
      {step < 3 && (
        <footer className="sticky bottom-0 px-4 py-4 bg-black/80 border-t border-gray-800/60 backdrop-blur-sm">
          <div className="max-w-md mx-auto space-y-2">
            {step === 2 && !gameEnded && (
              <p className="text-center text-gray-600 font-mono text-[10px]">
                Completa el juego para continuar
              </p>
            )}
            {step === 2 && gameEnded && !moodAsked && (
              <p className="text-center text-gray-600 font-mono text-[10px] animate-pulse">
                Leyendo tu mensaje...
              </p>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed() || (step === 1 && !challenge)}
              className={cn(
                "w-full h-14 rounded-xl text-base font-black font-mono tracking-widest gap-2 transition-all duration-300 border-2",
                canProceed() && (step !== 1 || challenge)
                  ? "bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-400 shadow-lg shadow-yellow-500/30"
                  : "bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed"
              )}
            >
              {step === 1 && !challenge
                ? "SORTEANDO MISIÓN..."
                : step === 2
                ? "VER VEREDICTO"
                : "INICIAR MISIÓN"}
              {(step !== 1 || challenge) && <ChevronRight className="w-5 h-5" />}
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}
