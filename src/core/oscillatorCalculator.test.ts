import { describe, it, expect } from 'vitest'
import {
  detuneToHz,
  unisonVoices,
  fmRatio,
  subOscillator
} from './oscillatorCalculator'

// =============================================================================
// detuneToHz
// =============================================================================

describe('detuneToHz', () => {
  it('returns 0 when cents is 0 (no detune)', () => {
    expect(detuneToHz(440, 0)).toBe(0)
  })

  it('returns positive offset for positive cents (sharper)', () => {
    // +100¢ = 1 semitone up at A4=440Hz
    // Formula: 440 * 2^(100/1200) - 440 ≈ 26.16
    const result = detuneToHz(440, 100)
    expect(result).toBeCloseTo(26.16, 1)
  })

  it('returns negative offset for negative cents (flatter)', () => {
    // -50¢ = quarter-tone down at A4=440Hz
    // Formula: 440 * 2^(-50/1200) - 440 ≈ -12.53
    const result = detuneToHz(440, -50)
    expect(result).toBeCloseTo(-12.53, 1)
  })

  it('returns 0 when baseFreq is 0 (no sound to detune)', () => {
    expect(detuneToHz(0, 100)).toBe(0)
    expect(detuneToHz(0, -50)).toBe(0)
    expect(detuneToHz(0, 0)).toBe(0)
  })

  it('returns baseFreq for exactly 1 octave up (1200¢ = ×2)', () => {
    // 1200¢ = exactly one octave → frequency doubles
    // 440 * 2^(1200/1200) - 440 = 440 * 2 - 440 = 440
    expect(detuneToHz(440, 1200)).toBeCloseTo(440, 5)
  })

  it('works with non-A4 base frequencies', () => {
    // 261.63 Hz = Middle C (C4), +100¢ = C#4/Db4
    const result = detuneToHz(261.63, 100)
    // 261.63 * 2^(1/12) - 261.63 ≈ 15.56
    expect(result).toBeCloseTo(15.56, 1)
  })

  it('handles very large cent values (2 octaves = 2400¢)', () => {
    const result = detuneToHz(440, 2400)
    // 440 * 2^(2400/1200) - 440 = 440 * 4 - 440 = 1320
    expect(result).toBeCloseTo(1320, 1)
  })
})

// =============================================================================
// unisonVoices
// =============================================================================

