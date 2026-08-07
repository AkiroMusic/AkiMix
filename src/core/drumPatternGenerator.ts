/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Drum Pattern Generator — Genre-Based Rhythm & Groove Engine
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 *   Generates realistic drum patterns across 16 genres (electronic + acoustic).
 *   Given a genre name, it returns a complete 16th-note grid for one bar in
 *   4/4 time — with hit positions, velocities, swing offset markers, ghost
 *   note probability, and a suggested BPM.
 *
 * WHY THIS EXISTS:
 *   - Producers need a starting point when programming drums for a genre
 *     they don't usually produce — "what does a typical DnB beat look like?"
 *   - Songwriters use genre patterns to quickly sketch rhythm ideas
 *   - The grid format (10 drum parts × 16 steps) maps directly to step
 *     sequencers, drum machines, and piano-roll editing
 *
 * DRUM PATTERN THEORY (鼓模式基础):
 *   A 16-step grid represents one bar of 16th notes in 4/4 time.
 *   Each drum part gets its own row. 1 = hit, 0 = no hit.
 *   Swing shifts the timing of offbeat 16th notes (positions 2,4,6,8,10,12,14,16)
 *   to create a "shuffled" feel — essential for genres like DnB and UK Garage.
 *   Ghost notes are very quiet extra hits that add groove without adding volume.
 *
 * GRID LAYOUT (10 rows × 16 columns):
 *   Each column = one 16th note. Columns 0-3 = beat 1, 4-7 = beat 2, etc.
 *   In 4/4 time: | 1 . . . | 2 . . . | 3 . . . | 4 . . . |
 *                 | o o o o | o o o o | o o o o | o o o o |
 *                 (columns 0-3) (4-7)   (8-11)   (12-15)
 *
 * @example
 *   import { getPattern, applySwing, addGhostNotes } from './drumPatternGenerator'
 *   const pattern = getPattern('House')
 *   // → { grid: [...], velocity: [...], parts: [...], swing: 0, ghostNoteChance: 10, bpm: 126 }
 *
 *   const swung = applySwing(pattern!.grid, 30)
 *   // → odd-column hits marked with 2 (swung)
 *
 *   const ghosted = addGhostNotes(swung, pattern!.velocity, 20)
 *   // → added ghost notes to Snare & Hi-Hat
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import type { GenreEntry } from './genreTaxonomy'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * DrumPattern — Complete drum pattern for one bar (16th notes, 4/4 time).
 *
 * @property grid — 10×16 binary matrix: 1 = hit, 0 = rest (or 2 = swung hit
 *           after applySwing()). Rows = DRUM_PARTS, columns = 16th-note steps.
 * @property velocity — Same 10×16 shape as grid. Values 1-127 where there's a
 *           hit, 0 where there's no hit. Represents MIDI velocity (volume).
 * @property parts — The 10 drum part names in row order (see DRUM_PARTS).
 * @property swing — Swing amount 0-100 (0 = straight, 50 = even 16ths).
 *           Tells the UI how much to delay offbeat 16th notes.
 * @property ghostNoteChance — Probability (0-100) that empty Snare/Hi-Hat
 *           slots get a very quiet extra hit when addGhostNotes() is called.
 * @property bpm — Typical/suggested BPM for this genre.
 */
