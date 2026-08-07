/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Chord Progressions Module
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 * Provides chord progression data, extended chord construction, and modal
 * interchange (borrowed chord) information for music producers and
 * songwriters.
 *
 * WHY THIS IS USEFUL:
 *  - Beginners can explore common chord progressions across 11 music genres
 *  - Producers can build extended chords (7ths, 9ths, sus chords, etc.)
 *  - Songwriters can borrow chords from parallel modes for more interesting
 *    harmonies
 *
 * HOW TO USE:
 *   import {
 *     GENRES,
 *     getProgressions,
 *     extendedChord,
 *     modalInterchange
 *   } from '../core/chordProgressions'
 *
 *   // Get chord progressions for a genre
 *   const popProgressions = getProgressions('Pop')
 *   // Returns 6+ progression objects with roman, chords, description, energy
 *
 *   // Build an extended chord
 *   const cmaj7 = extendedChord('C', 'maj7')
 *   // Returns ['C', 'E', 'G', 'B']
 *
 *   // Get borrowed chords from parallel modes
 *   const borrowed = modalInterchange('C')
 *   // Returns array of mode objects with borrowed chords and descriptions
 */

// =============================================================================
// Imports
// =============================================================================

import type { GenreEntry } from './genreTaxonomy'

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * A single chord progression with Roman numeral analysis and emotional context.
 * All chord names are shown relative to a key so they're instrument-agnostic.
 */
export interface Progression {
  /** Roman numeral analysis of the progression (e.g., 'I–V–vi–IV') */
  roman: string
  /**
   * Example chord names in a convenient root key.
   * Country progressions use G; most others use C.
   */
  chords: string[]
  /** Emotional / mood description to help producers choose the right vibe */
  description: string
  /** Energy intensity rating from 1 (calm) to 10 (aggressive) */
  energy: number
  /** Common keys this genre is typically written in */
  commonKeys: string[]
}

/** Supported extended chord types with their semitone intervals */
export type ExtendedChordType =
  | 'maj7'
  | 'min7'
  | 'dom7'
  | 'dim7'
  | 'aug'
  | 'sus2'
  | 'sus4'
  | 'maj9'
  | 'min9'
  | 'dom9'

/**
 * Modal interchange (mode mixture) information for a given key.
 * Describes which chords can be borrowed from parallel modes.
 */
export interface ModalInterchange {
  /** Name of the parallel mode (e.g., 'Dorian', 'Mixolydian') */
  mode: string
  /**
   * Chords borrowed from this mode, shown in the given key.
   * Empty array means the mode is rarely used for borrowing.
   */
  borrowedChords: string[]
  /** Description of the emotional quality this mode brings */
  description: string
}

// =============================================================================
// Constants
// =============================================================================

/**
 * 12-tone equal temperament chromatic scale (sharp-based).
 * Used for interval calculations in extendedChord and transposition.
 */
const NOTES_SHARP: readonly string[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
]

/**
 * 12-tone equal temperament chromatic scale (flat-based).
 * Used when the root note uses flat notation (e.g., Bb, Eb).
 */
const NOTES_FLAT: readonly string[] = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
]

/**
 * Semitone intervals for each extended chord type, relative to the root.
 * Each number is the number of semitones above the root.
 *
 * 和弦类型的半音音程定义，以根音为基准。
 * - maj7: 大三和弦+大七度 (root, major 3rd, perfect 5th, major 7th)
 * - min7: 小三和弦+小七度 (root, minor 3rd, perfect 5th, minor 7th)
 * - dom7: 大三和弦+小七度 (root, major 3rd, perfect 5th, minor 7th)
 * - dim7: 减七和弦 (root, minor 3rd, diminished 5th, diminished 7th)
 * - aug:  增三和弦 (root, major 3rd, augmented 5th)
 * - sus2: 挂留二和弦 (root, major 2nd, perfect 5th)
 * - sus4: 挂留四和弦 (root, perfect 4th, perfect 5th)
 * - maj9: 大九和弦 (root, major 3rd, perfect 5th, major 7th, major 9th)
 * - min9: 小九和弦 (root, minor 3rd, perfect 5th, minor 7th, major 9th)
 * - dom9: 属九和弦 (root, major 3rd, perfect 5th, minor 7th, major 9th)
 */
const CHORD_INTERVALS: Record<ExtendedChordType, readonly number[]> = {
  maj7: [0, 4, 7, 11],   // Cmaj7: C E G B
  min7: [0, 3, 7, 10],   // Cmin7: C Eb G Bb
  dom7: [0, 4, 7, 10],   // C7: C E G Bb
  dim7: [0, 3, 6, 9],    // Cdim7: C Eb Gb A
  aug:  [0, 4, 8],       // Caug: C E G#
  sus2: [0, 2, 7],       // Csus2: C D G
  sus4: [0, 5, 7],       // Fsus4: C F G
  maj9: [0, 4, 7, 11, 14], // Cmaj9: C E G B D
  min9: [0, 3, 7, 10, 14], // Cmin9: C Eb G Bb D
  dom9: [0, 4, 7, 10, 14]  // C9: C E G Bb D
}

