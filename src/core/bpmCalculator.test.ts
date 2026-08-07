import { describe, it, expect } from 'vitest'
import {
  bpmToMs,
  getNormalDelays,
  getDottedDelays,
  getTripletDelays,
  getCompressReleaseTimes,
  getReverbPreDelay,
  getReverbRt60,
  calculateTapTempo,
  applySpeedMultiplier
} from './bpmCalculator'

describe('bpmToMs', () => {
  it('returns 500ms for BPM 120, 1/4 note', () => {
    expect(bpmToMs(120, 4)).toBe(500)
  })

  it('returns 250ms for BPM 120, 1/8 note', () => {
    expect(bpmToMs(120, 8)).toBe(250)
  })

  it('returns 1000ms for BPM 60, 1/4 note', () => {
    expect(bpmToMs(60, 4)).toBe(1000)
  })
})

describe('getNormalDelays', () => {
  it('returns correct values for BPM 120', () => {
    const delays = getNormalDelays(120)
    expect(delays['1/4']).toBe(500)
    expect(delays['1/8']).toBe(250)
    expect(delays['1/16']).toBe(125)
  })
})

describe('getDottedDelays', () => {
  it('returns 1.5x normal delays', () => {
    const dotted = getDottedDelays(120)
    expect(dotted['1/4']).toBe(750)
    expect(dotted['1/8']).toBe(375)
  })
})

describe('getTripletDelays', () => {
  it('returns 2/3 of normal delays', () => {
    const triplet = getTripletDelays(120)
    expect(triplet['1/4']).toBeCloseTo(333.3, 0)
    expect(triplet['1/8']).toBeCloseTo(166.7, 0)
  })
})

describe('getCompressReleaseTimes', () => {
  it('returns correct release times for BPM 120', () => {
    const times = getCompressReleaseTimes(120)
    expect(times[0].division).toBe('1/4')
    expect(times[0].ms).toBe(500)
    expect(times[0].warning).toBeNull()
  })

  it('warns low for very fast BPM on small divisions', () => {
    const times = getCompressReleaseTimes(240)
    const div64 = times.find((t) => t.division === '1/64')
    expect(div64?.warning).toBe('low')
  })

  it('warns high for very slow BPM', () => {
    const times = getCompressReleaseTimes(30)
    const div4 = times.find((t) => t.division === '1/4')
    expect(div4?.warning).toBe('high')
  })
})

describe('getReverbPreDelay', () => {
  it('returns 125ms for BPM 120 at 1/16 note', () => {
    expect(getReverbPreDelay(120, 16)).toBe(125)
  })
})

describe('getReverbRt60', () => {
  it('returns decay times tied to BPM 120', () => {
    const rt60 = getReverbRt60(120)
    expect(rt60.short).toBe(250)
    expect(rt60.medium).toBe(500)
    expect(rt60.long).toBe(1000)
  })
})

describe('calculateTapTempo', () => {
  it('returns 0 with insufficient intervals', () => {
    expect(calculateTapTempo([])).toBe(0)
    expect(calculateTapTempo([500])).toBe(0)
  })

  it('calculates BPM from intervals', () => {
    // 500ms intervals = 120 BPM
    expect(calculateTapTempo([500, 500, 500])).toBe(120)
  })
})

describe('applySpeedMultiplier', () => {
  it('doubles BPM at 2x', () => {
    expect(applySpeedMultiplier(120, 2)).toBe(240)
  })

  it('halves BPM at 0.5x', () => {
    expect(applySpeedMultiplier(120, 0.5)).toBe(60)
  })

  it('clamps to 1-999 range', () => {
    expect(applySpeedMultiplier(1, 0.1)).toBe(1)
    expect(applySpeedMultiplier(999, 2)).toBe(999)
  })
})
