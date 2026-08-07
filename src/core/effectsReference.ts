/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Effects Reference — Reverb, Delay, Distortion Data Tables
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 *   Provides production reference data for common audio effects — reverb
 *   spaces, BPM-synced delay times, distortion types, and delay feedback
 *   decay calculations. These tables serve as quick lookup references for
 *   mixing and sound design decisions.
 *
 * SOUND DESIGN CONTEXT:
 *   效果器参考数据 — 为混音和音色设计提供快速查找的参考表格
 *   Each function returns curated, mix-engineer-vetted data rather than
 *   computed-from-formula values, grounded in real-world studio practice.
 *   The exception is delayBpmSync() and delayFeedbackStaging(), which ARE
 *   formula-driven but present the output as ready-to-use reference tables.
 *
 * DATA SOURCES:
 *   Values are derived from:
 *     - Industry-standard reverb hardware (Lexicon 480L, EMT 140/250)
 *     - Published sound design references (see sound-design-reference.md)
 *     - Common mixing engineer practices for delay sync & feedback staging
 *
 * @example
 *   import { reverbBySpace, delayBpmSync } from './effectsReference'
 *   const spaces = reverbBySpace()
 *   const delays = delayBpmSync(128)
 */

// =============================================================================
// Type Definitions
// =============================================================================

/** A single reverb space preset — room size, decay time, density */
export interface ReverbSpaceEntry {
  /** Display name for the space (e.g., 'Small Room', 'Cathedral') */
  space: string
  /**
   * RT60 — the time in milliseconds for reverb to decay by 60dB.
   * 混响衰减时间 — 声音衰减 60dB 所需的时间（毫秒）
   * Larger spaces = longer RT60 values.
   */
  rt60Ms: number
  /**
   * Pre-delay in milliseconds — gap between dry signal and reverb onset.
   * 预延迟 — 干信号与混响开始之间的时间间隔
   * Longer pre-delay = perception of a larger physical space.
   */
  preDelayMs: number
  /**
   * Density of the reverb tail — 'Low', 'Medium', or 'High'.
   * 密度 — 混响尾音的密度
   * Higher density = smoother, more diffuse decay.
   * Plate reverbs are Low (smooth but sparse early reflections),
   * Hall/Cathedral are High (dense, enveloping).
   */
  density: string
  /**
   * Human-readable description of the space's character.
   * 空间特性的文字描述
   */
  description: string
}

/** A BPM-synced delay timing entry */
export interface DelaySyncEntry {
  /** Readable label (e.g., 'Quarter', 'Dotted 8th') */
  label: string
  /** Note division as a string (e.g., '1/1', '3/4') */
  noteDiv: string
  /** Delay time in milliseconds, rounded to 1 decimal place */
  ms: number
  /** Common genre/style usage hint for this timing */
  commonIn: string
}

/** A distortion type reference entry */
export interface DistortionTypeEntry {
  /** Distortion type name (e.g., 'Soft Clip', 'Tube (Triode)') */
  type: string
  /** Which harmonics are emphasized by this distortion type */
  harmonicProfile: string
  /** Description of the transfer curve shape */
  transferDescription: string
  /** Typical THD (Total Harmonic Distortion) range */
  thdRange: string
  /** Common musical/production applications */
  commonUse: string
}

/** Delay feedback staging result — repeats until silence and character */
export interface FeedbackStagingResult {
  /**
   * Number of audible repeats before the delay decays 60dB below the
   * original signal. Capped at 200 for practical purposes.
   * 延迟重复次数 — 在衰减 60dB 之前的可听重复次数
   */
  repeatsMinus60dB: number
  /**
   * Text description of the feedback character (e.g., 'Classic echo',
   * 'Near-infinite'). Maps from the repeat count range.
   * 反馈特性描述 — 基于重复次数的文字描述
   */
  character: string
}

// =============================================================================
// Reverb Reference Data
// =============================================================================