/** All available music genres with human-readable names */
export const GENRES: GenreEntry[] = [
  // ── Electronic / Dance ──
  { name: 'EDM', superGenre: 'electronic' },
  // ── Rock / Pop ──
  { name: 'Pop', superGenre: 'rockPop' },
  { name: 'Rock', superGenre: 'rockPop' },
  // ── Jazz / Blues / R&B ──
  { name: 'Jazz', superGenre: 'jazzBlues' },
  { name: 'Blues', superGenre: 'jazzBlues' },
  { name: 'R&B', superGenre: 'jazzBlues' },
  // ── Hip-Hop ──
  { name: 'Hip-Hop', superGenre: 'hipHop' },
  // ── Metal ──
  { name: 'Metal', superGenre: 'metal' },
  // ── Folk / Country / World ──
  { name: 'Country', superGenre: 'folkCountry' },
  { name: 'Latin', superGenre: 'folkCountry' },
  // ── Classical / Ambient ──
  { name: 'Classical', superGenre: 'classicalAmbient' }
]

/** Convenience export: just the genre name strings (backward compat) */
export const GENRE_NAMES: string[] = GENRES.map((g) => g.name)

// =============================================================================
// Modal Interchange Database (for key of C)
// =============================================================================
//
// 调式互换 (Mode Mixture): 在自然大调中借用平行调的和弦
// Parallel modes share the same tonic but have different scale degrees,
// providing fresh harmonic colors. The data below shows which chords are
// commonly borrowed from each parallel mode when composing in C major.
//
// 在C大调中:
// - 多利亚(Dorian): ♭3, ♭7 → 借用 ii (Dm) 和 IV (G)
// - 弗里吉亚(Phrygian): ♭2, ♭3, ♭6, ♭7 → 借用 ♭II (Fm) 和 ♭VII (Bb)
// - 利底亚(Lydian): ♯4 → 借用 ♯IVdim (F#dim) 和 II (D)
// - 混合利底亚(Mixolydian): ♭7 → 借用 ♭VII (Bb) 和 ♭III (F)
// - 伊奥利亚(Aeolian / 自然小调): ♭3, ♭6, ♭7 → 借用 ♭VI (F), ♭VII (G), iv (Am)
// - 洛克利亚(Locrian): 极少借用

const C_PARALLEL_MODES: ModalInterchange[] = [
  {
    mode: 'Dorian',
    borrowedChords: ['Dm', 'G'],
    description: 'Bright minor flavor with major IV'
  },
  {
    mode: 'Phrygian',
    borrowedChords: ['Fm', 'Bb'],
    description: 'Dark, Spanish-flavored minor'
  },
  {
    mode: 'Lydian',
    borrowedChords: ['D', 'F#dim'],
    description: 'Dreamy, floating with raised 4th'
  },
  {
    mode: 'Mixolydian',
    borrowedChords: ['Bb', 'F'],
    description: 'Bluesy dominant feel with flat 7th'
  },
  {
    mode: 'Aeolian (natural minor)',
    borrowedChords: ['F', 'G', 'Am'],
    description: 'Dark melancholic minor'
  },
  {
    mode: 'Locrian',
    borrowedChords: [],
    description: 'Rarely used for borrowing'
  }
]

// =============================================================================
// Chord Progression Database
// =============================================================================
//
// Each genre has its own set of characteristic chord progressions.
// Roman numerals show the harmonic function regardless of key.
// The chords array shows an example voicing in a common key for that genre.
//
// 每个音乐流派都有其标志性的和弦进行。
// 罗马数字表示和声功能，与调性无关。
// chords 数组展示了在该流派常用调性中的示例和弦。

// ---------------------------------------------------------------------------
// POP progressions — catchy, verse-chorus focused
// 流行音乐进行 — 朗朗上口，主歌-副歌结构
// ---------------------------------------------------------------------------
const POP_PROGRESSIONS: Progression[] = [
  {
    roman: 'I–V–vi–IV',
    chords: ['C', 'G', 'Am', 'F'],
    description: 'Classic anthemic pop progression — the foundation of countless hits',
    energy: 7,
    commonKeys: ['C', 'G', 'D', 'A', 'E♭']
  },
  {
    roman: 'vi–IV–I–V',
    chords: ['Am', 'F', 'C', 'G'],
    description: 'Emotional introspective — softens the energy with a minor start',
    energy: 5,
    commonKeys: ['C', 'G', 'D', 'A', 'E♭']
  },
  {
    roman: 'I–vi–IV–V',
    chords: ['C', 'Am', 'F', 'G'],
    description: 'Classic doo-wop — the 50s progression that still works today',
    energy: 6,
    commonKeys: ['C', 'G', 'D', 'A', 'E♭']
  },
  {
    roman: 'I–IV–V',
    chords: ['C', 'F', 'G'],
    description: 'Direct foundation — three chords, endless possibilities',
    energy: 8,
    commonKeys: ['C', 'G', 'D', 'A', 'E♭']
  },
  {
    roman: 'I–V–vi–iii–IV',
    chords: ['C', 'G', 'Am', 'Em', 'F'],
    description: 'Extended emotional — adds the iii for deeper feeling',
    energy: 5,
    commonKeys: ['C', 'G', 'D', 'A', 'E♭']
  },
  {
    roman: 'I–V–IV–V',
    chords: ['C', 'G', 'F', 'G'],
    description: 'Lifting anticipation — the V–IV motion creates forward momentum',
    energy: 7,
    commonKeys: ['C', 'G', 'D', 'A', 'E♭']
  }
]

