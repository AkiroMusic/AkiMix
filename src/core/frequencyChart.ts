/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Frequency & Pitch Lookup — Musical Notes to Hz, Pitch Shifting
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 *   Converts between MIDI note numbers, frequency (Hz), and note names.
 *   Essential for EQ work, pitch shifting, and understanding the frequency
 *   spectrum of different notes.
 *
 * WHY THIS EXISTS:
 *   - Equal temperament tuning: A4 = 440Hz is the standard reference pitch
 *   - Each semitone = 12√2 ≈ 1.05946 frequency ratio
 *   - MIDI note 69 = A4 = 440Hz
 *   - Formula: f = 440 * 2^((midi - 69) / 12)
 *
 * MUSICAL CONTEXT:
 *   - C4 = Middle C = MIDI 60 ≈ 261.63Hz
 *   - A4 = 440Hz (tuning standard)
 *   - C0 = MIDI 12 ≈ 16.35Hz (lowest practical note)
 *   - B8 = MIDI 119 ≈ 7902.13Hz (highest typical note on piano)
 *   - Full MIDI range: 0-127, but we use 12-119 (C0 to B8)
 *
 * PITCH SHIFTING:
 *   +12 semitones = ×2 speed (one octave up)
 *   -12 semitones = ×0.5 speed (one octave down)
 *   +1 semitone = ×1.05946 speed
 *
 * @example
 *   import { midiToFrequency, frequencyToNote, generateFrequencyChart } from './frequencyChart'
 *   midiToFrequency(69)    // → 440 (A4)
 *   midiToNoteName(60)     // → 'C4'
 *   frequencyToNote(440)   // → { note: 'A4', octave: 4, midi: 69, frequency: 440 }
 */

/**
 * NoteInfo — Represents a single musical note with all its identifiers.
 *
 * Each note can be identified by:
 *   - Name: "C4", "A#3", "Bb5" (scientific pitch notation)
 *   - MIDI: Integer 0-127 (standard MIDI note number)
 *   - Frequency: Hz value (equal temperament, A4=440Hz)
 *
 * @property note — Display name like "C4", "A#3", "Bb5"
 * @property octave — Octave number (-1 to 9, but we use 0 to 8)
 * @property midi — MIDI note number (12 = C0, 69 = A4, 119 = B8)
 * @property frequency — Exact frequency in Hz (rounded to 2 decimals)
 */
export interface NoteInfo {
  note: string
  octave: number
  midi: number
  frequency: number
}

/**
 * NOTE_NAMES — Standard chromatic scale note names.
 *
 * Index 0-11 maps to MIDI note % 12:
 *   0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B
 *
 * For flats (enharmonic equivalents like Bb = A#), we use sharps consistently.
 * The actual pitch is the same — Bb (B-flat) = A# (A-sharp).
 */
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/**
 * midiToFrequency — Convert MIDI note number to frequency in Hz.
 *
 * THE FORMULA:
 *   f = 440 × 2^((n - 69) / 12)
 *
 * WHERE:
 *   440 = A4 reference frequency in Hz
 *   69  = MIDI note number for A4
 *   12  = number of semitones per octave
 *   n   = input MIDI note number
 *
 * This is the standard equal-temperament tuning formula used by all
 * modern synthesizers and digital audio software.
 *
 * @param midi — MIDI note number (0-127). Valid range:
 *               - 0 = C-1 (~8.18Hz, subsonic)
 *               - 12 = C0 (~16.35Hz, lowest piano note)
 *               - 69 = A4 (440Hz, tuning reference)
 *               - 127 = G9 (~12543Hz, highest MIDI note)
 * @returns Frequency in Hz, rounded to 2 decimal places
 *
 * @example
 *   midiToFrequency(69)        // → 440 (A4, standard tuning)
 *   midiToFrequency(60)        // → 261.63 (Middle C / C4)
 *   midiToFrequency(12)        // → 16.35 (C0, lowest piano note)
 *   midiToFrequency(81)        // → 880 (A5, one octave above A4)
 */