/**
 * reverbBySpace — Get reverb reference data for all modeled space types.
 *
 * 根据空间类型获取混响参考数据
 *
 * Returns 9 space presets ranging from tight closets to massive cathedrals
 * and algorithmic reverbs (plate, spring, shimmer). Each entry includes:
 *   - RT60: decay time in ms (how long the reverb lingers)
 *   - Pre-delay: ms before first reflections arrive
 *   - Density: text description of tail density (Low / Medium / High)
 *   - Description: character note for quick reference
 *
 * APPLICATIONS:
 *   空间类型	适用场景
 *   Closet/Tight	Tight vocal ambience, drum room
 *   Small Room	Intimate acoustic instruments
 *   Medium Room	Versatile general-purpose reverb
 *   Large Hall	Orchestral, cinematic, piano
 *   Cathedral	Ambient pads, epic builds
 *   Plate	Vocals (THE classic vocal reverb), snare
 *   Spring	Guitar amps, dub, reggae
 *   Chamber	Orchestra, classical recordings
 *   Shimmer	Ambient, post-rock, ethereal textures
 *
 * @returns An array of 9 ReverbSpaceEntry objects, one per space type,
 *          ordered from smallest/driest to largest/most diffuse.
 *
 * @example
 *   const reverbs = reverbBySpace()
 *   reverbs[0]  // → { space: 'Closet/Tight', rt60Ms: 150, ... }
 *   reverbs[4]  // → { space: 'Cathedral', rt60Ms: 4500, ... }
 *   reverbs.length  // → 9
 */
export function reverbBySpace(): ReverbSpaceEntry[] {
  return [
    {
      space: 'Closet/Tight',
      rt60Ms: 150,
      preDelayMs: 3,
      density: 'Low',
      description: 'Very small, tight space'
    },
    {
      space: 'Small Room',
      rt60Ms: 450,
      preDelayMs: 8,
      density: 'Medium',
      description: 'Intimate room ambience'
    },
    {
      space: 'Medium Room',
      rt60Ms: 800,
      preDelayMs: 15,
      density: 'Medium',
      description: 'Versatile room sound'
    },
    {
      space: 'Large Hall',
      rt60Ms: 2200,
      preDelayMs: 30,
      density: 'High',
      description: 'Concert hall spaciousness'
    },
    {
      space: 'Cathedral',
      rt60Ms: 4500,
      preDelayMs: 55,
      density: 'High',
      description: 'Massive, epic space'
    },
    {
      space: 'Plate',
      rt60Ms: 1800,
      preDelayMs: 8,
      density: 'Low',
      description: 'Classic analog plate, smooth and dense'
    },
    {
      space: 'Spring',
      rt60Ms: 1200,
      preDelayMs: 3,
      density: 'Low',
      description: 'Bouncy spring reverb, lo-fi character'
    },
    {
      space: 'Chamber',
      rt60Ms: 1600,
      preDelayMs: 18,
      density: 'Medium',
      description: 'Natural stone chamber'
    },
    {
      space: 'Shimmer',
      rt60Ms: 3500,
      preDelayMs: 20,
      density: 'Medium',
      description: 'Ethereal pitched reverb'
    }
  ]
}

// =============================================================================
// BPM-Synced Delay Reference
// =============================================================================

/**
 * DELAY_DIVISIONS — Static factor table for BPM-synced delay calculations.
 *
 * 延迟音符划分及倍率 — BPM 同步延迟计算的基础表格
 *
 * Each entry defines a note division by its musical factor relative to a
 * quarter note (1 beat):
 *   ms = 60000 / BPM * factor
 *
 * FACTORS EXPLAINED:
 *   倍率说明:
 *   Quarter (1):       1 beat     → full quarter note
 *   Dotted 8th (0.75): 3/4 beat  → 8th note + 16th note
 *   8th (0.5):         1/2 beat  → standard eighth
 *   Dotted 16th (0.375): 3/8 beat → swung 16th feel
 *   16th (0.25):       1/4 beat  → standard sixteenth
 *   8th triplet (0.333): 1/3 beat → triplet feel
 *   16th triplet (0.167): 1/6 beat → fast triplet
 */
const DELAY_DIVISIONS: {
  label: string
  noteDiv: string
  factor: number
  commonIn: string
}[] = [
  {
    label: 'Quarter',
    noteDiv: '1/1',
    factor: 1,
    commonIn: 'Ambient, experimental'
  },
  {
    label: 'Dotted 8th',
    noteDiv: '3/4',
    factor: 0.75,
    commonIn: 'Hip-hop, R&B, Trance leads'
  },
  {
    label: '8th',
    noteDiv: '1/2',
    factor: 0.5,
    commonIn: 'House, Techno, Pop'
  },
  {
    label: 'Dotted 16th',
    noteDiv: '3/8',
    factor: 0.375,
    commonIn: 'DnB, fast genres'
  },
  {
    label: '16th',
    noteDiv: '1/4',
    factor: 0.25,
    commonIn: 'House hats, DnB'
  },
  {
    label: '8th triplet',
    noteDiv: '1/3',
    factor: 0.333,
    commonIn: 'Dub, Reggae'
  },
  {
    label: '16th triplet',
    noteDiv: '1/6',
    factor: 0.167,
    commonIn: 'DnB, fast fills'
  }
]

