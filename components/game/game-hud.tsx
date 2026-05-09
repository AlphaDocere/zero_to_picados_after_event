"use client"

import { Heart, Zap, Star, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

const STAGE_NAMES: Record<string, string> = {
  low: "DESPERTAR",
  mid: "EQUILIBRIO",
  high: "FLUJO",
}

interface GameHUDProps {
  mood: number
  lives: number
  energy: number
  points: number
  stage: number
}

export function GameHUD({ mood, lives, energy, points, stage }: GameHUDProps) {
  const stageName =
    mood < 40 ? STAGE_NAMES.low : mood < 70 ? STAGE_NAMES.mid : STAGE_NAMES.high

  return (
    <div className="w-full bg-black/80 border-b-2 border-yellow-500/40 backdrop-blur-sm">
      {/* Stage header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-yellow-500/20">
        <span className="text-yellow-400 font-mono text-xs font-bold tracking-widest">
          E{stage} · {stageName}
        </span>
        <span className="text-gray-500 font-mono text-xs">RULETA EMOCIONAL</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between px-4 py-2 gap-4">
        {/* Mood */}
        <div className="flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-purple-300 font-mono font-bold text-sm leading-none">{mood}</span>
            <span className="text-gray-600 font-mono text-[10px]">MOOD</span>
          </div>
        </div>

        {/* Energía */}
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
          <div className="flex flex-col">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-3 rounded-sm",
                    i < energy ? "bg-yellow-400" : "bg-gray-700"
                  )}
                />
              ))}
            </div>
            <span className="text-gray-600 font-mono text-[10px]">ENERGÍA</span>
          </div>
        </div>

        {/* Puntos */}
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-emerald-300 font-mono font-bold text-sm leading-none">
              {String(points).padStart(4, "0")}
            </span>
            <span className="text-gray-600 font-mono text-[10px]">PUNTOS</span>
          </div>
        </div>

        {/* Vidas */}
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col items-end">
            <div className="flex gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < lives ? "text-red-500 fill-red-500" : "text-gray-700"
                  )}
                />
              ))}
            </div>
            <span className="text-gray-600 font-mono text-[10px]">VIDAS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
