'use client'

import React, { useState } from 'react'
import { ChevronUp } from 'lucide-react'

interface CacheMetrics {
  hits: number
  misses: number
  totalRequests: number
  hitRate: number
  avgLatency: number
}

interface CacheMetricsPanelProps {
  metrics: CacheMetrics
  cacheSize: number
  onClear?: () => void
}

export function CacheMetricsPanel({
  metrics,
  cacheSize,
  onClear,
}: CacheMetricsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-4 right-4 z-50 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-slate-400 hover:text-slate-300 transition-colors border border-slate-700/50 hover:border-slate-600"
          title="Mostrar métricas de cache"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {isExpanded && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white p-4 rounded-lg shadow-lg border border-slate-700 max-w-sm z-50 font-mono text-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-green-400">Cache Metrics [v1.2.1]</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-200"
              title="Ocultar métricas"
            >
              <ChevronUp className="w-4 h-4 transform rotate-180" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Total Requests:</span>
              <span className="text-blue-400">{metrics.totalRequests}</span>
            </div>

            <div className="flex justify-between">
              <span>Cache Hits:</span>
              <span className="text-green-400">{metrics.hits}</span>
            </div>

            <div className="flex justify-between">
              <span>Cache Misses:</span>
              <span className="text-red-400">{metrics.misses}</span>
            </div>

            <div className="flex justify-between border-t border-slate-600 pt-2">
              <span>Hit Rate:</span>
              <span className="text-yellow-400">{metrics.hitRate.toFixed(1)}%</span>
            </div>

            <div className="flex justify-between">
              <span>Avg Latency:</span>
              <span className="text-yellow-400">{metrics.avgLatency.toFixed(0)}ms</span>
            </div>

            <div className="flex justify-between">
              <span>Cache Entries:</span>
              <span className="text-purple-400">{cacheSize}</span>
            </div>
          </div>

          {onClear && (
            <button
              onClick={onClear}
              className="mt-3 w-full px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors"
            >
              Clear Cache
            </button>
          )}

          <div className="mt-2 text-xs text-slate-400">
            Response caching & indexes optimizations active
          </div>
        </div>
      )}
    </>
  )
}
