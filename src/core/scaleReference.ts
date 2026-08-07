/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Scale Reference — Musical Scales, Modes & Diatonic Chords
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 *   Provides the building blocks for musical scale and mode generation.
 *   Given a tonic (key) and a mode, it produces the complete scale with note
 *   names, intervals, frequencies, and diatonic chord qualities.
 *
 * WHY THIS EXISTS:
 *   - Songwriters need quick reference: "what notes are in D Dorian?"
 *   - Producers use mode information for chord progression choices
 *   - The frequency data connects music theory directly to audio processing
 *     (EQ notching, instrument layering, harmonic mixing)
 *   - Diatonic chord qualities tell you which triads "belong" to a key
 *
 * MUSICAL BACKGROUND:
 *   - The chromatic scale has 12 equally-spaced notes (semitones)
 *   - A "mode" is a pattern of whole-steps (2 semitones) and half-steps
 *     (1 semitone) that defines a scale's character
 *   - Each mode has a distinct mood: Ionian (happy), Dorian (jazzy),
 *     Phrygian (exotic), Lydian (dreamy), Mixolydian (bluesy),
 *     Aeolian (sad/somber), Locrian (unstable/dissonant)
 *   - The 7 modes correspond to playing a C major scale starting from
 *     each of its 7 notes (C Ionian, D Dorian, E Phrygian, etc.)
 *
 * @example
 *   import { getScale, getChordQualities } from './scaleReference'
 *   getScale('C', 'Ionian')     // → C major scale with frequencies
 *   getScale('A', 'Aeolian')    // → A natural minor (= C Ionian notes)
 *   getChordQualities('Dorian') // → ['Minor','Minor','Major','Major','Minor','Diminished','Major']
 */

/**
 * ScaleNote — A single note within a generated scale.
 *
 * Each entry bridges music theory (note name, degree, interval) with practical
 * audio processing (frequency in Hz) so you can use scale data directly in
 * mixing decisions.
 *
 * @property degree — Scale degree (1-based). 1 = tonic/root of the scale.
 * @property note — Note name with octave, e.g. "C4", "F#3".
 * @property semitoneFromRoot — Semitone distance from the tonic. 0 = unison.
 * @property frequency — Exact frequency in Hz (equal temperament, A4 = 440Hz).
 * @property interval — Quality name, e.g. "Unison", "Major 3rd", "Perfect 5th".
 */
export interface ScaleNote {
  degree: number
  note: string
  semitoneFromRoot: number
  frequency: number
  interval: string
}

/**
 * ALL_KEYS — The 12 chromatic note names in order.
 *
 * Each index 0-11 corresponds to one semitone step in the chromatic scale.
 * Using sharps (#) consistently (enharmonic: C# = Db, D# = Eb, etc.).
 *
 * @example
 *   ALL_KEYS[0]  // 'C'
 *   ALL_KEYS[9]  // 'A'
 */
export const ALL_KEYS: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/**
 * MODES — The 7 diatonic modes.
 *
 * Each mode is a rotation of the major scale pattern. If you play only the
 * white keys on a piano starting from C, you get C Ionian. Start from D
 * you get D Dorian, etc.
 *
 * ORDER: Brightest (most major) to darkest (most minor):
 *   Lydian → Ionian → Mixolydian → Dorian → Aeolian → Phrygian → Locrian
 *
 * @example
 *   MODES[0]  // 'Ionian'
 *   MODES[5]  // 'Aeolian'
 */
export const MODES: string[] = [
  'Ionian',
  'Dorian',
  'Phrygian',
  'Lydian',
  'Mixolydian',
  'Aeolian',
  'Locrian'
]

/**
 * ModeInfo — Helper type documenting a mode's interval pattern.
 * Not exported — used internally for documentation.
 *
 * 半音 (hān-yīn) = semitone = 1 half-step on a piano
 * 全音 (quán-yīn) = whole tone = 2 semitones
 */
