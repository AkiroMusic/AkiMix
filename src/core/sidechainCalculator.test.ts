import { describe, it, expect } from 'vitest'
import {
  pumpTiming,
  releaseCurve,
  multibandCrossovers,
  kickLengthMs
} from './sidechainCalculator'

// =============================================================================
// pumpTiming — Pump envelope timing from BPM + note division factor
// =============================================================================

describe('pumpTiming', () => {
  it('calculates quarter-note pump at 120 BPM', () => {
    // 60000 / 120 * 1 = 500ms total
    // attack = 500 * 0.1 = 50
    // hold = 500 * 0.2 = 100
    // release = 500 * 0.7 = 350
    const result = pumpTiming(120, 1)
    expect(result.totalMs).toBe(500)
    expect(result.attackMs).toBe(50)
    expect(result.holdMs).toBe(100)
    expect(result.releaseMs).toBe(350)
  })

  it('sum of attack + hold + release equals totalMs', () => {
    // The three segments should always add up to the full cycle
    const result = pumpTiming(128, 0.5)
    const sum = result.attackMs + result.holdMs + result.releaseMs
    expect(sum).toBeCloseTo(result.totalMs, 1)
  })

  it('returns correct proportions (10/20/70%)', () => {
    const result = pumpTiming(140, 1)
    // Each segment should be the correct percentage of total
    expect(result.attackMs).toBeCloseTo(result.totalMs * 0.1, 1)
    expect(result.holdMs).toBeCloseTo(result.totalMs * 0.2, 1)
    expect(result.releaseMs).toBeCloseTo(result.totalMs * 0.7, 1)
  })

  it('returns zeros when BPM is 0', () => {
    const result = pumpTiming(0, 1)
    expect(result.totalMs).toBe(0)
    expect(result.attackMs).toBe(0)
    expect(result.holdMs).toBe(0)
    expect(result.releaseMs).toBe(0)
  })

  it('returns zeros when BPM is negative', () => {
    const result = pumpTiming(-10, 1)
    expect(result).toEqual({ totalMs: 0, attackMs: 0, holdMs: 0, releaseMs: 0 })
  })

  it('clamps BPM to minimum of 20', () => {
    // BPM below 20 should be treated as 20
    const result = pumpTiming(5, 1)
    expect(result.totalMs).toBeGreaterThan(0)
    // At BPM=20, totalMs = 60000/20 * 1 = 3000
    expect(result.totalMs).toBe(3000)
  })

  it('clamps BPM to maximum of 300', () => {
    // BPM above 300 should be treated as 300
    const result = pumpTiming(400, 1)
    // At BPM=300, totalMs = 60000/300 * 1 = 200
    expect(result.totalMs).toBe(200)
  })

  it('clamps noteDivFactor to minimum of 0.0625', () => {
    // Very small note factor = 64th note
    const result = pumpTiming(120, 0.01)
    // At factor=0.0625, totalMs = 60000/120 * 0.0625 = 31.25 → 31.3
    expect(result.totalMs).toBeGreaterThan(0)
    expect(result.totalMs).toBe(31.3)
  })

  it('clamps noteDivFactor to maximum of 4', () => {
    // Large note factor = whole note (4 quarters)
    const result = pumpTiming(120, 8)
    // At factor=4, totalMs = 60000/120 * 4 = 2000
    expect(result.totalMs).toBe(2000)
  })

  it('rounds all values to 1 decimal place', () => {
    // 128 BPM / 8th note creates fractional values needing rounding
    // total = 60000/128 * 0.5 = 234.375 → 234.4
    const result = pumpTiming(128, 0.5)
    expect(result.totalMs).toBe(234.4)
    expect(result.attackMs).toBe(23.4)
    expect(result.holdMs).toBe(46.9)
    expect(result.releaseMs).toBe(164.1)
  })

  it('handles eighth-note pump at 128 BPM', () => {
    const result = pumpTiming(128, 0.5)
    // 60000 / 128 * 0.5 = 234.375
    expect(result.totalMs).toBeCloseTo(234.4, 1)
  })
})

// =============================================================================
// releaseCurve — Gain recovery curve generation
// =============================================================================

