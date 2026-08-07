/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Filter Calculator — Cutoff, Resonance, Slope & Envelope Utilities
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 *   Provides utility functions for synthesizer-style filter calculations.
 *   These are essential for:
 *
 *   1. CUTOFF → NOTE: Convert a filter cutoff frequency to its nearest
 *      musical note name (e.g., 440Hz → A4). Helps musicians dial in
 *      filter sweeps by note rather than abstract Hz values.
 *
 *   2. Q → RESONANCE: Convert a filter's Q factor to the resulting
 *      resonance boost in dB at the cutoff frequency. Higher Q =
 *      more pronounced resonant peak.
 *
 *   3. SLOPE INFO: Look up filter slope characteristics (6dB/oct,
 *      12dB/oct, 24dB/oct, 48dB/oct). Each doubles the steepness
 *      via additional filter poles.
 *
 *   4. FILTER ENVELOPE: Generate a simplified ADSR-like envelope
 *      shape for modulating a filter cutoff over time.
 *
 * CORE FORMULA (cutoff → MIDI note):
 *   MIDI = 69 + 12 * log2(freq / 440)
 *     69 = MIDI number for A4 (440Hz reference)
 *     12 = semitones per octave
 *   log2(freq / 440) = number of octaves away from A4
 *
 * CORE FORMULA (Q → resonance dB):
 *   dB = 10 * log10(1 + Q²)
 *     This formula closely models the resonant peak boost of a
 *     2-pole filter at the cutoff frequency, where:
 *     - Q ≈ 0.707 (Butterworth) produces no peak (maximally flat)
 *     - Q = 1.0 produces ≈3dB boost at cutoff
 *     - Q = 10.0 produces ≈20dB boost at cutoff
 *
 * @example
 *   import { cutoffToNote, qToResonance } from './filterCalculator'
 *   cutoffToNote(440)    // → { note: 'A4', midi: 69, frequency: 440 }
 *   qToResonance(1)      // → ≈3.01 (dB boost at cutoff)
 */

// =============================================================================
// Constants
// =============================================================================

/** Standard MIDI note names in chromatic order. Index 0 = C (MIDI note 0). */
const NOTE_NAMES: readonly string[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
]

/** MIDI reference: A4 = 440Hz, MIDI number 69 */
const MIDI_A4 = 69

/** Frequency of A4 in Hz (standard tuning reference) */
const FREQ_A4 = 440

/**
 * The Butterworth threshold — maximum Q factor that produces a
 * flat (non-resonant) response. Below this value, there's no
 * audible resonant peak at the cutoff frequency.
 *
 * Mathematically: 1 / sqrt(2) ≈ 0.7071
 * Also known as: the critically damped case for a 2-pole filter.
 */
const BUTTERWORTH_Q = 1 / Math.SQRT2

/**
 * Maximum practical Q factor. Beyond this, the resonance peak
 * exceeds ~40dB which is extreme and rarely useful in practice.
 */
const MAX_Q = 100

/** Practical upper limit for MIDI notes (MIDI spec range: 0–127) */
const MIDI_MAX = 127

/** Practical lower limit for MIDI notes (MIDI spec range: 0–127) */
const MIDI_MIN = 0

/** Maximum envelope time in milliseconds (30 seconds) */
const MAX_ENV_MS = 30000

// =============================================================================
// cutoffToNote
// =============================================================================