// ---------------------------------------------------------------------------
// ROCK progressions — power-driven, guitar-friendly
// 摇滚进行 — 强力驱动，对吉他友好
// ---------------------------------------------------------------------------
const ROCK_PROGRESSIONS: Progression[] = [
  {
    roman: 'I–IV–V',
    chords: ['C', 'F', 'G'],
    description: 'Classic rock foundation — power chords at their finest',
    energy: 8,
    commonKeys: ['E', 'A', 'D', 'G', 'C']
  },
  {
    roman: 'i–VII–VI',
    chords: ['Am', 'G', 'F'],
    description: 'Minor rock anthem — dark, driving energy',
    energy: 7,
    commonKeys: ['E', 'A', 'D', 'G', 'C']
  },
  {
    roman: 'I–V–vi–IV',
    chords: ['C', 'G', 'Am', 'F'],
    description: 'Pop-punk energy — borrowed from pop but louder',
    energy: 7,
    commonKeys: ['E', 'A', 'D', 'G', 'C']
  },
  {
    roman: 'i–VI–VII',
    chords: ['Am', 'F', 'G'],
    description: 'Dark minor power — the staple of alternative rock',
    energy: 8,
    commonKeys: ['E', 'A', 'D', 'G', 'C']
  },
  {
    roman: 'I–♭VII–IV–I',
    chords: ['C', 'Bb', 'F', 'C'],
    description: 'Mixolydian swagger — flat 7th adds bluesy edge',
    energy: 6,
    commonKeys: ['E', 'A', 'D', 'G', 'C']
  },
  {
    roman: 'V–IV–I',
    chords: ['G', 'F', 'C'],
    description: 'Reverse power chord — unexpected resolution',
    energy: 7,
    commonKeys: ['E', 'A', 'D', 'G', 'C']
  }
]

// ---------------------------------------------------------------------------
// EDM progressions — build-up/drop focused
// 电子舞曲进行 — 围绕 build-up/drop 结构
// ---------------------------------------------------------------------------
const EDM_PROGRESSIONS: Progression[] = [
  {
    roman: 'I–V–vi–IV',
    chords: ['C', 'G', 'Am', 'F'],
    description: 'Anthem house/progressive — the stadium-filling staple',
    energy: 8,
    commonKeys: ['C', 'G', 'D', 'A', 'F']
  },
  {
    roman: 'i–VII–VI–VII',
    chords: ['Am', 'G', 'F', 'G'],
    description: 'Trance uplifting — builds energy through repetition',
    energy: 6,
    commonKeys: ['C', 'G', 'D', 'A', 'F']
  },
  {
    roman: 'vi–IV–I–V',
    chords: ['Am', 'F', 'C', 'G'],
    description: 'Melodic dubstep emotion — drop-ready tension',
    energy: 5,
    commonKeys: ['C', 'G', 'D', 'A', 'F']
  },
  {
    roman: 'i–i–VI–VII',
    chords: ['Am', 'Am', 'F', 'G'],
    description: 'Dark techno drive — minimal but powerful',
    energy: 7,
    commonKeys: ['C', 'G', 'D', 'A', 'F']
  },
  {
    roman: 'i–VI–III–VII',
    chords: ['Am', 'F', 'C', 'G'],
    description: 'Epic trance journey — the classic uplifting progression',
    energy: 6,
    commonKeys: ['C', 'G', 'D', 'A', 'F']
  },
  {
    roman: 'ii–IV–I–V',
    chords: ['Dm', 'F', 'C', 'G'],
    description: 'Introspective progressive — deeper, more thoughtful',
    energy: 4,
    commonKeys: ['C', 'G', 'D', 'A', 'F']
  },
  {
    roman: 'iii–vi–IV–V',
    chords: ['Em', 'Am', 'F', 'G'],
    description: 'Titanium-style uplifting — made famous by David Guetta',
    energy: 7,
    commonKeys: ['C', 'G', 'D', 'A', 'F']
  }
]

// ---------------------------------------------------------------------------
// HIP-HOP progressions — sample-friendly, groove-based
// 嘻哈进行 — 适合采样，以律动为基础
// ---------------------------------------------------------------------------
const HIPHOP_PROGRESSIONS: Progression[] = [
  {
    roman: 'ii7–V7–Imaj7',
    chords: ['Dm7', 'G7', 'Cmaj7'],
    description: 'Smooth jazz-rap — the sophisticated foundation',
    energy: 4,
    commonKeys: ['C', 'D', 'E♭', 'F', 'G']
  },
  {
    roman: 'Imaj7–iii7–vi7–IV',
    chords: ['Cmaj7', 'Em7', 'Am7', 'F'],
    description: 'Warm soulful — lush extended chords for laid-back vibes',
    energy: 5,
    commonKeys: ['C', 'D', 'E♭', 'F', 'G']
  },
  {
    roman: 'i7–VII–VI–VII',
    chords: ['Am7', 'G', 'F', 'G'],
    description: 'Neo-soul loop — atmospheric and hypnotic',
    energy: 3,
    commonKeys: ['C', 'D', 'E♭', 'F', 'G']
  },
  {
    roman: 'IV–I–V–vi',
    chords: ['F', 'C', 'G', 'Am'],
    description: 'Emotional trap — melodic minor feel',
    energy: 6,
    commonKeys: ['C', 'D', 'E♭', 'F', 'G']
  },
  {
    roman: 'i–♭VII–♭VI–♭VII',
    chords: ['Am', 'G', 'F', 'G'],
    description: 'Modern R&B groove — smooth and contemporary',
    energy: 4,
    commonKeys: ['C', 'D', 'E♭', 'F', 'G']
  },
  {
    roman: 'IV–iii–ii–I',
    chords: ['F', 'Em', 'Dm', 'C'],
    description: 'Descending soul — warm stepwise motion',
    energy: 5,
    commonKeys: ['C', 'D', 'E♭', 'F', 'G']
  }
]

