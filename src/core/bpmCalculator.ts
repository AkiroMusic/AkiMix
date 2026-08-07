/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * BPM Calculator — Tempo-Based Mixing Calculations
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 *   Provides utility functions for time-based audio calculations tied to
 *   tempo (BPM — Beats Per Minute). These calculations are essential for:
 *
 *   1. DELAY TIMES: Echo/delay effects timed to the beat (1/4, 1/8, 1/16 notes)
 *   2. COMPRESSOR RELEASE: Release times synced to the beat
 *   3. REVERB PRE-DELAY: Room size estimation from tempo
 *   4. REVERB RT60: Decay time recommendations based on tempo
 *   5. TAP TEMPO: Calculate BPM from manual tapping intervals
 *   6. SPEED MULTIPLIER: Scale BPM up/down (e.g., half-time, double-time)
 *
 * CORE FORMULA:
 *   ms = 60000 / BPM * (4 / noteDiv)
 *   60000ms = 1 minute
 *   1 beat = 1/4 note = 60000/BPM ms
 *
 * THESE ARE NOT MAGIC NUMBERS:
 *   60000 = milliseconds in a minute (60 * 1000)
 *   4 = quarter note = 1 beat in 4/4 time
 *   noteDiv 4 = quarter note, 8 = eighth note, 16 = sixteenth, etc.
 *
 * @example
 *   import { bpmToMs } from './bpmCalculator'
 *   bpmToMs(120, 4)    // → 500 (1/4 note at 120 BPM = 500ms)
 *   bpmToMs(120, 8)    // → 250 (1/8 note)
 *   bpmToMs(120, 16)   // → 125 (1/16 note)
 */

/**
 * bpmToMs — Convert BPM + note division to milliseconds.
 *
 * The CORE formula used by all other functions in this module.
 * A quarter note (1 beat) at X BPM takes 60000/X milliseconds.
 * Other note divisions are scaled from there.
 *
 * @param bpm — Beats per minute. Range: 1-999 (but realistic: 40-240)
 * @param noteDiv — The note division as a fraction:
 *                  4 = quarter note (= 1 beat)
 *                  8 = eighth note (= 1/2 beat)
 *                  16 = sixteenth note (= 1/4 beat)
 *                  1 = whole note (= 4 beats)
 * @returns Time in milliseconds, as a raw float
 *
 * @example
 *   bpmToMs(120, 4)       // → 500 (1/4 note at 120 BPM = 500ms)
 *   bpmToMs(120, 8)       // → 250 (1/8 note)
 *   bpmToMs(60, 4)        // → 1000 (1 second = 1 beat at 60 BPM)
 *   bpmToMs(120, 1)       // → 2000 (whole note at 120 BPM = 2 seconds)
 */
export function bpmToMs(bpm: number, noteDiv: number): number {
  return (60000 / bpm) * (4 / noteDiv)
}

/**
 * getNormalDelays — Calculate delay times for standard note divisions.
 *
 * Returns ALL standard note divisions (1/1 through 1/64) as milliseconds.
 * This is your go-to function for setting delay effect times that lock
 * to the tempo of your track.
 *
 * WHY IT'S USEFUL:
 *   Setting a delay to 1/8 note means each echo lands exactly on the beat.
 *   Dotted and triplet variants create polyrhythmic patterns.
 *
 * @param bpm — Beats per minute
 * @returns Object like { "1/1": 2000, "1/2": 1000, "1/4": 500, "1/8": 250, ... }
 *           Values are rounded to 1 decimal place
 *
 * @example
 *   getNormalDelays(120)
 *   // → { "1/1": 2000, "1/2": 1000, "1/4": 500, "1/8": 250, "1/16": 125, ... }
 */
export function getNormalDelays(bpm: number): Record<string, number> {
  const divisions = [1, 2, 4, 8, 16, 32, 64]
  const result: Record<string, number> = {}
  for (const div of divisions) {
    result[`1/${div}`] = parseFloat(bpmToMs(bpm, div).toFixed(1))
  }
  return result
}

/**
 * getDottedDelays — Calculate dotted delay times.
 *
 * A "dotted" note is 1.5× the length of the standard note.
 * Dotted delays create a swung, syncopated feel — the delay repeats
 * land off the main beat, creating interest.
 *
 * MUSICAL CONTEXT:
 *   Dotted 1/8 note = 1/8 + 1/16 = 3/16 note value.
 *   This is THE classic delay timing in dub/reggae music.
 *
 * @param bpm — Beats per minute
 * @returns Object with same keys as getNormalDelays, each × 1.5
 *
 * @example
 *   getDottedDelays(120)
 *   // → { "1/4": 750, "1/8": 375, "1/16": 187.5, ... }
 *   // Compare to normal: 1/4 = 500, dotted 1/4 = 750
 */