/**
 * cutoffToNote — Map a cutoff frequency to the nearest musical note.
 *
 * WHY THIS EXISTS:
 *   Synthesizer filter cutoffs are typically adjusted by ear or by
 *   frequency in Hz. Converting to a musical note helps musicians
 *   set filter resonance sweeps to specific keys of the scale, making
 *   filter automation sound more musical and intentional.
 *
 *   For example, setting a resonant filter cutoff to C3 ensures that
 *   the filter "rings" at a frequency that's in key with a C-minor
 *   track, rather than at an arbitrary pitch that clashes.
 *
 * @param cutoffHz — Filter cutoff frequency in Hertz.
 *                   Must be a positive number. 0 or negative returns
 *                   a default "no note" response.
 * @returns Object with:
 *   - note: Note name string (e.g., "C4", "A#3", "G9"), or "—" for invalid input
 *   - midi: MIDI note number (0–127), or -1 for invalid input
 *   - frequency: The original cutoffHz value (passthrough for reference)
 *
 * @example
 *   cutoffToNote(440)       // → { note: 'A4',  midi: 69, frequency: 440 }
 *   cutoffToNote(261.63)    // → { note: 'C4',  midi: 60, frequency: 261.63 }
 *   cutoffToNote(12543)     // → { note: 'G9',  midi: 127, frequency: 12543 }
 *   cutoffToNote(0)         // → { note: '—',   midi: -1, frequency: 0 }
 *   cutoffToNote(-100)      // → { note: '—',   midi: -1, frequency: -100 }
 */
export function cutoffToNote(cutoffHz: number): {
  note: string
  midi: number
  frequency: number
} {
  // 边界检查：≤ 0 的频率没有音高意义
  // If cutoff is 0 or negative, there is no meaningful pitch
  if (cutoffHz <= 0) {
    return { note: '—', midi: -1, frequency: 0 }
  }

  // MIDI公式: 69 + 12 * log2(freq / 440)
  // 69 = A4 的 MIDI 编号，440 = A4 的标准频率
  // Formula from MIDI standard: 69 semitones above C0 (= A4)
  const rawMidi = MIDI_A4 + 12 * Math.log2(cutoffHz / FREQ_A4)

  // 四舍五入到最近的半音，然后钳制到 MIDI 规范范围 0–127
  // Round to nearest semitone and clamp to MIDI specification range
  const midi = Math.max(MIDI_MIN, Math.min(MIDI_MAX, Math.round(rawMidi)))

  // 将 MIDI 编号转换为音名
  // MIDI note 0 = C (note index 0), 69 = A (note index 9 = 69 % 12)
  const noteIndex = midi % 12
  const noteName = NOTE_NAMES[noteIndex]

  // 计算八度：MIDI 约定 floor(midi / 12) - 1
  // MIDI octave convention: C4 = MIDI 60, octave = floor(60/12) - 1 = 4
  const octave = Math.floor(midi / 12) - 1

  return {
    note: `${noteName}${octave}`,
    midi,
    frequency: cutoffHz
  }
}

// =============================================================================
// qToResonance
// =============================================================================

/**
 * qToResonance — Convert Q factor to resonance dB boost at cutoff.
 *
 * WHAT IS Q?
 *   Q (Quality factor) describes how underdamped a filter is:
 *   - Low Q (< 0.707): Gentle roll-off, no resonant peak (Butterworth)
 *   - Q = 0.707: Maximally flat passband (Butterworth response)
 *   - Q = 1.0: Noticeable peak at cutoff (~3dB boost)
 *   - High Q (> 2): Pronounced resonant "ringing" at the cutoff freq
 *
 * RESONANCE IN SYNTHESIZERS:
 *   Turning up the resonance on a synth filter makes the cutoff
 *   frequency "sing" — it emphasizes the frequencies right at the
 *   cutoff point. This is THE defining sound of analog synthesis,
 *   used in everything from TB-303 acid bass to dubstep wobbles.
 *
 * @param q — Filter Q factor (Quality factor).
 *            Typical range: 0.5 to 100.
 *            Values ≤ 0 or < 0.707 return 0 (no resonant peak).
 *            Clamped internally to max 100.
 * @returns Resonance boost at cutoff frequency, in decibels (dB).
 *          Higher values = more pronounced resonant peak.
 *          0 means no boost (flat response at cutoff).
 *
 * @example
 *   qToResonance(0.707)    // → 0        (Butterworth, flat)
 *   qToResonance(1)        // → ≈3.01    (moderate peak)
 *   qToResonance(3)        // → ≈10.0    (pronounced peak)
 *   qToResonance(10)       // → ≈20.04   (strong peak)
 *   qToResonance(-1)       // → 0        (invalid input)
 *
 * REFERENCE TABLE (typical synth filter values):
 *   Q = 0.707 (Butterworth) → 0dB   (maximally flat, no peak)
 *   Q = 1.0                 → ≈3dB  (gentle resonance)
 *   Q = 1.3 (TB-303 style)  → ≈4.3dB (acid bass character)
 *   Q = 3.0                 → ≈10dB  (strong resonance)
 *   Q = 5.0                 → ≈14dB  (aggressive resonance)
 *   Q = 10.0                → ≈20dB  (extreme, self-oscillating)
 */
