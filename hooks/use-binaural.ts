'use client'

import { useRef, useCallback } from 'react'

type Forecast = 'improving' | 'stable' | 'needs-care'

const CONFIGS: Record<Forecast, { baseFreq: number; beatFreq: number; volume: number; label: string }> = {
  'needs-care': { baseFreq: 220, beatFreq: 6,  volume: 0.07, label: 'Theta 6Hz — sanación profunda' },
  'stable':     { baseFreq: 220, beatFreq: 10, volume: 0.06, label: 'Alpha 10Hz — calma enfocada'   },
  'improving':  { baseFreq: 220, beatFreq: 14, volume: 0.07, label: 'Alpha/Beta 14Hz — energía positiva' },
}

const PENTATONIC_NOTES = [220, 261.63, 293.66, 329.63, 392.00, 440]

export function useBinauralBeat() {
  const ctxRef  = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const melodyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const melodyPlayingRef = useRef<boolean>(false)

  const playNextNote = useCallback((ctx: AudioContext, masterGain: GainNode) => {
    if (!melodyPlayingRef.current) return

    const osc = ctx.createOscillator()
    const noteGain = ctx.createGain()
    const pan = ctx.createStereoPanner()
    
    osc.type = 'sine'
    // Pick a random note from the pentatonic scale (sometimes an octave higher)
    const baseFreq = PENTATONIC_NOTES[Math.floor(Math.random() * PENTATONIC_NOTES.length)]
    const isHigh = Math.random() > 0.7
    osc.frequency.value = isHigh ? baseFreq * 2 : baseFreq

    // Random panning between -0.5 and 0.5
    pan.pan.value = (Math.random() * 1) - 0.5

    const now = ctx.currentTime
    const attack = 3
    const release = 4
    
    noteGain.gain.setValueAtTime(0, now)
    noteGain.gain.linearRampToValueAtTime(0.015, now + attack) // very soft melody
    noteGain.gain.linearRampToValueAtTime(0, now + attack + release)
    
    osc.connect(pan).connect(noteGain).connect(masterGain)
    osc.start(now)
    osc.stop(now + attack + release)

    // Schedule next note between 2 and 5 seconds
    const nextTime = 2000 + Math.random() * 3000
    melodyTimeoutRef.current = setTimeout(() => {
      playNextNote(ctx, masterGain)
    }, nextTime)
  }, [])

  const start = useCallback((forecast: Forecast) => {
    // Close any existing context
    ctxRef.current?.close()
    if (melodyTimeoutRef.current) clearTimeout(melodyTimeoutRef.current)
    melodyPlayingRef.current = true

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

    // Start melody layer
    playNextNote(ctx, master)

    return config.label
  }, [playNextNote])

  const stop = useCallback(() => {
    melodyPlayingRef.current = false
    if (melodyTimeoutRef.current) clearTimeout(melodyTimeoutRef.current)

    if (!gainRef.current || !ctxRef.current) return
    const ctx = ctxRef.current
    gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)
    setTimeout(() => ctx.close(), 2500)
    gainRef.current = null
    ctxRef.current = null
  }, [])

  return { start, stop, configs: CONFIGS }
}
