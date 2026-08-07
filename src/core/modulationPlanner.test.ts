import { describe, it, expect } from 'vitest'
import {
  lfoRateSync,
  adsrValidate,
  modulationMatrix,
  lfoWaveforms
} from './modulationPlanner'

// ---------------------------------------------------------------------------
// lfoRateSync
// ---------------------------------------------------------------------------

describe('lfoRateSync', () => {
  it('returns 12 entries at 120 BPM', () => {
    const table = lfoRateSync(120)
    expect(table).toHaveLength(12)
  })

  it('returns quarter note = 500ms and hz = 2 at 120 BPM', () => {
    const table = lfoRateSync(120)
    const quarter = table.find((e) => e.label === '1/4 (quarter)')
    expect(quarter).toBeDefined()
    expect(quarter!.ms).toBe(500)
    expect(quarter!.hz).toBe(2)
  })

  it('returns empty array when BPM is 0', () => {
    expect(lfoRateSync(0)).toEqual([])
  })

  it('returns empty array when BPM is negative', () => {
    expect(lfoRateSync(-10)).toEqual([])
  })

  it('produces proportionally shorter ms values at higher BPM', () => {
    const slow = lfoRateSync(120)
    const fast = lfoRateSync(128)

    const slowQuarter = slow.find((e) => e.label === '1/4 (quarter)')
    const fastQuarter = fast.find((e) => e.label === '1/4 (quarter)')

    expect(slowQuarter).toBeDefined()
    expect(fastQuarter).toBeDefined()

    // 128 BPM is faster than 120, so ms should be shorter
    expect(fastQuarter!.ms).toBeLessThan(slowQuarter!.ms)
    // Quarter at 128 BPM = 60000/128*1 = 468.75 → 468.8
    expect(fastQuarter!.ms).toBe(468.8)
    // Hz correspondingly higher
    expect(fastQuarter!.hz).toBe(2.133)
  })

  it('calculates correct triplet values at 120 BPM', () => {
    const table = lfoRateSync(120)
    // 1/8t: factor=0.333 → ms = 500 * 0.333 = 166.5
    const triplet = table.find((e) => e.label === '1/8t (triplet)')
    expect(triplet).toBeDefined()
    expect(triplet!.ms).toBe(166.5)
    expect(triplet!.hz).toBeCloseTo(6.006, 1)
  })

  it('calculates correct dotted values at 120 BPM', () => {
    const table = lfoRateSync(120)
    // 1/4d: factor=1.5 → ms = 500 * 1.5 = 750
    const dotted = table.find((e) => e.label === '1/4d (dotted)')
    expect(dotted).toBeDefined()
    expect(dotted!.ms).toBe(750)
    expect(dotted!.hz).toBeCloseTo(1.333, 1)
  })

  it('each entry has all four required fields', () => {
    const table = lfoRateSync(90)
    for (const entry of table) {
      expect(entry).toHaveProperty('label')
      expect(entry).toHaveProperty('division')
      expect(entry).toHaveProperty('ms')
      expect(entry).toHaveProperty('hz')
      expect(typeof entry.label).toBe('string')
      expect(typeof entry.division).toBe('number')
      expect(typeof entry.ms).toBe('number')
      expect(typeof entry.hz).toBe('number')
    }
  })
})

// ---------------------------------------------------------------------------
// adsrValidate
// ---------------------------------------------------------------------------

describe('adsrValidate', () => {
  it('returns default values when called with empty object', () => {
    const result = adsrValidate({})
    expect(result).toEqual({
      attackMs: 10,
      decayMs: 100,
      sustainPercent: 50,
      releaseMs: 200
    })
  })

  it('clamps attackMs to 0-30000 range', () => {
    const tooLow = adsrValidate({ attackMs: -5 })
    expect(tooLow.attackMs).toBe(0)

    const tooHigh = adsrValidate({ attackMs: 50000 })
    expect(tooHigh.attackMs).toBe(30000)
  })

  it('clamps decayMs to 0-30000 range', () => {
    const tooLow = adsrValidate({ decayMs: -100 })
    expect(tooLow.decayMs).toBe(0)

    const tooHigh = adsrValidate({ decayMs: 99999 })
    expect(tooHigh.decayMs).toBe(30000)
  })

  it('clamps sustainPercent to 0-100 range', () => {
    const tooLow = adsrValidate({ sustainPercent: -20 })
    expect(tooLow.sustainPercent).toBe(0)

    const tooHigh = adsrValidate({ sustainPercent: 200 })
    expect(tooHigh.sustainPercent).toBe(100)
  })

  it('clamps releaseMs to 0-60000 range', () => {
    const tooLow = adsrValidate({ releaseMs: -1 })
    expect(tooLow.releaseMs).toBe(0)

    const tooHigh = adsrValidate({ releaseMs: 100000 })
    expect(tooHigh.releaseMs).toBe(60000)
  })

  it('passes valid values through unchanged', () => {
    const result = adsrValidate({
      attackMs: 50,
      decayMs: 250,
      sustainPercent: 75,
      releaseMs: 500
    })
    expect(result).toEqual({
      attackMs: 50,
      decayMs: 250,
      sustainPercent: 75,
      releaseMs: 500
    })
  })

  it('accepts partial params — only overrides supplied fields', () => {
    const result = adsrValidate({ attackMs: 5, releaseMs: 500 })
    expect(result.attackMs).toBe(5)
    expect(result.decayMs).toBe(100) // default
    expect(result.sustainPercent).toBe(50) // default
    expect(result.releaseMs).toBe(500)
  })

  it('treats zero as an explicit value, not a missing value', () => {
    const result = adsrValidate({ attackMs: 0, sustainPercent: 0 })
    expect(result.attackMs).toBe(0)
    expect(result.decayMs).toBe(100) // default
    expect(result.sustainPercent).toBe(0)
    expect(result.releaseMs).toBe(200) // default
  })

  it('returns an object with all four numeric properties', () => {
    const result = adsrValidate({})
    expect(result).toHaveProperty('attackMs')
    expect(result).toHaveProperty('decayMs')
    expect(result).toHaveProperty('sustainPercent')
    expect(result).toHaveProperty('releaseMs')
    expect(typeof result.attackMs).toBe('number')
    expect(typeof result.decayMs).toBe('number')
    expect(typeof result.sustainPercent).toBe('number')
    expect(typeof result.releaseMs).toBe('number')
  })
})