/**
 * delayBpmSync — Generate a BPM-synced delay time reference table.
 *
 * 生成 BPM 同步延迟时间参考表
 *
 * Given a tempo in BPM, calculates the delay time in milliseconds for every
 * standard note division used in music production. This is the essential
 * reference for setting delay effect times that lock to the track's tempo.
 *
 * CORE FORMULA: ms = 60000 / BPM × factor
 *   - 60000 = ms in one minute
 *   - BPM   = beats per minute
 *   - factor = note division's ratio to a quarter note
 *
 * EXAMPLE AT 120 BPM:
 *   Quarter (×1.0):   500ms
 *   8th (×0.5):       250ms
 *   16th (×0.25):     125ms
 *   Dotted 8th (×0.75): 375ms
 *
 * @param bpm — Beats per minute. Must be > 0. Returns empty array for
 *              BPM ≤ 0 (invalid / unknown tempo).
 * @returns Array of 7 DelaySyncEntry objects, each with label, note
 *          division, computed ms (rounded to 1 decimal), and common genre
 *          usage hint. Empty array if BPM ≤ 0.
 *
 * @example
 *   delayBpmSync(120)
 *   // → [
 *   //     { label: 'Quarter', noteDiv: '1/1', ms: 500, commonIn: 'Ambient, experimental' },
 *   //     { label: '8th',     noteDiv: '1/2', ms: 250, commonIn: 'House, Techno, Pop' },
 *   //     ...
 *   //   ]
 *
 *   delayBpmSync(0)   // → []  (BPM ≤ 0)
 */
export function delayBpmSync(bpm: number): DelaySyncEntry[] {
  // BPM ≤ 0 is invalid — return empty table
  if (bpm <= 0) return []

  return DELAY_DIVISIONS.map((div) => {
    // ms = 60000 / BPM * factor, rounded to 1 decimal
    const ms = parseFloat((60000 / bpm * div.factor).toFixed(1))
    return {
      label: div.label,
      noteDiv: div.noteDiv,
      ms,
      commonIn: div.commonIn
    }
  })
}

// =============================================================================
// Distortion Reference Data
// =============================================================================

/**
 * distortionTypes — Get distortion/saturation reference data.
 *
 * 获取失真/饱和效果参考数据
 *
 * Returns 6 distortion types with their harmonic profiles, transfer curve
 * descriptions, typical THD (Total Harmonic Distortion) ranges, and common
 * production uses. Useful for choosing the right distortion when shaping
 * sounds.
 *
 * DISTORTION PRIMER:
 *   失真类型速查:
 *   - Soft Clip:     Gradual saturation, musical even-order harmonics
 *   - Hard Clip:     Aggressive odd-order harmonics, digital harshness
 *   - Tube (Triode): Warm even-order harmonics (2nd, 4th), asymmetric
 *   - Tape Saturation: Console-style odd-order harmonics, compression
 *   - Diode:         Guitar pedal-style asymmetric hard clipping
 *   - Wavefolder:    Extreme harmonic generation, modular synthesis
 *
 * @returns An array of 6 DistortionTypeEntry objects.
 *
 * @example
 *   const types = distortionTypes()
 *   types[0]  // → { type: 'Soft Clip', harmonicProfile: 'Mostly 3rd harmonic', ... }
 *   types[3]  // → { type: 'Tape Saturation', ... }
 */
export function distortionTypes(): DistortionTypeEntry[] {
  return [
    {
      type: 'Soft Clip',
      harmonicProfile: 'Mostly 3rd harmonic',
      transferDescription: 'Gradual saturation curve',
      thdRange: '0.1-5%',
      commonUse: 'Mastering, subtle warmth'
    },
    {
      type: 'Hard Clip',
      harmonicProfile: 'All odd harmonics',
      transferDescription: 'Sharp brick-wall clipping',
      thdRange: '5-30%',
      commonUse: 'Aggressive, lo-fi, bitcrush'
    },
    {
      type: 'Tube (Triode)',
      harmonicProfile: 'Even-dominant (2nd, 4th)',
      transferDescription: 'Asymmetric exponential',
      thdRange: '0.5-15%',
      commonUse: 'Warmth, bass harmonics'
    },
    {
      type: 'Tape Saturation',
      harmonicProfile: 'Odd harmonics (3rd, 5th)',
      transferDescription: 'Soft knee + hysteresis',
      thdRange: '0.5-10%',
      commonUse: 'Mix bus glue, console warmth'
    },
    {
      type: 'Diode',
      harmonicProfile: 'Odd-dominant',
      transferDescription: 'Asymmetric hard clip',
      thdRange: '3-25%',
      commonUse: 'Guitar pedal distortion'
    },
    {
      type: 'Wavefolder',
      harmonicProfile: 'Extreme harmonics to Nyquist',
      transferDescription: 'Triangle foldback',
      thdRange: '10-100%',
      commonUse: 'Modular bass design, EDM'
    }
  ]
}

