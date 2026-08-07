/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Modulation Planner — LFO, ADSR, and Modulation Routing Utilities
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 *   Provides utility functions for planning modulation in a synthesizer or
 *   audio effect context. These calculations are essential for:
 *
 *   1. LFO RATE SYNC: Generate tempo-synced LFO rate tables so low-frequency
 *      oscillators lock to the beat grid of your track.
 *   2. ADSR VALIDATION: Clamp and default envelope parameters (Attack, Decay,
 *      Sustain, Release) to safe, musical ranges.
 *   3. MODULATION MATRIX: Create source→target routing grids for routing
 *      modulation sources (LFOs, envelopes, MIDI controllers) to destinations.
 *   4. LFO WAVEFORMS: Reference data describing the harmonic character of
 *      common LFO waveform shapes.
 *
 * CORE FORMULA:
 *   LFO period (ms) = 60000 / BPM × divisionFactor
 *   LFO frequency (hz) = 1000 / ms
 *   60000ms = 1 minute
 *   1000ms = 1 second
 *
 * THESE ARE NOT MAGIC NUMBERS:
 *   60000 = milliseconds in a minute (60 × 1000)
 *   1000 = milliseconds per second (for ms→hz conversion)
 *   divisionFactor 1.0 = 1/4 note = 1 beat in 4/4 time
 *
 * @example
 *   import { lfoRateSync } from './modulationPlanner'
 *   lfoRateSync(120)
 *   // → [{ label: '1/4 (quarter)', division: 1, ms: 500, hz: 2 }, ...]
 */

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

/**
 * A single entry in a BPM-synced LFO rate table.
 *
 * @property label — Human-readable division name (e.g. "1/4 (quarter)")
 * @property division — Numeric divisor (1 = whole, 2 = half, 4 = quarter, …)
 * @property ms — Period in milliseconds (rounded to 1 decimal)
 * @property hz — Frequency in hertz (rounded to 3 decimals)
 */
export interface LfoRateEntry {
  label: string
  division: number
  ms: number
  hz: number
}

/**
 * A validated ADSR envelope parameter set with all values clamped to range.
 *
 * ADSR stands for Attack, Decay, Sustain, Release — the four stages of an
 * envelope that shapes a sound's amplitude or filter cutoff over time.
 *
 * @property attackMs — Time to reach peak level (ms, 0-30000)
 * @property decayMs — Time to fall to sustain level (ms, 0-30000)
 * @property sustainPercent — Level held while key is pressed (%, 0-100)
 * @property releaseMs — Time to fade to silence after key release (ms, 0-60000)
 */
export interface AdsrParams {
  attackMs: number
  decayMs: number
  sustainPercent: number
  releaseMs: number
}

/**
 * A single routing entry in a modulation matrix.
 *
 * Modulation routing connects a source (e.g. "LFO 1") to a destination
 * parameter (e.g. "Filter Cutoff") with a depth amount.
 *
 * @property source — Name of the modulation source
 * @property target — Name of the destination parameter
 * @property depth — Modulation intensity (default 0, typically -1 to 1)
 */
export interface ModulationRoute {
  source: string
  target: string
  depth: number
}

/**
 * Reference data describing an LFO waveform shape.
 *
 * @property type — Waveform name (e.g. "Sine", "Square")
 * @property description — Character / use-case summary in plain English
 * @property harmonics — Harmonic content description
 */
export interface LfoWaveformInfo {
  type: string
  description: string
  harmonics: string
}

// ---------------------------------------------------------------------------
// LFO Division Table
// ---------------------------------------------------------------------------