export function qToResonance(q: number): number {
  // 无效或低于 Butterworth 阈值的情况：没有共振峰
  // No resonant peak below Butterworth threshold:
  //   Q <= 0 is physically meaningless
  //   Q <= 1/√2 produces no resonant peak
  if (q <= 0) return 0
  if (q <= BUTTERWORTH_Q) return 0

  // 钳制到最大值，防止计算溢出
  // Clamp to practical range — beyond Q=100 the boost exceeds ~40dB
  const clampedQ = Math.min(q, MAX_Q)

  // 共振峰增益公式（音频 DSP 中的标准近似）
  // Resonant peak gain at cutoff frequency for a 2-pole filter.
  // This formula, dB = 10 * log10(1 + Q²), models the magnitude
  // response of a resonant lowpass/highpass filter at its cutoff.
  //
  // 公式推导：
  //   A resonant 2-pole filter has transfer function denominator:
  //   s² + s/Q + 1. At the cutoff frequency (s = jω₀), the magnitude
  //   response is approximately sqrt(1 + Q²), giving:
  //   dB = 20 * log10(sqrt(1 + Q²)) = 10 * log10(1 + Q²)
  //
  // 参考值校验：
  //   Q = 0.707 → 0dB (threshold returns 0 before calculation)
  //   Q = 1.0   → 10*log10(2) ≈ 3.01 dB
  //   Q = 10    → 10*log10(101) ≈ 20.04 dB
  //   Q = 100   → 10*log10(10001) ≈ 40.00 dB
  return 10 * Math.log10(1 + clampedQ * clampedQ)
}

// =============================================================================
// slopeInfo
// =============================================================================

/**
 * A lookup record mapping filter slope type to its characteristics.
 * Provides fast access without switch/case boilerplate.
 */
const SLOPE_INFO: Record<
  '6dB' | '12dB' | '24dB' | '48dB',
  { dbPerOctave: number; poles: number; description: string }
> = {
  /**
   * 6dB/oct — 1-pole filter.
   * The gentlest slope. Rolls off at 6dB per octave (20dB/decade).
   * Common in: basic tone controls, simple hi-fi crossovers.
   */
  '6dB': {
    dbPerOctave: 6,
    poles: 1,
    description: 'Gentlest slope, 1-pole filter'
  },

  /**
   * 12dB/oct — 2-pole filter.
   * THE classic analog synthesizer filter slope.
   * Rolls off at 12dB per octave (40dB/decade).
   * Used in: Roland TB-303, Jupiter-8, Moog (some models).
   * Resonant 2-pole filters produce the iconic "acid" sound.
   */
  '12dB': {
    dbPerOctave: 12,
    poles: 2,
    description: 'Moderate slope, 2-pole filter (classic analog synth)'
  },

  /**
   * 24dB/oct — 4-pole filter.
   * The most common slope in subtractive synthesis.
   * Rolls off at 24dB per octave (80dB/decade).
   * Used in: Moog ladder filter, most EDM synth presets.
   * The steep slope produces aggressive, "fat" filter sweeps.
   */
  '24dB': {
    dbPerOctave: 24,
    poles: 4,
    description: 'Steep slope, 4-pole filter (Moog, most common in EDM)'
  },

  /**
   * 48dB/oct — 8-pole filter.
   * Extremely steep roll-off. Near-brickwall filtering.
   * Rolls off at 48dB per octave (160dB/decade).
   * Used for: aggressive filtering, sound design effects,
   * removing specific frequency bands with surgical precision.
   */
  '48dB': {
    dbPerOctave: 48,
    poles: 8,
    description: 'Very steep, 8-pole filter (aggressive filtering)'
  }
}

