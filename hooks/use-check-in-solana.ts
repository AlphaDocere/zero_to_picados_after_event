import { useCallback, useState } from 'react'
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  TransactionSignature,
} from '@solana/web3.js'

interface CheckInSolanaParams {
  city: string
  initialMood: number
  finalMood: number
  agent: string
  sentiment: string
  walletAddress: string
  signTransaction: (tx: any) => Promise<any>
}

interface RegistrationResult {
  signature: string | null
  error: string | null
  loading: boolean
}

export function useCheckInSolana() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)

  const registerCheckIn = useCallback(
    async (params: CheckInSolanaParams): Promise<RegistrationResult> => {
      setLoading(true)
      setError(null)
      setSignature(null)

      try {
        // Obtener la transacción del endpoint
        const actionUrl = new URL(
          `/api/actions/check-in-memo`,
          typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
        )

        actionUrl.searchParams.set('city', params.city)
        actionUrl.searchParams.set('initialMood', params.initialMood.toString())
        actionUrl.searchParams.set('finalMood', params.finalMood.toString())
        actionUrl.searchParams.set('agent', params.agent)
        actionUrl.searchParams.set('sentiment', params.sentiment)

        // POST a la acción con la wallet del usuario
        const response = await fetch(actionUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account: params.walletAddress }),
        })

        if (!response.ok) {
          throw new Error('Error al obtener la transacción de Solana')
        }

        const { transaction: txBase64, message } = await response.json()

        // Deserializar la transacción
        const { Transaction } = await import('@solana/web3.js')
        const txBuffer = Buffer.from(txBase64, 'base64')
        const transaction = Transaction.from(txBuffer)

        // Firmar con el wallet del usuario
        const signedTx = await params.signTransaction(transaction)

        // Enviar a la red
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
        const sig = await connection.sendRawTransaction(
          signedTx.serialize(),
          { skipPreflight: true, maxRetries: 3 }
        )

        // Esperar confirmación
        await connection.confirmTransaction(sig, 'finalized')

        setSignature(sig)
        return { signature: sig, error: null, loading: false }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Error desconocido al registrar en Solana'
        setError(errorMsg)
        console.error('[v0] Error registering check-in on Solana:', err)
        return { signature: null, error: errorMsg, loading: false }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    registerCheckIn,
    loading,
    error,
    signature,
  }
}
