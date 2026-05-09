import { z } from 'zod'

export const langSchema = z.enum(['es', 'en']).default('es')

export const moodSchema = z.number().int().min(0).max(100)

export const moodBucketSchema = z.enum(['low', 'medium', 'high'])

export const agentIdSchema = z.enum(['amplifier', 'documentarian', 'visionary'])

export const citySchema = z.string().trim().min(1).max(80)

export function moodToBucket(mood: number): 'low' | 'medium' | 'high' {
  if (mood < 40) return 'low'
  if (mood < 70) return 'medium'
  return 'high'
}