describe('unisonVoices', () => {
  it('returns single centered voice when count is 1', () => {
    const result = unisonVoices(1, 20)
    expect(result).toHaveLength(1)
    expect(result[0].voice).toBe(1)
    expect(result[0].detuneCents).toBe(0)
    expect(result[0].frequency).toBe(440)
  })

  it('returns evenly spaced voices for odd count with center at 0', () => {
    // 3 voices spread 20¢: [-10, 0, 10]
    const result = unisonVoices(3, 20)
    expect(result).toHaveLength(3)
    expect(result[0].voice).toBe(1)
    expect(result[0].detuneCents).toBe(-10)
    expect(result[1].voice).toBe(2)
    expect(result[1].detuneCents).toBe(0)
    expect(result[1].frequency).toBe(440)
    expect(result[2].voice).toBe(3)
    expect(result[2].detuneCents).toBe(10)
  })

  it('returns symmetric voices for even count (skips 0)', () => {
    // 4 voices spread 20¢: [-15, -5, 5, 15]
    const result = unisonVoices(4, 20)
    expect(result).toHaveLength(4)
    expect(result[0].detuneCents).toBe(-15)
    expect(result[1].detuneCents).toBe(-5)
    expect(result[2].detuneCents).toBe(5)
    expect(result[3].detuneCents).toBe(15)
  })

  it('computes correct frequencies for detuned voices', () => {
    const result = unisonVoices(3, 20)
    // Voice 1: 440 * 2^(-10/1200) ≈ 437.47
    expect(result[0].frequency).toBeCloseTo(437.47, 1)
    // Voice 2: centered at 0¢ = 440Hz
    expect(result[1].frequency).toBe(440)
    // Voice 3: 440 * 2^(10/1200) ≈ 442.55
    expect(result[2].frequency).toBeCloseTo(442.55, 1)
  })

  it('returns empty array when count is less than 1', () => {
    expect(unisonVoices(0, 20)).toHaveLength(0)
    expect(unisonVoices(-1, 20)).toHaveLength(0)
  })

  it('clamps count to maximum of 16', () => {
    const result = unisonVoices(20, 20)
    expect(result).toHaveLength(16)
    // First voice should be -(16-1)/2 * (2*20/16) = -7.5*2.5 = -18.75
    expect(result[0].detuneCents).toBeCloseTo(-18.75, 2)
    // Last voice should be +18.75, 16th voice index 15
    expect(result[15].detuneCents).toBeCloseTo(18.75, 2)
  })

  it('clamps spreadCents to 0 (all voices in tune)', () => {
    const result = unisonVoices(3, -10)
    // spreadCents clamped to 0, so all voices at 0 detune
    expect(result).toHaveLength(3)
    expect(result[0].detuneCents).toBe(0)
    expect(result[1].detuneCents).toBe(0)
    expect(result[2].detuneCents).toBe(0)
  })

  it('clamps spreadCents to 100 (maximum spread)', () => {
    const result = unisonVoices(3, 200)
    // spreadCents clamped to 100
    // step = 100 / (3-1) = 50
    // [-50, 0, 50]
    expect(result).toHaveLength(3)
    expect(result[0].detuneCents).toBe(-50)
    expect(result[2].detuneCents).toBe(50)
  })

  it('detune values are sorted low to high', () => {
    const result = unisonVoices(5, 40)
    for (let i = 1; i < result.length; i++) {
      expect(result[i].detuneCents).toBeGreaterThan(result[i - 1].detuneCents)
    }
  })

  it('voices are 1-indexed sequentially', () => {
    const result = unisonVoices(6, 30)
    expect(result.map((v) => v.voice)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('produces audible frequency for all voices at max spread', () => {
    // Even at maximum spread (100¢), all frequencies should be
    // within audible range around A4
    // 440 * 2^(-100/1200) ≈ 415.3 (roughly G#4)
    // 440 * 2^(100/1200) ≈ 466.2 (roughly A#4/Bb4)
    const result = unisonVoices(5, 100)
    for (const v of result) {
      expect(v.frequency).toBeGreaterThan(400)
      expect(v.frequency).toBeLessThan(500)
    }
  })
})

// =============================================================================
// fmRatio
// =============================================================================

describe('fmRatio', () => {
  it('produces carrier = modulator at 1:1 ratio', () => {
    const result = fmRatio(440, 1, 1)
    expect(result.carrier).toBe(440)
    expect(result.modulator).toBe(440)
  })

  it('generates symmetrical sidebands around carrier (filtering subsonic)', () => {
    const result = fmRatio(440, 1, 1)
    // With carrier=440, mod=440:
    // n=1: 0 (filtered), 880
    // n=2: -440 (filtered), 1320
    // n=3: -880 (filtered), 1760
    // n=4: -1320 (filtered), 2200
    expect(result.sidebands).toEqual([880, 1320, 1760, 2200])
  })

  it('produces correct sidebands for 2:1 ratio (mod higher)', () => {
    const result = fmRatio(440, 2, 0.5)
    // carrier=440, modulator=880
    // n=1: -440(filtered), 1320
    // n=2: -1320(filtered), 2200
    // n=3: -2200(filtered), 3080
    // n=4: -3080(filtered), 3960
    expect(result.modulator).toBe(880)
    expect(result.sidebands).toEqual([1320, 2200, 3080, 3960])
  })

  it('filters negative sidebands below 20Hz', () => {
    // Low carrier + high ratio = many negative sidebands
    const result = fmRatio(100, 5, 1)
    // carrier=100, modulator=500
    // n=1: -400(filtered), 600
    // n=2: -900(filtered), 1100
    // n=3: -1400(filtered), 1600
    // n=4: -1900(filtered), 2100
    expect(result.sidebands).toEqual([600, 1100, 1600, 2100])
  })

  it('returns upper sideband when lower is just above 20Hz', () => {
    // carrier=500, mod=240, n=2: lower=500-480=20 (>=20, included)
    const result = fmRatio(500, 0.48, 1)
    expect(result.modulator).toBeCloseTo(240, 0)
    // n=2: lower=500-480=20 — should be included (20 >= 20)
    expect(result.sidebands).toContain(20)
  })

  it('clamps modulatorRatio to 0.1 minimum', () => {
    const result = fmRatio(440, 0, 1)
    // ratio clamped to 0.1, modulator = 440 * 0.1 = 44
    expect(result.modulator).toBe(44)
  })

  it('clamps modulatorRatio to 8 maximum', () => {
    const result = fmRatio(440, 10, 1)
    // ratio clamped to 8, modulator = 440 * 8 = 3520
    expect(result.modulator).toBe(3520)
  })

  it('produces all 8 sidebands when none are subsonic', () => {
    // High carrier with gentle ratio keeps all sidebands above 20Hz
    // carrier=1000, modulator=100 (ratio=0.1)
    // n=1: 900, 1100
    // n=2: 800, 1200
    // n=3: 700, 1300
    // n=4: 600, 1400
    const result = fmRatio(1000, 0.1, 1)
    expect(result.sidebands).toHaveLength(8)
    expect(result.sidebands).toEqual([
      900, 1100,
      800, 1200,
      700, 1300,
      600, 1400
    ])
  })

  it('returns exactly 4 pairs of sideband frequencies', () => {
    const result = fmRatio(1000, 1, 1)
    // All sidebands should be > 20Hz
    // n=1: 0, 2000 — wait, 0 is filtered
    // carrier=1000, mod=1000
    // n=1: 0(filtered), 2000
    // n=2: -1000(filtered), 3000
    // n=3: -2000(filtered), 4000
    // n=4: -3000(filtered), 5000
    expect(result.sidebands).toEqual([2000, 3000, 4000, 5000])
  })
})

// =============================================================================
// subOscillator
// =============================================================================

describe('subOscillator', () => {
  it('returns half frequency for 1 octave down', () => {
    expect(subOscillator(440, 1)).toBe(220)
  })

  it('returns quarter frequency for 2 octaves down', () => {
    expect(subOscillator(440, 2)).toBe(110)
  })

  it('returns 1/8 frequency for 3 octaves down', () => {
    expect(subOscillator(440, 3)).toBe(55)
  })

  it('returns 0 when frequency is 0', () => {
    expect(subOscillator(0, 1)).toBe(0)
  })

  it('returns 0 when frequency is negative', () => {
    expect(subOscillator(-100, 1)).toBe(0)
  })

  it('returns 0 when octavesDown is less than 1', () => {
    expect(subOscillator(440, 0)).toBe(0)
    expect(subOscillator(440, -1)).toBe(0)
  })

  it('returns 0 when octavesDown exceeds 3', () => {
    expect(subOscillator(440, 4)).toBe(0)
    expect(subOscillator(440, 10)).toBe(0)
  })

  it('works with non-standard frequencies', () => {
    expect(subOscillator(261.63, 1)).toBeCloseTo(130.82, 1)
    expect(subOscillator(1000, 2)).toBe(250)
  })

  it('provides consistent halving relationship across octaves', () => {
    // 3 octaves down = 1 octave down thrice
    const oneDown = subOscillator(440, 1) // 220
    const twoDown = subOscillator(440, 2) // 110
    const threeDown = subOscillator(440, 3) // 55
    expect(oneDown).toBe(220)
    expect(twoDown).toBe(110)
    // Verify halving chain: 440/2=220, 220/2=110, 110/2=55
    expect(oneDown / 2).toBe(twoDown)
    expect(twoDown / 2).toBe(threeDown)
  })
})
