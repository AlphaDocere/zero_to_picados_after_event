import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Transaction } from '@solana/web3.js'

interface CheckInData {
  city: string
  initialMood: number
  finalMood: number
  agent: string
  sentiment: string
  date?: string
}

export async function registerCheckInOnSolana(
  checkInData: CheckInData,
  connection: any,
  publicKey: any,
  signTransaction: any
): Promise<{ signature: string | null; error: string | null }> {
  if (!publicKey || !signTransaction) {
    return {
      signature: null,
      error: 'Wallet not connected',
    }
  }

  try {
    const params = new URLSearchParams({
      city: checkInData.city,
      initialMood: String(checkInData.initialMood),
      finalMood: String(checkInData.finalMood),
      agent: checkInData.agent,
      sentiment: checkInData.sentiment,
      date: checkInData.date || new Date().toISOString(),
    })

    // Obtener la transacción del endpoint
    const res = await fetch(`/api/actions/check-in?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: publicKey.toBase58() }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message ?? 'Error construyendo la transacción')
    }

    const { transaction: txBase64 } = await res.json()
    const txBuffer = Buffer.from(txBase64, 'base64')
    const transaction = Transaction.from(txBuffer)

    // Obtener el blockhash reciente
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = publicKey

    // Firmar la transacción
    const signed = await signTransaction(transaction)

    // Enviar la transacción
    const signature = await connection.sendRawTransaction(signed.serialize())

    // Confirmar la transacción
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    })

    console.log('[v0] Check-in registrado en Solana:', signature)

    return {
      signature,
      error: null,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[v0] Error registrando en Solana:', msg)
    return {
      signature: null,
      error: msg.includes('User rejected') ? 'Firma cancelada' : msg,
    }
  }
}

export function useSolanaCheckIn() {
  const { connection } = useConnection()
  const { publicKey, signTransaction } = useWallet()

  return {
    isConnected: !!publicKey,
    publicKey,
    registerCheckIn: (data: CheckInData) =>
      registerCheckInOnSolana(data, connection, publicKey, signTransaction),
  }
}