/**
 * slopeInfo — Look up filter slope characteristics by type.
 *
 * WHY FILTER SLOPE MATTERS:
 *   The slope determines how aggressively frequencies beyond the
 *   cutoff point are attenuated:
 *   - 6dB/oct: Gentle, subtle — sounds natural, like a tone control
 *   - 12dB/oct: Moderate — the classic analog synth sound
 *   - 24dB/oct: Steep — the Moog sound, dominant in modern EDM
 *   - 48dB/oct: Very steep — aggressive, surgical filtering
 *
 *   Each 6dB increment adds one "pole" to the filter circuit.
 *   More poles = steeper roll-off but also more phase shift
 *   and potential resonance.
 *
 * @param type — The filter slope designation:
 *               '6dB'  → 1-pole, gentle
 *               '12dB' → 2-pole, classic analog synth
 *               '24dB' → 4-pole, Moog-style / EDM
 *               '48dB' → 8-pole, aggressive
 * @returns Object with:
 *   - dbPerOctave: Attenuation rate in dB per octave
 *   - poles: Number of filter poles (1 pole ≈ 6dB/oct)
 *   - description: Human-readable description of the slope character
 *
 * @example
 *   slopeInfo('6dB')
 *   // → { dbPerOctave: 6, poles: 1, description: 'Gentlest slope, 1-pole filter' }
 *   slopeInfo('24dB')
 *   // → { dbPerOctave: 24, poles: 4, description: 'Steep slope, 4-pole filter (Moog, most common in EDM)' }
 */
export function slopeInfo(
  type: '6dB' | '12dB' | '24dB' | '48dB'
): { dbPerOctave: number; poles: number; description: string } {
  return SLOPE_INFO[type]
}

// =============================================================================
// filterEnvelopePoints
// =============================================================================

/**
 * filterEnvelopePoints — Generate a simplified filter envelope shape.
 *
 * WHAT THIS DOES:
 *   Creates an array of envelope values (0–1) that describe how a
 *   filter cutoff should change over time. This is a simplified
 *   ADSR-style envelope — Attack → Decay → Release (with sustain
 *   level at the end of decay).
 *
 * ENVELOPE PHASES:
 *   ┌─────────┬──────────────┬──────────┐
 *   │ Attack  │   Decay      │ Release  │
 *   │ 0 → 1   │ 1 → sustain  │ sus → 0  │
 *   └─────────┴──────────────┴──────────┘
 *   ↑───────────────── time ─────────────→
 *
 *   ATTACK: Filter opens up (cutoff rises), value ramps from 0 to 1
 *   DECAY:  Filter settles to sustain level, 1 → sustainLevel
 *   RELEASE:Filter closes (cutoff drops), sustainLevel → 0
 *
 * The points are distributed proportionally across the total timeline.
 * This means a long attack phase gets more points than a short one.
 *
 * @param attackMs  — Time in ms for the attack phase (opening the filter).
 *                    Clamped to 0–30000ms.
 * @param decayMs   — Time in ms for the decay phase (settling to sustain).
 *                    Clamped to 0–30000ms.
 * @param sustainLevel — Level the filter settles to after decay (0–1).
 *                    Clamped to 0–1. 0 = fully closed, 1 = fully open.
 * @param releaseMs — Time in ms for the release phase (closing the filter).
 *                    Clamped to 0–30000ms.
 * @param numPoints — Number of envelope points to generate.
 *                    Controls the resolution of the envelope curve.
 * @returns Array of envelope values (0–1), one per point.
 *          Returns an empty array if numPoints <= 0.
 *          Returns all zeros if total time is 0.
 *
 * @example
 *   // Simple attack + decay + release envelope
 *   filterEnvelopePoints(100, 200, 0.5, 100, 5)
 *   // → [0, 0.5, 0.75, 0.5, 0]  (approximate values)
 *
 *   // All times zero → flat line at 0
 *   filterEnvelopePoints(0, 0, 0, 0, 4)
 *   // → [0, 0, 0, 0]
 *
 *   // Sustain clamped to valid range
 *   filterEnvelopePoints(100, 100, 2, 100, 3)
 *   // → [0, 1, 0]  (sustainLevel clamped from 2 to 1)
 */
