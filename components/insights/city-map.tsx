"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CityMapProps {
  cities: any[]
}

export function CityMap({ cities }: CityMapProps) {
  const data = cities
    .sort((a, b) => b.avgChange - a.avgChange)
    .slice(0, 12)
    .map(city => ({
      city: city.city.split(' ')[0],
      mood: city.avgMood,
      change: city.avgChange > 0 ? city.avgChange : 0,
      decline: city.avgChange < 0 ? Math.abs(city.avgChange) : 0
    }))

  return (
    <div className="w-full h-96 bg-card rounded-2xl border border-border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">Cambio Emocional por Ciudad</h3>
        <p className="text-xs text-muted-foreground">Verde: mejoría | Rojo: declive</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis type="number" />
          <YAxis dataKey="city" type="category" width={95} />
          <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }} />
          <Bar dataKey="change" fill="#10b981" name="Mejoría" />
          <Bar dataKey="decline" fill="#ef4444" name="Declive" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
