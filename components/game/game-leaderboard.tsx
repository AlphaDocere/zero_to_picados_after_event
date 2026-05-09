"use client"

import { cn } from "@/lib/utils"
import { Trophy } from "lucide-react"

const PLAYERS = [
  { name: "ByteNinja",    emoji: "🥷", score: 940 },
  { name: "AlphaLoop",   emoji: "🤖", score: 895 },
  { name: "NeuralNova",  emoji: "🧠", score: 852 },
  { name: "SyntaxStorm", emoji: "⚡", score: 821 },
  { name: "DevDrifter",  emoji: "🎮", score: 787 },
  { name: "CodeZen",     emoji: "🔮", score: 750 },
  { name: "PixelPulse",  emoji: "💾", score: 718 },
  { name: "FrontendFx",  emoji: "🎨", score: 672 },
  { name: "APIWatcher",  emoji: "🔌", score: 635 },
  { name: "LoopBreaker", emoji: "🌀", score: 580 },
]

const RANK_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"]

function getRank(userScore: number) {
  return PLAYERS.filter((p) => p.score > userScore).length + 1
}

function getVisibleRows(userRank: number) {
  const merged = [
    ...PLAYERS.slice(0, userRank - 1).map((p) => ({ ...p, isUser: false })),
    { name: "TÚ", emoji: "🧑‍💻", score: -1, isUser: true },
    ...PLAYERS.slice(userRank - 1).map((p) => ({ ...p, isUser: false })),
  ]
  const start = Math.max(0, userRank - 3)
  const end = Math.min(merged.length, userRank + 2)
  return { rows: merged.slice(start, end), startRank: start + 1 }
}

interface GameLeaderboardProps {
  userScore: number
  gameStatus: "idle" | "playing" | "dead" | "won"
}

export function GameLeaderboard({ userScore, gameStatus }: GameLeaderboardProps) {
  const rank = getRank(userScore)
  const { rows, startRank } = getVisibleRows(rank)

  const rankBadge = rank <= 3 ? "🏆 TOP 3" : rank <= 6 ? "⭐ TOP 6" : "📈 SUBIENDO"
  const rankColor = rank <= 3 ? "text-yellow-400" : rank <= 6 ? "text-purple-400" : "text-gray-500"
  const rankBg = rank <= 3 ? "bg-yellow-900/30 border-yellow-500/40" : rank <= 6 ? "bg-purple-900/30 border-purple-500/40" : "bg-black/40 border-gray-700/30"

  return (
    <>
      {/* ── Mobile: horizontal strip (hidden on lg) ── */}
      <div className="lg:hidden rounded-xl bg-black/70 border border-yellow-500/20 overflow-hidden">
        <div className="px-3 py-1.5 bg-yellow-500/10 border-b border-yellow-500/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400 font-mono text-[9px] font-bold tracking-widest">LEADERBOARD</span>
          </div>
          <span className={cn("font-mono text-[9px] font-bold", rankColor)}>
            {rankBadge} · #{rank}
          </span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto scrollbar-hide">
          {rows.map((player, i) => {
            const absoluteRank = startRank + i
            return (
              <div
                key={player.isUser ? "user" : player.name}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg shrink-0 text-[9px] font-mono",
                  player.isUser
                    ? "bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold"
                    : "bg-black/30 text-gray-500"
                )}
              >
                <span className="text-[10px]">{player.emoji}</span>
                <span>{player.isUser ? "TÚ" : player.name}</span>
                <span className={player.isUser && userScore > 0 ? "text-yellow-400" : ""}>
                  {player.isUser ? (userScore > 0 ? `${userScore}` : "—") : player.score}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Desktop: vertical sidebar (hidden below lg) ── */}
      <div className="hidden lg:flex flex-col gap-2">
        <div className="rounded-xl bg-black/70 border border-yellow-500/30 overflow-hidden">
          <div className="px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400 font-mono text-[10px] font-bold tracking-widest">LEADERBOARD</span>
          </div>
          <div className="px-2 py-2 space-y-1">
            {rows.map((player, i) => {
              const absoluteRank = startRank + i
              return (
                <div
                  key={player.isUser ? "user" : player.name}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg",
                    player.isUser ? "bg-purple-500/20 border border-purple-500/40" : "bg-black/20"
                  )}
                >
                  <span className={cn(
                    "font-mono font-black text-xs w-5 text-right shrink-0",
                    player.isUser ? "text-purple-400" : RANK_COLORS[absoluteRank - 1] || "text-gray-600"
                  )}>
                    {absoluteRank}
                  </span>
                  <span className="text-sm shrink-0">{player.emoji}</span>
                  <span className={cn(
                    "font-mono text-[10px] truncate flex-1",
                    player.isUser ? "text-purple-300 font-bold" : absoluteRank <= 3 ? "text-gray-200" : "text-gray-500"
                  )}>
                    {player.name}
                  </span>
                  <span className={cn(
                    "font-mono text-[10px] font-bold shrink-0",
                    player.isUser
                      ? userScore > 0 ? "text-yellow-400" : "text-gray-600"
                      : absoluteRank <= 3 ? "text-yellow-400" : "text-gray-600"
                  )}>
                    {player.isUser ? (userScore > 0 ? `${userScore}` : "—") : player.score}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className={cn("rounded-xl border px-3 py-2 text-center", rankBg)}>
          <div className={cn("font-mono text-[10px] font-bold tracking-wider", rankColor)}>{rankBadge}</div>
          <div className="font-mono text-[10px] text-gray-500 mt-0.5">Posición #{rank} de {PLAYERS.length + 1}</div>
        </div>

        {gameStatus === "playing" && (
          <p className="text-purple-400/60 font-mono text-[9px] text-center animate-pulse">¡Sigue subiendo!</p>
        )}
        {gameStatus === "won" && rank <= 5 && (
          <p className="text-yellow-400 font-mono text-[9px] text-center font-bold">🔥 ¡Quedaste top 5!</p>
        )}
      </div>
    </>
  )
}