interface ModeInfo {
  /** Name of the mode (e.g. "Ionian") */
  name: string
  /** Half-step pattern across the 7 scale degrees */
  pattern: number[]
  /** Common description of the mode's character */
  character: string
  /** Chinese term for the mode's tonal quality */
  tonalQuality: string
}

/**
 * MODE_INTERVALS — Half-step patterns for each of the 7 diatonic modes.
 *
 * Each array has 7 values (one per scale degree), where:
 *   1 = half step (半音 / semitone)
 *   2 = whole step (全音 / whole tone)
 *
 * The sum of each pattern is always 12 (one octave).
 *
 * MODE CHARACTER (Bright → Dark):
 *   Lydian      [2,2,2,1,2,2,1]  — Brightest, #4 creates a dreamy/spacious feel
 *   Ionian      [2,2,1,2,2,2,1]  — Major scale, happy/standard (大调)
 *   Mixolydian  [2,2,1,2,2,1,2]  — Bluesy/rock, b7 gives it a dominant feel
 *   Dorian      [2,1,2,2,2,1,2]  — Jazzy/minor with raised 6th, versatile
 *   Aeolian     [2,1,2,2,1,2,2]  — Natural minor, sad/emotional (小调)
 *   Phrygian    [1,2,2,2,1,2,2]  — Exotic/Spanish, b2 creates tension
 *   Locrian     [1,2,2,1,2,2,2]  — Darkest/unstable, b5 is the tritone
 *
 * @example
 *   MODE_INTERVALS['Ionian']  // → [2,2,1,2,2,2,1]
 *   MODE_INTERVALS['Locrian'] // → [1,2,2,1,2,2,2]
 */
export const MODE_INTERVALS: Record<string, number[]> = {
  /** Ionian (Major Scale / 大调音阶) — Bright, stable, "happy" */
  Ionian: [2, 2, 1, 2, 2, 2, 1],
  /** Dorian (多利亚调式) — Minor with raised 6th, jazzy/bluesy */
  Dorian: [2, 1, 2, 2, 2, 1, 2],
  /** Phrygian (弗里吉亚调式) — Minor with b2, exotic/Mediterranean */
  Phrygian: [1, 2, 2, 2, 1, 2, 2],
  /** Lydian (利底亚调式) — Major with #4, dreamy/spacious */
  Lydian: [2, 2, 2, 1, 2, 2, 1],
  /** Mixolydian (混合利底亚调式) — Dominant scale, bluesy/rock */
  Mixolydian: [2, 2, 1, 2, 2, 1, 2],
  /** Aeolian (爱奥利亚调式 / 小调) — Natural minor, sad/emotional */
  Aeolian: [2, 1, 2, 2, 1, 2, 2],
  /** Locrian (洛克利亚调式) — Diminished/minor with b2b5, unstable */
  Locrian: [1, 2, 2, 1, 2, 2, 2]
}

/**
 * MODE_CHORD_QUALITIES — Diatonic triad chord qualities for each mode.
 *
 * For each mode, the 7 scale degrees produce triads with these qualities:
 *   'Major'      — Root, Major 3rd, Perfect 5th (happy, stable)
 *   'Minor'      — Root, Minor 3rd, Perfect 5th (sad, mellow)
 *   'Diminished' — Root, Minor 3rd, Tritone (tense, unstable)
 *
 * 和弦性质 (hé-xián xìng-zhì) = chord quality
 *   大三和弦 = Major triad
 *   小三和弦 = Minor triad
 *   减三和弦 = Diminished triad
 *
 * PATTERN MEMORY:
 *   Ionian      (M m m M M m d) — Standard major key harmony
 *   Dorian      (m m M M m d M) — Minor i, major bVII (very common in rock)
 *   Phrygian    (m M M m d M m) — Minor i, major bII (flamenco sound)
 *   Lydian      (M M m d M m m) — Major I with diminished ii
 *   Mixolydian  (M m d M m m M) — Major I with diminished iii
 *   Aeolian     (m d M m m M M) — Natural minor harmony
 *   Locrian     (d M m m M M m) — Diminished tonic (rarely used)
 *
 * @example
 *   MODE_CHORD_QUALITIES['Ionian']  // → ['Major','Minor','Minor','Major','Major','Minor','Diminished']
 *   MODE_CHORD_QUALITIES['Aeolian'] // → ['Minor','Diminished','Major','Minor','Minor','Major','Major']
 */