describe('releaseCurve', () => {
  it('linear curve produces equal steps from 0 to 1', () => {
    const curve = releaseCurve(350, 'linear', 5)
    // With 5 points: [0, 0.25, 0.5, 0.75, 1]
    expect(curve).toHaveLength(5)
    expect(curve[0]).toBe(0)
    expect(curve[1]).toBe(0.25)
    expect(curve[2]).toBe(0.5)
    expect(curve[3]).toBe(0.75)
    expect(curve[4]).toBe(1)
  })

  it('linear curve starts at 0 and ends at 1', () => {
    const curve = releaseCurve(200, 'linear', 10)
    expect(curve[0]).toBe(0)
    expect(curve[curve.length - 1]).toBe(1)
  })

  it('logarithmic curve starts fast (early values higher than linear)', () => {
    const linear = releaseCurve(350, 'linear', 10)
    const log = releaseCurve(350, 'logarithmic', 10)
    // At t≈0.11 (index 1 of 9): log should be > linear
    // linear[1] = 1/9 ≈ 0.111
    // log[1] = log10(1 + 9/9) = log10(2) ≈ 0.301
    expect(log[1]).toBeGreaterThan(linear[1])
  })

  it('logarithmic curve starts at 0 and ends at 1', () => {
    const curve = releaseCurve(350, 'logarithmic', 5)
    expect(curve[0]).toBe(0)
    expect(curve[curve.length - 1]).toBe(1)
  })

  it('exponential curve starts slow (early values lower than linear)', () => {
    const linear = releaseCurve(350, 'linear', 10)
    const exp = releaseCurve(350, 'exponential', 10)
    // At t≈0.11 (index 1 of 9): exp should be < linear
    // linear[1] = 1/9 ≈ 0.111
    // exp[1] = (1/9)² ≈ 0.012
    expect(exp[1]).toBeLessThan(linear[1])
  })

  it('exponential curve starts at 0 and ends at 1', () => {
    const curve = releaseCurve(350, 'exponential', 5)
    expect(curve[0]).toBe(0)
    expect(curve[curve.length - 1]).toBe(1)
  })

  it('returns [] when points is less than 2', () => {
    expect(releaseCurve(100, 'linear', 0)).toEqual([])
    expect(releaseCurve(100, 'linear', 1)).toEqual([])
  })

  it('clamps points to maximum of 100', () => {
    const curve = releaseCurve(500, 'linear', 200)
    expect(curve).toHaveLength(100)
  })

  it('linear curve with 2 points returns [0, 1]', () => {
    const curve = releaseCurve(100, 'linear', 2)
    expect(curve).toEqual([0, 1])
  })

  it('logarithmic curve with 2 points returns [0, 1]', () => {
    const curve = releaseCurve(100, 'logarithmic', 2)
    expect(curve).toEqual([0, 1])
  })

  it('exponential curve with 2 points returns [0, 1]', () => {
    const curve = releaseCurve(100, 'exponential', 2)
    expect(curve).toEqual([0, 1])
  })
})

// =============================================================================
// multibandCrossovers — Standard crossover frequencies
// =============================================================================

describe('multibandCrossovers', () => {
  it('returns [] for 1 band (full range, no crossover)', () => {
    expect(multibandCrossovers(1)).toEqual([])
  })

  it('returns correct crossover for 2 bands', () => {
    const result = multibandCrossovers(2)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ band: 1, crossoverHz: 100 })
  })

  it('returns correct crossovers for 3 bands', () => {
    const result = multibandCrossovers(3)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ band: 1, crossoverHz: 100 })
    expect(result[1]).toEqual({ band: 2, crossoverHz: 300 })
  })

  it('returns correct crossovers for 4 bands', () => {
    const result = multibandCrossovers(4)
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ band: 1, crossoverHz: 80 })
    expect(result[1]).toEqual({ band: 2, crossoverHz: 250 })
    expect(result[2]).toEqual({ band: 3, crossoverHz: 800 })
  })

  it('returns [] for bands < 1', () => {
    expect(multibandCrossovers(0)).toEqual([])
    expect(multibandCrossovers(-1)).toEqual([])
  })

  it('returns [] for bands > 4', () => {
    expect(multibandCrossovers(5)).toEqual([])
    expect(multibandCrossovers(8)).toEqual([])
  })

  it('band indices are 1-based', () => {
    const result = multibandCrossovers(3)
    // First crossover is between band 1 and band 2 → band index 1
    expect(result[0].band).toBe(1)
    expect(result[1].band).toBe(2)
  })
})

// =============================================================================
// kickLengthMs — Kick tail length from BPM + note value
// =============================================================================

describe('kickLengthMs', () => {
  it('returns 500ms for quarter note at 120 BPM', () => {
    expect(kickLengthMs(120, 'quarter')).toBe(500)
  })

  it('returns 250ms for 8th note at 120 BPM', () => {
    expect(kickLengthMs(120, '8th')).toBe(250)
  })

  it('returns 125ms for 16th note at 120 BPM', () => {
    expect(kickLengthMs(120, '16th')).toBe(125)
  })

  it('returns ~166.7ms for 8th triplet at 120 BPM', () => {
    // 60000 / 120 * (1/3) = 166.666... → 166.7
    const result = kickLengthMs(120, '8th triplet')
    expect(result).toBeCloseTo(166.7, 1)
  })

  it('returns 0 when BPM is 0', () => {
    expect(kickLengthMs(0, 'quarter')).toBe(0)
  })

  it('returns 0 when BPM is negative', () => {
    expect(kickLengthMs(-20, 'quarter')).toBe(0)
  })

  it('defaults to quarter note factor for unknown note values', () => {
    // Unknown note should fall back to quarter = factor 1
    expect(kickLengthMs(120, 'whole')).toBe(500)
    expect(kickLengthMs(120, '1/4')).toBe(500)
    expect(kickLengthMs(120, 'dotted-quarter')).toBe(500)
  })
})