export function midiToFrequency(midi: number): number {
  return parseFloat((440 * Math.pow(2, (midi - 69) / 12)).toFixed(2))
}

/**
 * midiToNoteName — Convert MIDI note number to scientific pitch notation.
 *
 * FORMAT: [NoteName][OctaveNumber]
 *   e.g., "C4" (Middle C), "A#3", "B5"
 *
 * Octave numbering follows the standard:
 *   C0 = MIDI 12 (lowest note on an 88-key piano)
 *   C4 = MIDI 60 (Middle C)
 *   C8 = MIDI 108 (highest C)
 *   B8 = MIDI 119 (highest note on 88-key piano)
 *
 * @param midi — MIDI note number (0-127)
 * @returns String like "C4", "A#3", "F#5"
 *
 * @example
 *   midiToNoteName(60)     // → "C4" (Middle C)
 *   midiToNoteName(69)     // → "A4" (440Hz reference)
 *   midiToNoteName(61)     // → "C#4" (C-sharp above Middle C)
 */
export function midiToNoteName(midi: number): string {
  const noteIndex = midi % 12
  const octave = Math.floor(midi / 12) - 1
  return `${NOTE_NAMES[noteIndex]}${octave}`
}

/**
 * generateFrequencyChart — Generate complete frequency table from C0 to B8.
 *
 * Produces an array of NoteInfo objects covering the full range of an
 * 88-key piano (MIDI 12-119). Each entry includes the note name, octave
 * number, MIDI number, and exact frequency.
 *
 * USES:
 *   - Displaying a frequency reference table in the UI
 *   - Building lookup maps for note-to-frequency queries
 *   - Visualizing the frequency spectrum for EQ work
 *
 * RANGE: C0 (16.35Hz) to B8 (7902.13Hz) — 108 notes, 9 octaves
 *
 * @returns Array of NoteInfo objects, one per MIDI note from 12 to 119
 *
 * @example
 *   const chart = generateFrequencyChart()
 *   chart[0]  // → { note: 'C0', octave: 0, midi: 12, frequency: 16.35 }
 *   chart[48] // → { note: 'C4', octave: 4, midi: 60, frequency: 261.63 }
 *   chart[57] // → { note: 'A4', octave: 4, midi: 69, frequency: 440 }
 *   chart.length // → 108
 */
export function generateFrequencyChart(): NoteInfo[] {
  const chart: NoteInfo[] = []
  // MIDI 12 = C0 (lowest C), MIDI 119 = B8 (highest B on 88-key piano)
  for (let midi = 12; midi <= 119; midi++) {
    chart.push({
      note: midiToNoteName(midi),
      octave: Math.floor(midi / 12) - 1,
      midi,
      frequency: midiToFrequency(midi)
    })
  }
  return chart
}

/**
 * semitonesToSpeed — Convert semitone interval to playback speed ratio.
 *
 * In audio pitch-shifting, changing pitch by N semitones requires
 * multiplying the playback speed by 2^(N/12).
 *
 * EXAMPLES:
 *   +12 semitones = 1 octave up = ×2 speed
 *   -12 semitones = 1 octave down = ×0.5 speed
 *   +1 semitone = ×1.05946 (the 12th root of 2)
 *   +7 semitones = ×1.498 (perfect fifth)
 *
 * @param semitones — Number of semitones (+ up, - down)
 * @returns Speed ratio (rounded to 4 decimal places)
 *
 * @example
 *   semitonesToSpeed(12)     // → 2 (octave up = double speed)
 *   semitonesToSpeed(-12)    // → 0.5 (octave down = half speed)
 *   semitonesToSpeed(0)      // → 1 (no change)
 *   semitonesToSpeed(1)      // → 1.0595 (one semitone up)
 *   semitonesToSpeed(7)      // → 1.4983 (perfect fifth)
 */
