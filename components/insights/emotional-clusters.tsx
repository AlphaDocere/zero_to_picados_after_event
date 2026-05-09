"use client"

import { Badge } from "@/components/ui/badge"

interface EmotionalClustersProps {
  clusters: any
}

export function EmotionalClusters({ clusters }: EmotionalClustersProps) {
  const agentNames: Record<string, string> = {
    compassionate: 'Nova - Compasiva',
    analytical: 'Atlas - Analítica',
    reflective: 'Phoenix - Reflexiva'
  }

  // Sanitize values to prevent NaN display
  const getSafeValue = (val: any, defaultVal: number = 0) => {
    const num = Number(val)
    return isNaN(num) ? defaultVal : num
  }

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-2">Clusters Emocionales Globales</h3>
        <p className="text-xs text-muted-foreground">Ciudades agrupadas por tendencia de cambio</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Rising */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl border border-green-200 dark:border-green-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h4 className="font-bold text-foreground">En Ascenso</h4>
          </div>
          <div className="space-y-2">
            {clusters.rising.map((city: any) => (
              <div key={city.city} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-foreground">{city.city}</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">+{getSafeValue(city.avgChange)}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{ width: `${(getSafeValue(city.avgMood) / 100) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stable */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <h4 className="font-bold text-foreground">Estables</h4>
          </div>
          <div className="space-y-2">
            {clusters.stable.map((city: any) => (
              <div key={city.city} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-foreground">{city.city}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{getSafeValue(city.avgChange)}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${(getSafeValue(city.avgMood) / 100) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Declining */}
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-2xl border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <h4 className="font-bold text-foreground">En Declive</h4>
          </div>
          <div className="space-y-2">
            {clusters.declining.map((city: any) => (
              <div key={city.city} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-foreground">{city.city}</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">{getSafeValue(city.avgChange)}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div 
                    className="bg-red-500 h-1.5 rounded-full"
                    style={{ width: `${(getSafeValue(city.avgMood) / 100) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