/**
 * LFO_DIVISIONS — Predefined tempo-synced LFO note divisions.
 *
 * Each entry maps a human-readable label to its multiplication factor
 * relative to a quarter note (= 1 beat in 4/4 time). A factor of 1.0
 * means one cycle per beat; factor 4.0 means one cycle per whole note.
 *
 * Musical context (音乐背景):
 *   - Standard divisions (标准分音): Binary subdivisions 1/1 ~ 1/64
 *   - Triplet divisions (三连音): Divide one beat into 3 equal parts —
 *     creates a 3-against-2 polyrhythmic feel
 *   - Dotted divisions (附点): 1.5× the standard length — creates swing
 *     and syncopation, classic in dub/reggae delay timing
 *
 * WHY THE FACTORS LOOK THIS WAY:
 *   - Quarter note = 1 beat. ms = 60000/BPM × 1
 *   - Eighth note = ½ beat. ms = 60000/BPM × 0.5
 *   - Triplet eighth = ⅓ beat. ms = 60000/BPM × 0.333
 *   - Dotted quarter = 1½ beats. ms = 60000/BPM × 1.5
 */
const LFO_DIVISIONS: { label: string; factor: number }[] = [
  { label: '1/1 (whole)', factor: 4 },
  { label: '1/2 (half)', factor: 2 },
  { label: '1/4 (quarter)', factor: 1 },
  { label: '1/8 (eighth)', factor: 0.5 },
  { label: '1/16 (16th)', factor: 0.25 },
  { label: '1/32 (32nd)', factor: 0.125 },
  { label: '1/64 (64th)', factor: 0.0625 },
  { label: '1/8t (triplet)', factor: 0.333 },
  { label: '1/16t (triplet)', factor: 0.167 },
  { label: '1/4d (dotted)', factor: 1.5 },
  { label: '1/8d (dotted)', factor: 0.75 },
  { label: '1/16d (dotted)', factor: 0.375 }
] as const

// ---------------------------------------------------------------------------
// Default modulation sources and targets
// ---------------------------------------------------------------------------

/**
 * DEFAULT_SOURCES — Standard modulation sources provided by most subtractive
 * synthesizers and audio effects.
 *
 * 来源类别 (Source categories):
 *   - LFO 1/2: Low-frequency oscillators for cyclic modulation
 *   - Env 1/2: Envelope generators for one-shot modulation shapes
 *   - Mod Wheel: MIDI CC 1, manual expression control
 *   - Aftertouch: Pressure-sensitive modulation after initial key press
 *   - Velocity: Key strike speed → dynamic response
 *   - Key Tracking: Note pitch → parameter scaling across keyboard
 */
const DEFAULT_SOURCES: string[] = [
  'LFO 1',
  'LFO 2',
  'Env 1 (Amp)',
  'Env 2 (Filter)',
  'Mod Wheel',
  'Aftertouch',
  'Velocity',
  'Key Tracking'
]

/**
 * DEFAULT_TARGETS — Common modulation destinations in a synthesizer signal
 * path. These represent the parameters most frequently modulated in sound
 * design.
 *
 * 目标参数 (Target parameters):
 *   - Pitch: Oscillator frequency modulation (vibrato, pitch bends)
 *   - Filter Cutoff: Timbre/brightness modulation (wah, sweeps)
 *   - Volume: Amplitude modulation (tremolo, sidechain pumping)
 *   - Pan: Stereo position modulation (auto-pan, width effects)
 *   - Wavetable Position: Wavetable oscillator scanning
 *   - FM Amount: Frequency-modulation intensity
 */
const DEFAULT_TARGETS: string[] = [
  'Pitch',
  'Filter Cutoff',
  'Volume',
  'Pan',
  'Wavetable Position',
  'FM Amount'
]

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * lfoRateSync — Generate a BPM-synced LFO rate table.
 *
 * Calculates the period (ms) and frequency (hz) for each standard note
 * division at the given BPM. This lets you sync LFO cycles to the beat:
 * a 1/4 LFO completes one full cycle every quarter note.
 *
 * 公式 (Formula):
 *   ms = 60000 / BPM × factor
 *   hz = 1000 / ms
 *
 * 音乐用途 (Musical usage):
 *   - 1/4 LFO on filter cutoff = filter sweep that resets every beat
 *   - 1/8t LFO on pitch = triplet vibrato for rhythmic variation
 *   - 1/4d LFO on volume = swung tremolo pattern
 *
 * @param bpm — Beats per minute. Valid range is 20-300.
 *              Returns empty array if BPM ≤ 0.
 * @returns Array of LfoRateEntry objects, one per division (12 total).
 *          ms rounded to 1 decimal, hz rounded to 3 decimals.
 *
 * @example
 *   lfoRateSync(120)
 *   // → [
 *   //     { label: '1/1 (whole)',  division: 4, ms: 2000, hz: 0.5 },
 *   //     { label: '1/4 (quarter)', division: 1, ms: 500, hz: 2 },
 *   //     ...
 *   //   ]
 *
 *   lfoRateSync(0)     // → []
 *   lfoRateSync(-10)   // → []
 */
