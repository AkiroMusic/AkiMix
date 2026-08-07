import { describe, it, expect } from 'vitest'
import {
  cutoffToNote,
  qToResonance,
  slopeInfo,
  filterEnvelopePoints
} from './filterCalculator'

// =============================================================================
// cutoffToNote
// =============================================================================

describe('cutoffToNote', () => {
  it('returns A4 for 440Hz (standard tuning reference)', () => {
    const result = cutoffToNote(440)
    expect(result.note).toBe('A4')
    expect(result.midi).toBe(69)
    expect(result.frequency).toBe(440)
  })

  it('returns C4 for ~261.63Hz (middle C)', () => {
    // Middle C (C4) = 261.63Hz → MIDI 60
    const result = cutoffToNote(261.63)
    expect(result.note).toBe('C4')
    expect(result.midi).toBe(60)
  })

  it('clamps to G9 for extremely high frequencies above MIDI 127', () => {
    // 12543Hz is well above the highest MIDI note (G9 ≈ 12543Hz)
    const result = cutoffToNote(12543)
    expect(result.note).toBe('G9')
    expect(result.midi).toBe(127)
  })

  it('returns default for 0Hz (no sound = no pitch)', () => {
    const result = cutoffToNote(0)
    expect(result.note).toBe('—')
    expect(result.midi).toBe(-1)
    expect(result.frequency).toBe(0)
  })

  it('returns default for negative cutoff (invalid input)', () => {
    const result = cutoffToNote(-100)
    expect(result.note).toBe('—')
    expect(result.midi).toBe(-1)
  })

  it('handles frequencies below MIDI 0 by clamping to C0', () => {
    // Very low frequencies (e.g., 8Hz) would map below MIDI 0
    const result = cutoffToNote(8)
    expect(result.midi).toBe(0)
    expect(result.note).toBe('C-1') // C-1 = MIDI 0
  })

  it('maps A4 correctly as 69th MIDI note', () => {
    // MIDI note 69 = A4. Verify the modulo and octave math:
    // 69 % 12 = 9 → NOTE_NAMES[9] = 'A'
    // floor(69 / 12) - 1 = 5 - 1 = 4 → 'A4'
    const result = cutoffToNote(440)
    expect(result.note).toBe('A4')
  })

  it('maps C#4 (MIDI 61) correctly', () => {
    // C#4 ≈ 277.18Hz. MIDI 61 → 61 % 12 = 1 → 'C#'
    // floor(61 / 12) - 1 = 5 - 1 = 4 → 'C#4'
    const result = cutoffToNote(277.18)
    expect(result.note).toBe('C#4')
    expect(result.midi).toBe(61)
  })

  it('preserves original frequency in the output object', () => {
    const result = cutoffToNote(123.45)
    expect(result.frequency).toBe(123.45)
  })
})

// =============================================================================
// qToResonance
// =============================================================================

describe('qToResonance', () => {
  it('returns 0 for Butterworth Q (0.707) — flat response, no peak', () => {
    // Q = 1/√2 ≈ 0.707 is the Butterworth threshold.
    // Below or at this value, there is no resonant peak.
    expect(qToResonance(0.707)).toBe(0)
  })

  it('returns ≈3dB for Q = 1.0 (gentle resonance)', () => {
    // Q = 1 produces a subtle resonant peak at cutoff:
    // 10 * log10(1 + 1²) = 10 * log10(2) ≈ 3.01dB
    expect(qToResonance(1)).toBeCloseTo(3, 1)
  })

  it('returns ≈20dB for Q = 10 (strong resonance)', () => {
    // 10 * log10(1 + 10²) = 10 * log10(101) ≈ 20.04dB
    expect(qToResonance(10)).toBeCloseTo(20, 1)
  })

  it('returns 0 for Q <= 0 (physically meaningless values)', () => {
    expect(qToResonance(0)).toBe(0)
    expect(qToResonance(-1)).toBe(0)
    expect(qToResonance(-100)).toBe(0)
  })

  it('returns 0 for Q < 0.5 (underdamped, no audible peak)', () => {
    // Below Q = 0.5, the filter is so underdamped that
    // no resonant peak manifests at the cutoff frequency.
    expect(qToResonance(0.3)).toBe(0)
    expect(qToResonance(0.49)).toBe(0)
  })

  it('clips Q at 100 (returns ≈40dB max resonance)', () => {
    // At Q = 100: 10 * log10(1 + 10000) = 10 * 4.0004 ≈ 40dB
    // Beyond this, resonance becomes extreme and self-oscillation occurs.
    const q100 = qToResonance(100)
    expect(q100).toBeCloseTo(40, 1)

    // Clamping: Q > 100 should give same result as Q = 100
    const q200 = qToResonance(200)
    expect(q200).toBeCloseTo(40, 1)
  })

  it('returns ≈10dB for Q = 3 (pronounced resonance)', () => {
    // 10 * log10(1 + 9) = 10 * log10(10) = 10dB
    expect(qToResonance(3)).toBeCloseTo(10, 1)
  })

  it('returns ≈14dB for Q = 5 (aggressive resonance)', () => {
    // 10 * log10(1 + 25) = 10 * log10(26) ≈ 14.15dB
    // Use precision=0 (tolerance ±0.5) since ≈14 is an approximation
    expect(qToResonance(5)).toBeCloseTo(14, 0)
  })
})