export function filterEnvelopePoints(
  attackMs: number,
  decayMs: number,
  sustainLevel: number,
  releaseMs: number,
  numPoints: number
): number[] {
  // 钳制所有时间参数到有效范围（0–30000ms）
  // Clamp time parameters to valid range
  const attack = Math.max(0, Math.min(MAX_ENV_MS, attackMs))
  const decay = Math.max(0, Math.min(MAX_ENV_MS, decayMs))
  const release = Math.max(0, Math.min(MAX_ENV_MS, releaseMs))

  // 钳制延音电平到 0–1 范围
  // Clamp sustain to valid amplitude range
  const sustain = Math.max(0, Math.min(1, sustainLevel))

  // 无效点数：返回空数组
  // Invalid point count
  if (numPoints <= 0) return []

  // 时间总和（包络总时长）
  // Total envelope duration
  const totalMs = attack + decay + release

  // 没有时间变化：返回全零数组
  // No temporal envelope — flat line at 0 or sustain
  if (totalMs <= 0) {
    return new Array(numPoints).fill(0)
  }

  // 衰减阶段结束时的电平：延音电平（由 sustain 定义）
  // The level at the end of the decay phase
  const result: number[] = []

  for (let i = 0; i < numPoints; i++) {
    // 计算当前点在时间轴上的位置（比例 0→1）
    // Calculate proportional position along the total timeline
    const t = numPoints > 1 ? i / (numPoints - 1) : 0
    // 当前位置对应的毫秒数
    // Map proportion to actual milliseconds
    const ms = t * totalMs

    let value: number

    if (attack > 0 && ms < attack) {
      // === 起音阶段（Attack）：从 0 线性上升到 1 ===
      // The filter opens: value ramps from 0 to 1
      // 当前点在起音段中的比例 × 目标值 1
      // Fraction of attack elapsed times the target peak
      value = ms / attack
    } else if (decay > 0 && ms < attack + decay) {
      // === 衰减阶段（Decay）：从 1 线性下降到延音电平 ===
      // The filter settles: value ramps from 1 to sustain level
      const localMs = ms - attack
      // 从 1 向 sustain 线性插值
      // Linear interpolation from 1 down to sustain level
      value = 1 - (localMs / decay) * (1 - sustain)
    } else if (release > 0) {
      // === 释放阶段（Release）：从延音电平线性下降到 0 ===
      // The filter closes: value ramps from sustain level to 0
      const localMs = ms - attack - decay
      // 从 sustain 向 0 线性插值
      // Linear interpolation from sustain down to 0
      value = sustain * (1 - localMs / release)
    } else {
      // === 无活动阶段 ===
      // 如果走到这里，说明所有剩余阶段时长均为零，
      // 包络停留在延音电平（不再变化）
      // All remaining phases have zero duration — sit at sustain
      value = sustain
    }

    result.push(value)
  }

  return result
}