// ---------------------------------------------------------------------------
// JAZZ progressions — extended harmony, ii–V–I centered
// 爵士进行 — 延伸和弦，以 ii–V–I 为核心
// ---------------------------------------------------------------------------
const JAZZ_PROGRESSIONS: Progression[] = [
  {
    roman: 'ii7–V7–Imaj7',
    chords: ['Dm7', 'G7', 'Cmaj7'],
    description: 'Fundamental jazz cadence — the most important progression in jazz',
    energy: 4,
    commonKeys: ['C', 'F', 'B♭', 'E♭', 'G']
  },
  {
    roman: 'I–VI7–ii7–V7',
    chords: ['Cmaj7', 'A7', 'Dm7', 'G7'],
    description: 'Rhythm changes A section — the backbone of bebop',
    energy: 5,
    commonKeys: ['C', 'F', 'B♭', 'E♭', 'G']
  },
  {
    roman: 'iii7–VI7–ii7–V7',
    chords: ['Em7', 'A7', 'Dm7', 'G7'],
    description: 'Circle of fifths turn — smooth harmonic motion',
    energy: 5,
    commonKeys: ['C', 'F', 'B♭', 'E♭', 'G']
  },
  {
    roman: 'Imaj7–♭VI7–ii7–V7',
    chords: ['Cmaj7', 'Ab7', 'Dm7', 'G7'],
    description: 'Tritone substitution — colorful reharmonization',
    energy: 6,
    commonKeys: ['C', 'F', 'B♭', 'E♭', 'G']
  },
  {
    roman: 'iim7b5–V7–im7',
    chords: ['Dm7b5', 'G7', 'Cm7'],
    description: 'Minor ii–V–i classic — dark and sophisticated',
    energy: 4,
    commonKeys: ['C', 'F', 'B♭', 'E♭', 'G']
  },
  {
    roman: 'I–VII–III–VI–II–V–I',
    chords: ['Cmaj7', 'Bm7', 'Em7', 'Am7', 'Dm7', 'G7', 'C'],
    description: 'Extended circle progression — the ultimate jazz workout',
    energy: 5,
    commonKeys: ['C', 'F', 'B♭', 'E♭', 'G']
  }
]

// ---------------------------------------------------------------------------
// CLASSICAL progressions — cadence-driven, voice-leading focused
// 古典进行 — 以终止式为导向，注重声部进行
// ---------------------------------------------------------------------------
const CLASSICAL_PROGRESSIONS: Progression[] = [
  {
    roman: 'I–IV–vii°–iii–vi–ii–V–I',
    chords: ['C', 'F', 'Bdim', 'Em', 'Am', 'Dm', 'G', 'C'],
    description: 'Circle of fifths, Baroque — the complete cycle',
    energy: 5,
    commonKeys: ['C', 'G', 'D', 'F', 'B♭']
  },
  {
    roman: 'i–iv–VII–III–VI–ii°–V–i',
    chords: ['Am', 'Dm', 'G', 'C', 'F', 'Bdim', 'E', 'Am'],
    description: 'Minor circle, Baroque — dramatic and powerful',
    energy: 6,
    commonKeys: ['C', 'G', 'D', 'F', 'B♭']
  },
  {
    roman: 'V–I',
    chords: ['G', 'C'],
    description: 'Perfect authentic cadence — the strongest resolution in Western music',
    energy: 8,
    commonKeys: ['C', 'G', 'D', 'F', 'B♭']
  },
  {
    roman: 'IV–I',
    chords: ['F', 'C'],
    description: 'Plagal cadence (Amen) — the church amen cadence',
    energy: 3,
    commonKeys: ['C', 'G', 'D', 'F', 'B♭']
  },
  {
    roman: 'V–vi',
    chords: ['G', 'Am'],
    description: 'Deceptive cadence — surprise resolution to the relative minor',
    energy: 4,
    commonKeys: ['C', 'G', 'D', 'F', 'B♭']
  },
  {
    roman: 'I–V–vi–iii–IV',
    chords: ['C', 'G', 'Am', 'Em', 'F'],
    description: 'Romantic descending 3rds — lush and emotional',
    energy: 4,
    commonKeys: ['C', 'G', 'D', 'F', 'B♭']
  }
]

