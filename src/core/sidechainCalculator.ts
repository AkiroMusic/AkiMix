/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Sidechain Calculator — Pump Timing, Release Curves, Crossover Frequencies
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 *   Provides utility functions for SIDECHAIN compressor / volume-shaping
 *   calculations. Sidechaining is the most iconic electronic-music mixing
 *   technique — it "ducks" one sound (e.g., a pad) in response to another
 *   (e.g., the kick drum), creating the signature "pumping" effect.
 *
 *   SIDECHAIN CONCEPTS (侧链概念):
 *
 *   1. PUMP ENVELOPE (泵送包络):
 *      Each kick-hit triggers an envelope that shapes the sidechained
 *      signal's volume. The envelope has three segments:
 *
 *        ATTACK  — Gain drops to silence  (volume drops → "duck")
 *        HOLD    — Stays quiet             (pump sustain)
 *        RELEASE — Recover to full volume   (gain恢复)
 *
 *      The 10/20/70% split (A/H/R) is a club-tested formula: the
 *      attack is snappy, the hold gives the kick space, the release
 *      is smooth enough to be musical.
 *      10/20/70% 比例是经过舞曲验证的行业标准。
 *
 *   2. RELEASE CURVE (释放曲线):
 *      HOW the gain recovers during the release phase shapes the
 *      feel of the pump — logarithmic = natural VCA duck,
 *      exponential = aggressive EDM pump, linear = neutral.
 *      不同的释放曲线决定了 pumping 听感是"自然"还是"激进"。
 *
 *   3. MULTIBAND CROSSOVER (多频段分频):
 *      Split-band sidechain lets you duck only the low frequencies
 *      while keeping highs intact — so the pad doesn't "wobble"
 *      when the kick hits. Standard crossover points are at 80Hz,
 *      100Hz, 250Hz, 300Hz, 800Hz.
 *      多频段侧链只压缩低频区域，保留高频连续性。
 *
 * @module sidechainCalculator
 */

/**
 * PUMP_ENVELOPE_PROPORTIONS — The A/H/R split of a sidechain pump cycle.
 *
 * These ratios represent the club-standard duck envelope used in house,
 * techno, and EDM production. The attack is a quick 10% volume drop,
 * hold gives 20% space for the kick transient, and release is a
 * smooth 70% recovery.
 * 这是 House/Techno/EDM 制作中标准的侧链泵送包络比例。
 */
const PUMP_ENVELOPE_PROPORTIONS = {
  attack: 0.1,
  hold: 0.2,
  release: 0.7
} as const

/**
 * CROSSOVER_TABLE — Standard multiband crossover frequencies.
 *
 * These frequencies are industry-standard split points derived from
 * decades of loudspeaker crossover design and studio monitor tuning:
 *
 *   - 2-band: 100Hz      → sub vs. everything else
 *   - 3-band: 100/300Hz  → sub / low-mid / mid-high
 *   - 4-band: 80/250/800Hz → sub / low / mid / high
 *
 * 这些分频点是专业音响工程中验证过的标准值。
 */
const CROSSOVER_TABLE: Record<number, number[]> = {
  2: [100],
  3: [100, 300],
  4: [80, 250, 800]
} as const

/**
 * NOTE_VALUE_FACTORS — Mapping from note-name strings to beat-length factors.
 *
 * Each factor represents the note length as a fraction of a quarter note:
 *   'quarter'      = 1       (1 beat)
 *   '8th'          = 0.5     (half a beat)
 *   '16th'         = 0.25    (quarter beat)
 *   '8th triplet'  = 1/3     (three notes fitting in one beat)
 *
 * These factors are used to calculate time intervals from tempo.
 * 这些音符时值因子用于从 BPM 计算时间间隔。
 */
const NOTE_VALUE_FACTORS: Record<string, number> = {
  quarter: 1,
  '8th': 0.5,
  '16th': 0.25,
  '8th triplet': 1 / 3
} as const

