/**
 * Solana Transaction Validator
 * Verifica transacciones en Solana Devnet/Mainnet
 */

interface SolanaTransaction {
  signature: string
  blockTime: number | null
  slot: number | null
  transaction: {
    message: {
      accountKeys: Array<{ pubkey: string; signer: boolean; writable: boolean }>
      instructions: any[]
      recentBlockhash: string
    }
    signatures: string[]
  } | null
  meta: {
    err: any
    fee: number
    preBalances: number[]
    postBalances: number[]
    logMessages: string[]
  } | null
  status: 'success' | 'error' | 'not_found'
}

const SOLANA_RPC_URL = 'https://api.devnet.solana.com'

/**
 * Valida una transacción en Solana
 */
export async function validateSolanaTransaction(signature: string): Promise<SolanaTransaction> {
  if (!signature || signature.trim() === '') {
    return {
      signature,
      blockTime: null,
      slot: null,
      transaction: null,
      meta: null,
      status: 'not_found',
    }
  }

  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [signature, { encoding: 'json', maxSupportedTransactionVersion: 0 }],
      }),
    })

    const data = await response.json()

    if (data.result === null) {
      return {
        signature,
        blockTime: null,
        slot: null,
        transaction: null,
        meta: null,
        status: 'not_found',
      }
    }

    const result = data.result
    const isSuccess = result.meta?.err === null

    return {
      signature,
      blockTime: result.blockTime,
      slot: result.slot,
      transaction: result.transaction,
      meta: result.meta,
      status: isSuccess ? 'success' : 'error',
    }
  } catch (error) {
    console.error('[v0] Error validating Solana transaction:', error)
    return {
      signature,
      blockTime: null,
      slot: null,
      transaction: null,
      meta: null,
      status: 'error',
    }
  }
}

/**
 * Obtiene información legible de una transacción
 */
export function formatTransactionInfo(tx: SolanaTransaction) {
  if (tx.status === 'not_found') {
    return {
      valid: false,
      message: 'Transacción no encontrada en Solana Devnet',
      details: null,
    }
  }

  if (tx.status === 'error') {
    return {
      valid: false,
      message: 'Error al validar transacción',
      details: tx.meta?.err ? `Error: ${JSON.stringify(tx.meta.err)}` : 'Error desconocido',
    }
  }

  const date = tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString('es-ES') : 'Desconocido'
  const fee = tx.meta?.fee ? (tx.meta.fee / 1e9).toFixed(6) : '0'

  return {
    valid: true,
    message: '✓ Transacción verificada en Solana',
    details: {
      signature: tx.signature,
      slot: tx.slot,
      blockTime: date,
      fee: `${fee} SOL`,
      confirmed: tx.status === 'success',
      accounts: tx.transaction?.message?.accountKeys?.length || 0,
      instructions: tx.transaction?.message?.instructions?.length || 0,
    },
  }
}

/**
 * Genera un link a Solana Explorer
 */
export function generateSolanaExplorerLink(signature: string, cluster: 'devnet' | 'mainnet' = 'devnet') {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`
}