export function semitonesToSpeed(semitones: number): number {
  return parseFloat(Math.pow(2, semitones / 12).toFixed(4))
}

/**
 * speedToSemitones — Convert playback speed ratio to semitones.
 *
 * The inverse of semitonesToSpeed(). Given a speed ratio, calculate
 * how many semitones of pitch shift it represents.
 *
 * FORMULA: semitones = 12 × log2(ratio)
 *
 * @param ratio — Playback speed ratio (> 0). Less common values:
 *                - 0.5 = -12 semitones (octave down)
 *                - 1.0 = 0 semitones (no change)
 *                - 2.0 = +12 semitones (octave up)
 * @returns Semitones (rounded to 2 decimal places)
 *
 * @example
 *   speedToSemitones(2)      // → 12 (octave up)
 *   speedToSemitones(0.5)    // → -12 (octave down)
 *   speedToSemitones(1)      // → 0 (no change)
 *   speedToSemitones(1.0595) // → 1 (one semitone)
 */
export function speedToSemitones(ratio: number): number {
  return parseFloat((12 * Math.log2(ratio)).toFixed(2))
}

/**
 * centsToSpeed — Convert cents to speed ratio.
 *
 * 1 cent = 1/100 of a semitone.
 * 100 cents = 1 semitone.
 * 1200 cents = 1 octave.
 *
 * Cents are used for microtonal adjustments and fine-tuning.
 * If a sample is 5 cents sharp, you'd use this to find the ratio
 * to adjust it back.
 *
 * @param cents — Number of cents (+ sharp, - flat). Range: -1200 to +1200
 *                (one octave in either direction, though ±50 is more typical)
 * @returns Speed ratio (rounded to 4 decimal places)
 *
 * @example
 *   centsToSpeed(0)     // → 1 (no change)
 *   centsToSpeed(100)   // → 1.0595 (= 1 semitone up)
 *   centsToSpeed(-100)  // → 0.9439 (= 1 semitone down)
 *   centsToSpeed(1200)  // → 2 (1 octave up)
 *   centsToSpeed(50)    // → 1.0293 (50 cents = quarter tone)
 */
export function centsToSpeed(cents: number): number {
  return semitonesToSpeed(cents / 100)
}

/**
 * frequencyToNote — Find the closest musical note for a given frequency.
 *
 * Determines the nearest equal-temperament note for any input frequency.
 * Uses the reverse of the MIDI frequency formula:
 *   n = 12 × log2(f / 440) + 69
 *
 * Useful for:
 *   - Identifying what note a recorded instrument is playing
 *   - Finding the closest tuning reference for EQ notching
 *   - Converting analyzer readings to musical notation
 *
 * @param freq — Frequency in Hz (> 0). Values outside MIDI range (0-127)
 *               return null.
 * @returns NoteInfo of the closest matching note, or null if out of range
 *          (below C-1 ≈ 8.18Hz or above G9 ≈ 12543Hz)
 *
 * @example
 *   frequencyToNote(440)      // → { note: 'A4', octave: 4, midi: 69, frequency: 440 }
 *   frequencyToNote(261.63)   // → { note: 'C4', octave: 4, midi: 60, frequency: 261.63 }
 *   frequencyToNote(450)      // → { note: 'A4', octave: 4, midi: 69, frequency: 440 }
 *                             // (450Hz rounds to A4 = 440Hz)
 *   frequencyToNote(-1)       // → null (negative frequency)
 *   frequencyToNote(20000)    // → null (above MIDI range)
 */
export function frequencyToNote(freq: number): NoteInfo | null {
  if (freq <= 0) return null

  // Reverse MIDI formula to get the closest MIDI note number
  const midi = Math.round(12 * Math.log2(freq / 440) + 69)

  // MIDI 0-127 is the full valid range
  if (midi < 0 || midi > 127) return null

  return {
    note: midiToNoteName(midi),
    octave: Math.floor(midi / 12) - 1,
    midi,
    frequency: midiToFrequency(midi)
  }
}
