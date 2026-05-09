'use client'

import { useRef, useCallback } from 'react'

type Forecast = 'improving' | 'stable' | 'needs-care'

const CONFIGS: Record<Forecast, { baseFreq: number; beatFreq: number; volume: number; label: string }> = {
  'needs-care': { baseFreq: 220, beatFreq: 6,  volume: 0.07, label: 'Theta 6Hz — sanación profunda' },
  'stable':     { baseFreq: 220, beatFreq: 10, volume: 0.06, label: 'Alpha 10Hz — calma enfocada'   },
  'improving':  { baseFreq: 220, beatFreq: 14, volume: 0.07, label: 'Alpha/Beta 14Hz — energía positiva' },
}

export function useBinauralBeat() {
  const ctxRef  = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const start = useCallback((forecast: Forecast) => {
    // Close any existing context
    ctxRef.current?.close()

    const config = CONFIGS[forecast]
    const ctx = new AudioContext()
    ctxRef.current = ctx

    // Master gain with 3s fade-in
    const master = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(config.volume, ctx.currentTime + 3)
    master.connect(ctx.destination)
    gainRef.current = master

    // Left channel — base frequency
    const leftOsc = ctx.createOscillator()
    const leftPan = ctx.createStereoPanner()
    leftOsc.type = 'sine'
    leftOsc.frequency.value = config.baseFreq
    leftPan.pan.value = -1
    leftOsc.connect(leftPan).connect(master)
    leftOsc.start()

    // Right channel — base + beat frequency (creates the binaural effect)
    const rightOsc = ctx.createOscillator()
    const rightPan = ctx.createStereoPanner()
    rightOsc.type = 'sine'
    rightOsc.frequency.value = config.baseFreq + config.beatFreq
    rightPan.pan.value = 1
    rightOsc.connect(rightPan).connect(master)
    rightOsc.start()

    return config.label
  }, [])

  const stop = useCallback(() => {
    if (!gainRef.current || !ctxRef.current) return
    const ctx = ctxRef.current
    gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)
    setTimeout(() => ctx.close(), 2500)
    gainRef.current = null
    ctxRef.current = null
  }, [])

  return { start, stop, configs: CONFIGS }
}