export function lfoRateSync(bpm: number): LfoRateEntry[] {
  // 无效的 BPM 值直接返回空表
  // Invalid BPM — no meaningful tempo to calculate from
  if (bpm <= 0) return []

  return LFO_DIVISIONS.map((div) => {
    const ms = (60000 / bpm) * div.factor
    return {
      label: div.label,
      division: Math.round(1 / (div.factor / 4)),
      ms: parseFloat(ms.toFixed(1)),
      hz: parseFloat((1000 / ms).toFixed(3))
    }
  })
}

/**
 * adsrValidate — Validate and clamp ADSR envelope parameters.
 *
 * ADSR envelopes shape how a sound evolves over time. This function
 * ensures the four parameters stay within musically sensible ranges
 * and fills in defaults for any unspecified values.
 *
 * 包络阶段 (Envelope stages):
 *   - ATTACK (起音): How fast the sound reaches full volume after key press
 *   - DECAY (衰减): How fast it drops to the sustain level
 *   - SUSTAIN (保持): The level held while the key is held down
 *   - RELEASE (释音): How fast it fades to silence after key release
 *
 * CLAMPING BEHAVIOR (数值限制):
 *   Values above the maximum are capped; values below zero are raised
 *   to zero. This prevents silent/inaudible or distorted results from
 *   extreme envelope settings.
 *
 * @param params — Partial ADSR object. Omitted fields use defaults:
 *   attackMs=10, decayMs=100, sustainPercent=50, releaseMs=200.
 * @returns A complete AdsrParams object with all values clamped:
 *   attackMs: 0-30000, decayMs: 0-30000, sustainPercent: 0-100, releaseMs: 0-60000
 *
 * @example
 *   adsrValidate({})                               // → defaults
 *   adsrValidate({ attackMs: 5 })                  // → attackMs=5, rest defaults
 *   adsrValidate({ attackMs: -10 })                // → attackMs=0 (clamped)
 *   adsrValidate({ attackMs: 50000 })              // → attackMs=30000 (clamped)
 *   adsrValidate({ attackMs: 5, releaseMs: 500 })  // → mix of supplied + defaults
 */
export function adsrValidate(
  params: {
    attackMs?: number
    decayMs?: number
    sustainPercent?: number
    releaseMs?: number
  }
): AdsrParams {
  // 默认值 — 当参数未提供时使用
  // Default values — musically neutral starting point
  const attackMs: number = params.attackMs ?? 10
  const decayMs: number = params.decayMs ?? 100
  const sustainPercent: number = params.sustainPercent ?? 50
  const releaseMs: number = params.releaseMs ?? 200

  return {
    // Attack: 0-30000ms — very fast click to very long fade-in
    attackMs: clamp(attackMs, 0, 30000),
    // Decay: 0-30000ms — instant drop to very slow fall
    decayMs: clamp(decayMs, 0, 30000),
    // Sustain: 0-100% — silence to full level
    sustainPercent: clamp(sustainPercent, 0, 100),
    // Release: 0-60000ms — abrupt stop to very long tail
    releaseMs: clamp(releaseMs, 0, 60000)
  }
}

