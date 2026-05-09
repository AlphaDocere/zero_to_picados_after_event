'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useState } from 'react'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { registerCheckInOnSolana } from '@/lib/solana-check-in'

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
  const { connection } = useConnection()
  const { publicKey, signTransaction } = useWallet()
  const [loading, setLoading] = useState(false)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRegisterOnSolana = async () => {
    if (!publicKey || !signTransaction) {
      return
    }

    setLoading(true)
    setError(null)
    setTxSignature(null)

    const { signature, error: err } = await registerCheckInOnSolana(
      {
        city,
        initialMood,
        finalMood,
        agent,
        sentiment,
      },
      connection,
      publicKey,
      signTransaction
    )

    if (err) {
      setError(err)
    } else if (signature) {
      setTxSignature(signature)
      // Guardar la firma en localStorage para el historial
      const storedSigs = localStorage.getItem('solana_check_in_signatures')
      const sigs = storedSigs ? JSON.parse(storedSigs) : []
      sigs.push(signature)
      localStorage.setItem('solana_check_in_signatures', JSON.stringify(sigs.slice(-10))) // Guardar últimas 10
    }

    setLoading(false)
  }

  return (
    <div className="space-y-3">
      {!publicKey ? (
        <div className="bg-gradient-to-r from-purple-950/50 to-pink-950/50 border border-purple-500/30 rounded-xl p-4 space-y-3">
          <p className="text-sm text-purple-200">
            Conecta tu wallet de Solana para guardar este check-in en la blockchain
          </p>
          <WalletMultiButton style={{ width: '100%', height: '44px' }} />
        </div>
      ) : (
        <>
          <Button
            onClick={handleRegisterOnSolana}
            disabled={loading || !!txSignature}
            className="w-full h-12 rounded-xl text-base font-bold gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/40 transition-all duration-300 hover:shadow-purple-500/60 disabled:opacity-50"
          >
            <Zap className="w-5 h-5" />
            {loading
              ? 'Guardando en Solana...'
              : txSignature
                ? '✓ Guardado en Solana'
                : 'Guardar en Solana'}
          </Button>

          {error && (
            <div className="bg-red-950/50 border border-red-500/50 rounded-lg px-4 py-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

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
        </>
      )}
    </div>
  )
}