/**
 * clamp — Constrain a number between min and max.
 *
 * @param value — Number to clamp
 * @param min — Lower bound (inclusive)
 * @param max — Upper bound (inclusive)
 * @returns The clamped value
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * round1 — Round to 1 decimal place.
 *
 * Matches the rounding style used across the codebase
 * (e.g., bpmCalculator's getNormalDelays).
 *
 * @param value — Raw float
 * @returns Value rounded to 1 decimal place
 */
function round1(value: number): number {
  return parseFloat(value.toFixed(1))
}

/**
 * pumpTiming — Calculate sidechain pump envelope timing.
 *
 * Given a BPM and note division factor, computes the total pump cycle
 * length and its three segments (attack, hold, release).
 *
 * SIDECHAIN CONTEXT (侧链上下文):
 *   When the kick hits, the sidechain compressor lowers the volume of
 *   the target track. The pump envelope describes this volume dip and
 *   recovery. Timing it to the beat grid (via BPM) makes the pumping
 *   feel musical and locked to the groove.
 *   将侧链包络与 BPM 同步，可以使 pumping 效果与节拍对齐，听起来更有音乐性。
 *
 * PROPORTIONS:
 *   Attack  = 10%  — Quick volume drop (快速压降)
 *   Hold    = 20%  — Sustain silence (保持静音)
 *   Release = 70%  — Smooth recovery (平滑恢复)
 *
 * @param bpm — Beats per minute. If ≤ 0, returns all zeros.
 *              Clamped to 20-300 range (reasonable tempo bounds).
 * @param noteDivFactor — Note division as a fraction of a quarter note:
 *                        1 = quarter note, 0.5 = 8th note, 2 = half note, etc.
 *                        Clamped to 0.0625-4 (64th note to whole note).
 * @returns An object with:
 *   - totalMs:   Full pump cycle duration in milliseconds
 *   - attackMs:  Time for gain to drop to minimum (10% of total)
 *   - holdMs:    Time gain stays at minimum (20% of total)
 *   - releaseMs: Time for gain to recover to full (70% of total)
 *   All values are rounded to 1 decimal place.
 *
 * @example
 *   // Quarter-note pump at 120 BPM
 *   pumpTiming(120, 1)
 *   // → { totalMs: 500, attackMs: 50, holdMs: 100, releaseMs: 350 }
 *
 *   // Eighth-note pump at 128 BPM
 *   pumpTiming(128, 0.5)
 *   // → { totalMs: 234.4, attackMs: 23.4, holdMs: 46.9, releaseMs: 164.1 }
 *
 *   // Invalid BPM
 *   pumpTiming(0, 1)
 *   // → { totalMs: 0, attackMs: 0, holdMs: 0, releaseMs: 0 }
 */
export function pumpTiming(
  bpm: number,
  noteDivFactor: number
): { totalMs: number; attackMs: number; holdMs: number; releaseMs: number } {
  // BPM ≤ 0 is invalid — no tempo, no pump
  if (bpm <= 0) {
    return { totalMs: 0, attackMs: 0, holdMs: 0, releaseMs: 0 }
  }

  // Clamp inputs to reasonable production bounds
  const safeBpm = clamp(bpm, 20, 300)
  const safeFactor = clamp(noteDivFactor, 0.0625, 4)

  // Total pump cycle = one note-length division
  // 60000ms in a minute ÷ BPM × note factor = ms for that note duration
  const totalMs = 60000 / safeBpm * safeFactor

  // Split the cycle into three phases at fixed ratios
  const attackMs = totalMs * PUMP_ENVELOPE_PROPORTIONS.attack
  const holdMs = totalMs * PUMP_ENVELOPE_PROPORTIONS.hold
  const releaseMs = totalMs * PUMP_ENVELOPE_PROPORTIONS.release

  return {
    totalMs: round1(totalMs),
    attackMs: round1(attackMs),
    holdMs: round1(holdMs),
    releaseMs: round1(releaseMs)
  }
}