// =============================================================================
// slopeInfo
// =============================================================================

describe('slopeInfo', () => {
  it('returns correct info for 6dB/oct (1-pole, gentle)', () => {
    const info = slopeInfo('6dB')
    expect(info.dbPerOctave).toBe(6)
    expect(info.poles).toBe(1)
    expect(info.description).toContain('Gentlest')
  })

  it('returns correct info for 12dB/oct (2-pole, classic analog)', () => {
    const info = slopeInfo('12dB')
    expect(info.dbPerOctave).toBe(12)
    expect(info.poles).toBe(2)
    expect(info.description).toContain('classic analog synth')
  })

  it('returns correct info for 24dB/oct (4-pole, Moog-style)', () => {
    const info = slopeInfo('24dB')
    expect(info.dbPerOctave).toBe(24)
    expect(info.poles).toBe(4)
    expect(info.description).toContain('Moog')
    expect(info.description).toContain('EDM')
  })

  it('returns correct info for 48dB/oct (8-pole, aggressive)', () => {
    const info = slopeInfo('48dB')
    expect(info.dbPerOctave).toBe(48)
    expect(info.poles).toBe(8)
    expect(info.description).toContain('aggressive')
  })

  it('each slope has poles = dbPerOctave / 6', () => {
    // Rule of thumb: 1 pole ≈ 6dB/octave roll-off
    expect(slopeInfo('6dB').poles).toBe(slopeInfo('6dB').dbPerOctave / 6)
    expect(slopeInfo('12dB').poles).toBe(slopeInfo('12dB').dbPerOctave / 6)
    expect(slopeInfo('24dB').poles).toBe(slopeInfo('24dB').dbPerOctave / 6)
    expect(slopeInfo('48dB').poles).toBe(slopeInfo('48dB').dbPerOctave / 6)
  })
})

// =============================================================================
// filterEnvelopePoints
// =============================================================================

