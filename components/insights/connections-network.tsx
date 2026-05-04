"use client"

interface ConnectionsNetworkProps {
  connections: any[]
}

export function ConnectionsNetwork({ connections }: ConnectionsNetworkProps) {
  const topConnections = connections
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10)

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-2">Red de Conexiones Emocionales</h3>
        <p className="text-xs text-muted-foreground">Ciudades con patrones emocionales similares</p>
      </div>

      <div className="space-y-2">
        {topConnections.map((conn, idx) => (
          <div key={idx} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="font-semibold text-foreground">{conn.source}</div>
              <div className="flex-1 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-2"></div>
              <div className="font-semibold text-foreground">{conn.target}</div>
            </div>
            <div className="ml-4 bg-primary/20 px-3 py-1 rounded-full">
              <span className="text-sm font-bold text-primary">{conn.similarity}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-border p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">Total de conexiones identificadas</p>
        <p className="text-2xl font-bold text-foreground">{connections.length}</p>
        <p className="text-xs text-muted-foreground mt-2">Ciudades con patrones similares</p>
      </div>
    </div>
  )
}
