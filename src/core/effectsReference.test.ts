/**
 * Unit tests for the Effects Reference module.
 *
 * Tests cover data integrity, boundary values, and computed formula
 * correctness for all four exported functions.
 */

import { describe, it, expect } from 'vitest'
import {
  reverbBySpace,
  delayBpmSync,
  distortionTypes,
  delayFeedbackStaging
} from './effectsReference'
import type { ReverbSpaceEntry, DelaySyncEntry, DistortionTypeEntry } from './effectsReference'

// =============================================================================
// reverbBySpace — Data integrity & ordering
// =============================================================================

describe('reverbBySpace', () => {
  const spaces = reverbBySpace()

  it('returns 9 space presets', () => {
    expect(spaces).toHaveLength(9)
  })

  it('every entry has all required fields with correct types', () => {
    for (const entry of spaces) {
      expect(typeof entry.space).toBe('string')
      expect(entry.space.length).toBeGreaterThan(0)

      expect(typeof entry.rt60Ms).toBe('number')
      expect(entry.rt60Ms).toBeGreaterThan(0)

      expect(typeof entry.preDelayMs).toBe('number')
      expect(entry.preDelayMs).toBeGreaterThanOrEqual(0)

      expect(typeof entry.density).toBe('string')
      expect(['Low', 'Medium', 'High']).toContain(entry.density)

      expect(typeof entry.description).toBe('string')
      expect(entry.description.length).toBeGreaterThan(0)
    }
  })

  it('physical spaces (entries 0-4) have ascending RT60 values', () => {
    // Physical spaces: Closet/Tight → Small Room → Medium Room → Large Hall → Cathedral
    // Algorithmic reverbs (Plate, Spring, Chamber, Shimmer) are NOT ordered by size
    // — they occupy entries 5-8 and can have any RT60 relative to each other.
    for (let i = 1; i < 5; i++) {
      expect(spaces[i].rt60Ms).toBeGreaterThan(spaces[i - 1].rt60Ms)
    }
  })

  it('pre-delay values increase approximately with space size', () => {
    // Pre-delay generally increases for larger spaces; relaxed check
    // (Plate and Spring have low pre-delay despite medium RT60 —
    //  that's expected — they're algorithmic reverbs, not physical spaces)
    expect(spaces[0].preDelayMs).toBeLessThanOrEqual(spaces[4].preDelayMs)
    expect(spaces[0].preDelayMs).toBe(3) // Closet/Tight
    expect(spaces[4].preDelayMs).toBe(55) // Cathedral
  })

  it('all space names are unique', () => {
    const names = spaces.map((s) => s.space)
    expect(new Set(names).size).toBe(names.length)
  })

  it('returns the correct first and last entries', () => {
    expect(spaces[0].space).toBe('Closet/Tight')
    expect(spaces[0].rt60Ms).toBe(150)

    expect(spaces[spaces.length - 1].space).toBe('Shimmer')
    expect(spaces[spaces.length - 1].rt60Ms).toBe(3500)
  })

  it('density is correctly distributed across space types', () => {
    const low = spaces.filter((s) => s.density === 'Low').map((s) => s.space)
    const med = spaces.filter((s) => s.density === 'Medium').map((s) => s.space)
    const high = spaces.filter((s) => s.density === 'High').map((s) => s.space)

    // Small/tight spaces and algorithmic reverbs = Low density
    expect(low).toContain('Closet/Tight')
    expect(low).toContain('Plate')
    expect(low).toContain('Spring')

    // Mid-sized rooms and chambers = Medium density
    expect(med).toContain('Small Room')
    expect(med).toContain('Medium Room')
    expect(med).toContain('Chamber')
    expect(med).toContain('Shimmer')

    // Large spaces = High density
    expect(high).toContain('Large Hall')
    expect(high).toContain('Cathedral')
  })
})

// =============================================================================
// delayBpmSync — BPM-synced delay time calculation
// =============================================================================