export const MODE_CHORD_QUALITIES: Record<string, string[]> = {
  /** Ionian — Major, Minor, Minor, Major, Major, Minor, Diminished */
  Ionian: ['Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor', 'Diminished'],
  /** Dorian — Minor, Minor, Major, Major, Minor, Diminished, Major */
  Dorian: ['Minor', 'Minor', 'Major', 'Major', 'Minor', 'Diminished', 'Major'],
  /** Phrygian — Minor, Major, Major, Minor, Diminished, Major, Minor */
  Phrygian: ['Minor', 'Major', 'Major', 'Minor', 'Diminished', 'Major', 'Minor'],
  /** Lydian — Major, Major, Minor, Diminished, Major, Minor, Minor */
  Lydian: ['Major', 'Major', 'Minor', 'Diminished', 'Major', 'Minor', 'Minor'],
  /** Mixolydian — Major, Minor, Diminished, Major, Minor, Minor, Major */
  Mixolydian: ['Major', 'Minor', 'Diminished', 'Major', 'Minor', 'Minor', 'Major'],
  /** Aeolian — Minor, Diminished, Major, Minor, Minor, Major, Major */
  Aeolian: ['Minor', 'Diminished', 'Major', 'Minor', 'Minor', 'Major', 'Major'],
  /** Locrian — Diminished, Major, Minor, Minor, Major, Major, Minor */
  Locrian: ['Diminished', 'Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor']
}

/**
 * INTERVAL_NAMES — Map from semitone distance to interval quality name.
 *
 * These names are the standard musical intervals within one octave:
 *   m2 = minor second,  M2 = major second,  m3 = minor third,
 *   M3 = major third,   P4 = perfect fourth, TT = tritone,
 *   P5 = perfect fifth, m6 = minor sixth,   M6 = major sixth,
 *   m7 = minor seventh, M7 = major seventh,  P8 = perfect octave
 */
const INTERVAL_NAMES: Record<number, string> = {
  0: 'Unison',
  1: 'Minor 2nd',
  2: 'Major 2nd',
  3: 'Minor 3rd',
  4: 'Major 3rd',
  5: 'Perfect 4th',
  6: 'Tritone',
  7: 'Perfect 5th',
  8: 'Minor 6th',
  9: 'Major 6th',
  10: 'Minor 7th',
  11: 'Major 7th',
  12: 'Octave'
}

/**
 * keyToIndex — Look up the chromatic index of a key name.
 *
 * @param key — Note name like "C", "F#", "Bb" (Bb → A# internally)
 * @returns Chromatic index 0-11, or -1 if not found
 */
function keyToIndex(key: string): number {
  return ALL_KEYS.indexOf(key)
}

/**
 * modeToMidiBase — Calculate the MIDI note number for the root of a scale.
 *
 * Uses the formula: keyIndex + 48 (anchors at octave 3-4 range).
 * Key index 0 (C) → MIDI 48 (C3 ≈ 130.81Hz)
 * Key index 9 (A) → MIDI 57 (A3 ≈ 220Hz)
 *
 * @param keyIndex — Chromatic index of the tonic key (0-11)
 * @returns MIDI note number for the root
 */
function modeToMidiBase(keyIndex: number): number {
  return keyIndex + 48
}

/**
 * midiToFrequency — Convert MIDI note number to frequency in Hz.
 *
 * Equal temperament formula: f = 440 × 2^((n - 69) / 12)
 *
 * @param midi — MIDI note number
 * @returns Frequency in Hz, rounded to 2 decimal places
 */
function midiToFrequency(midi: number): number {
  return parseFloat((440 * Math.pow(2, (midi - 69) / 12)).toFixed(2))
}

