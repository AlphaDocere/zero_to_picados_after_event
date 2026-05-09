'use client'

import { useState } from 'react'
import { Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { recordCheckInLocally } from '@/lib/solana/check-in-recorder'

interface CheckInData {
  city: string
  initialMood: number
  finalMood: number
  moodShift: number
  agentUsed: 'compassionate' | 'analytical' | 'reflective'
  sentiment: string
}

interface CheckInWeb3RecorderProps {
  checkInData: CheckInData
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

  const handleRecordOnWeb3 = async () => {
    setLoading(true)
    setStatus('idle')

    try {
      const entry = recordCheckInLocally(checkInData)
      setSignature(entry.signature)
      setStatus('success')
      setMessage('Check-in registrado en Web3')
      onSuccess?.(entry.signature)
    } catch (error) {
      setStatus('error')
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      setMessage(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Auto-record si está habilitado
  if (autoRecord && status === 'idle' && !loading) {
    setTimeout(() => handleRecordOnWeb3(), 100)
  }

  if (status === 'success') {
    return (
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
    )
  }

  if (status === 'error') {
    return (
      <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/50 space-y-1">
        <div className="flex gap-2 items-center text-red-300">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-semibold">{message}</span>
        </div>
      </div>
    )
  }

  return (
    <Button
      onClick={handleRecordOnWeb3}
      disabled={loading}
      className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
    >
      <Zap className="w-4 h-4" />
      {loading ? 'Registrando en Web3...' : 'Registrar en Web3'}
    </Button>
  )
}
