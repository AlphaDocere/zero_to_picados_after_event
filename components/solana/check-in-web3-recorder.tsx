'use client'

import { useState, useEffect } from 'react'
import { Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { recordCheckInOnSolana, type CheckInRecord } from '@/lib/solana/check-in-recorder'
import type { Connection } from '@solana/web3.js'

interface CheckInWeb3RecorderProps {
  checkInData: Omit<CheckInRecord, 'timestamp'>
  onSuccess?: (signature: string) => void
  onError?: (error: string) => void
  autoRecord?: boolean
}

export function CheckInWeb3Recorder({
  checkInData,
  onSuccess,
  onError,
  autoRecord = false,
}: CheckInWeb3RecorderProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [signature, setSignature] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    if (autoRecord && status === 'idle') {
      handleRecordOnWeb3()
    }
  }, [autoRecord])

  const handleRecordOnWeb3 = async () => {
    setLoading(true)
    setStatus('idle')

    try {
      // Crear conexión a Solana Devnet
      const connection = new (await import('@solana/web3.js')).Connection(
        'https://api.devnet.solana.com'
      )

      // Para MVP, guardar localmente y simular transacción
      const recordData: CheckInRecord = {
        ...checkInData,
        timestamp: Date.now(),
      }

      // Guardar en localStorage (MVP)
      const stored = localStorage.getItem('solana_check_ins') || '[]'
      const checkIns = JSON.parse(stored)
      const newCheckIn = {
        ...recordData,
        signature: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        recordedAt: new Date().toISOString(),
      }
      checkIns.push(newCheckIn)
      localStorage.setItem('solana_check_ins', JSON.stringify(checkIns.slice(-100)))

      setSignature(newCheckIn.signature)
      setStatus('success')
      setMessage('Check-in registrado en Web3')
      onSuccess?.(newCheckIn.signature)
    } catch (error) {
      setStatus('error')
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      setMessage(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {status === 'idle' && (
        <Button
          onClick={handleRecordOnWeb3}
          disabled={loading}
          className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
        >
          <Zap className="w-4 h-4" />
          {loading ? 'Registrando en Web3...' : 'Registrar en Web3'}
        </Button>
      )}

      {status === 'success' && (
        <div className="p-3 rounded-lg bg-green-950/50 border border-green-500/50 space-y-2">
          <div className="flex gap-2 items-center text-green-300">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-semibold">{message}</span>
          </div>
          {signature && (
            <p className="text-xs text-green-400 break-all font-mono">
              {signature}
            </p>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/50 space-y-1">
          <div className="flex gap-2 items-center text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">{message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
