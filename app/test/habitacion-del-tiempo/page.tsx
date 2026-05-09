'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function HabitacionTestPage() {
  const [userId, setUserId] = useState('user-test-001')
  const [agentName, setAgentName] = useState('Nova')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExecute = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('[v0] Disparando cron para:', userId, agentName)
      const response = await fetch('/api/cron/generate-agent-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, agentName, manual: true })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error ejecutando cron')
        console.error('[v0] Error:', data)
        return
      }

      setResult(data)
      console.log('[v0] Resultado:', data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('[v0] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Testing: Habitación del Tiempo
          </h1>
          <p className="text-muted-foreground">
            Dispara manualmente el Cron para generar ambientes virtuales
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              User ID
            </label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="user-test-001"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Agente
            </label>
            <div className="flex gap-2">
              {['Nova', 'Atlas', 'Phoenix'].map((agent) => (
                <Button
                  key={agent}
                  variant={agentName === agent ? 'default' : 'outline'}
                  onClick={() => setAgentName(agent)}
                  disabled={loading}
                >
                  {agent}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleExecute}
            disabled={loading || !userId}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            {loading ? 'Ejecutando...' : 'Ejecutar Cron'}
          </Button>
        </Card>

        {error && (
          <Card className="p-4 bg-red-950/20 border-red-500">
            <p className="text-red-400 font-mono text-sm">{error}</p>
          </Card>
        )}

        {result && (
          <Card className="p-6 space-y-4 bg-green-950/20 border-green-500">
            <h2 className="text-xl font-bold text-green-400">Éxito!</h2>
            <pre className="bg-background p-4 rounded overflow-auto text-xs text-foreground">
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </main>
  )
}