/**
 * modulationMatrix — Generate all source→target pairs with default depth 0.
 *
 * Creates a complete modulation routing grid connecting every source to
 * every target. Self-modulation pairs (where source === target) are
 * filtered out — a parameter modulating itself is a feedback loop with
 * no musical use in this context.
 *
 * 调制矩阵 (Modulation Matrix):
 *   A synth's modulation matrix is the patch bay that routes sources
 *   (envelopes, LFOs, controllers) to destinations (filter, pitch,
 *   volume, etc.). Each route has a depth that controls intensity.
 *
 * @param sources — List of modulation source names.
 *   Defaults to 8 standard synth sources.
 * @param targets — List of destination parameter names.
 *   Defaults to 6 common synth targets.
 * @returns Flat array of ModulationRoute objects sorted by source, then target.
 *   8×6 = 48 entries with default arrays (no self-modulation to filter).
 *
 * @example
 *   modulationMatrix()
 *   // → [{ source: 'Aftertouch', target: 'Filter Cutoff', depth: 0 }, ...]
 *
 *   modulationMatrix(['LFO 1'], ['Pitch', 'Volume'])
 *   // → [{ source: 'LFO 1', target: 'Pitch', depth: 0 },
 *   //     { source: 'LFO 1', target: 'Volume', depth: 0 }]
 *
 *   modulationMatrix(['LFO 1'], ['LFO 1'])
 *   // → []  (no self-modulation)
 */
export function modulationMatrix(
  sources: string[] = DEFAULT_SOURCES,
  targets: string[] = DEFAULT_TARGETS
): ModulationRoute[] {
  const routes: ModulationRoute[] = []

  for (const source of sources) {
    for (const target of targets) {
      // 过滤自身调制 — 防止反馈回路
      // Filter self-modulation — prevents unmusical feedback loops
      if (source === target) continue

      routes.push({ source, target, depth: 0 })
    }
  }

  // 按来源名称排序，再按目标名称排序
  // Sort by source name, then by target name for deterministic ordering
  routes.sort((a, b) => {
    const sourceCmp = a.source.localeCompare(b.source)
    if (sourceCmp !== 0) return sourceCmp
    return a.target.localeCompare(b.target)
  })

  return routes
}

/**
 * lfoWaveforms — Get reference data for common LFO waveforms.
 *
 * Each waveform shape has a unique harmonic character that affects how
 * it modulates a target parameter:
 *
 * 波形特性 (Waveform character):
 *   - Sine (正弦波): Smooth, no abrupt transitions — gentle vibrato/filter sweeps
 *   - Triangle (三角波): Smooth but sharper corners — more pronounced wobble
 *   - Saw Up/Down (锯齿波): Asymmetric ramps — aggressive, "rising/falling" feel
 *   - Square (方波): Binary on/off — rhythmic stepping, trills
 *   - Random S&H (采样保持): Stepped random — sample & hold, classic "computer" bleeps
 *
 * @returns Array of 6 LfoWaveformInfo entries.
 *
 * @example
 *   lfoWaveforms()
 *   // → [
 *   //     { type: 'Sine', description: 'Smooth, continuous modulation', harmonics: 'Fundamental only' },
 *   //     ...
 *   //   ]
 */
export function lfoWaveforms(): LfoWaveformInfo[] {
  return [
    {
      type: 'Sine',
      description: 'Smooth, continuous modulation',
      harmonics: 'Fundamental only'
    },
    {
      type: 'Triangle',
      description: 'Smooth but snappier than sine',
      harmonics: 'Odd harmonics 1/n²'
    },
    {
      type: 'Saw Up',
      description: 'Slow rise, fast drop',
      harmonics: 'All harmonics'
    },
    {
      type: 'Saw Down',
      description: 'Fast rise, slow drop',
      harmonics: 'All harmonics'
    },
    {
      type: 'Square',
      description: 'Binary on/off modulation',
      harmonics: 'Odd harmonics 1/n'
    },
    {
      type: 'Random S&H',
      description: 'Stepped random values',
      harmonics: 'Pseudo-random spectrum'
    }
  ]
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * clamp — Restrict a number to a given [min, max] range.
 *
 * 范围限制 — 将数值限制在最小值和最大值之间
 *
 * @param value — Input number
 * @param min — Lower bound (inclusive)
 * @param max — Upper bound (inclusive)
 * @returns Clamped value within [min, max]
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
