/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Oscillator Calculator — Synthesizer Voice & Modulation Math
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 *   Provides utility functions for synthesizer programming and oscillator
 *   configuration. These calculations are essential for:
 *
 *   1. DETUNE: Converting pitch-bend cents to Hz offsets for fine-tuning
 *   2. UNISON VOICES: Generating multiple detuned voices for thicker sounds
 *      (the "supersaw" / "detuned saw" effect)
 *   3. FM SYNTHESIS: Calculating carrier/modulator frequencies and sideband
 *      positions for frequency modulation synthesis
 *   4. SUB OSCILLATOR: Generating bass frequencies 1-3 octaves below the
 *      fundamental
 *
 * CORE FORMULA:
 *   f_out = f_base × 2^(cents / 1200)
 *   — 1200 cents = 1 octave = ×2 frequency
 *   — 100 cents = 1 semitone in 12-TET (12-Tone Equal Temperament)
 *   — detuneToHz returns the DIFFERENCE from base frequency
 *
 * MUSICAL THEORY:
 *   Cents are a logarithmic unit of pitch interval.
 *   1 cent = 1/100 of a semitone = 1/1200 of an octave.
 *   Human pitch perception is logarithmic (familiar "mel" scale).
 *   The cent scale is linear in log-frequency, so it maps cleanly to
 *   human hearing and allows simple additive interval arithmetic.
 *
 * @example
 *   import { detuneToHz } from './oscillatorCalculator'
 *   detuneToHz(440, 100)  // → ~26.16 (one semitone up from A4 = ~B4)
 */

/**
 * detuneToHz — Convert a cent value to a frequency offset in Hz.
 *
 * 音程のセント値を周波数オフセット (Hz) に変換します。
 * Converts a pitch interval in cents to an absolute frequency offset.
 *
 * The formula computes the frequency difference between the base frequency
 * and the detuned target:
 *   offset = baseFreq × 2^(cents / 1200) - baseFreq
 *
 * At 0¢ the offset is always 0Hz (no detune).
 * At baseFreq=0 the offset is always 0Hz (no sound to detune).
 * Positive cents → positive offset (higher pitch).
 * Negative cents → negative offset (lower pitch).
 *
 * @param baseFreq — The reference frequency in Hz. Can be 0 (returns 0).
 *                   通常は A4=440Hz を基準とします。
 *                   Typically referenced to A4 = 440Hz.
 * @param cents — Pitch deviation in cents. 1 cent = 1/100 semitone.
 *                Range: typically -1200 to +1200 (one octave).
 * @returns Frequency offset in Hz. Positive = above base, negative = below.
 *
 * @example
 *   detuneToHz(440, 0)         // → 0 (no detune)
 *   detuneToHz(440, 100)       // → ~26.16 (one semitone up ≈ B4)
 *   detuneToHz(440, -50)       // → ~-12.53 (quarter-tone down)
 *   detuneToHz(0, 100)         // → 0 (no base frequency to detune)
 *
 * @see https://en.wikipedia.org/wiki/Cent_(music) — Cent definition
 */
export function detuneToHz(baseFreq: number, cents: number): number {
  // ベース周波数が0の場合、デチューンする音が存在しないため0を返す
  // If base frequency is 0, there is no sound to detune — return 0
  if (baseFreq === 0) return 0

  // セント→周波数比の計算: ratio = 2^(cents/1200)
  // Convert cents to frequency ratio using the standard equal-temperament formula
  // 1200 cents = 1 octave → ratio of exactly 2.0
  const ratio = Math.pow(2, cents / 1200)

  // オフセット = 基準周波数 × (比率 - 1)
  // The offset is the difference between the detuned frequency and the base
  return baseFreq * ratio - baseFreq
}

/**
 * UnisonVoice — A single voice in a detuned unison stack.
 *
 * ユニゾンボイス — デチューンされたボイススタック内の1声。
 * Each voice has a 1-based index, a detune value in cents, and the
 * resulting absolute frequency when applied to A4 = 440Hz.
 */