// ---------------------------------------------------------------------------
// METAL progressions — power chords, dark tonality
// 金属进行 — 强力和弦，黑暗调性
// ---------------------------------------------------------------------------
const METAL_PROGRESSIONS: Progression[] = [
  {
    roman: 'i–VII–VI',
    chords: ['Am', 'G', 'F'],
    description: 'Classic metal anthem — the defining metal progression',
    energy: 9,
    commonKeys: ['E', 'D', 'C', 'A', 'G']
  },
  {
    roman: 'i–VI–VII',
    chords: ['Am', 'F', 'G'],
    description: 'Dark power chord — heavy and driving',
    energy: 8,
    commonKeys: ['E', 'D', 'C', 'A', 'G']
  },
  {
    roman: '♭VII–I',
    chords: ['Bb', 'C'],
    description: 'Mixolydian resolution — simple but crushing',
    energy: 8,
    commonKeys: ['E', 'D', 'C', 'A', 'G']
  },
  {
    roman: '♭VI–♭VII–I',
    chords: ['Ab', 'Bb', 'C'],
    description: 'Dark tension release — three chords of pure power',
    energy: 9,
    commonKeys: ['E', 'D', 'C', 'A', 'G']
  },
  {
    roman: 'i–iv–V',
    chords: ['Am', 'Dm', 'E'],
    description: 'Harmonic minor dramatic — exotic and menacing',
    energy: 7,
    commonKeys: ['E', 'D', 'C', 'A', 'G']
  },
  {
    roman: 'i–i–VI–VII',
    chords: ['Am', 'Am', 'F', 'G'],
    description: 'Doom metal repetition — slow, heavy, hypnotic',
    energy: 7,
    commonKeys: ['E', 'D', 'C', 'A', 'G']
  }
]

// ---------------------------------------------------------------------------
// R&B progressions — extended chords, smooth voice leading
// R&B 进行 — 延伸和弦，平滑声部进行
// ---------------------------------------------------------------------------
const RNB_PROGRESSIONS: Progression[] = [
  {
    roman: 'ii7–V7–Imaj7',
    chords: ['Dm7', 'G7', 'Cmaj7'],
    description: 'Smooth R&B foundation — the jazz influence on R&B',
    energy: 4,
    commonKeys: ['C', 'D♭', 'E♭', 'F', 'G']
  },
  {
    roman: 'Imaj7–iii7–vi7–IV',
    chords: ['Cmaj7', 'Em7', 'Am7', 'F'],
    description: 'Warm contemporary — lush and soulful',
    energy: 5,
    commonKeys: ['C', 'D♭', 'E♭', 'F', 'G']
  },
  {
    roman: 'i–iv–i–V7',
    chords: ['Am', 'Dm', 'Am', 'E7'],
    description: 'Gospel soul — church roots in modern R&B',
    energy: 6,
    commonKeys: ['C', 'D♭', 'E♭', 'F', 'G']
  },
  {
    roman: 'IV–iii–ii–I',
    chords: ['F', 'Em', 'Dm', 'C'],
    description: 'Descending warmth — smooth stepwise elegance',
    energy: 4,
    commonKeys: ['C', 'D♭', 'E♭', 'F', 'G']
  },
  {
    roman: 'i–♭VII–♭VI–♭VII',
    chords: ['Am', 'G', 'F', 'G'],
    description: 'Modern neo-soul — atmospheric and laid-back',
    energy: 3,
    commonKeys: ['C', 'D♭', 'E♭', 'F', 'G']
  },
  {
    roman: 'Imaj7–♭VII7–IVmaj7',
    chords: ['Cmaj7', 'Bb7', 'Fmaj7'],
    description: 'Jazz-R&B fusion — sophisticated harmonic blend',
    energy: 4,
    commonKeys: ['C', 'D♭', 'E♭', 'F', 'G']
  }
]

// ---------------------------------------------------------------------------
// COUNTRY progressions — Nashville numbers, open-chord friendly
// 乡村进行 — 纳什维尔数字体系，对开放和弦友好
// ---------------------------------------------------------------------------
const COUNTRY_PROGRESSIONS: Progression[] = [
  {
    roman: 'I–IV–V',
    chords: ['G', 'C', 'D'],
    description: 'Country foundation — the Nashville sound',
    energy: 7,
    commonKeys: ['G', 'D', 'A', 'C', 'E']
  },
  {
    roman: 'I–V–vi–IV',
    chords: ['G', 'D', 'Em', 'C'],
    description: 'Modern Nashville — pop-country crossover',
    energy: 6,
    commonKeys: ['G', 'D', 'A', 'C', 'E']
  },
  {
    roman: 'I–IV–I–V',
    chords: ['G', 'C', 'G', 'D'],
    description: 'Train beat classic — driving and upbeat',
    energy: 6,
    commonKeys: ['G', 'D', 'A', 'C', 'E']
  },
  {
    roman: 'I–vi–IV–V',
    chords: ['G', 'Em', 'C', 'D'],
    description: 'Country ballad — heartfelt and melodic',
    energy: 5,
    commonKeys: ['G', 'D', 'A', 'C', 'E']
  },
  {
    roman: 'I–V–IV–IV',
    chords: ['G', 'D', 'C', 'C'],
    description: 'Contemporary country — modern radio sound',
    energy: 7,
    commonKeys: ['G', 'D', 'A', 'C', 'E']
  },
  {
    roman: 'V–IV–I',
    chords: ['D', 'C', 'G'],
    description: 'Reverse resolution — unexpected but satisfying',
    energy: 5,
    commonKeys: ['G', 'D', 'A', 'C', 'E']
  }
]

