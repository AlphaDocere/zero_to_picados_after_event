'use client'

import { useState, useEffect } from 'react'
import { Zap, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCheckInSolana } from '@/hooks/use-check-in-solana'

interface SolanaRegisterButtonProps {
  city: string
  initialMood: number
  finalMood: number
  agent: string
  sentiment: string
}

export function SolanaRegisterButton({
  city,
  initialMood,
  finalMood,
  agent,
  sentiment,
}: SolanaRegisterButtonProps) {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { registerCheckIn, loading, signature, error } = useCheckInSolana()

  useEffect(() => {
    // Detectar si Phantom está disponible
    const checkPhantom = async () => {
      if ('solana' in window) {
        const solana = window.solana as any
        if (solana?.isPhantom) {
          try {
            const accounts = await solana.request({
              method: 'getAccounts',
            })
            if (accounts.length > 0) {
              setWalletAddress(accounts[0].address)
              setWalletConnected(true)
            }
          } catch (err) {
            console.log('[v0] Phantom no conectado aún')
          }
        }
      }
    }
    checkPhantom()
  }, [])

  const handleConnectWallet = async () => {
    if ('solana' in window) {
      const solana = window.solana as any
      if (solana?.isPhantom) {
        try {
          const accounts = await solana.request({
            method: 'requestAccounts',
          })
          setWalletAddress(accounts[0].address)
          setWalletConnected(true)
        } catch (err) {
          console.error('[v0] Error conectando Phantom:', err)
        }
      }
    }
  }

  const handleRegister = async () => {
    if (!walletAddress) return

    const solana = window.solana as any
    if (!solana?.signTransaction) return

    await registerCheckIn({
      city,
      initialMood,
      finalMood,
      agent,
      sentiment,
      walletAddress,
      signTransaction: (tx) => solana.signTransaction(tx),
    })
  }

  const copySignature = () => {
    if (signature) {
      navigator.clipboard.writeText(signature)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-4">
      {!walletConnected ? (
        <Button
          onClick={handleConnectWallet}
          className="w-full h-12 rounded-xl text-base font-bold gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/40"
        >
          <Zap className="w-5 h-5" />
          Conectar Phantom Wallet
        </Button>
      ) : signature ? (
        <div className="space-y-3">
          <div className="bg-green-950/50 border border-green-500/50 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-green-300">
                  ✓ Registrado en Solana Devnet
                </p>
                <p className="text-xs text-green-400 mt-1 break-all">
                  {signature}
                </p>
              </div>
              <button
                onClick={copySignature}
                className="p-2 hover:bg-green-900/50 rounded transition-colors"
                title="Copiar firma"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-300" />
                ) : (
                  <Copy className="w-4 h-4 text-green-300" />
                )}
              </button>
            </div>
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-green-300 hover:text-green-200 underline"
            >
              Ver en Solana Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ) : (
        <>
          <Button
            onClick={handleRegister}
            disabled={loading}
            className="w-full h-12 rounded-xl text-base font-bold gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/40 disabled:opacity-50"
          >
            <Zap className="w-5 h-5" />
            {loading ? 'Registrando en Solana...' : 'Registrar Check-in en Solana'}
          </Button>

          {error && (
            <div className="bg-red-950/50 border border-red-500/50 rounded-xl p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Tu check-in se registrará como un Memo inmutable en Solana Devnet
      </p>
    </div>
  )
}