export interface UnisonVoice {
  /** 1-based voice index (1 = first voice, 2 = second, etc.) */
  voice: number
  /**
   * Detune offset in cents from the root pitch.
   * ルートピッチからのセント単位のデチューン量。
   * 0 = in tune, negative = flat, positive = sharp.
   */
  detuneCents: number
  /**
   * Resulting frequency at A4=440Hz after applying detune.
   * A4=440Hz にデチューンを適用した結果の周波数。
   * Formula: 440 × 2^(detuneCents / 1200)
   */
  frequency: number
}

/**
 * unisonVoices — Generate detune values for N unison voices.
 *
 * ユニゾンボイスのデチューン値を生成します。
 * Creates a set of evenly distributed detuned voices around the center
 * pitch to create a thicker, richer sound. This is the classic "supersaw"
 * or "detuned oscillator" effect used extensively in electronic music.
 *
 * DISTRIBUTION RULES:
 *   — ODD count (e.g., 3): Center voice is perfectly in tune (0¢).
 *     Side voices are evenly spaced on each side.
 *     E.g., 3 voices spread 20¢ = [-10, 0, +10]
 *   — EVEN count (e.g., 4): No center voice; all voices are paired
 *     symmetrically around 0, skipping 0.
 *     E.g., 4 voices spread 20¢ = [-15, -5, +5, +15]
 *
 * THEORY:
 *   The human ear perceives slightly detuned voices as a single, richer
 *   timbre due to the "fusion" property of the auditory system. This is
 *   the same principle behind choir and string section detuning.
 *
 * @param count — Number of unison voices (1–16). If < 1, returns [].
 *                奇数なら中央に同音、偶数なら0を飛ばして対称配置。
 * @param spreadCents — Total spread in cents (0–100). Half applied to
 *                      each side of center.
 *                      スプレッド幅。±spread/2 の範囲に分布。
 * @returns Array of UnisonVoice objects sorted by detune (low to high).
 *
 * @example
 *   unisonVoices(1, 20)   // → [{voice: 1, detuneCents: 0, frequency: 440}]
 *   unisonVoices(3, 20)   // → [{voice:1, -10¢}, {voice:2, 0¢}, {voice:3, +10¢}]
 *   unisonVoices(4, 20)   // → [{voice:1, -15¢}, {voice:2, -5¢}, {voice:3, +5¢}, {voice:4, +15¢}]
 *   unisonVoices(0, 20)   // → []
 */
export function unisonVoices(
  count: number,
  spreadCents: number
): UnisonVoice[] {
  // ボイス数が1未満なら空配列を返す（無効な入力）
  // No voices requested — return empty array
  if (count < 1) return []

  // 入力値を許容範囲にクランプ
  // Clamp inputs to valid ranges:
  //   count: 1–16 (synthesizers rarely need more than 16 unison voices)
  //   spreadCents: 0–100 (beyond 100¢ sounds out of tune rather than "thick")
  const clampedCount = Math.min(16, count)
  const clampedSpread = Math.max(0, Math.min(100, spreadCents))

  const voices: UnisonVoice[] = []
  const A4 = 440 // A4 = 440Hz を基準周波数とする / Reference frequency

  // ボイスが1つだけの場合は中央（0¢）のみ
  // Single voice — always centered at 0¢ detune
  if (clampedCount === 1) {
    voices.push({ voice: 1, detuneCents: 0, frequency: A4 })
    return voices
  }

  // 奇数 / Even count — center at 0, sides evenly spaced
  // 奇数 / Even count — center at 0, sides evenly spaced
  // Note: TypeScript branded type would be overkill here since
  // the parity check IS the discriminant — no enum needed.
  const isEven = clampedCount % 2 === 0

  // 奇数：step = spread / (count - 1)、偶数：step = 2 * spread / count
  // These formulas ensure the outermost voices are exactly at ±spreadCents/2
  // for odd counts (voice at center), but extend beyond for even counts
  // (no center voice, so gaps push outward).
  //
  // 奇数配置の考え方:
  //   中央のボイスを0¢として、両側に等間隔で配置。
  //   ステップ = spread / (count - 1) で計算。
  //   例: count=3, spread=20 → step=10 → [-10, 0, +10]
  //
  // 偶数配置の考え方:
  //   中央を飛ばして、0を挟んだ対称位置に配置。
  //   外側のボイスは奇数時よりも遠くに配置される。
  //   例: count=4, spread=20 → step=2*20/4=10 → [-15, -5, +5, +15]
  //
  // Odd distribution:
  //   Center voice at 0¢, evenly spaced on both sides.
  //   Step = spread / (count - 1).
  //
  // Even distribution:
  //   No center voice — pairs symmetric around 0.
  //   Step = 2 * spread / count.
  //   Outer voices land farther than the half-spread boundary.
  const step = isEven
    ? (2 * clampedSpread) / clampedCount
    : clampedSpread / (clampedCount - 1)

  // (count - 1) / 2 = the index offset that centers the distribution on 0
  // For count=4: offset = 1.5, for count=3: offset = 1.0
  const offset = (clampedCount - 1) / 2

  for (let i = 0; i < clampedCount; i++) {
    const voiceIndex = i + 1 // 1-based voice numbering / 1始まりのボイス番号
    // step === 0 の場合、全ボイスが同調（0¢）で、JSの -0 問題を防ぐ
    // When step is 0, all voices are in tune (0¢). Explicit 0 prevents JS -0.
    const detuneCents = step === 0 ? 0 : (i - offset) * step
    // セント→周波数変換: f = 440 × 2^(cents / 1200)
    // Convert detune cents to absolute frequency at A4=440Hz
    const frequency = A4 * Math.pow(2, detuneCents / 1200)

    voices.push({ voice: voiceIndex, detuneCents, frequency })
  }

  return voices
}

