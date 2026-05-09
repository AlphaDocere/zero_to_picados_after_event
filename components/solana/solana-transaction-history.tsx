'use client'

import { useConnection } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'

interface SolanaTransaction {
  signature: string
  blockTime?: number
  status: string
}

export function SolanaTransactionHistory() {
  const { connection } = useConnection()
  const [transactions, setTransactions] = useState<SolanaTransaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Buscar transacciones recientes con el memo program
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        // Para este MVP, podríamos guardar las firmas en localStorage o FireStore
        // Por ahora mostraremos un placeholder
        const storedSigs = localStorage.getItem('solana_check_in_signatures')
        if (storedSigs) {
          const sigs = JSON.parse(storedSigs) as string[]
          setTransactions(
            sigs.map((sig) => ({
              signature: sig,
              status: 'confirmed',
            }))
          )
        }
      } catch (err) {
        console.error('[v0] Error fetching transactions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [connection])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Cargando transacciones...
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No hay check-ins registrados en Solana aún
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground mb-4">Check-ins en Solana</h3>
      {transactions.map((tx) => (
        <a
          key={tx.signature}
          href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 p-3 rounded-lg bg-card border border-border hover:border-purple-500/50 hover:bg-purple-900/20 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-purple-400 truncate">
              {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Devnet</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </a>
      ))}
    </div>
  )
}