// ---------------------------------------------------------------------------
// LATIN progressions — rhythmic, dance-oriented harmony
// 拉丁进行 — 节奏感强，以舞蹈为导向的和声
// ---------------------------------------------------------------------------
const LATIN_PROGRESSIONS: Progression[] = [
  {
    roman: 'ii7–V7–Imaj7',
    chords: ['Dm7', 'G7', 'Cmaj7'],
    description: 'Bossa nova foundation — the harmony behind the rhythm',
    energy: 4,
    commonKeys: ['C', 'D', 'G', 'A', 'E♭']
  },
  {
    roman: 'I–IV–V–IV',
    chords: ['C', 'F', 'G', 'F'],
    description: 'Salsa pillar — bright and energetic',
    energy: 7,
    commonKeys: ['C', 'D', 'G', 'A', 'E♭']
  },
  {
    roman: 'i–V7–V7–i',
    chords: ['Cm', 'G7', 'G7', 'Cm'],
    description: 'NY salsa minor — dramatic and intense',
    energy: 6,
    commonKeys: ['C', 'D', 'G', 'A', 'E♭']
  },
  {
    roman: 'IV–III–II–I',
    chords: ['F', 'E', 'D', 'C'],
    description: 'Spanish cadence — the Andalusian progression',
    energy: 5,
    commonKeys: ['C', 'D', 'G', 'A', 'E♭']
  },
  {
    roman: 'i–VII–VI–V',
    chords: ['Am', 'G', 'F', 'E'],
    description: 'Flamenco descending — passionate and fiery',
    energy: 6,
    commonKeys: ['C', 'D', 'G', 'A', 'E♭']
  },
  {
    roman: 'vi–ii–V–I',
    chords: ['Am', 'Dm', 'G', 'C'],
    description: 'Bossa nova turnaround — smooth and cyclical',
    energy: 4,
    commonKeys: ['C', 'D', 'G', 'A', 'E♭']
  }
]

// ---------------------------------------------------------------------------
// BLUES progressions — the 12-bar form and its variations
// 布鲁斯进行 — 12小节形式及其变体
// ---------------------------------------------------------------------------
const BLUES_PROGRESSIONS: Progression[] = [
  {
    roman: 'I7–IV7–I7–V7–IV7–I7',
    chords: ['C7', 'F7', 'C7', 'G7', 'F7', 'C7'],
    description: '12-bar blues standard — the foundation of modern music',
    energy: 7,
    commonKeys: ['E', 'A', 'D', 'G', 'C']
  },
  {
    roman: 'I7–IV7–I7–I7–IV7–IV7–I7–I7–V7–IV7–I7–V7',
    chords: ['C7', 'F7', 'C7', 'C7', 'F7', 'F7', 'C7', 'C7', 'G7', 'F7', 'C7', 'G7'],
    description: '12-bar blues template — the complete 12-bar form',
    energy: 8,
    commonKeys: ['E', 'A', 'D', 'G', 'C']
  },
  {
    roman: 'I7–IV7–I7–V7/ii–ii7–V7–I7–V7/VI–ii7–V7–I7–V7',
    chords: ['C7', 'F7', 'C7', 'A7', 'Dm7', 'G7', 'C7', 'A7', 'Dm7', 'G7', 'C7', 'G7'],
    description: 'Jazz blues — sophisticated harmony for blues',
    energy: 6,
    commonKeys: ['E', 'A', 'D', 'G', 'C']
  },
  {
    roman: 'i7–iv7–i7–i7–iv7–iv7–i7–i7–♭VII7–♭VII7–i7–V7',
    chords: ['Cm7', 'Fm7', 'Cm7', 'Cm7', 'Fm7', 'Fm7', 'Cm7', 'Cm7', 'Bb7', 'Bb7', 'Cm7', 'G7'],
    description: 'Minor blues — darker, moodier alternative',
    energy: 7,
    commonKeys: ['E', 'A', 'D', 'G', 'C']
  },
  {
    roman: 'I7–I7–IV7–I7–V7–IV7–I7–V7',
    chords: ['C7', 'C7', 'F7', 'C7', 'G7', 'F7', 'C7', 'G7'],
    description: 'Quick-change blues — early rock and roll staple',
    energy: 8,
    commonKeys: ['E', 'A', 'D', 'G', 'C']
  },
  {
    roman: 'I7–I7–I7–I7–IV7–IV7–I7–I7–V7–IV7–I7–I7',
    chords: ['C7', 'C7', 'C7', 'C7', 'F7', 'F7', 'C7', 'C7', 'G7', 'F7', 'C7', 'C7'],
    description: 'Slow blues — deep, emotional, spacious',
    energy: 5,
    commonKeys: ['E', 'A', 'D', 'G', 'C']
  }
]

/**
 * Lookup table mapping lowercase genre names to their progression arrays.
 */