describe('delayBpmSync', () => {
  it('returns 7 entries at valid BPM (120)', () => {
    const delays = delayBpmSync(120)
    expect(delays).toHaveLength(7)
  })

  it('quarter note at 120 BPM is exactly 500ms', () => {
    const delays = delayBpmSync(120)
    const quarter = delays.find((d) => d.label === 'Quarter')
    expect(quarter).toBeDefined()
    expect(quarter!.ms).toBe(500)
    expect(quarter!.noteDiv).toBe('1/1')
  })

  it('computes correct values for all note divisions at 120 BPM', () => {
    const delays = delayBpmSync(120)

    const assertDelay = (label: string, expectedMs: number) => {
      const entry = delays.find((d) => d.label === label)
      expect(entry, `Missing entry for "${label}"`).toBeDefined()
      // Use toBeCloseTo for floating-point safety
      expect(entry!.ms).toBeCloseTo(expectedMs, 1)
    }

    assertDelay('Quarter', 500)
    assertDelay('Dotted 8th', 375)
    assertDelay('8th', 250)
    assertDelay('Dotted 16th', 187.5)
    assertDelay('16th', 125)
    assertDelay('8th triplet', 166.5)
    assertDelay('16th triplet', 83.5)
  })

  it('returns correct values at a different BPM (128)', () => {
    const delays = delayBpmSync(128)

    // Manual calculation: 60000 / 128 * factor
    const assertDelay = (label: string, expectedMs: number) => {
      const entry = delays.find((d) => d.label === label)
      expect(entry, `Missing entry for "${label}"`).toBeDefined()
      expect(entry!.ms).toBeCloseTo(expectedMs, 0)
    }

    assertDelay('Quarter', 468.8) // 60000/128 * 1 = 468.75 ≈ 468.8
    assertDelay('8th', 234.4)     // 60000/128 * 0.5 = 234.375 ≈ 234.4
    assertDelay('16th', 117.2)    // 60000/128 * 0.25 = 117.1875 ≈ 117.2
  })

  it('returns empty array for BPM of 0', () => {
    expect(delayBpmSync(0)).toHaveLength(0)
  })

  it('returns empty array for negative BPM', () => {
    expect(delayBpmSync(-120)).toHaveLength(0)
    expect(delayBpmSync(-1)).toHaveLength(0)
  })

  it('all entries have unique labels', () => {
    const delays = delayBpmSync(120)
    const labels = delays.map((d) => d.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('all entries have unique note divisions', () => {
    const delays = delayBpmSync(120)
    const noteDivs = delays.map((d) => d.noteDiv)
    expect(new Set(noteDivs).size).toBe(noteDivs.length)
  })

  it('every entry has all required fields', () => {
    const delays = delayBpmSync(120)
    for (const entry of delays) {
      expect(typeof entry.label).toBe('string')
      expect(entry.label.length).toBeGreaterThan(0)
      expect(typeof entry.noteDiv).toBe('string')
      expect(entry.noteDiv.length).toBeGreaterThan(0)
      expect(typeof entry.ms).toBe('number')
      expect(entry.ms).toBeGreaterThan(0)
      expect(typeof entry.commonIn).toBe('string')
      expect(entry.commonIn.length).toBeGreaterThan(0)
    }
  })

  it('dotted delays are 1.5x the standard subdivision', () => {
    // Dotted 8th should be 1.5× standard 8th = 0.75/0.5 = 1.5
    // Dotted 16th should be 1.5× standard 16th = 0.375/0.25 = 1.5
    const delays = delayBpmSync(120)
    const eighth = delays.find((d) => d.label === '8th')!
    const dotted8th = delays.find((d) => d.label === 'Dotted 8th')!
    expect(dotted8th.ms).toBeCloseTo(eighth.ms * 1.5, 1)

    const sixteenth = delays.find((d) => d.label === '16th')!
    const dotted16th = delays.find((d) => d.label === 'Dotted 16th')!
    expect(dotted16th.ms).toBeCloseTo(sixteenth.ms * 1.5, 1)
  })
})

// =============================================================================
// distortionTypes — Data integrity
// =============================================================================

describe('distortionTypes', () => {
  const types = distortionTypes()

  it('returns 6 distortion types', () => {
    expect(types).toHaveLength(6)
  })

  it('every entry has all required fields', () => {
    for (const entry of types) {
      expect(typeof entry.type).toBe('string')
      expect(entry.type.length).toBeGreaterThan(0)

      expect(typeof entry.harmonicProfile).toBe('string')
      expect(entry.harmonicProfile.length).toBeGreaterThan(0)

      expect(typeof entry.transferDescription).toBe('string')
      expect(entry.transferDescription.length).toBeGreaterThan(0)

      expect(typeof entry.thdRange).toBe('string')
      // THD range format: "X-Y%" or "X%"
      expect(entry.thdRange).toMatch(/\d+(\.\d+)?%(-\d+(\.\d+)?%)?/)

      expect(typeof entry.commonUse).toBe('string')
      expect(entry.commonUse.length).toBeGreaterThan(0)
    }
  })

  it('all types have unique names', () => {
    const names = types.map((t) => t.type)
    expect(new Set(names).size).toBe(names.length)
  })

  it('each type has a distinct harmonic profile', () => {
    const profiles = types.map((t) => t.harmonicProfile)
    expect(new Set(profiles).size).toBe(profiles.length)
  })

  it('Soft Clip has the lowest THD range (mastering grade)', () => {
    const softClip = types.find((t) => t.type === 'Soft Clip')
    expect(softClip).toBeDefined()
    expect(softClip!.thdRange).toBe('0.1-5%')
    expect(softClip!.commonUse).toMatch(/mastering/i)
  })

  it('Wavefolder has the widest THD range (modular synthesis)', () => {
    const wavefolder = types.find((t) => t.type === 'Wavefolder')
    expect(wavefolder).toBeDefined()
    expect(wavefolder!.thdRange).toBe('10-100%')
    expect(wavefolder!.commonUse).toMatch(/modular|edm/i)
  })

  it('Tube and Tape provide warmth-oriented distortion', () => {
    const tube = types.find((t) => t.type === 'Tube (Triode)')
    const tape = types.find((t) => t.type === 'Tape Saturation')
    expect(tube).toBeDefined()
    expect(tape).toBeDefined()
    expect(tube!.commonUse).toMatch(/warmth/i)
    expect(tape!.commonUse).toMatch(/warmth/i)
  })
})

// =============================================================================
// delayFeedbackStaging — Feedback decay calculation
// =============================================================================

describe('delayFeedbackStaging', () => {
  it('returns 1 repeat with "No repeats" for 0% feedback', () => {
    const result = delayFeedbackStaging(0)
    expect(result.repeatsMinus60dB).toBe(1)
    expect(result.character).toBe('No repeats')
  })

  it('returns 1 repeat with "No repeats" for negative feedback', () => {
    const result = delayFeedbackStaging(-50)
    expect(result.repeatsMinus60dB).toBe(1)
    expect(result.character).toBe('No repeats')
  })

  it('returns 999 repeats with "Self-oscillation!" for 100% feedback', () => {
    const result = delayFeedbackStaging(100)
    expect(result.repeatsMinus60dB).toBe(999)
    expect(result.character).toBe('Self-oscillation!')
  })

  it('returns 999 repeats with "Self-oscillation!" for feedback above 100%', () => {
    const result = delayFeedbackStaging(150)
    expect(result.repeatsMinus60dB).toBe(999)
    expect(result.character).toBe('Self-oscillation!')
  })

  it('computes approximately 10 repeats at 50% feedback', () => {
    const result = delayFeedbackStaging(50)
    // n = log(0.001) / log(0.5) ≈ 9.966 → rounds to 10
    expect(result.repeatsMinus60dB).toBe(10)
  })

  it('computes approximately 66 repeats at 90% feedback', () => {
    const result = delayFeedbackStaging(90)
    // n = log(0.001) / log(0.9) ≈ 65.563 → rounds to 66
    expect(result.repeatsMinus60dB).toBe(66)
  })

  it('caps repeats at 200 for feedback approaching 100%', () => {
    const result = delayFeedbackStaging(99)
    // n = log(0.001) / log(0.99) ≈ 687.3 → capped to 200
    expect(result.repeatsMinus60dB).toBe(200)
    expect(result.character).toBe('Near-infinite')
  })

  it('capped repeats for 99.9% feedback', () => {
    const result = delayFeedbackStaging(99.9)
    expect(result.repeatsMinus60dB).toBe(200)
    expect(result.character).toBe('Near-infinite')
  })

  it('character is "Subtle slap" for repeats in 1-2 range', () => {
    // 5% feedback → n ≈ 2.306 → rounds to 2 → 'Subtle slap'
    const result = delayFeedbackStaging(5)
    expect(result.repeatsMinus60dB).toBeGreaterThanOrEqual(1)
    expect(result.repeatsMinus60dB).toBeLessThanOrEqual(2)
    expect(result.character).toBe('Subtle slap')
  })

  it('character is "Clean decay" for repeats in 3-5 range', () => {
    // 20% feedback → n ≈ 4.292 → rounds to 4 → 'Clean decay'
    const result = delayFeedbackStaging(20)
    expect(result.repeatsMinus60dB).toBeGreaterThanOrEqual(3)
    expect(result.repeatsMinus60dB).toBeLessThanOrEqual(5)
    expect(result.character).toBe('Clean decay')
  })

  it('character is "Classic echo" for repeats in 6-10 range', () => {
    // 40% feedback → n ≈ 7.540 → rounds to 8 → 'Classic echo'
    const result = delayFeedbackStaging(40)
    expect(result.repeatsMinus60dB).toBeGreaterThanOrEqual(6)
    expect(result.repeatsMinus60dB).toBeLessThanOrEqual(10)
    expect(result.character).toBe('Classic echo')
  })

  it('character is "Long tail" for repeats in 11-20 range', () => {
    // 70% feedback → n ≈ 19.368 → rounds to 19 → 'Long tail'
    const result = delayFeedbackStaging(70)
    expect(result.repeatsMinus60dB).toBeGreaterThanOrEqual(11)
    expect(result.repeatsMinus60dB).toBeLessThanOrEqual(20)
    expect(result.character).toBe('Long tail')
  })

  it('character is "Very long" for repeats in 21-50 range', () => {
    // 80% feedback → n ≈ 30.958 → rounds to 31 → 'Very long'
    const result = delayFeedbackStaging(80)
    expect(result.repeatsMinus60dB).toBeGreaterThanOrEqual(21)
    expect(result.repeatsMinus60dB).toBeLessThanOrEqual(50)
    expect(result.character).toBe('Very long')
  })

  it('character is "Near-infinite" for repeats in 51-200 range', () => {
    const result = delayFeedbackStaging(90)
    expect(result.repeatsMinus60dB).toBeGreaterThanOrEqual(51)
    expect(result.repeatsMinus60dB).toBeLessThanOrEqual(200)
    expect(result.character).toBe('Near-infinite')
  })

  it('repeats count increases as feedback percentage increases', () => {
    const results = [10, 20, 30, 40, 50, 60, 70, 80, 90].map((pct) =>
      delayFeedbackStaging(pct).repeatsMinus60dB
    )

    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toBeGreaterThan(results[i - 1])
    }
  })

  it('result fields have correct types', () => {
    const result = delayFeedbackStaging(50)
    expect(typeof result.repeatsMinus60dB).toBe('number')
    expect(typeof result.character).toBe('string')
    expect(result.character.length).toBeGreaterThan(0)
  })
})