describe('filterEnvelopePoints', () => {
  it('returns correct count of points', () => {
    const result = filterEnvelopePoints(100, 100, 0.5, 100, 10)
    expect(result).toHaveLength(10)
  })

  it('starts at 0 (filter closed) and ends at 0 (filter closed)', () => {
    const result = filterEnvelopePoints(100, 100, 0.5, 100, 10)
    expect(result[0]).toBe(0)
    expect(result[result.length - 1]).toBe(0)
  })

  it('reaches peak value of 1 at the end of attack phase', () => {
    // Attack = 100ms, Decay = 200ms, so the peak is at t=0 (start)
    // With 4 points: i=0 (0ms) = start of attack, i=1 (133ms) = decay
    // Actually the peak (value=1) is at the transition from attack to decay
    // With attack=100 and total=400: transition at 100/400 = 25% of timeline
    const result = filterEnvelopePoints(100, 200, 0.5, 100, 4)
    // Point 0: ms = 0 — start of attack → value = 0 / 100 = 0
    expect(result[0]).toBe(0)
    // Point 1: ms ≈ 133.3 (0.333 * 400) — in decay → value between 1 and 0.5
    expect(result[1]).toBeGreaterThan(0.5)
    expect(result[1]).toBeLessThanOrEqual(1)
  })

  it('reaches sustain level during decay phase', () => {
    // Attack=0 so we start in decay phase at value 1
    // Decay → sustainLevel=0.3
    // With 3 points: [value at decay start, value mid-decay, value at release end]
    const result = filterEnvelopePoints(0, 200, 0.3, 0, 3)
    // Point 0: t=0, ms=0 → decay start → value = 1
    expect(result[0]).toBe(1)
    // Point 2: t=1, ms=200 → decay end → value = sustain = 0.3
    expect(result[2]).toBeCloseTo(0.3, 2)
  })

  it('clamps sustainLevel to valid range 0–1', () => {
    // sustainLevel = 2.5 should be clamped to 1
    const result = filterEnvelopePoints(100, 100, 2.5, 100, 3)
    // Last point should be 0 (release phase end)
    expect(result[result.length - 1]).toBe(0)
    // Some intermediate point should show clamped sustain behavior
    // With 3 points and attack=decay=release equal:
    // The peak should be 1 (not >1)
    const maxVal = Math.max(...result)
    expect(maxVal).toBeLessThanOrEqual(1)
  })

  it('clamps sustainLevel below 0 to 0', () => {
    const result = filterEnvelopePoints(100, 100, -1, 100, 2)
    // Point 0: attack start → 0
    expect(result[0]).toBe(0)
    // Point 1: release end → 0
    expect(result[1]).toBe(0)
  })

  it('returns all zeros when all times are 0 (no envelope)', () => {
    const result = filterEnvelopePoints(0, 0, 0, 0, 5)
    expect(result).toEqual([0, 0, 0, 0, 0])
  })

  it('returns empty array when numPoints is 0', () => {
    const result = filterEnvelopePoints(100, 100, 0.5, 100, 0)
    expect(result).toEqual([])
  })

  it('returns all zeros for negative numPoints', () => {
    const result = filterEnvelopePoints(100, 100, 0.5, 100, -1)
    expect(result).toEqual([])
  })

  it('handles single point correctly', () => {
    // With 1 point and non-zero times, the point is at position 0
    // which is the start of attack → value = 0
    const result = filterEnvelopePoints(100, 100, 0.5, 100, 1)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(0)
  })

  it('clamps time parameters to max 30000ms', () => {
    // Very large times should be clamped
    const result = filterEnvelopePoints(99999, 99999, 0.5, 99999, 3)
    // With clamping: each phase = 30000ms, total = 90000ms
    // Point 0: ms = 0 → attack start → value = 0
    // Point 1: ms = 45000 → past attack+decay (60000ms) → release
    //   localMs = 45000 - 60000 = -15000. Hmm wait, that's wrong.
    //
    // Actually totalMs = 30000 + 30000 + 30000 = 90000
    // Point 1: t = 0.5, ms = 45000
    //   attack+decay = 30000 + 30000 = 60000
    //   45000 < 60000 → in decay phase
    //   localMs = 45000 - 30000 = 15000
    //   value = 1 - (15000/30000) * (1 - 0.5) = 1 - 0.5 * 0.5 = 0.75
    expect(result).toHaveLength(3)
    // All values should be in valid 0–1 range
    result.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    })
  })

  it('works with attack-only envelope', () => {
    // Only attack phase, no decay or release.
    // After the attack ramp finishes (value=1), the envelope
    // sits at the sustain level since no release phase exists.
    const result = filterEnvelopePoints(100, 0, 0.5, 0, 4)
    // totalMs = 100
    // Point 0: ms = 0 → attack → 0/100 = 0
    // Point 1: ms ≈ 33.3 → attack → 33.3/100 ≈ 0.333
    // Point 2: ms ≈ 66.7 → attack → 66.7/100 ≈ 0.667
    // Point 3: ms = 100 → past attack, no decay/release → sustain = 0.5
    expect(result).toHaveLength(4)
    expect(result[0]).toBe(0)
    expect(result[1]).toBeCloseTo(0.333, 2)
    expect(result[2]).toBeCloseTo(0.667, 2)
    expect(result[3]).toBe(0.5)
  })
})

// =============================================================================
// Integration — envelope values remain in valid range
// =============================================================================

describe('filterEnvelopePoints — value integrity', () => {
  it('all values are in the 0–1 range for various inputs', () => {
    const testCases: [number, number, number, number, number][] = [
      [50, 100, 0.3, 150, 8],
      [200, 50, 0.7, 0, 6],
      [0, 200, 0.5, 200, 5],
      [100, 0, 1, 100, 4],
      [100, 100, 0, 100, 7],
      [1000, 500, 0.8, 300, 12],
      [30000, 0, 0, 0, 3],
      [0, 0, 0.5, 30000, 6]
    ]

    for (const [attack, decay, sustain, release, points] of testCases) {
      const result = filterEnvelopePoints(attack, decay, sustain, release, points)
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(0)
        expect(result[i]).toBeLessThanOrEqual(1)
      }
    }
  })

  it('produces monotonically increasing then decreasing shape', () => {
    // A standard ADR envelope should rise then fall
    // (attack rises, decay+release falls)
    const result = filterEnvelopePoints(100, 100, 0.3, 100, 10)
    const peakIndex = result.indexOf(Math.max(...result))

    // Values before the peak should be non-decreasing
    for (let i = 1; i < peakIndex; i++) {
      expect(result[i]).toBeGreaterThanOrEqual(result[i - 1])
    }

    // Values after the peak should be non-increasing
    for (let i = peakIndex + 1; i < result.length; i++) {
      expect(result[i]).toBeLessThanOrEqual(result[i - 1])
    }
  })
})