/**
 * FmParams — Result of an FM ratio calculation.
 *
 * FMシンセシスパラメータ — FM合成の計算結果。
 * Contains the carrier frequency, modulator frequency, and the
 * generated sideband frequencies.
 */
export interface FmParams {
  /**
   * Carrier frequency in Hz (the main oscillator).
   * 搬送波の周波数 — メインの発振器（音として聞こえる基本周波数）。
   */
  carrier: number

  /**
   * Modulator frequency in Hz (modulates the carrier's pitch).
   * 変調波の周波数 — 搬送波のピッチを変調する発振器。
   * Formula: carrierFreq × modulatorRatio
   */
  modulator: number

  /**
   * Sideband frequencies in Hz, generated at carrier ± n × modulator.
   * サイドバンド周波数 — 搬送波 ± n × 変調波で生成される倍音群。
   * These are the spectral components that give FM synthesis its
   * distinctive harmonic character.
   *
   * FM THEORY:
   *   When a modulator (fm) modulates a carrier (fc), the output spectrum
   *   contains sidebands at fc ± n×fm for n = 1, 2, 3, ...
   *   The number and amplitude of audible sidebands depends on the
   *   modulation index. We compute the first 4 pairs (n=1..4).
   *
   *   Negative frequencies (< 20Hz, subsonic) are filtered out.
   *   可聴域外 (< 20Hz) のサイドバンドは除去されます。
   */
  sidebands: number[]
}

/**
 * fmRatio — Calculate FM synthesis parameters from carrier & modulator ratio.
 *
 * FMシンセシスのパラメータ（搬送波、変調波、サイドバンド）を計算します。
 *
 * FM (Frequency Modulation) synthesis works by using one oscillator
 * (the modulator) to modulate the frequency of another (the carrier).
 * This produces a complex harmonic spectrum (sidebands) that is much
 * richer than a simple sine wave.
 *
 * This function calculates the FREQUENCY positions of the operator
 * oscillators and their sidebands, NOT their amplitudes (which require
 * Bessel function evaluation based on the modulation index).
 *
 * @param carrierFreq — Carrier oscillator frequency in Hz (the "main" tone)
 * @param modulatorRatio — Ratio of modulator to carrier frequency.
 *                         変調波の周波数比（搬送波に対する比率）。
 *                         Range: 0.1–8.
 *                         1 = same pitch (produces odd+even harmonics).
 *                         2 = one octave above (produces only odd harmonics).
 * @param modIndex — Modulation index (0–10). Controls sideband amplitude.
 *                   変調指数。サイドバンドの振幅（音量）を制御。
 *                   Higher values = more prominent sidebands / brighter timbre.
 *                   NOTE: This parameter is accepted for API completeness
 *                   but does not affect frequency calculation — frequency
 *                   positions depend only on carrier/modulator ratio.
 * @returns FmParams with carrier, modulator, and sideband frequencies.
 *
 * @example
 *   fmRatio(440, 1, 1)
 *   // → { carrier: 440, modulator: 440, sidebands: [880, 1320, 1760, 2200] }
 *   //   (subsonic sidebands 0, -440, -880, -1320 are filtered)
 *
 *   fmRatio(440, 2, 0.5)
 *   // → { carrier: 440, modulator: 880, sidebands: [1320, 2200, 3080, 3960] }
 *
 * @see https://en.wikipedia.org/wiki/Frequency_modulation_synthesis
 */
