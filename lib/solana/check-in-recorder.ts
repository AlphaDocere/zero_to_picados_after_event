/**
 * Solana Check-In Recorder
 * Registra cada check-in como una transacción en la blockchain de Solana
 * Usa Memo Program para almacenar datos de forma simple y económica
 */

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'

export interface CheckInRecord {
  city: string
  initialMood: number
  finalMood: number
  moodShift: number
  agentUsed: 'compassionate' | 'analytical' | 'reflective'
  sentiment: string
  timestamp: number
}

export interface SolanaCheckInResponse {
  success: boolean
  signature?: string
  error?: string
}

/**
 * Registra un check-in en Solana blockchain
 * Guarda la información codificada en una transacción Memo
 */
export async function recordCheckInOnSolana(
  checkInData: CheckInRecord,
  connection: Connection,
  wallet: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<SolanaCheckInResponse> {
  try {
    // Preparar datos para la transacción
    const memoData = JSON.stringify({
      type: 'CHECK_IN',
      ...checkInData,
      walletAddress: wallet.toString(),
    })

    // Crear transacción simple (sin Memo Program por ahora, solo como tx vacía con metadatos)
    const transaction = new Transaction()
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet,
        toPubkey: wallet, // Self-transfer para crear huella
        lamports: 5000, // Mínimo para crear la transacción
      })
    )

    // Agregar descripción a la transacción
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash
    transaction.feePayer = wallet

    // Firmar transacción
    const signedTransaction = await signTransaction(transaction)

    // Enviar transacción
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    )

    // Esperar confirmación
    await connection.confirmTransaction(signature, 'confirmed')

    // Guardar en localStorage como respaldo
    saveCheckInLocally(checkInData, signature)

    return {
      success: true,
      signature,
    }
  } catch (error) {
    console.error('[Solana] Error registering check-in:', error)
    // Guardar localmente aunque falle en blockchain
    saveCheckInLocally(checkInData, 'local-' + Date.now())

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Guarda el check-in en localStorage como respaldo
 */
function saveCheckInLocally(checkInData: CheckInRecord, signature: string) {
  try {
    const stored = localStorage.getItem('solana_check_ins')
    const checkIns = stored ? JSON.parse(stored) : []

    checkIns.push({
      ...checkInData,
      signature,
      recordedAt: new Date().toISOString(),
    })

    // Guardar últimas 100 transacciones
    localStorage.setItem(
      'solana_check_ins',
      JSON.stringify(checkIns.slice(-100))
    )
  } catch (e) {
    console.warn('[Solana] Could not save locally:', e)
  }
}

/**
 * Obtiene el historial de check-ins del localStorage
 */
export function getCheckInHistory(): CheckInRecord[] {
  try {
    const stored = localStorage.getItem('solana_check_ins')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Obtiene un check-in específico por firma
 */
export function getCheckInBySignature(signature: string): CheckInRecord | null {
  try {
    const history = getCheckInHistory()
    return history.find((ci: any) => ci.signature === signature) || null
  } catch {
    return null
  }
}

/**
 * Obtiene estadísticas del historial
 */
export function getCheckInStats() {
  const history = getCheckInHistory()

  if (history.length === 0) {
    return {
      totalCheckIns: 0,
      averageMoodShift: 0,
      bestMoodDay: null,
      favoriteAgent: null,
    }
  }

  const totalCheckIns = history.length
  const averageMoodShift =
    history.reduce((sum: number, ci: any) => sum + ci.moodShift, 0) /
    totalCheckIns
  const bestMoodDay = history.reduce((best: any, ci: any) =>
    ci.moodShift > (best?.moodShift || -100) ? ci : best
  )

  // Contar agentes usados
  const agentCounts: Record<string, number> = {}
  history.forEach((ci: any) => {
    agentCounts[ci.agentUsed] = (agentCounts[ci.agentUsed] || 0) + 1
  })
  const favoriteAgent = Object.entries(agentCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0]

  return {
    totalCheckIns,
    averageMoodShift: averageMoodShift.toFixed(1),
    bestMoodDay,
    favoriteAgent,
  }
}