export function getDottedDelays(bpm: number): Record<string, number> {
  const normal = getNormalDelays(bpm)
  const result: Record<string, number> = {}
  for (const [key, val] of Object.entries(normal)) {
    result[key] = parseFloat((val * 1.5).toFixed(1))
  }
  return result
}

/**
 * getTripletDelays — Calculate triplet delay times.
 *
 * Triplet notes divide a beat into 3 equal parts (instead of 2 or 4).
 * A triplet 1/8 note = 2/3 of a standard 1/8 note = "1/12 note."
 *
 * WHERE IT'S USED:
 *   Triplet delays create a 3-against-2 polyrhythm feel.
 *   Common in progressive rock, jazz, and electronic music.
 *
 * @param bpm — Beats per minute
 * @returns Object with same keys as getNormalDelays, each × 2/3
 *
 * @example
 *   getTripletDelays(120)
 *   // → { "1/4": 333.3, "1/8": 166.7, "1/16": 83.3, ... }
 */
export function getTripletDelays(bpm: number): Record<string, number> {
  const normal = getNormalDelays(bpm)
  const result: Record<string, number> = {}
  for (const [key, val] of Object.entries(normal)) {
    result[key] = parseFloat((val * 2 / 3).toFixed(1))
  }
  return result
}

/**
 * getCompressReleaseTimes — Compressor release settings synced to tempo.
 *
 * A compressor's RELEASE controls how quickly it stops reducing gain
 * after the signal drops below the threshold. Setting release to a
 * tempo-synced value ensures the compressor "breathes" with the music.
 *
 * RULES OF THUMB:
 *   - Release < 50ms → "Low" warning: may cause distortion/pumping
 *   - Release 50-150ms → Good for fast percussion
 *   - Release 150-400ms → Good for general mix bus
 *   - Release 400-800ms → Good for program compression
 *   - Release > 800ms → "High" warning: may be too slow to recover
 *
 * @param bpm — Beats per minute
 * @returns Array of objects, one per division, each with:
 *   - division: Note division label (e.g., "1/4")
 *   - ms: Release time in milliseconds
 *   - warning: null if reasonable, 'low' if too fast, 'high' if too slow
 *
 * @example
 *   getCompressReleaseTimes(120)
 *   // → [
 *   //     { division: "1/4", ms: 500, warning: null },
 *   //     { division: "1/8", ms: 250, warning: null },
 *   //     { division: "1/16", ms: 125, warning: null },
 *   //     { division: "1/32", ms: 62.5, warning: null },
 *   //     { division: "1/64", ms: 31.3, warning: 'low' },
 *   //   ]
 */
export function getCompressReleaseTimes(bpm: number): {
  division: string
  ms: number
  warning: 'low' | 'high' | null
}[] {
  const divisions = [4, 8, 16, 32, 64]
  return divisions.map((div) => {
    const ms = bpmToMs(bpm, div)
    let warning: 'low' | 'high' | null = null
    if (ms < 50) warning = 'low'
    else if (ms > 800) warning = 'high'
    return {
      division: `1/${div}`,
      ms: parseFloat(ms.toFixed(1)),
      warning
    }
  })
}

/**
 * REVERB_PRE_DELAY_RANGES — Pre-delay timing by room type.
 *
 * Pre-delay is the gap between the original sound and the first reflections.
 * Longer pre-delay = perception of a larger space.
 *
 * ROOM TYPES:
 *   room:   0-20ms   — Small room, tight ambience
 *   hall:   10-40ms  — Concert hall, spacious
 *   plate:  0-30ms   — Plate reverb, smooth
 *   chamber: 10-40ms — Chamber reverb, rich
 */
export const REVERB_PRE_DELAY_RANGES = {
  room: { min: 0, max: 20, label: 'Room' },
  hall: { min: 10, max: 40, label: 'Hall/Big' },
  plate: { min: 0, max: 30, label: 'Plate' },
  chamber: { min: 10, max: 40, label: 'Chamber' }
} as const

export type ReverbType = keyof typeof REVERB_PRE_DELAY_RANGES

