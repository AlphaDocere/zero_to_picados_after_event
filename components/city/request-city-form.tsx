'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Globe, Send, CheckCircle } from 'lucide-react'
import { requestNewCity } from '@/lib/news-service'
import { cn } from '@/lib/utils'

export function RequestCityForm() {
  const [cityName, setCityName] = useState('')
  const [country, setCountry] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!cityName.trim() || !country || !email.trim()) {
      setError('Por favor completa todos los campos obligatorios')
      setLoading(false)
      return
    }

    const result = await requestNewCity(cityName, country, email, message)

    if (result) {
      setSuccess(true)
      setCityName('')
      setCountry('')
      setEmail('')
      setMessage('')
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError('Error al enviar la solicitud. Intenta de nuevo.')
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-blue-950/50 to-cyan-950/50 border border-blue-500/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-foreground">Solicita tu Ciudad</h3>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-200">
          <p className="font-medium mb-1 flex items-center gap-1">
            🌍 Cobertura del Proyecto
          </p>
          <p>Actualmente Reflect está enfocado en eventos locales y comunidades de <strong>Chile, Argentina, Perú y Colombia</strong>. Solo se procesarán solicitudes para estos países.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              País *
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-md border border-blue-500/30 bg-background/50 text-foreground px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
              required
            >
              <option value="" disabled className="bg-slate-900 text-muted-foreground">
                Selecciona tu país...
              </option>
              <option value="Chile" className="bg-slate-900 text-foreground">Chile 🇨🇱</option>
              <option value="Argentina" className="bg-slate-900 text-foreground">Argentina 🇦🇷</option>
              <option value="Perú" className="bg-slate-900 text-foreground">Perú 🇵🇪</option>
              <option value="Colombia" className="bg-slate-900 text-foreground">Colombia 🇨🇴</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Nombre de la ciudad *
            </label>
            <Input
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="Ej: Santiago, Mendoza, Lima..."
              className="bg-background/50 border-blue-500/30"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Email *
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="bg-background/50 border-blue-500/30"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Mensaje (opcional)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Cuéntanos por qué quieres esta ciudad..."
              className="bg-background/50 border-blue-500/30 min-h-20 resize-none"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-500/50 rounded-lg px-3 py-2">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-950/50 border border-green-500/50 rounded-lg px-3 py-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-sm text-green-300">¡Solicitud enviada correctamente!</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Te notificaremos cuando tu ciudad sea agregada
        </p>
      </div>
    </div>
  )
}