const PROGRESSION_DATA: Record<string, Progression[]> = {
  pop: POP_PROGRESSIONS,
  rock: ROCK_PROGRESSIONS,
  edm: EDM_PROGRESSIONS,
  'hip-hop': HIPHOP_PROGRESSIONS,
  jazz: JAZZ_PROGRESSIONS,
  classical: CLASSICAL_PROGRESSIONS,
  metal: METAL_PROGRESSIONS,
  'r&b': RNB_PROGRESSIONS,
  country: COUNTRY_PROGRESSIONS,
  latin: LATIN_PROGRESSIONS,
  blues: BLUES_PROGRESSIONS
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Find the chromatic index (0–11) of a note name.
 * Accepts both sharp (C#, F#) and flat (Bb, Eb) spellings.
 *
 * @param note - Note name (e.g., 'C', 'F#', 'Bb', 'Eb')
 * @returns Chromatic index 0–11, or -1 if not found
 *
 * 将音符名转换为半音索引 (0–11)。
 * 支持升号 (C#, F#) 和降号 (Bb, Eb) 两种拼写。
 */
function noteToIndex(note: string): number {
  const sharpIdx = NOTES_SHARP.indexOf(note)
  if (sharpIdx !== -1) return sharpIdx
  return NOTES_FLAT.indexOf(note)
}

/**
 * Get the note name at a chromatic index, preferring either sharp or flat
 * notation based on the `useFlat` flag.
 *
 * @param index - Chromatic index (0–11, will be modulo 12)
 * @param useFlat - Whether to prefer flat notation (default: false)
 * @returns Note name in the preferred spelling
 *
 * 根据 chromatic index 获取音符名，通过 useFlat 控制使用升号或降号表示。
 */
function indexToNote(index: number, useFlat: boolean): string {
  const i = ((index % 12) + 12) % 12
  return useFlat ? NOTES_FLAT[i] : NOTES_SHARP[i]
}

/**
 * Determine whether a chord name uses flat notation in its root.
 *
 * @param chord - Full chord name (e.g., 'Bb', 'Bb7', 'Fm')
 * @returns true if the root uses flat notation
 *
 * 判断和弦名的根音是否使用降号。
 */
function chordUsesFlat(chord: string): boolean {
  // Root is the first character(s): C, C#, Db, D, D#, Eb, E, F, F#, Gb, G, G#, Ab, A, A#, Bb, B
  if (chord.length >= 2 && (chord[1] === 'b' || chord[1] === '♭')) return true
  return false
}

/**
 * Extract the root note from a chord name.
 * Handles: 'C' → 'C', 'F#' → 'F#', 'Bb' → 'Bb', 'Cmaj7' → 'C', 'F#dim' → 'F#', etc.
 *
 * @param chord - Full chord name
 * @returns The root note portion
 *
 * 从和弦名中提取根音。
 */
function parseRoot(chord: string): string {
  if (chord.length >= 2 && (chord[1] === '#' || chord[1] === 'b' || chord[1] === '♭')) {
    // Convert unicode flat '♭' to 'b' for index lookup
    if (chord[1] === '♭') return chord[0] + 'b'
    return chord.slice(0, 2)
  }
  return chord[0]
}

/**
 * Extract the quality/extension suffix from a chord name.
 * e.g., 'Cmaj7' → 'maj7', 'Dm' → 'm', 'G7' → '7', 'F#dim' → 'dim'
 *
 * @param chord - Full chord name
 * @returns The quality suffix (everything after the root)
 *
 * 从和弦名中提取质量/后缀部分。
 */
function parseQuality(chord: string): string {
  if (chord.length >= 2 && (chord[1] === '#' || chord[1] === 'b' || chord[1] === '♭')) {
    return chord.slice(2)
  }
  return chord.slice(1)
}

/**
 * Transpose a chord name by a given number of semitones.
 * Preserves the chord quality (m, 7, maj7, dim, etc.).
 *
 * @param chord - Chord name to transpose (e.g., 'Dm', 'G7', 'F#dim', 'Bb')
 * @param semitones - Number of semitones to transpose (positive = up)
 * @returns Transposed chord name
 *
 * 将和弦名按指定半音数移调。
 * 保留和弦质量标记（m, 7, maj7, dim 等）。
 */
function transposeChord(chord: string, semitones: number): string {
  const root = parseRoot(chord)
  const quality = parseQuality(chord)
  const rootIdx = noteToIndex(root)
  if (rootIdx === -1) return chord // fallback: return unchanged

  const useFlat = root.includes('b')
  const newRoot = indexToNote(rootIdx + semitones, useFlat)
  return newRoot + quality
}

// =============================================================================
// Public API Functions
// =============================================================================

/**
 * Get chord progressions for a given music genre.
 * Returns at least 6 progressions per genre, each with Roman numeral analysis,
 * example chords, emotional description, and energy rating.
 *
 * @param genre - Genre name (case-insensitive, e.g., 'Pop', 'rock', 'EDM')
 * @returns Array of Progression objects, or empty array if genre not found
 *
 * 获取指定音乐流派的和弦进行。
 * 每个流派至少返回6条进行，包含罗马数字分析、示例和弦、情感描述和能量评级。
 * 如果流派不存在，返回空数组。
 */
export function getProgressions(genre: string): Progression[] {
  const key = genre.toLowerCase().trim()
  const data = PROGRESSION_DATA[key]
  if (!data) return []
  return data
}

/**
 * Returns true if an interval (in semitones) represents a minor or diminished
 * quality, which should use flat notation (Eb, Gb, Bb) rather than sharp
 * (D#, F#, A#) for musical correctness.
 *
 * Minor/dim intervals: minor 3rd (3), diminished 5th (6), diminished 7th (9), minor 7th (10)
 * 小三度、减五度、减七度、小七度音程应使用降号表示。
 *
 * @param interval - Semitone interval from root
 * @returns true if flat notation is preferred for this interval
 */
function intervalPrefersFlat(interval: number): boolean {
  const semitones = ((interval % 12) + 12) % 12
  // 3=minor 3rd, 6=diminished 5th, 9=diminished 7th, 10=minor 7th
  return semitones === 3 || semitones === 6 || semitones === 9 || semitones === 10
}

/**
 * Build the notes of an extended chord from a root note and chord type.
 *
 * Uses semitone intervals to calculate each chord tone from the root:
 *   - maj7:  [0, 4, 7, 11]  — 大七和弦 (Cmaj7 = C E G B)
 *   - min7:  [0, 3, 7, 10]  — 小七和弦 (Dmin7 = D F A C)
 *   - dom7:  [0, 4, 7, 10]  — 属七和弦 (Gdom7 = G B D F)
 *   - dim7:  [0, 3, 6, 9]   — 减七和弦 (Cdim7 = C Eb Gb A)
 *   - aug:   [0, 4, 8]      — 增三和弦 (Caug = C E G#)
 *   - sus2:  [0, 2, 7]      — 挂留二和弦
 *   - sus4:  [0, 5, 7]      — 挂留四和弦
 *   - maj9:  [0, 4, 7, 11, 14] — 大九和弦
 *   - min9:  [0, 3, 7, 10, 14] — 小九和弦 (Cmin9 = C Eb G Bb D)
 *   - dom9:  [0, 4, 7, 10, 14] — 属九和弦 (Cdom9 = C E G Bb D)
 *
 * Notation follows music theory conventions:
 *   - Minor/dim intervals (3, 6, 9, 10 semitones) use flat spellings.
 *   - Major/aug intervals (4, 8, 11 semitones) use sharp spellings.
 *   - The root, perfect intervals, and major 2nd use the root's notation.
 *
 * @param root - Root note (e.g., 'C', 'F#', 'Bb')
 * @param type - Extended chord type
 * @returns Array of note names in the chord, from root upward
 *
 * 从根音和和弦类型构建延伸和弦的音符列表。
 * 使用半音音程计算每个和弦音，并按照乐理规范选择升降号表示。
 */
export function extendedChord(root: string, type: ExtendedChordType): string[] {
  const rootIdx = noteToIndex(root)
  if (rootIdx === -1) return []

  const rootUsesFlat = root.includes('b')
  const intervals = CHORD_INTERVALS[type]

  return intervals.map((interval) => {
    let useFlat: boolean
    if (interval === 0) {
      // Root — use the root's own spelling
      useFlat = rootUsesFlat
    } else if (intervalPrefersFlat(interval)) {
      // Minor/dim intervals (3, 6, 9, 10) — flat notation is musically correct
      useFlat = true
    } else {
      // Major/aug intervals (4, 8, 11) — sharp notation
      useFlat = false
    }
    return indexToNote(rootIdx + interval, useFlat)
  })
}

/**
 * Get modal interchange (mode mixture) information for a given key.
 *
 * Modal interchange borrows chords from parallel modes (same tonic, different
 * scale). For example, in C major you can borrow F from C Aeolian or D from
 * C Lydian, creating unexpected harmonic colors.
 *
 * 调式互换（Mode Mixture）是指在同一个主音上借用平行调的和弦。
 * 例如在C大调中，可以从C伊奥利亚调借用F，或从C利底亚调借用D，
 * 创造出意想不到的和声色彩。
 *
 * @param sourceKey - Key to get modal interchange data for
 *                    (e.g., 'C', 'G', 'Bb'). Case-insensitive, supports both
 *                    sharp and flat notation.
 * @returns Array of ModalInterchange objects, one per parallel mode
 *
 * 获取指定调的调式互换信息。
 * 如果指定的键不是C，所有和弦会自动移调到目标调。
 */
export function modalInterchange(sourceKey: string): ModalInterchange[] {
  const normalizedKey = sourceKey.trim()
  const keyIdx = noteToIndex(normalizedKey)

  // If key not found or it's C, return the base data unchanged
  if (keyIdx === -1) return []
  if (normalizedKey === 'C') return C_PARALLEL_MODES

  // C is at index 0; calculate semitone shift from C to the target key
  // C=0, so the semitones needed = keyIdx - 0 = keyIdx
  const semitones = keyIdx

  return C_PARALLEL_MODES.map((mode) => ({
    mode: mode.mode,
    borrowedChords: mode.borrowedChords.map((chord) =>
      transposeChord(chord, semitones)
    ),
    description: mode.description
  }))
}
