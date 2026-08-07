import { describe, it, expect } from 'vitest'
import {
  msToSamples,
  samplesToMs,
  getAllSampleCounts,
  formatSampleCount,
  SAMPLE_RATES
} from './sampleConverter'

describe('msToSamples', () => {
  it('converts 1000ms at 44100Hz to 44100 samples', () => {
    expect(msToSamples(1000, 44100)).toBe(44100)
  })

  it('converts 500ms at 48000Hz to 24000 samples', () => {
    expect(msToSamples(500, 48000)).toBe(24000)
  })
})

describe('samplesToMs', () => {
  it('converts back 44100 samples at 44100Hz to 1000ms', () => {
    expect(samplesToMs(44100, 44100)).toBe(1000)
  })
})

describe('getAllSampleCounts', () => {
  it('returns counts for all standard sample rates', () => {
    const counts = getAllSampleCounts(1000)
    expect(Object.keys(counts)).toHaveLength(4)
    expect(counts[44100]).toBe(44100)
    expect(counts[48000]).toBe(48000)
    expect(counts[96000]).toBe(96000)
    expect(counts[192000]).toBe(192000)
  })
})

describe('formatSampleCount', () => {
  it('formats with commas', () => {
    expect(formatSampleCount(44100)).toBe('44,100')
  })
})

describe('SAMPLE_RATES', () => {
  it('contains the 4 standard rates', () => {
    expect(SAMPLE_RATES).toEqual([44100, 48000, 96000, 192000])
  })
})
