import { describe, it, expect } from 'vitest'
import {
  midiToFrequency,
  midiToNoteName,
  generateFrequencyChart,
  semitonesToSpeed,
  speedToSemitones,
  centsToSpeed,
  frequencyToNote
} from './frequencyChart'

describe('midiToFrequency', () => {
  it('returns 440 for A4 (MIDI 69)', () => {
    expect(midiToFrequency(69)).toBe(440)
  })

  it('returns ~261.63 for C4 (MIDI 60)', () => {
    expect(midiToFrequency(60)).toBeCloseTo(261.63, 0)
  })
})

describe('midiToNoteName', () => {
  it('returns C4 for MIDI 60', () => {
    expect(midiToNoteName(60)).toBe('C4')
  })

  it('returns A4 for MIDI 69', () => {
    expect(midiToNoteName(69)).toBe('A4')
  })

  it('returns C0 for MIDI 12', () => {
    expect(midiToNoteName(12)).toBe('C0')
  })
})

describe('generateFrequencyChart', () => {
  it('generates 96 notes from C0 to B8', () => {
    const chart = generateFrequencyChart()
    expect(chart.length).toBe(108)
    expect(chart[0].note).toBe('C0')
    expect(chart[chart.length - 1].note).toBe('B8')
  })
})

describe('semitonesToSpeed', () => {
  it('returns 2x for +12 semitones', () => {
    expect(semitonesToSpeed(12)).toBe(2)
  })

  it('returns 0.5x for -12 semitones', () => {
    expect(semitonesToSpeed(-12)).toBe(0.5)
  })
})

describe('speedToSemitones', () => {
  it('returns 12 for 2x speed', () => {
    expect(speedToSemitones(2)).toBe(12)
  })
})

describe('centsToSpeed', () => {
  it('returns same as semitonesToSpeed for 100 cents', () => {
    expect(centsToSpeed(100)).toBe(semitonesToSpeed(1))
  })
})

describe('frequencyToNote', () => {
  it('finds A4 for 440Hz', () => {
    const note = frequencyToNote(440)
    expect(note?.note).toBe('A4')
    expect(note?.frequency).toBe(440)
  })

  it('returns null for negative frequency', () => {
    expect(frequencyToNote(-1)).toBeNull()
  })
})
