'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SolanaCheckInButtonProps {
  city: string
  initialMood: number
  finalMood: number
  agent: string
  sentiment: string
}

export function SolanaCheckInButton({
  city,
  initialMood,
  finalMood,
  agent,
  sentiment,
}: SolanaCheckInButtonProps) {
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegisterOnSolana = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/actions/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          initialMood,
          finalMood,
          agent,
          sentiment,
        }),
      })

      const data = await response.json()
      if (data.signature) {
        setTxSignature(data.signature)
        const storedSigs = localStorage.getItem('solana_check_in_signatures')
        const sigs = storedSigs ? JSON.parse(storedSigs) : []
        sigs.push(data.signature)
        localStorage.setItem('solana_check_in_signatures', JSON.stringify(sigs.slice(-10)))
      }
    } catch (error) {
      console.error('[v0] Error registering on Solana:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleRegisterOnSolana}
        disabled={loading || !!txSignature}
        className="w-full h-12 rounded-xl text-base font-bold gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/40 transition-all duration-300 hover:shadow-purple-500/60 disabled:opacity-50"
      >
        <Zap className="w-5 h-5" />
        {loading
          ? 'Registrando en Solana...'
          : txSignature
            ? '✓ Guardado en Solana'
            : 'Guardar en Solana'}
      </Button>

      {txSignature && (
        <div className="bg-green-950/50 border border-green-500/50 rounded-lg px-4 py-3 space-y-2">
          <p className="text-sm text-green-300 font-semibold">
            ✓ Check-in registrado en Solana Devnet
          </p>
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-400 hover:text-green-300 underline block"
          >
            Ver en Solana Explorer →
          </a>
        </div>
      )}
    </div>
  )
}
