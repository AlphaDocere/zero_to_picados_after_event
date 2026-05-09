"use client"

import { useState } from "react"
import { X, Heart, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, message: string) => Promise<void>
  isLoading?: boolean
  sessionCity: string
}

const CELEBRATORY_EMOJIS = ["🌟", "💫", "✨", "🎉", "🌈", "💚", "🙏", "💜", "🕯️", "🌸"]

export function SupportModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  sessionCity
}: SupportModalProps) {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) return
    
    await onSubmit(name, message)
    setSubmitted(true)
    
    // Mostrar feedback y cerrar después
    setTimeout(() => {
      setName("")
      setMessage("")
      setSubmitted(false)
      onClose()
    }, 2000)
  }

  if (submitted) {
    const randomEmoji = CELEBRATORY_EMOJIS[Math.floor(Math.random() * CELEBRATORY_EMOJIS.length)]
    
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card rounded-3xl border-2 border-border p-8 text-center space-y-6 animate-in">
          <div className="text-6xl animate-float">{randomEmoji}</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">¡Apoyo Compartido!</h2>
            <p className="text-sm text-muted-foreground">Tu voz fue escuchada en la comunidad</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card rounded-3xl border-2 border-border p-8 space-y-6 animate-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Suma Tu Apoyo</h2>
            <p className="text-sm text-muted-foreground">{sessionCity}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Tu nombre</label>
            <input
              type="text"
              placeholder="¿Cómo te llamas?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Tu mensaje</label>
            <textarea
              placeholder="Comparte tu apoyo, una reflexión o un shout out..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all"
            />
            <div className="text-xs text-muted-foreground">{message.length}/200</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-2xl h-12"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !message.trim() || isLoading}
            className="flex-1 rounded-2xl h-12 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Heart className="w-4 h-4" />
            {isLoading ? "Compartiendo..." : "Compartir Apoyo"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Tu apoyo será visible en nuestra comunidad y enviado a nuestro canal colaborativo
        </p>
      </div>
    </div>
  )
}
