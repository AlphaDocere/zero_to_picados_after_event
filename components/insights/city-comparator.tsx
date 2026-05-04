"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CityComparatorProps {
  cities: any[]
}

export function CityComparator({ cities }: CityComparatorProps) {
  const [selected, setSelected] = useState([cities[0]?.city, cities[1]?.city])

  const city1 = cities.find(c => c.city === selected[0])
  const city2 = cities.find(c => c.city === selected[1])

  if (!city1 || !city2) return null

  const similarity = Math.round((1 - (Math.abs(city1.avgMood - city2.avgMood) + Math.abs(city1.avgChange - city2.avgChange)) / 200) * 100)

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-4">
        <select 
          value={selected[0]}
          onChange={(e) => setSelected([e.target.value, selected[1]])}
          className="flex-1 px-4 py-2 rounded-xl border border-border bg-background text-foreground"
        >
          {cities.map(c => <option key={c.city} value={c.city}>{c.city}</option>)}
        </select>

        <div className="flex items-center justify-center px-4 font-bold text-foreground">vs</div>

        <select
          value={selected[1]}
          onChange={(e) => setSelected([selected[0], e.target.value])}
          className="flex-1 px-4 py-2 rounded-xl border border-border bg-background text-foreground"
        >
          {cities.map(c => <option key={c.city} value={c.city}>{c.city}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="space-y-3">
            <h3 className="font-bold text-foreground">{city1.city}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ánimo promedio:</span>
                <span className="font-semibold">{city1.avgMood}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cambio:</span>
                <span className={`font-semibold ${city1.avgChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {city1.avgChange > 0 ? '+' : ''}{city1.avgChange}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-ins:</span>
                <span>{city1.count}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-3">
            <h3 className="font-bold text-foreground">{city2.city}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ánimo promedio:</span>
                <span className="font-semibold">{city2.avgMood}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cambio:</span>
                <span className={`font-semibold ${city2.avgChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {city2.avgChange > 0 ? '+' : ''}{city2.avgChange}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-ins:</span>
                <span>{city2.count}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">Similitud Emocional</p>
        <p className="text-3xl font-bold text-primary">{similarity}%</p>
      </div>
    </div>
  )
}