export interface DrumPattern {
  grid: number[][]
  velocity: number[][]
  parts: string[]
  swing: number
  ghostNoteChance: number
  bpm: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * GENRES — All 16 supported drum pattern genres, organized by super-genre.
 *
 * Covers electronic dance genres (House, Techno, Trance, Dubstep, DnB,
 * UK Garage, Trap, Future Bass, Hardstyle, Breakbeat) and acoustic/instrumental
 * genres (Jazz, Rock, Funk, Hip-Hop, Latin, Metal).
 *
 * Each entry includes its super-genre family for hierarchical UI grouping.
 * The genre `name` is the canonical lookup key for pattern data.
 *
 * Why these 16? These are the most commonly-requested genres in music production
 * forums, representing 95%+ of typical producer workflow needs.
 */
export const GENRES: GenreEntry[] = [
  // ── Electronic / Dance ──
  { name: 'House', superGenre: 'electronic' },
  { name: 'Trance', superGenre: 'electronic' },
  { name: 'Techno', superGenre: 'electronic' },
  { name: 'Dubstep', superGenre: 'electronic' },
  { name: 'Drum & Bass', superGenre: 'electronic' },
  { name: 'UK Garage', superGenre: 'electronic' },
  { name: 'Trap', superGenre: 'electronic' },
  { name: 'Future Bass', superGenre: 'electronic' },
  { name: 'Hardstyle', superGenre: 'electronic' },
  { name: 'Breakbeat', superGenre: 'electronic' },
  // ── Rock / Pop ──
  { name: 'Rock', superGenre: 'rockPop' },
  // ── Jazz / Blues / R&B ──
  { name: 'Jazz', superGenre: 'jazzBlues' },
  { name: 'Funk', superGenre: 'jazzBlues' },
  // ── Hip-Hop ──
  { name: 'Hip-Hop', superGenre: 'hipHop' },
  // ── Metal ──
  { name: 'Metal', superGenre: 'metal' },
  // ── Folk / Country / World ──
  { name: 'Latin', superGenre: 'folkCountry' }
]

/** Convenience export: just the genre name strings (backward compat) */
export const GENRE_NAMES: string[] = GENRES.map((g) => g.name)

/**
 * DRUM_PARTS — The 10 drum/percussion parts in grid row order.
 *
 * ORDER MATTERS — Each genre's grid rows correspond to these indices:
 *   0: Kick     — 底鼓, the kick drum (low-end thump, the "1" of the beat)
 *   1: Snare    — 军鼓, the snare drum (crack/backbeat on 2 and 4)
 *   2: Hi-Hat   — 踩镲, closed hi-hat (timekeeping, 8th/16th notes)
 *   3: Open Hat — 开镲, open hi-hat (accent, "washy" sound)
 *   4: Clap     — 拍手, hand clap (often layered with snare)
 *   5: Rim      — 鼓边, rim shot / rim click (percussive accent)
 *   6: Tom      — 嗵鼓, tom-tom (fills, melodic accents)
 *   7: Crash    — 吊镲, crash cymbal (section markers, accents)
 *   8: Ride     — 叮叮镲, ride cymbal (timekeeping in jazz/rock)
 *   9: Percussion — 打击乐, auxiliary percussion (shaker, tambourine, etc.)
 *
 * @example
 *   DRUM_PARTS[0]  // → 'Kick'
 *   DRUM_PARTS[4]  // → 'Clap'
 *   DRUM_PARTS.length  // → 10
 */
export const DRUM_PARTS: string[] = [
  'Kick',
  'Snare',
  'Hi-Hat',
  'Open Hat',
  'Clap',
  'Rim',
  'Tom',
  'Crash',
  'Ride',
  'Percussion'
]

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Number of 16th-note steps in one bar (4/4 time). */
const STEPS = 16

/** Number of drum parts (rows in the grid). */
const NUM_PARTS = 10

/**
 * buildPattern — Construct grid and velocity arrays from compact input.
 *
 * Converts a row-by-row grid definition and per-part base velocities into
 * the full 10×16 grid and velocity arrays used by `getPattern()`.
 *
 * @param rows — 10 arrays of 16 binary values (0/1), one per DRUM_PART.
 * @param baseVelocities — 10 base velocity values (1-127), one per DRUM_PART.
 * @returns An object with `grid` (10×16 binary) and `velocity` (10×16,
 *          velocity where grid=1, 0 where grid=0).
 */
function buildPattern(
  rows: number[][],
  baseVelocities: number[]
): { grid: number[][]; velocity: number[][] } {
  const grid: number[][] = []
  const velocity: number[][] = []

  for (let r = 0; r < NUM_PARTS; r++) {
    const row = [...rows[r]]
    grid.push(row)
    // Each hit gets the part's base velocity; rests stay 0
    velocity.push(row.map((cell) => (cell === 1 ? baseVelocities[r] : 0)))
  }

  return { grid, velocity }
}

/**
 * clamp — Clamp a number between min and max (inclusive).
 *
 * @param value — The number to clamp.
 * @param min — Lower bound.
 * @param max — Upper bound.
 * @returns The clamped value.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * linearScale — Map a value from [0, 100] to one of two outcomes.
 *
 * Used by applySwing to determine whether a column gets swung:
 *   - 0% → all false (no swing)
 *   - 100% → all true (full swing)
 *   - 50% → mixed (half the columns swung, determined by column position)
 *
 * For deterministic behavior, we swing columns proportionally:
 * columns whose index falls within the swing percentage (of 8 odd columns)
 * get marked. This avoids randomness while still being musically meaningful.
 *
 * @param swingPercent — Swing intensity 0-100 (already clamped).
 * @param oddIndex — Which odd-column pair this is (0-7).
 * @returns True if this column should be marked as swung.
 */
function isColumnSwung(swingPercent: number, oddIndex: number): boolean {
  // Of the 8 odd columns (1,3,5,7,9,11,13,15), swingPercent/100 of them
  // are swung. We swing the first N odd columns where N = round(8 * swingPercent / 100).
  const swungCount = Math.round((STEPS / 2) * (swingPercent / 100))
  return oddIndex < swungCount
}

// ---------------------------------------------------------------------------
// Genre pattern data
// ---------------------------------------------------------------------------

/**
 * GENRE_DATA — Internal lookup table mapping genre names to pattern data.
 *
 * Each entry has:
 *   - `rows`:       10×16 grid (0 = rest, 1 = hit)
 *   - `vel`:        10 base MIDI velocity values (1-127)
 *   - `swing`:      Swing percentage (0-100)
 *   - `ghostNote`:  Ghost note chance percentage (0-100)
 *   - `bpm`:        Typical genre BPM
 *
 * VELOCITY MAPPING (percentage → MIDI):
 *   100% = 127,  95% = 121,  90% = 114,  85% = 108,  80% = 102
 *   75% = 95,    70% = 89,   65% = 83,   60% = 76,   55% = 70
 *   50% = 64,    45% = 57,   40% = 51,   35% = 44,   30% = 38
 */
const GENRE_DATA: Record<
  string,
  { rows: number[][]; vel: number[]; swing: number; ghostNote: number; bpm: number }
> = {
  // =========================================================================
  // House (浩室音乐) — 4-to-floor, offbeat hi-hat, claps on 2 & 4
  // =========================================================================
  House: {
    rows: [
      // Kick — 4-to-floor (every beat)
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      // Snare — no snare in house (clap does the backbeat)
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Hi-Hat — offbeat 8th notes (swung feel)
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      // Open Hat — reserved (occasional accent on beat 2.5)
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Clap — backbeat on beats 2 and 4
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Rim — unused in house
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Tom — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — beat 1 only (section marker)
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — unused (hi-hat carries time)
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Perc — shaker on all offbeats (adds shuffle texture)
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
    ],
    vel: [114, 0, 83, 64, 102, 0, 0, 127, 0, 51],
    swing: 0,
    ghostNote: 10,
    bpm: 126
  },

  // =========================================================================
  // Techno (铁克诺) — Driving 4-to-floor, metallic percussion, industrial feel
  // =========================================================================
  Techno: {
    rows: [
      // Kick — 4-to-floor (the engine of techno)
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      // Snare — no traditional snare
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Hi-Hat — 8th note driving pattern
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      // Open Hat — offbeat accent on the "and" of 2 and 4
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Clap — backbeat on 2 and 4
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Rim — metallic rim clicks on all 8th notes (industrial texture)
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      // Tom — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — beat 1 only (section marker)
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — steady 8th ride cymbal (adds sheen)
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      // Perc — shaker on 2 and 4 (subtle groove)
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
    ],
    vel: [127, 0, 89, 70, 108, 76, 0, 127, 76, 51],
    swing: 5,
    ghostNote: 5,
    bpm: 130
  },

  // =========================================================================
  // Trance (迷幻舞曲) — 4-to-floor, euphoric, ride on 8th notes
  // =========================================================================
  Trance: {
    rows: [
      // Kick — powerful 4-to-floor
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      // Snare — no snare (clap carries backbeat)
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Hi-Hat — offbeat 8th
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      // Open Hat — reserved for build-ups
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Clap — backbeat 2 and 4 (often with reverb tails)
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Rim — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Tom — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — beat 1 and step 14 (fill accent on the "ah" of 4)
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      // Ride — 8th note ride (drives the energy)
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      // Perc — light shaker on beats 2, 4, 6, 8, 10, 12, 14, 16
      [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0]
    ],
    vel: [121, 0, 76, 70, 102, 0, 0, 121, 83, 44],
    swing: 0,
    ghostNote: 5,
    bpm: 138
  },

  // =========================================================================
  // Dubstep (回响贝斯) — Half-time, swung, heavy snare on beat 3
  // =========================================================================
  Dubstep: {
    rows: [
      // Kick — on 1 and occasionally step 12
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      // Snare — half-time snare on beat 3 (the "wobble drop" hit)
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Hi-Hat — swung 8th notes
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      // Open Hat — occasional accent
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Clap — layered with snare (index 4 = row 4 is Clap)
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Rim — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Tom — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — beat 1
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Perc — light shaker on beats 2, 4, 6, 8, 10, 12, 14, 16
      [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0]
    ],
    vel: [127, 127, 89, 76, 0, 0, 0, 127, 0, 38],
    swing: 30,
    ghostNote: 20,
    bpm: 140
  },

  // =========================================================================
  // Drum & Bass (鼓打贝斯) — Syncopated, fast, intricate hi-hat 16ths
  // =========================================================================
  'Drum & Bass': {
    rows: [
      // Kick — syncopated "jump-up" pattern
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
      // Snare — ghost snares on 3, 7, 11, 15 (layered with main clap)
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      // Hi-Hat — driving 16th notes (the "rolling" DnB feel)
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      // Open Hat — accent on steps 8 and 16
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      // Clap — main snare accent on beat 3 (step 8)
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Rim — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Tom — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — beat 1 only (brief, to not clutter the high end)
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — 8th note ride
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      // Perc — syncopated shaper (adds groove texture)
      [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0]
    ],
    vel: [114, 127, 95, 76, 121, 0, 0, 127, 70, 57],
    swing: 50,
    ghostNote: 30,
    bpm: 174
  },

  // =========================================================================
  // UK Garage (英国车库) — 2-step, swung, syncopated, maximum groove
  // =========================================================================
  'UK Garage': {
    rows: [
      // Kick — 2-step pattern: 1, 8, 9, 16 (shuffled)
      [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      // Snare — beat 3 (light, often half-time feel)
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Hi-Hat — swung 8th notes
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      // Open Hat — offbeat accents on 4 and 12
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      // Clap — layered with snare on beat 3
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Rim — swung rim clicks (characteristic UKG texture)
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      // Tom — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — beat 1
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Perc — light shaker on all offbeats
      [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0]
    ],
    vel: [108, 127, 83, 64, 114, 70, 0, 127, 0, 44],
    swing: 60,
    ghostNote: 25,
    bpm: 135
  },

  // =========================================================================
  // Trap (陷阱音乐) — Heavy 808 kick, loud snare/clap on 3, sparse hi-hats
  // =========================================================================
  Trap: {
    rows: [
      // Kick (808) — beat 1 and step 12 (sparse, sub-bass focused)
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      // Snare — loud snare on beat 3
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Hi-Hat — sparse 16th pattern with "trap rolls"
      [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      // Open Hat — unused (trap uses closed hats + rolls)
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Clap — layered with snare on beat 3
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Rim — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Tom — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — beat 1
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Perc — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    vel: [127, 127, 89, 0, 121, 0, 0, 127, 0, 0],
    swing: 0,
    ghostNote: 5,
    bpm: 140
  },

  // =========================================================================
  // Future Bass (未来贝斯) — Half-time, colorful, snare on 3, shaker groove
  // =========================================================================
  'Future Bass': {
    rows: [
      // Kick — half-time feel (1, 9)
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Snare — loud on beat 3 (half-time backbeat)
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Hi-Hat — swung 8th notes
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      // Open Hat — accent on 7, 15
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      // Clap — layered with snare on beat 3
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Rim — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Tom — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — beat 1
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Perc — shaker on all 8th notes (adds bounce)
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
    ],
    vel: [114, 127, 89, 70, 114, 0, 0, 127, 0, 51],
    swing: 30,
    ghostNote: 15,
    bpm: 150
  },

  // =========================================================================
  // Hardstyle (硬派舞曲) — Hard kick, offbeat claps, sparse percussion
  // =========================================================================
  Hardstyle: {
    rows: [
      // Kick — hard kick on 1, 4, 9, 12 (signature hardstyle pattern)
      [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      // Snare — no snare (kick is the rhythmic lead)
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Hi-Hat — sparse offbeat
      [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
      // Open Hat — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Clap — offbeat claps on the kick release (4, 8, 12, 16)
      [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      // Rim — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Tom — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — beat 1
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Perc — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    vel: [127, 0, 64, 0, 102, 0, 0, 127, 0, 0],
    swing: 0,
    ghostNote: 0,
    bpm: 150
  },

  // =========================================================================
  // Breakbeat (碎拍) — Syncopated, funky, ghost snares, high ghost chance
  // =========================================================================
  Breakbeat: {
    rows: [
      // Kick — syncopated breakbeat pattern
      [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      // Snare — ghost snares, main accent on step 8 (beat 3)
      [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
      // Hi-Hat — 16th note ride (busy, driving)
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      // Open Hat — accent on 8, 16
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      // Clap — main accent on beat 3 (step 8)
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Rim — clicks on beats 5, 13 (funky accent)
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Tom — fill on step 12
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      // Crash — double crash intro (1, 2)
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — 8th note ride
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      // Perc — syncopated auxiliary
      [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]
    ],
    vel: [108, 127, 89, 70, 121, 64, 102, 127, 64, 51],
    swing: 25,
    ghostNote: 35,
    bpm: 160
  },

  // =========================================================================
  // Jazz (爵士) — Ride cymbal timekeeping, feathering kick, high swing
  // =========================================================================
  Jazz: {
    rows: [
      // Kick — feathering on 1 and 3 (light, "walking" feel)
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Snare — comping ghost notes, light backbeat (brushes feel)
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      // Hi-Hat — chick (foot splash) on 2 and 4 (timekeeping)
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Open Hat — unused (jazz uses ride for time)
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Clap — no claps in jazz (traditional)
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Rim — unused (cross-stick on snare instead)
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Tom — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — occasional accent on 1
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — swung 8th note ride cymbal (THE defining jazz pattern)
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      // Perc — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    vel: [89, 76, 70, 0, 0, 0, 0, 114, 83, 0],
    swing: 65,
    ghostNote: 40,
    bpm: 120
  },

  // =========================================================================
  // Rock (摇滚) — 4-to-floor, backbeat snare, crash on 1
  // =========================================================================
  Rock: {
    rows: [
      // Kick — 4-to-floor (rock solid)
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      // Snare — backbeat on 2 and 4 (the heart of rock drumming)
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Hi-Hat — 8th note (steady timekeeping)
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      // Open Hat — occasional accents (8th note offbeats)
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      // Clap — unused in traditional rock
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Rim — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Tom — unused in basic pattern
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — beat 1 (section marker)
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — unused (hi-hat carries time in verses)
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Perc — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    vel: [114, 121, 95, 70, 0, 0, 0, 127, 0, 0],
    swing: 0,
    ghostNote: 10,
    bpm: 120
  },

  // =========================================================================
  // Funk (放克) — Syncopated 16th, one-handed hi-hat, deep groove
  // =========================================================================
  Funk: {
    rows: [
      // Kick — syncopated 16th note pattern (the "funk pocket")
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0],
      // Snare — backbeat on 2 and 4 (tight and punchy)
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Hi-Hat — 16th notes (one-handed technique, very active)
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      // Open Hat — syncopated accents
      [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
      // Clap — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Rim — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Tom — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — beat 1
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Perc — syncopated shaker (adds to the pocket)
      [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0]
    ],
    vel: [108, 127, 95, 64, 0, 0, 0, 121, 0, 51],
    swing: 40,
    ghostNote: 35,
    bpm: 105
  },

  // =========================================================================
  // Hip-Hop (嘻哈) — Boom-bap, swung, loud backbeat, 90s feel
  // =========================================================================
  'Hip-Hop': {
    rows: [
      // Kick — boom-bap syncopated (heavily swung)
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
      // Snare — loud backbeat on 2 and 4 (the "bap")
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Hi-Hat — simple 8th note
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      // Open Hat — turnaround accent on step 16
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      // Clap — unused (snare carries the backbeat)
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Rim — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Tom — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — beat 1
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Perc — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    vel: [121, 114, 76, 64, 0, 0, 0, 127, 0, 0],
    swing: 50,
    ghostNote: 25,
    bpm: 90
  },

  // =========================================================================
  // Latin (拉丁) — Tumbao kick, cross-stick snare, clave, maraca feel
  // =========================================================================
  Latin: {
    rows: [
      // Kick — tumbao pattern (montuno rhythm)
      [1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0],
      // Snare (cross-stick) — on 4, 8, 12, 16 (cascara feel)
      [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      // Hi-Hat — 16th notes (maraca/shaker feel)
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      // Open Hat — accent on 3, 7, 11, 15
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      // Clap — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Rim — clave rhythm (the defining Latin percussion pattern)
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      // Tom — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — beat 1
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Ride — steady bell pattern
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      // Perc — shaker accent on 5, 13
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
    ],
    vel: [108, 95, 83, 64, 0, 76, 0, 127, 70, 51],
    swing: 15,
    ghostNote: 10,
    bpm: 120
  },

  // =========================================================================
  // Metal (金属) — Double bass 16th rolls, backbeat snare, aggressive crashes
  // =========================================================================
  Metal: {
    rows: [
      // Kick — double bass 16th rolls (blast beat adjacent)
      [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
      // Snare — backbeat on 2 and 4 (holds the groove together)
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Hi-Hat — 8th note (or triggered via double bass patterns)
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      // Open Hat — crash accent on 4, 8, 12, 16
      [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      // Clap — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Rim — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Tom — unused in basic pattern
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Crash — frequent crashes (signature metal aggression)
      [1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Ride — quarter note ride (adds weight)
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      // Perc — unused
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    vel: [127, 127, 102, 89, 0, 0, 0, 127, 89, 0],
    swing: 0,
    ghostNote: 5,
    bpm: 180
  }
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * getPattern — Generate a drum pattern for a given genre.
 *
 * Looks up the genre in GENRE_DATA and returns the full drum pattern:
 * grid (10×16), velocity (10×16), the parts list, swing percentage, ghost
 * note chance, and the typical BPM for that genre.
 *
 * HOW PATTERNS ARE DESIGNED:
 *   Each genre pattern encodes the ESSENTIAL rhythmic elements that define
 *   that genre's drum sound. For example:
 *   - House = 4-to-floor kick + offbeat hi-hat + claps on 2 & 4
 *   - Jazz = ride cymbal timekeeping + feathering kick + ghost snare comping
 *   - Drum & Bass = syncopated kick + rolling 16th hi-hat + 2-step snare
 *
 * @param genre — The genre name (case-sensitive). Must match one of the
 *                strings in GENRES (e.g. 'House', 'Jazz', 'Drum & Bass').
 * @returns A DrumPattern object if the genre is found, or null if the genre
 *          is not in GENRES.
 *
 * @example
 *   getPattern('House')
 *   // → {
 *   //     grid: [
 *   //       [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],  // Kick (4-to-floor)
 *   //       [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],  // Snare
 *   //       ...
 *   //     ],
 *   //     velocity: [...],
 *   //     parts: ['Kick', 'Snare', 'Hi-Hat', ...],
 *   //     swing: 0,
 *   //     ghostNoteChance: 10,
 *   //     bpm: 126
 *   //   }
 *
 *   getPattern('Unknown')  // → null
 */
export function getPattern(genre: string): DrumPattern | null {
  const data = GENRE_DATA[genre]
  if (!data) return null

  const { grid, velocity } = buildPattern(data.rows, data.vel)

  return {
    grid,
    velocity,
    parts: [...DRUM_PARTS],
    swing: data.swing,
    ghostNoteChance: data.ghostNote,
    bpm: data.bpm
  }
}

/**
 * applySwing — Mark offbeat 16th notes for swing timing offset.
 *
 * Swing shifts the timing of ODD-INDEXED 16th notes (columns 1, 3, 5, 7,
 * 9, 11, 13, 15 in 0-based indexing) to create a "shuffled" groove.
 *
 * HOW SWING WORKS (摇摆原理):
 *   In straight 16ths, each note is evenly spaced. With swing, the offbeat
 *   16th notes (the 2nd, 4th, 6th... positions in each pair) are delayed
 *   slightly. This delay creates the characteristic "bounce" of swung genres
 *   like jazz, DnB, and UK Garage.
 *
 * IMPLEMENTATION:
 *   0% swing → no notes are marked (grid returned as-is).
 *   >0% swing → odd-column hits are marked with 2 instead of 1.
 *   The percentage determines HOW MANY odd columns get swung (proportional,
 *   from first odd column outward). The actual timing shift amount should
 *   be interpreted by the UI using the percentage.
 *
 * @param grid — The original 10×16 drum grid (values 0 or 1).
 * @param swingPercent — Swing intensity 0-100. Values outside this range
 *                       are clamped. 0 = straight (no swing), 50 = even
 *                       16ths, 100 = all odd columns swung.
 * @returns A NEW 10×16 grid array (the original is not mutated). Swung
 *          hits are marked with 2. If swingPercent is 0 (or clamped to 0),
 *          returns a shallow clone of the input with all values unchanged.
 *
 * @example
 *   const grid = [
 *     [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],  // Kick
 *     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],  // Snare
 *     // ... 8 more rows
 *   ]
 *
 *   const swung = applySwing(grid, 50)
 *   // → Grid where first 4 odd-column hits (out of 8) have 2 instead of 1
 */
export function applySwing(grid: number[][], swingPercent: number): number[][] {
  const clamped = clamp(Math.round(swingPercent), 0, 100)

  // 0% swing: no changes, return a shallow clone
  if (clamped === 0) {
    return grid.map((row) => [...row])
  }

  // >0% swing: odd columns (1,3,5,7,9,11,13,15) with a hit get marked as 2
  return grid.map((row) =>
    row.map((cell, col) => {
      if (cell !== 1) return cell
      // Check if this is an odd-indexed column (0-based)
      if (col % 2 !== 0) {
        // Determine which odd-column pair this is (0-7)
        const oddIndex = Math.floor(col / 2)
        if (isColumnSwung(clamped, oddIndex)) return 2
      }
      return cell
    })
  )
}

/**
 * addGhostNotes — Add low-velocity ghost notes to Snare and Hi-Hat rows.
 *
 * Ghost notes are very quiet extra hits that fill in empty spaces in the
 * groove. They're felt more than heard — they add texture and "pocket"
 * without drawing attention to themselves.
 *
 * GHOST NOTE THEORY (鬼音符理论):
 *   In drumming, ghost notes are played at very low volume (typically 25-40
 *   MIDI velocity) on the snare drum. They're especially important in funk,
 *   breakbeat, and DnB where they create the illusion of a more complex,
 *   human-performed groove. The hi-hat ghosts add subtle shuffle texture.
 *
 * ROWS AFFECTED:
 *   - Snare (index 1) — ghost notes add micro-rhythmic texture
 *   - Hi-Hat (index 2) — ghost notes add shuffle/bounce
 *   - All other rows are left unchanged
 *
 * @param grid — The 10×16 drum grid to modify.
 * @param velocity — The 10×16 velocity array corresponding to the grid.
 * @param chance — Probability (0-100) that each empty slot gets a ghost note.
 *                 0 = no ghosts, 100 = fill every empty slot.
 * @returns A new object with new `grid` and `velocity` arrays (originals
 *          are NOT mutated). Added ghost hits have velocity 25-40.
 *
 * @example
 *   const { grid, velocity } = addGhostNotes(originalGrid, originalVelocity, 30)
 *   // → 30% of empty Snare/Hi-Hat slots now have a ghost note at velocity ~32
 */
export function addGhostNotes(
  grid: number[][],
  velocity: number[][],
  chance: number
): { grid: number[][]; velocity: number[][] } {
  const clampedChance = clamp(chance, 0, 100)

  // Clone the input arrays to avoid mutation
  const newGrid: number[][] = grid.map((row) => [...row])
  const newVelocity: number[][] = velocity.map((row) => [...row])

  // Only operate on Snare (index 1) and Hi-Hat (index 2)
  const ghostRows = [1, 2]

  for (const row of ghostRows) {
    for (let col = 0; col < STEPS; col++) {
      // Only add ghost notes to EMPTY slots
      if (newGrid[row][col] !== 0) continue

      // Roll the dice: random 0-100, if < chance, add ghost
      const roll = Math.random() * 100
      if (roll < clampedChance) {
        newGrid[row][col] = 1
        // Random velocity in 25-40 range (quiet, subtle)
        newVelocity[row][col] = Math.floor(Math.random() * 16) + 25
      }
    }
  }

  return { grid: newGrid, velocity: newVelocity }
}