/**
 * releaseCurve — Generate a gain recovery curve for the release phase.
 *
 * Produces an array of gain values (0 → 1) that describe how the
 * sidechained signal recovers its full volume during the release segment.
 *
 * SIDECHAIN CONTEXT (侧链曲线):
 *   The RELEASE CURVE defines the "feel" of the pump:
 *
 *   LINEAR (线性)       — Equal gain steps. Neutral, predictable.
 *                         Neutral,适用于透明压缩场景。
 *
 *   LOGARITHMIC (对数)  — Fast initial recovery that slows down.
 *                         Simulates a classic analog VCA compressor
 *                         (e.g., dbx 160). Natural-sounding duck.
 *                         模拟经典模拟 VCA 压缩器的自然恢复特性。
 *
 *   EXPONENTIAL (指数)  — Slow initial recovery that snaps up at the end.
 *                         Creates the aggressive "EDM pump" sound where
 *                         the volume stays ducked and suddenly pops back.
 *                         EDM 风格的激进泵送效果，音量被压制后突然弹回。
 *
 * FORMULAS:
 *   linear:       p_i = i / (n - 1)
 *   logarithmic:  p_i = log10(1 + 9 × i / (n - 1))
 *   exponential:  p_i = (i / (n - 1))²
 *   where n = points, i = 0-based index
 *
 * @param releaseMs — Duration of the release phase in ms (used for metadata,
 *                    not curve shape — kept for API consistency).
 * @param curveType — The shape of the recovery curve:
 *                    'linear' | 'logarithmic' | 'exponential'
 * @param points — How many gain values to generate.
 *                 If < 2, returns []. If > 100, clamped to 100.
 * @returns Array of gain values from 0 (fully ducked) to 1 (fully recovered).
 *          Length equals clamped points value.
 *
 * @example
 *   releaseCurve(350, 'linear', 5)
 *   // → [0, 0.25, 0.5, 0.75, 1]
 *
 *   releaseCurve(350, 'logarithmic', 5)
 *   // → [0, 0.292, 0.511, 0.699, 1]
 *
 *   releaseCurve(350, 'exponential', 5)
 *   // → [0, 0.063, 0.25, 0.563, 1]
 *
 *   releaseCurve(350, 'linear', 1)
 *   // → []
 */
export function releaseCurve(
  releaseMs: number,
  curveType: 'linear' | 'logarithmic' | 'exponential',
  points: number
): number[] {
  // Not enough points to form a curve
  if (points < 2) return []

  // Cap to prevent excessively large arrays
  const safePoints = Math.min(points, 100)

  const result: number[] = []
  const maxIndex = safePoints - 1

  for (let i = 0; i < safePoints; i++) {
    // Normalized position within the curve: 0.0 → 1.0
    const t = i / maxIndex

    let value: number

    switch (curveType) {
      case 'linear':
        // Equal steps: volume recovers at constant rate
        // 线性：音量以恒定速率恢复
        value = t
        break

      case 'logarithmic': {
        // Fast initial recovery, then gradual slowdown
        // log10(1 + 9t) maps 0→0 and 1→1 with log curvature
        // 对数曲线：先快后慢，模拟 VCA 自然恢复特性
        value = Math.log10(1 + 9 * t)
        break
      }

      case 'exponential':
        // Slow initial recovery that snaps up at the end
        // t² maps 0→0 and 1→1 with exponential curvature
        // 指数曲线：先慢后快，产生 EDM 激进泵送感
        value = t * t
        break
    }

    result.push(value)
  }

  return result
}

