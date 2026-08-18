'use client'

import { useState } from 'react'
import { Search, CheckCircle, AlertCircle, Zap, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { validateSolanaTransaction, formatTransactionInfo, generateSolanaExplorerLink } from '@/lib/solana/solana-validator'

export function SolanaTxValidator() {
  const [signature, setSignature] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleValidate = async () => {
    const trimmed = signature.trim()
    if (!trimmed) {
      setError('Por favor ingresa una firma de transacción')
      return
    }

    if (trimmed.length < 43) {
      setError('La firma Solana debe tener al menos 43 caracteres (habitualmente 87-88 base-58)')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const tx = await validateSolanaTransaction(trimmed)
      const info = formatTransactionInfo(tx)
      setResult({ ...info, signature: trimmed, tx })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al validar transacción')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-bold text-foreground">Validador de Transacciones Solana</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Verifica cualquier firma de transacción en Solana Devnet
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Ingresa una firma de transacción (87-88 caracteres base-58)"
            value={signature}
            onChange={(e) => {
              setSignature(e.target.value)
              setError(null)
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
            disabled={loading}
            className="text-sm font-mono"
          />
          <Button
            onClick={handleValidate}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold gap-2"
          >
            {loading ? 'Validando...' : <><Search className="w-4 h-4" /> Validar</>}
          </Button>
        </div>
        {error && (
          <div className="bg-red-950/50 border border-red-500/50 rounded-lg px-3 py-2">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
      </div>

      {result && (
        <Card className="border-2 overflow-hidden">
          {result.valid ? (
            <div className="space-y-4">
              <div className="bg-green-950/30 border-b border-green-500/30 px-6 py-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-bold text-green-400">{result.message}</p>
                  <p className="text-sm text-green-300/70 mt-1">La transacción fue registrada en la blockchain</p>
                </div>
              </div>

              <div className="px-6 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Slot</p>
                    <p className="font-mono text-sm font-semibold text-foreground">{result.details?.slot ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fee</p>
                    <p className="font-mono text-sm font-semibold text-foreground">{result.details?.fee ?? '0 SOL'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Fecha</p>
                    <p className="font-semibold text-foreground text-sm">{result.details?.blockTime ?? 'Desconocido'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cuentas</p>
                    <p className="font-semibold text-foreground">{result.details?.accounts ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Instrucciones</p>
                    <p className="font-semibold text-foreground">{result.details?.instructions ?? 0}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Firma de Transacción</p>
                  <p className="font-mono text-xs break-all bg-muted/50 p-3 rounded text-foreground/70">
                    {result.signature}
                  </p>
                </div>

                <a
                  href={generateSolanaExplorerLink(result.signature, 'devnet')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-blue-950/50 hover:bg-blue-950/70 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 transition-colors text-sm font-semibold mt-4"
                >
                  Ver en Solana Explorer
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-950/30 border-b border-amber-500/30 px-6 py-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="font-bold text-amber-400">{result.message}</p>
                  {result.details && <p className="text-sm text-amber-300/70 mt-1">{result.details}</p>}
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Verifica que la firma sea correcta y que corresponda a una transacción emitida en Solana Devnet.
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ejemplo de firma válida (87-88 caracteres)</p>
        <p className="text-xs font-mono text-foreground/60 break-all">
          4sK9WbK1VwB8pM4yN6pP9rZ2xY5tU7wB4cD1eF0gJ2hM8mZvVJ3oq3Zn4wVqLxL4pNvZXpzQ5qF8vK3mN6pP9rZ2
        </p>
      </div>
    </div>
  )
}
