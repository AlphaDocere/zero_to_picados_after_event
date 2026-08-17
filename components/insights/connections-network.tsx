"use client"

import { MapPin, ArrowRightLeft, Sparkles, Activity } from "lucide-react"

interface ConnectionsNetworkProps {
  connections: any[]
}

export function ConnectionsNetwork({ connections }: ConnectionsNetworkProps) {
  // Filter out any connection with missing or empty city names
  const validConnections = (connections || []).filter(
    (conn) => conn && conn.source && conn.target && conn.source !== conn.target
  )

  const topConnections = validConnections
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10)

  // Helper for affinity label and badge color
  const getAffinityBadge = (similarity: number) => {
    if (similarity >= 85) {
      return {
        label: "Muy Alta",
        bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        bar: "from-emerald-500 to-teal-500",
      }
    }
    if (similarity >= 70) {
      return {
        label: "Alta",
        bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
        bar: "from-blue-500 to-indigo-500",
      }
    }
    return {
      label: "Moderada",
      bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
      bar: "from-purple-500 to-pink-500",
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Red de Conexiones Emocionales
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Ciudades vinculadas por resonancia y patrones emocionales colectivos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-secondary/80 text-muted-foreground border border-border font-medium">
            Top {topConnections.length} pares con mayor afinidad
          </span>
        </div>
      </div>

      {topConnections.length === 0 ? (
        <div className="text-center py-12 px-6 rounded-2xl bg-secondary/30 border border-border">
          <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40 animate-pulse" />
          <p className="text-sm font-medium text-foreground">No hay suficientes conexiones registradas aún</p>
          <p className="text-xs text-muted-foreground mt-1">
            A medida que más personas de distintas ciudades hagan check-in, aparecerán aquí las resonancias.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topConnections.map((conn, idx) => {
            const badgeInfo = getAffinityBadge(conn.similarity)
            return (
              <div
                key={`${conn.source}-${conn.target}-${idx}`}
                className="group relative bg-card hover:bg-card/90 rounded-2xl border border-border hover:border-primary/40 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4"
              >
                {/* Header: Rank & Affinity Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
                    #{idx + 1} Conexión
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${badgeInfo.bg}`}
                  >
                    {badgeInfo.label} • {conn.similarity}% afinidad
                  </span>
                </div>

                {/* Symmetrical Cities Display */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  {/* City A (Source) */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border/60 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium">Ciudad</p>
                      <p className="text-sm font-bold text-foreground truncate" title={conn.source}>
                        {conn.source}
                      </p>
                    </div>
                  </div>

                  {/* Connection Node */}
                  <div className="flex flex-col items-center justify-center px-1">
                    <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* City B (Target) */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border/60 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium">Ciudad</p>
                      <p className="text-sm font-bold text-foreground truncate" title={conn.target}>
                        {conn.target}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visual Similarity Progress Bar */}
                <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${badgeInfo.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, conn.similarity))}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/5 to-accent/10 rounded-2xl border border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="text-sm font-bold text-foreground">Total de Conexiones Detectadas</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pares urbanos con comportamientos y cambios de ánimo convergentes
          </p>
        </div>
        <div className="px-5 py-2 rounded-xl bg-card border border-border shadow-sm">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {validConnections.length}
          </span>
          <span className="text-xs text-muted-foreground ml-2 font-medium">redes</span>
        </div>
      </div>
    </div>
  )
}