// ---------------------------------------------------------------------------
// modulationMatrix
// ---------------------------------------------------------------------------

describe('modulationMatrix', () => {
  it('produces 48 pairs with default arrays (8 sources × 6 targets)', () => {
    const matrix = modulationMatrix()
    expect(matrix).toHaveLength(48)
  })

  it('filters out self-modulation when source equals target', () => {
    const matrix = modulationMatrix(['Filter Cutoff'], ['Filter Cutoff'])
    expect(matrix).toHaveLength(0)
  })

  it('works with custom source and target arrays', () => {
    const matrix = modulationMatrix(
      ['LFO 1', 'Env 1'],
      ['Pitch', 'Volume']
    )
    expect(matrix).toHaveLength(4)
  })

  it('returns pairs sorted by source, then by target', () => {
    const matrix = modulationMatrix(
      ['Z Source', 'A Source'],
      ['Z Target', 'A Target']
    )
    expect(matrix[0].source).toBe('A Source')
    expect(matrix[0].target).toBe('A Target')
    expect(matrix[1].source).toBe('A Source')
    expect(matrix[1].target).toBe('Z Target')
    expect(matrix[2].source).toBe('Z Source')
    expect(matrix[2].target).toBe('A Target')
    expect(matrix[3].source).toBe('Z Source')
    expect(matrix[3].target).toBe('Z Target')
  })

  it('each route has depth 0 by default', () => {
    const matrix = modulationMatrix(['LFO 1'], ['Pitch'])
    expect(matrix[0].depth).toBe(0)
  })

  it('returns empty array when sources is empty', () => {
    expect(modulationMatrix([], ['Pitch'])).toEqual([])
  })

  it('returns empty array when targets is empty', () => {
    expect(modulationMatrix(['LFO 1'], [])).toEqual([])
  })

  it('default matrix contains expected first and last entries', () => {
    const matrix = modulationMatrix()
    // Sorted: Aftertouch first, Velocity last
    expect(matrix[0].source).toBe('Aftertouch')
    expect(matrix[0].target).toBe('Filter Cutoff')
    expect(matrix[matrix.length - 1].source).toBe('Velocity')
    expect(matrix[matrix.length - 1].target).toBe('Wavetable Position')
  })
})

// ---------------------------------------------------------------------------
// lfoWaveforms
// ---------------------------------------------------------------------------

describe('lfoWaveforms', () => {
  it('returns 6 waveform types', () => {
    expect(lfoWaveforms()).toHaveLength(6)
  })

  it('every entry has type, description, and harmonics as strings', () => {
    for (const wf of lfoWaveforms()) {
      expect(typeof wf.type).toBe('string')
      expect(typeof wf.description).toBe('string')
      expect(typeof wf.harmonics).toBe('string')
    }
  })

  it('contains all expected waveform types', () => {
    const types = lfoWaveforms().map((w) => w.type)
    expect(types).toContain('Sine')
    expect(types).toContain('Triangle')
    expect(types).toContain('Saw Up')
    expect(types).toContain('Saw Down')
    expect(types).toContain('Square')
    expect(types).toContain('Random S&H')
  })

  it('Sine has correct description and harmonics', () => {
    const sine = lfoWaveforms().find((w) => w.type === 'Sine')
    expect(sine?.description).toBe('Smooth, continuous modulation')
    expect(sine?.harmonics).toBe('Fundamental only')
  })

  it('Square has correct description and harmonics', () => {
    const square = lfoWaveforms().find((w) => w.type === 'Square')
    expect(square?.description).toBe('Binary on/off modulation')
    expect(square?.harmonics).toBe('Odd harmonics 1/n')
  })

  it('Random S&H has correct description and harmonics', () => {
    const rsh = lfoWaveforms().find((w) => w.type === 'Random S&H')
    expect(rsh?.description).toBe('Stepped random values')
    expect(rsh?.harmonics).toBe('Pseudo-random spectrum')
  })
})