export function fmRatio(
  carrierFreq: number,
  modulatorRatio: number,
  modIndex: number
): FmParams {
  // 入力を許容範囲にクランプ
  // modulatorRatio: 0.1–8 (extreme ratios produce inharmonic/ring-mod-like timbres)
  // modIndex is accepted but unused in frequency calculation — see JSDoc
  const clampedRatio = Math.max(0.1, Math.min(8, modulatorRatio))

  const carrier = carrierFreq
  // 変調波周波数 = 搬送波 × 比
  // Modulator frequency = carrier × ratio
  const modulator = carrierFreq * clampedRatio

  // サイドバンド: carrier ± n × modulator (n = 1..4)
  // Generate 4 pairs of sideband frequencies
  // FM theory: a sine wave modulated by another sine wave produces
  // an infinite series of sidebands at fc ± n×fm for n = 1, 2, 3, ...
  const sidebands: number[] = []
  for (let n = 1; n <= 4; n++) {
    const lower = carrier - n * modulator
    const upper = carrier + n * modulator

    // 可聴域外 (< 20Hz) のサイドバンドは除去
    // Filter out subsonic sidebands — frequencies below 20Hz are inaudible
    // to humans regardless of the speaker system
    if (lower >= 20) sidebands.push(lower)
    if (upper >= 20) sidebands.push(upper)
  }

  return { carrier, modulator, sidebands }
}

/**
 * subOscillator — Calculate sub-oscillator frequency from a fundamental.
 *
 * サブオシレーターの周波数を計算します。
 * A sub-oscillator generates a pitch 1, 2, or 3 octaves below the
 * main oscillator, adding weight and depth to the sound — especially
 * useful for bass patches and lead synths.
 *
 * FORMULA:
 *   result = freq / 2^octavesDown
 *
 * Each octave down = frequency halving:
 *   — 1 octave down = ÷2
 *   — 2 octaves down = ÷4
 *   — 3 octaves down = ÷8
 *
 * @param freq — Fundamental frequency in Hz (the main oscillator's pitch)
 *               基本周波数（メインオシレーターのピッチ）
 * @param octavesDown — Number of octaves below the fundamental.
 *                      1, 2, or 3. Only values 1–3 are accepted.
 *                      下に何オクターブか (1/2/3)。
 * @returns Sub-oscillator frequency in Hz, or 0 if input is invalid.
 *
 * @example
 *   subOscillator(440, 1)   // → 220 (A3 — one octave below A4)
 *   subOscillator(440, 2)   // → 110 (A2 — two octaves below)
 *   subOscillator(440, 3)   // → 55 (A1 — three octaves below)
 *   subOscillator(0, 1)     // → 0 (invalid: no frequency to halve)
 *   subOscillator(440, 0)   // → 0 (invalid: must be at least 1 octave)
 *   subOscillator(440, 5)   // → 0 (invalid: max 3 octaves down)
 */
export function subOscillator(freq: number, octavesDown: number): number {
  // 周波数が0以下、またはオクターブ数が範囲外なら0を返す
  // Invalid inputs produce no output:
  //   — freq ≤ 0: no sound wave to divide
  //   — octavesDown outside 1–3: unsupported range (practical synths
  //     rarely subdivide more than 3 octaves)
  if (freq <= 0 || octavesDown < 1 || octavesDown > 3) return 0

  // 周波数を 2^octavesDown で割る (1オクターブ下 = ÷2)
  // Divide frequency by 2^octavesDown
  // Each octave halves the frequency: f/2, f/4, f/8
  return freq / Math.pow(2, octavesDown)
}