/**
 * multibandCrossovers — Get standard crossover frequencies for split-band sidechain.
 *
 * Returns the industry-standard crossover points used to split the frequency
 * spectrum for multiband sidechain compression.
 *
 * SIDECHAIN CONTEXT (多频段侧链):
 *   Instead of ducking the ENTIRE frequency range of a track, split-band
 *   sidechain only compresses the low frequencies (where the kick lives).
 *   This means your pad or bassline's high frequencies stay audible while
 *   the sub region ducks — preserving clarity and musicality.
 *   多频段侧链只压缩低频区域（底鼓所在频段），保留中高频的连续性，
 *   避免整轨 pumping 时高频产生不必要的晃动感。
 *
 * CROSSOVER POINTS (分频点):
 *   2 bands:  100Hz       — Sub (0-100Hz) vs. everything else
 *   3 bands:  100Hz, 300Hz — Sub / Low-mid / Mid-high
 *   4 bands:  80Hz, 250Hz, 800Hz — Sub / Low / Mid / High
 *
 * @param bands — Number of bands (1-4).
 *                bands=1 returns [] (full range, no crossover).
 *                bands < 1 or > 4 returns [].
 * @returns Array of { band, crossoverHz } objects ordered by band index.
 *          band indices are 1-based. Empty array for invalid counts.
 *
 * @example
 *   multibandCrossovers(1)  // → []
 *   multibandCrossovers(2)  // → [{ band: 1, crossoverHz: 100 }]
 *   multibandCrossovers(3)
 *   // → [{ band: 1, crossoverHz: 100 }, { band: 2, crossoverHz: 300 }]
 *   multibandCrossovers(5)  // → []
 */
export function multibandCrossovers(bands: number): { band: number; crossoverHz: number }[] {
  // Only 2-4 bands have standard crossover points defined
  if (bands < 2 || bands > 4) return []

  const freqs = CROSSOVER_TABLE[bands]
  if (!freqs) return []

  // Each frequency becomes a band boundary. Band index is 1-based.
  // freqs[i] is the crossover between band i and band i+1
  return freqs.map((hz, i) => ({
    band: i + 1,
    crossoverHz: hz
  }))
}

/**
 * kickLengthMs — Calculate the ideal kick tail length based on tempo.
 *
 * Determines how long a kick drum's tail (decay) should last to fit
 * the tempo without overlapping the next kick.
 *
 * SIDECHAIN CONTEXT (侧链与底鼓):
 *   The kick drum defines the rhythm. Its length determines how much
 *   space the sidechain has to duck and recover. A longer kick tail
 *   means a longer pump cycle. Matching the kick length to a note
 *   division keeps the groove tight and the pumping musical.
 *   底鼓长度决定了侧链泵送的频率范围 — 底鼓越长，侧链释放越慢。
 *   将底鼓长度与音符时值对齐，可以保持节奏紧密。
 *
 * @param bpm — Beats per minute. If ≤ 0, returns 0.
 * @param noteValue — Note name string. Supported values:
 *                    'quarter' (factor 1), '8th' (0.5), '16th' (0.25),
 *                    '8th triplet' (1/3 ≈ 0.333).
 *                    If unrecognized, defaults to 'quarter'.
 * @returns Kick tail length in milliseconds, rounded to 1 decimal.
 *          0 if BPM ≤ 0.
 *
 * @example
 *   kickLengthMs(120, 'quarter')       // → 500
 *   kickLengthMs(120, '8th')           // → 250
 *   kickLengthMs(120, '16th')          // → 125
 *   kickLengthMs(120, '8th triplet')   // → 166.7
 *   kickLengthMs(0, 'quarter')         // → 0
 */
export function kickLengthMs(bpm: number, noteValue: string): number {
  // No tempo = no meaningful length
  if (bpm <= 0) return 0

  // Factor defaults to quarter note if the note value isn't recognized
  const factor = NOTE_VALUE_FACTORS[noteValue] ?? NOTE_VALUE_FACTORS['quarter']

  // Same core formula: 60000 / BPM * duration factor
  const ms = 60000 / bpm * factor

  return round1(ms)
}