// =============================================================================
// Delay Feedback Decay Calculator
// =============================================================================

/**
 * FEEDBACK_CHARACTER_RANGES — Map repeat counts to descriptive labels.
 *
 * 反馈特性范围表 — 将重复次数映射为文字描述
 *
 * These ranges describe how a delay FEELS at different feedback levels:
 *   1-2:   Subtle slap     — short, percussive doubling
 *   3-5:   Clean decay     — distinct repeats that fade cleanly
 *   6-10:  Classic echo    — pronounced, musical repeats
 *   11-20: Long tail       — extended decay, ambient
 *   21-50: Very long       — almost infinite, builds up
 *   51-200: Near-infinite  — extreme feedback, wash
 */
function feedbackCharacter(repeats: number): string {
  if (repeats >= 1 && repeats <= 2) return 'Subtle slap'
  if (repeats >= 3 && repeats <= 5) return 'Clean decay'
  if (repeats >= 6 && repeats <= 10) return 'Classic echo'
  if (repeats >= 11 && repeats <= 20) return 'Long tail'
  if (repeats >= 21 && repeats <= 50) return 'Very long'
  return 'Near-infinite'
}

/**
 * delayFeedbackStaging — Calculate delay feedback decay characteristics.
 *
 * 计算延迟反馈衰减特性
 *
 * Given a feedback percentage (0-100), computes how many audible repeats
 * occur before the delay decays 60dB below the original signal, and
 * assigns a character label based on the repeat count.
 *
 * THE FORMULA:
 *   公式: n = log(0.001) / log(feedbackLinear)
 *   - 0.001 = the linear amplitude ratio corresponding to -60dB
 *             (20 * log10(0.001) = -60dB)
 *   - feedbackLinear = feedbackPercent / 100
 *   - n = number of repeats until -60dB decay
 *
 * WHY -60dB?:
 *   在音频工程中，-60dB 通常被认为是"听不见"的阈值
 *   -60dB is the standard threshold for "inaudible" in audio engineering.
 *   The decay from the original to silence spans this 60dB range.
 *
 * EDGE CASES:
 *   边界情况:
 *   - feedbackPercent ≤ 0:    No feedback → 1 repeat, 'No repeats'
 *   - feedbackPercent ≥ 100:  Self-oscillation → 999 repeats, special label
 *   - Otherwise:              Calculate from formula, cap at 200
 *
 * @param feedbackPercent — Feedback amount (0-100). Values ≤ 0 are treated
 *                         as no feedback. Values ≥ 100 indicate self-oscillation.
 * @returns FeedbackStagingResult with repeats (rounded, capped at 200)
 *          and a human-readable character string.
 *
 * @example
 *   delayFeedbackStaging(0)    // → { repeatsMinus60dB: 1,    character: 'No repeats' }
 *   delayFeedbackStaging(50)   // → { repeatsMinus60dB: 10,   character: 'Classic echo' }
 *   delayFeedbackStaging(90)   // → { repeatsMinus60dB: 66,   character: 'Near-infinite' }
 *   delayFeedbackStaging(100)  // → { repeatsMinus60dB: 999,  character: 'Self-oscillation!' }
 */
export function delayFeedbackStaging(feedbackPercent: number): FeedbackStagingResult {
  // Edge case: no feedback
  if (feedbackPercent <= 0) {
    return { repeatsMinus60dB: 1, character: 'No repeats' }
  }

  // Edge case: self-oscillation (100% or more = infinite feedback loop)
  if (feedbackPercent >= 100) {
    return { repeatsMinus60dB: 999, character: 'Self-oscillation!' }
  }

  // Normal calculation
  const feedbackLinear = feedbackPercent / 100
  // n = log(0.001) / log(feedbackLinear)
  // Math.log is natural log (ln), but any base works in this ratio
  const repeats = Math.log(0.001) / Math.log(feedbackLinear)

  // Round to integer and cap at 200
  const capped = Math.min(Math.round(repeats), 200)
  const character = feedbackCharacter(capped)

  return { repeatsMinus60dB: capped, character }
}
