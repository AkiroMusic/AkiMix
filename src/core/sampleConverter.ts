/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Sample Rate Converter — Milliseconds to Samples
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 *   Converts between milliseconds and sample counts at various sample rates.
 *   Essential for working with audio buffers, delay lines, and timing in
 *   digital audio workstations (DAWs).
 *
 * WHY SAMPLE RATES MATTER:
 *   - Sample rate = number of audio samples per second (e.g., 44100 Hz = 44100/sec)
 *   - Higher sample rates = more detail but larger file sizes
 *   - Common rates: 44100 (CD quality), 48000 (video/DVD), 96000 (Hi-Res), 192000
 *
 * CORE FORMULA:
 *   samples = ms * sampleRate / 1000
 *   ms = samples * 1000 / sampleRate
 *
 * PRACTICAL USE:
 *   - Delay line buffer sizes: how many samples to delay at a given ms
 *   - FFT window sizes: aligning analysis windows with time-based events
 *   - Sample-accurate timing: converting between time and sample positions
 *
 * @example
 *   import { msToSamples, samplesToMs, getAllSampleCounts } from './sampleConverter'
 *   msToSamples(100, 44100)       // → 4410 (100ms at 44.1kHz)
 *   msToSamples(100, 48000)       // → 4800 (100ms at 48kHz)
 *   getAllSampleCounts(100)       // → { 44100: 4410, 48000: 4800, 96000: 9600, 192000: 19200 }
 */

/**
 * SAMPLE_RATES — Standard audio sample rates supported by the app.
 *
 * 44100:  CD quality (standard for music)
 * 48000:  Video/DVD quality (standard for film/TV)
 * 96000:  Hi-Res audio (high-resolution, double 48kHz)
 * 192000: Ultra-high resolution (quadruple 48kHz)
 *
 * These are the most common sample rates in professional audio.
 * The 'as const' assertion makes TypeScript treat this as a readonly
 * tuple (not just number[]), enabling the SampleRate type below.
 */
export const SAMPLE_RATES = [44100, 48000, 96000, 192000] as const

/**
 * SampleRate — Type alias for valid sample rates.
 * Equivalent to: 44100 | 48000 | 96000 | 192000
 *
 * TypeScript infers this from the SAMPLE_RATES tuple using
 * (typeof SAMPLE_RATES)[number]. This means if we add a new rate
 * to SAMPLE_RATES, the type updates automatically.
 */
export type SampleRate = (typeof SAMPLE_RATES)[number]

/**
 * msToSamples — Convert milliseconds to sample count.
 *
 * FORMULA:
 *   samples = ms × sampleRate / 1000
 *
 * WHY THIS MATTERS:
 *   Audio buffers are measured in samples, not milliseconds. When you need
 *   to create a delay line of 100ms at 44.1kHz, you need a buffer of 4410
 *   samples. This conversion is essential for:
 *     - Buffer allocation (how many samples to allocate)
 *     - Delay line length calculations
 *     - FFT window sizing based on time
 *
 * @param ms — Time in milliseconds (> 0)
 * @param sampleRate — Sample rate (must be one of the standard rates)
 * @returns Number of samples (rounded to nearest integer because you can't
 *          have a fractional sample in a digital buffer)
 *
 * @example
 *   msToSamples(100, 44100)   // → 4410
 *   msToSamples(1000, 48000)  // → 48000 (1 second at 48kHz)
 *   msToSamples(1, 192000)    // → 192
 */
export function msToSamples(ms: number, sampleRate: SampleRate): number {
  return Math.round(ms * sampleRate / 1000)
}

/**
 * samplesToMs — Convert sample count to milliseconds.
 *
 * The inverse of msToSamples(). Given a buffer of N samples at a known
 * sample rate, calculate the duration in milliseconds.
 *
 * FORMULA:
 *   ms = samples × 1000 / sampleRate
 *
 * @param samples — Number of samples (> 0)
 * @param sampleRate — Sample rate (must be one of the standard rates)
 * @returns Time in milliseconds (rounded to 2 decimal places)
 *
 * @example
 *   samplesToMs(4410, 44100)   // → 100
 *   samplesToMs(48000, 48000)  // → 1000 (1 second)
 *   samplesToMs(192, 192000)   // → 1
 */
export function samplesToMs(samples: number, sampleRate: SampleRate): number {
  return parseFloat((samples * 1000 / sampleRate).toFixed(2))
}

/**
 * getAllSampleCounts — Get sample counts at ALL standard sample rates.
 *
 * Given a single time value, calculate the sample count for each of the
 * four standard sample rates. This is useful when you want to see how
 * a delay time changes across different sample rates.
 *
 * @param ms — Time in milliseconds
 * @returns Object with sample rates as keys, sample counts as values
 *
 * @example
 *   getAllSampleCounts(100)
 *   // → { 44100: 4410, 48000: 4800, 96000: 9600, 192000: 19200 }
 *
 *   getAllSampleCounts(1)
 *   // → { 44100: 44, 48000: 48, 96000: 96, 192000: 192 }
 */
export function getAllSampleCounts(ms: number): Record<number, number> {
  const result: Record<number, number> = {}
  for (const rate of SAMPLE_RATES) {
    result[rate] = msToSamples(ms, rate)
  }
  return result
}

/**
 * formatSampleCount — Format a sample count with locale digit grouping.
 *
 * Large sample counts are hard to read without separators:
 *   44100 → "44,100" (much more readable)
 *   192000 → "192,000"
 *
 * Uses the en-US locale which uses commas as thousand separators.
 * This is purely a display/UI helper — the raw number is unchanged.
 *
 * @param count — Raw sample count (e.g., 44100)
 * @returns Formatted string (e.g., "44,100")
 *
 * @example
 *   formatSampleCount(44100)    // → "44,100"
 *   formatSampleCount(192000)   // → "192,000"
 *   formatSampleCount(1000)     // → "1,000"
 */
export function formatSampleCount(count: number): string {
  return count.toLocaleString('en-US')
}