/**
 * getScale — Generate the full scale for a given tonic key and mode.
 *
 * HOW IT WORKS:
 *   1. Find the tonic key's position in the chromatic scale (0-11)
 *   2. Look up the mode's half-step interval pattern
 *   3. Walk through the 7 degrees, accumulating semitones from the root
 *   4. For each degree: compute the note name (wrapping at index 12),
 *      its frequency via the MIDI→Hz formula, and the interval name
 *
 * MIDI ASSIGNMENT:
 *   The root of the scale starts at (keyIndex + 48) which places:
 *   - C Ionian root = MIDI 48 (C3 ≈ 130.81Hz)
 *   - A Aeolian root = MIDI 57 (A3 ≈ 220Hz)
 *   Each subsequent degree adds its semitone offset to this base
 *
 * @param key — Tonic note name, e.g. "C", "G#", "F". Case-sensitive.
 *               Must match an entry in ALL_KEYS.
 * @param mode — Mode name, e.g. "Ionian", "Dorian". Case-sensitive.
 *                Must match an entry in MODES.
 * @returns Array of 7 ScaleNote objects (one per degree), or an empty
 *          array if the key or mode is not found
 *
 * @example
 *   getScale('C', 'Ionian')
 *   // → [
 *   //     { degree: 1, note: 'C3', semitoneFromRoot: 0, frequency: 130.81, interval: 'Unison' },
 *   //     { degree: 2, note: 'D3', semitoneFromRoot: 2, frequency: 146.83, interval: 'Major 2nd' },
 *   //     ...
 *   //   ]
 *
 *   getScale('A', 'Aeolian')
 *   // → Same notes as C Ionian (Aeolian = natural minor, relative to C major)
 *
 *   getScale('X', 'Ionian')  // → []  (invalid key)
 *   getScale('C', 'Unknown') // → []  (invalid mode)
 */
export function getScale(key: string, mode: string): ScaleNote[] {
  const keyIndex = keyToIndex(key)
  if (keyIndex === -1) return []

  const intervals = MODE_INTERVALS[mode]
  if (!intervals) return []

  const scale: ScaleNote[] = []
  const midiBase = modeToMidiBase(keyIndex)
  let cumulativeSemitones = 0

  for (let degree = 0; degree < intervals.length; degree++) {
    // For degree 0 (tonic), cumulativeSemitones stays 0
    // For later degrees, add the previous interval
    const semitones = degree === 0 ? 0 : cumulativeSemitones
    const noteIndex = (keyIndex + semitones) % 12
    const midiNote = midiBase + semitones
    const intervalName = INTERVAL_NAMES[semitones] ?? ''

    const octave = Math.floor(midiNote / 12) - 1

    scale.push({
      degree: degree + 1,
      note: `${ALL_KEYS[noteIndex]}${octave}`,
      semitoneFromRoot: semitones,
      frequency: midiToFrequency(midiNote),
      interval: intervalName
    })

    // Accumulate for next degree (unless we just processed the last degree)
    if (degree < intervals.length - 1) {
      cumulativeSemitones += intervals[degree]
    }
  }

  return scale
}

/**
 * getChordQualities — Get the diatonic triad chord qualities for a mode.
 *
 * Diatonic chords are the triads that naturally occur when you stack thirds
 * on each degree of the scale using only the scale's notes. These tell a
 * songwriter which chords "belong" to a key.
 *
 * @param mode — Mode name, e.g. "Ionian", "Dorian". Case-sensitive.
 *                Must match an entry in MODES.
 * @returns Array of 7 chord quality strings (one per degree), or an empty
 *          array if the mode is not found
 *
 * @example
 *   getChordQualities('Ionian')
 *   // → ['Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor', 'Diminished']
 *   //   I    ii    iii   IV    V     vi    vii°
 *
 *   getChordQualities('Unknown')  // → []
 */
export function getChordQualities(mode: string): string[] {
  const qualities = MODE_CHORD_QUALITIES[mode]
  return qualities ? [...qualities] : []
}
