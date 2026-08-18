/**
 * Solana Transaction Validator
 * Verifica transacciones en Solana Devnet/Mainnet
 */

export interface SolanaTransaction {
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
  status: 'success' | 'error' | 'not_found' | 'invalid'
}

const SOLANA_RPC_URL = 'https://api.devnet.solana.com'

/**
 * Valida una transacción en Solana Devnet
 */
export async function validateSolanaTransaction(signature: string): Promise<SolanaTransaction> {
  const cleanSig = (signature || '').trim()

  // Validar longitud básica de firma Solana base-58 (mínimo 43 caracteres)
  if (!cleanSig || cleanSig.length < 43) {
    return {
      signature: cleanSig,
      blockTime: null,
      slot: null,
      transaction: null,
      meta: null,
      status: 'invalid',
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
        params: [cleanSig, { encoding: 'json', maxSupportedTransactionVersion: 0 }],
      }),
    })

    if (!response.ok) {
      return {
        signature: cleanSig,
        blockTime: null,
        slot: null,
        transaction: null,
        meta: null,
        status: 'not_found',
      }
    }

    const data = await response.json()

    // Si el RPC de Solana devuelve un error de formato o parámetro inválido
    if (data?.error) {
      return {
        signature: cleanSig,
        blockTime: null,
        slot: null,
        transaction: null,
        meta: null,
        status: 'invalid',
      }
    }

    // Si no se encuentra la transacción en Devnet
    if (!data?.result || data.result === null) {
      return {
        signature: cleanSig,
        blockTime: null,
        slot: null,
        transaction: null,
        meta: null,
        status: 'not_found',
      }
    }

    const result = data.result
    const meta = result?.meta || null
    const isSuccess = Boolean(meta && meta.err === null)

    return {
      signature: cleanSig,
      blockTime: typeof result.blockTime === 'number' ? result.blockTime : null,
      slot: typeof result.slot === 'number' ? result.slot : null,
      transaction: result.transaction || null,
      meta: meta,
      status: isSuccess ? 'success' : (meta?.err ? 'error' : 'not_found'),
    }
  } catch (error) {
    console.error('[v0] Error validating Solana transaction:', error)
    return {
      signature: cleanSig,
      blockTime: null,
      slot: null,
      transaction: null,
      meta: null,
      status: 'not_found',
    }
  }
}

/**
 * Obtiene información legible y formateada de una transacción
 */
export function formatTransactionInfo(tx: SolanaTransaction) {
  if (!tx || tx.status === 'invalid') {
    return {
      valid: false,
      message: 'Firma inválida',
      details: 'La firma proporcionada no cumple con el formato válido de Solana base-58 (87-88 caracteres).',
    }
  }

  if (tx.status === 'not_found') {
    return {
      valid: false,
      message: 'Transacción no encontrada',
      details: 'La firma no existe en Solana Devnet o aún no ha sido confirmada por los validadores.',
    }
  }

  if (tx.status === 'error') {
    return {
      valid: false,
      message: 'Transacción no encontrada o con errores',
      details: tx.meta?.err ? `Error: ${JSON.stringify(tx.meta.err)}` : 'La transacción fue rechazada o falló en la blockchain.',
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