/**
 * getReverbPreDelay — Calculate reverb pre-delay from tempo & note division.
 *
 * Pre-delay is the time between the dry signal and the onset of reverb.
 * Syncing it to tempo creates a natural, musical reverb that aligns with
 * the beat grid.
 *
 * @param bpm — Beats per minute
 * @param noteDiv — Note division (16 = 1/16 note is a common choice for pre-delay)
 * @returns Pre-delay in milliseconds (rounded to 1 decimal)
 *
 * @example
 *   getReverbPreDelay(120, 16)  // → 125 (1/16 note)
 *   getReverbPreDelay(120, 8)   // → 250 (1/8 note)
 *   getReverbPreDelay(140, 16)  // → 107.1
 */
export function getReverbPreDelay(bpm: number, noteDiv: number): number {
  return parseFloat(bpmToMs(bpm, noteDiv).toFixed(1))
}

/**
 * getReverbRt60 — Get reverb decay time (RT60) recommendations.
 *
 * RT60 is the time it takes for the reverb to decay by 60dB.
 * We calculate three tiers based on the tempo:
 *   - SHORT (bar):   Fast decay, good for percussion, spoken vocals
 *   - MEDIUM (1/4):  Moderate decay, good for general mixing
 *   - LONG (1/2):    Slow decay, good for pads, ambient, cinematic
 *
 * The values are based on a quarter note's duration so they remain
 * musically relevant at any tempo.
 *
 * @param bpm — Beats per minute
 * @returns Object with short, medium, and long RT60 values in ms
 *
 * @example
 *   getReverbRt60(120)   // → { short: 250, medium: 500, long: 1000 }
 *   getReverbRt60(140)   // → { short: 214.3, medium: 428.6, long: 857.1 }
 */
export function getReverbRt60(bpm: number): {
  short: number
  medium: number
  long: number
} {
  const quarterMs = bpmToMs(bpm, 4)
  return {
    short: parseFloat((quarterMs * 0.5).toFixed(1)),
    medium: parseFloat(quarterMs.toFixed(1)),
    long: parseFloat((quarterMs * 2).toFixed(1))
  }
}

/**
 * calculateTapTempo — Calculate BPM from manual tapping intervals.
 *
 * HOW IT WORKS:
 *   1. User taps a button in time with the music
 *   2. Each tap stores the ms timestamp
 *   3. We collect the last 4 intervals (taps - 1 = intervals)
 *   4. Average the intervals → convert to BPM: bpm = 60000 / avgMs
 *
 * WHY AVERAGE OF LAST 4:
 *   Using more intervals smooths out timing inaccuracies from human tapping.
 *   Four intervals (5 taps) is a good balance of accuracy vs. speed.
 *
 * @param intervals — Array of ms timestamps from each tap. Must have at least 2 entries
 *                    to calculate a single interval.
 * @returns Calculated BPM (rounded, clamped 1-999), or 0 if fewer than 2 intervals
 *
 * @example
 *   calculateTapTempo([500, 500, 500, 500])    // → 120 (consistent 500ms intervals)
 *   calculateTapTempo([480, 520, 490, 510])    // → 120 (average ~500ms)
 *   calculateTapTempo([0])                      // → 0 (not enough intervals)
 */
export function calculateTapTempo(intervals: number[]): number {
  // Need at least 2 intervals for a meaningful average
  if (intervals.length < 2) return 0

  // Use the most recent intervals (up to 4) for responsiveness
  // The user may have changed tempo — older intervals become irrelevant
  const recent = intervals.slice(-4)
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length

  // Guard against division by zero
  if (avg <= 0) return 0

  const bpm = Math.round(60000 / avg)
  // Clamp to practical range (1-999 BPM)
  return Math.max(1, Math.min(999, bpm))
}

/**
 * applySpeedMultiplier — Scale BPM by a multiplier.
 *
 * Used for:
 *   - Half-time: multiplier 0.5
 *   - Double-time: multiplier 2
 *   - Gradual tempo changes during remixing
 *
 * @param bpm — Base BPM
 * @param multiplier — Scale factor (e.g., 0.5 = half, 2 = double)
 * @returns New BPM, rounded to nearest integer, clamped 1-999
 *
 * @example
 *   applySpeedMultiplier(120, 2)    // → 240 (double time)
 *   applySpeedMultiplier(120, 0.5)  // → 60 (half time)
 *   applySpeedMultiplier(120, 1.5)  // → 180 (1.5x)
 */
export function applySpeedMultiplier(bpm: number, multiplier: number): number {
  const result = Math.round(bpm * multiplier)
  return Math.max(1, Math.min(999, result))
}
