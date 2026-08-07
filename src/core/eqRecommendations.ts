/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * EQ Recommendations Module
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 * Provides frequency band recommendations for EQ (equalizer) based on:
 *   - Mix element type (kick, snare, vocals, etc.)
 *   - Music genre (pop, rock, electronic, hip-hop, etc.)
 *
 * WHY THIS IS USEFUL:
 * EQ is one of the most important mixing tools. Beginners often don't know
 * which frequencies to cut or boost for each instrument. This module gives
 * a solid starting point that can be refined by ear.
 *
 * HOW TO USE:
 *   import { getEqRecommendations, GENRES, MIX_ELEMENTS, type MixElement, type Genre } from '../core/eqRecommendations'
 *
 *   // Get recommendations for a specific element in a genre
 *   const recs = getEqRecommendations('kick', 'pop')
 *   // Returns: { element: 'kick', genre: 'pop', bands: [...] }
 *
 *   // Get all elements for a genre
 *   const allRecs = getGenreMixRecommendations('electronic')
 *   // Returns: { genre: 'electronic', elements: [...] }
 */

// =============================================================================
// Imports
// =============================================================================

import type { SuperGenre } from './genreTaxonomy'

// =============================================================================
// Type Definitions
// =============================================================================

/** Represents a single EQ frequency band recommendation */
export interface EqBand {
  /** Frequency in Hz (center of the band) */
  frequency: number
  /** Q-factor (bandwidth). Higher = narrower band */
  q: number
  /** Gain adjustment in dB. Positive = boost, negative = cut */
  gain: number
  /** Human-readable label for what this band affects */
  label: string
  /** Whether this is a cut (subtractive) or boost (additive) */
  type: 'cut' | 'boost' | 'shelf'
}

/** Available music genres for EQ presets */
export type Genre =
  | 'pop'
  | 'rock'
  | 'electronic'
  | 'hiphop'
  | 'jazz'
  | 'classical'
  | 'metal'
  | 'rnb'
  | 'country'
  | 'latin'



/** Available mix elements (instruments/buses) you'd put EQ on */
export type MixElement =
  | 'kick'
  | 'snare'
  | 'hihat'
  | 'tom'
  | 'bass'
  | 'vocals'
  | 'guitar'
  | 'piano'
  | 'strings'
  | 'pad'
  | 'fx'
  | 'master'

/** EQ recommendation for one element in one genre */
export interface EqRecommendation {
  /** Which mix element this applies to */
  element: MixElement
  /** Which genre this is optimized for */
  genre: Genre
  /** Human-readable description of the EQ approach */
  description: string
  /** Array of EQ band adjustments to apply */
  bands: EqBand[]
}

/** Complete genre mix — all elements with EQ recs for one genre */
export interface GenreMixRecommendation {
  genre: Genre
  /** Display name for the genre */
  label: string
  /** Array of EQ recommendations, one per mix element */
  elements: EqRecommendation[]
}

// =============================================================================
// Constants
// =============================================================================

/** All available genres with their display labels and super-genre family */
export const GENRES: { value: Genre; label: string; superGenre: SuperGenre }[] = [
  // ── Electronic / Dance ──
  { value: 'electronic', label: 'Electronic', superGenre: 'electronic' },
  // ── Rock / Pop ──
  { value: 'pop', label: 'Pop', superGenre: 'rockPop' },
  { value: 'rock', label: 'Rock', superGenre: 'rockPop' },
  // ── Jazz / Blues / R&B ──
  { value: 'jazz', label: 'Jazz', superGenre: 'jazzBlues' },
  { value: 'rnb', label: 'R&B', superGenre: 'jazzBlues' },
  // ── Hip-Hop ──
  { value: 'hiphop', label: 'Hip-Hop', superGenre: 'hipHop' },
  // ── Metal ──
  { value: 'metal', label: 'Metal', superGenre: 'metal' },
  // ── Folk / Country / World ──
  { value: 'country', label: 'Country', superGenre: 'folkCountry' },
  { value: 'latin', label: 'Latin', superGenre: 'folkCountry' },
  // ── Classical / Ambient ──
  { value: 'classical', label: 'Classical', superGenre: 'classicalAmbient' }
]

/** All mix elements with display labels */
export const MIX_ELEMENTS: { value: MixElement; label: string }[] = [
  { value: 'kick', label: 'Kick' },
  { value: 'snare', label: 'Snare' },
  { value: 'hihat', label: 'Hi-Hat / Cymbals' },
  { value: 'tom', label: 'Toms' },
  { value: 'bass', label: 'Bass' },
  { value: 'vocals', label: 'Vocals' },
  { value: 'guitar', label: 'Guitar' },
  { value: 'piano', label: 'Piano / Keys' },
  { value: 'strings', label: 'Strings' },
  { value: 'pad', label: 'Pad / Synth' },
  { value: 'fx', label: 'FX / Risers' },
  { value: 'master', label: 'Master Bus' }
]

// =============================================================================
// EQ Recommendation Database
//
// Each entry defines the standard EQ approach for one instrument in one genre.
// Values are based on common mixing practices from professional engineers.
// Beginners should use these as starting points and trust their ears!
// =============================================================================

// ---------------------------------------------------------------------------
// POP EQ recommendations
// ---------------------------------------------------------------------------
const POP_EQS: Record<string, EqRecommendation> = {
  kick: {
    element: 'kick',
    genre: 'pop',
    description: 'Clear punchy kick — sub presence with attack click',
    bands: [
      { frequency: 50, q: 1.0, gain: 3, label: 'Sub bass body', type: 'boost' },
      { frequency: 200, q: 1.5, gain: -2, label: 'Boxiness reduction', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 2, label: 'Beater attack', type: 'boost' },
      { frequency: 80, q: 1.0, gain: -3, label: 'Low-mud cleanup', type: 'cut' }
    ]
  },
  snare: {
    element: 'snare',
    genre: 'pop',
    description: 'Crisp snare with body and snap',
    bands: [
      { frequency: 200, q: 1.5, gain: 3, label: 'Snare body/thickness', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -3, label: 'Boxiness removal', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 4, label: 'Snap/crack', type: 'boost' },
      { frequency: 150, q: 1.5, gain: -2, label: 'Low rumble reduction', type: 'cut' }
    ]
  },
  hihat: {
    element: 'hihat',
    genre: 'pop',
    description: 'Airy hi-hat with reduced harshness',
    bands: [
      { frequency: 250, q: 1.0, gain: -3, label: 'Low clank removal', type: 'cut' },
      { frequency: 8000, q: 1.5, gain: 3, label: 'Air/shine', type: 'boost' },
      { frequency: 10000, q: 2.0, gain: 2, label: 'Sparkle top-end', type: 'boost' }
    ]
  },
  tom: {
    element: 'tom',
    genre: 'pop',
    description: 'Warm toms with punch',
    bands: [
      { frequency: 100, q: 1.5, gain: 3, label: 'Body/thump', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud removal', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 3, label: 'Stick attack', type: 'boost' }
    ]
  },
  bass: {
    element: 'bass',
    genre: 'pop',
    description: 'Clean sub bass with finger attack',
    bands: [
      { frequency: 60, q: 1.0, gain: 3, label: 'Sub bass foundation', type: 'boost' },
      { frequency: 200, q: 1.0, gain: -4, label: 'Muddiness cleanup', type: 'cut' },
      { frequency: 800, q: 1.5, gain: 3, label: 'Finger/pick attack', type: 'boost' },
      { frequency: 40, q: 1.5, gain: -3, label: 'Lowest rumble HPF', type: 'cut' }
    ]
  },
  vocals: {
    element: 'vocals',
    genre: 'pop',
    description: 'Present, clear vocals with air',
    bands: [
      { frequency: 120, q: 1.5, gain: -3, label: 'Proximity effect cut', type: 'cut' },
      { frequency: 300, q: 1.5, gain: -2, label: 'Muddiness reduction', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 3, label: 'Presence/clarity', type: 'boost' },
      { frequency: 10000, q: 2.0, gain: 2, label: 'Air/brightness', type: 'boost' }
    ]
  },
  guitar: {
    element: 'guitar',
    genre: 'pop',
    description: 'Full guitar that cuts through the mix',
    bands: [
      { frequency: 200, q: 1.5, gain: -2, label: 'Boxiness reduction', type: 'cut' },
      { frequency: 2000, q: 2.0, gain: 4, label: 'Presence/pick attack', type: 'boost' },
      { frequency: 250, q: 1.5, gain: 2, label: 'Low body warmth', type: 'boost' },
      { frequency: 8000, q: 2.0, gain: 2, label: 'Air on acoustic', type: 'boost' }
    ]
  },
  piano: {
    element: 'piano',
    genre: 'pop',
    description: 'Balanced piano — warm lows, clear highs',
    bands: [
      { frequency: 100, q: 1.5, gain: 2, label: 'Low body/warmth', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Muddiness cleanup', type: 'cut' },
      { frequency: 4000, q: 2.0, gain: 3, label: 'Presence/attack', type: 'boost' },
      { frequency: 80, q: 1.0, gain: -2, label: 'Low rumble HPF', type: 'cut' }
    ]
  },
  strings: {
    element: 'strings',
    genre: 'pop',
    description: 'Lush strings with air and body',
    bands: [
      { frequency: 200, q: 1.5, gain: 3, label: 'Body/warmth', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -2, label: 'Nasal resonance cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 3, label: 'Air/brightness', type: 'boost' },
      { frequency: 60, q: 1.0, gain: -3, label: 'Sub rumble HPF', type: 'cut' }
    ]
  },
  pad: {
    element: 'pad',
    genre: 'pop',
    description: 'Smooth pad that sits in the background',
    bands: [
      { frequency: 150, q: 1.5, gain: 2, label: 'Warmth', type: 'boost' },
      { frequency: 500, q: 1.5, gain: -4, label: 'Mud/boxiness cut', type: 'cut' },
      { frequency: 6000, q: 2.0, gain: 2, label: 'Air for shimmer', type: 'boost' },
      { frequency: 80, q: 1.0, gain: -3, label: 'Sub rumble HPF', type: 'cut' }
    ]
  },
  fx: {
    element: 'fx',
    genre: 'pop',
    description: 'Wide FX with controlled brightness',
    bands: [
      { frequency: 200, q: 1.0, gain: -3, label: 'Low rumble cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 4, label: 'Sparkle/shine', type: 'boost' },
      { frequency: 2000, q: 1.5, gain: -2, label: 'Harshness cut if needed', type: 'cut' }
    ]
  },
  master: {
    element: 'master',
    genre: 'pop',
    description: 'Gentle master bus EQ for polish',
    bands: [
      { frequency: 60, q: 1.0, gain: -1, label: 'Sub rumble control', type: 'cut' },
      { frequency: 300, q: 1.0, gain: -1.5, label: 'Low-mid cleanup', type: 'cut' },
      { frequency: 8000, q: 1.5, gain: 1.5, label: 'Air/openness', type: 'boost' },
      { frequency: 30, q: 1.0, gain: -3, label: 'Deep subsonic HPF', type: 'cut' }
    ]
  }
}

// ---------------------------------------------------------------------------
// ELECTRONIC EQ recommendations (dance music focus)
// ---------------------------------------------------------------------------
const ELECTRONIC_EQS: Record<string, EqRecommendation> = {
  kick: {
    element: 'kick',
    genre: 'electronic',
    description: 'Punchy electronic kick — sub-heavy with click',
    bands: [
      { frequency: 50, q: 1.0, gain: 5, label: 'Deep sub presence', type: 'boost' },
      { frequency: 100, q: 2.0, gain: -3, label: 'Boxiness notch', type: 'cut' },
      { frequency: 2000, q: 2.0, gain: 4, label: 'Click/attack transient', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -3, label: 'Hollow body cut', type: 'cut' }
    ]
  },
  snare: {
    element: 'snare',
    genre: 'electronic',
    description: 'Layered electronic snare with snap',
    bands: [
      { frequency: 200, q: 1.5, gain: 4, label: 'Snare body', type: 'boost' },
      { frequency: 400, q: 2.0, gain: -4, label: 'Boxiness notch', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 5, label: 'Snap/crack transient', type: 'boost' },
      { frequency: 150, q: 1.5, gain: -3, label: 'Low rumble cut', type: 'cut' }
    ]
  },
  hihat: {
    element: 'hihat',
    genre: 'electronic',
    description: 'Crisp hi-hats for rhythmic drive',
    bands: [
      { frequency: 300, q: 1.0, gain: -4, label: 'Low body removal', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 4, label: 'Shimmer/air', type: 'boost' },
      { frequency: 12000, q: 2.0, gain: 3, label: 'Top-end sparkle', type: 'boost' },
      { frequency: 5000, q: 2.0, gain: -2, label: 'Harshness taming', type: 'cut' }
    ]
  },
  tom: {
    element: 'tom',
    genre: 'electronic',
    description: 'Electronic toms with sub weight',
    bands: [
      { frequency: 80, q: 1.5, gain: 4, label: 'Thump/weight', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud removal', type: 'cut' },
      { frequency: 4000, q: 2.0, gain: 3, label: 'Attack transient', type: 'boost' }
    ]
  },
  bass: {
    element: 'bass',
    genre: 'electronic',
    description: 'Massive sub bass with clean mid attack',
    bands: [
      { frequency: 50, q: 1.0, gain: 5, label: 'Sub bass weight', type: 'boost' },
      { frequency: 120, q: 1.0, gain: -4, label: 'Mud cleanup', type: 'cut' },
      { frequency: 800, q: 2.0, gain: 3, label: 'Mid definition', type: 'boost' },
      { frequency: 30, q: 1.5, gain: -4, label: 'Deep subsonic HPF', type: 'cut' }
    ]
  },
  vocals: {
    element: 'vocals',
    genre: 'electronic',
    description: 'Vocals that cut through dense electronic mixes',
    bands: [
      { frequency: 150, q: 1.5, gain: -4, label: 'Proximity effect cut', type: 'cut' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Muddiness reduction', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 4, label: 'Presence over beat', type: 'boost' },
      { frequency: 10000, q: 2.0, gain: 3, label: 'Air/shine', type: 'boost' }
    ]
  },
  guitar: {
    element: 'guitar',
    genre: 'electronic',
    description: 'Tight electronic guitar in the mix',
    bands: [
      { frequency: 200, q: 1.5, gain: -3, label: 'Low boxiness cut', type: 'cut' },
      { frequency: 2500, q: 2.0, gain: 3, label: 'Presence/pick', type: 'boost' },
      { frequency: 100, q: 1.5, gain: -3, label: 'Rumble HPF', type: 'cut' },
      { frequency: 7000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  piano: {
    element: 'piano',
    genre: 'electronic',
    description: 'Electronic piano/keyboard clarity',
    bands: [
      { frequency: 100, q: 1.5, gain: 2, label: 'Body/warmth', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -4, label: 'Mud removal', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 3, label: 'Attack/presence', type: 'boost' },
      { frequency: 80, q: 1.0, gain: -3, label: 'Rumble HPF', type: 'cut' }
    ]
  },
  strings: {
    element: 'strings',
    genre: 'electronic',
    description: 'Synthetic strings with body and air',
    bands: [
      { frequency: 150, q: 1.5, gain: 3, label: 'Body', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -3, label: 'Nasal cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 4, label: 'Air/shimmer', type: 'boost' },
      { frequency: 60, q: 1.0, gain: -3, label: 'Sub cut', type: 'cut' }
    ]
  },
  pad: {
    element: 'pad',
    genre: 'electronic',
    description: 'Lush synth pads with clean low end',
    bands: [
      { frequency: 200, q: 1.5, gain: 3, label: 'Warmth', type: 'boost' },
      { frequency: 500, q: 1.5, gain: -5, label: 'Mud cut', type: 'cut' },
      { frequency: 7000, q: 2.0, gain: 3, label: 'Shimmer', type: 'boost' },
      { frequency: 80, q: 1.0, gain: -4, label: 'Sub rumble HPF', type: 'cut' }
    ]
  },
  fx: {
    element: 'fx',
    genre: 'electronic',
    description: 'Dramatic FX with air and width',
    bands: [
      { frequency: 100, q: 1.0, gain: -4, label: 'Low rumble cut', type: 'cut' },
      { frequency: 10000, q: 2.0, gain: 5, label: 'Air/top shine', type: 'boost' },
      { frequency: 3000, q: 1.5, gain: -3, label: 'Harshness if needed', type: 'cut' }
    ]
  },
  master: {
    element: 'master',
    genre: 'electronic',
    description: 'Master bus for loud, clear electronic music',
    bands: [
      { frequency: 40, q: 1.0, gain: -2, label: 'Subsonic rumble cut', type: 'cut' },
      { frequency: 200, q: 1.0, gain: -2, label: 'Mud control', type: 'cut' },
      { frequency: 10000, q: 1.5, gain: 2, label: 'Air/openness', type: 'boost' },
      { frequency: 60, q: 1.0, gain: 1, label: 'Punch', type: 'boost' }
    ]
  }
}

// ---------------------------------------------------------------------------
// HIP-HOP EQ recommendations (heavy low-end focus)
// ---------------------------------------------------------------------------
const HIPHOP_EQS: Record<string, EqRecommendation> = {
  kick: {
    element: 'kick',
    genre: 'hiphop',
    description: 'Massive hip-hop kick — sub monster',
    bands: [
      { frequency: 50, q: 1.0, gain: 6, label: 'Sub bass weight', type: 'boost' },
      { frequency: 200, q: 2.0, gain: -4, label: 'Boxiness notch', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 3, label: 'Click/attack', type: 'boost' },
      { frequency: 100, q: 1.5, gain: -3, label: 'Low-mid cleanup', type: 'cut' }
    ]
  },
  snare: {
    element: 'snare',
    genre: 'hiphop',
    description: 'Fat snare with snap — trap style',
    bands: [
      { frequency: 200, q: 1.5, gain: 5, label: 'Fat body', type: 'boost' },
      { frequency: 400, q: 2.0, gain: -3, label: 'Boxy notch', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 5, label: 'Snap transient', type: 'boost' },
      { frequency: 100, q: 1.5, gain: -3, label: 'Rumble cut', type: 'cut' }
    ]
  },
  hihat: {
    element: 'hihat',
    genre: 'hiphop',
    description: 'Crisp hi-hats on top with body rolled off',
    bands: [
      { frequency: 300, q: 1.0, gain: -5, label: 'Full low cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 4, label: 'Shimmer', type: 'boost' },
      { frequency: 10000, q: 2.0, gain: 3, label: 'Top sparkle', type: 'boost' },
      { frequency: 200, q: 1.0, gain: -3, label: 'Extra low cut', type: 'cut' }
    ]
  },
  tom: {
    element: 'tom',
    genre: 'hiphop',
    description: 'Boomy toms with weight',
    bands: [
      { frequency: 80, q: 1.5, gain: 5, label: 'Weight/thump', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 4000, q: 2.0, gain: 3, label: 'Attack', type: 'boost' }
    ]
  },
  bass: {
    element: 'bass',
    genre: 'hiphop',
    description: 'Massive 808 sub bass with attack',
    bands: [
      { frequency: 50, q: 1.0, gain: 6, label: 'Sub foundation', type: 'boost' },
      { frequency: 150, q: 1.0, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 1000, q: 2.0, gain: 3, label: 'Attack/definition', type: 'boost' },
      { frequency: 30, q: 1.5, gain: -4, label: 'Subsonic HPF', type: 'cut' }
    ]
  },
  vocals: {
    element: 'vocals',
    genre: 'hiphop',
    description: 'In-your-face rap vocals',
    bands: [
      { frequency: 100, q: 1.5, gain: -4, label: 'Proximity cut', type: 'cut' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud reduction', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 5, label: 'Presence/aggression', type: 'boost' },
      { frequency: 10000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  guitar: {
    element: 'guitar',
    genre: 'hiphop',
    description: 'Guitar sits in hip-hop mix',
    bands: [
      { frequency: 150, q: 1.5, gain: -3, label: 'Low cut', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 3, label: 'Presence', type: 'boost' },
      { frequency: 800, q: 1.5, gain: -2, label: 'Mud if needed', type: 'cut' }
    ]
  },
  piano: {
    element: 'piano',
    genre: 'hiphop',
    description: 'Sampled piano for hip-hop beats',
    bands: [
      { frequency: 80, q: 1.5, gain: -3, label: 'Rumble cut', type: 'cut' },
      { frequency: 300, q: 1.5, gain: -4, label: 'Mud cut', type: 'cut' },
      { frequency: 4000, q: 2.0, gain: 3, label: 'Attack/presence', type: 'boost' },
      { frequency: 200, q: 1.0, gain: 2, label: 'Body lift', type: 'boost' }
    ]
  },
  strings: {
    element: 'strings',
    genre: 'hiphop',
    description: 'Dramatic strings for hip-hop',
    bands: [
      { frequency: 150, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -3, label: 'Nasal cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 3, label: 'Air', type: 'boost' },
      { frequency: 60, q: 1.0, gain: -3, label: 'Sub HPF', type: 'cut' }
    ]
  },
  pad: {
    element: 'pad',
    genre: 'hiphop',
    description: 'Pad in the background',
    bands: [
      { frequency: 150, q: 1.5, gain: 2, label: 'Body warmth', type: 'boost' },
      { frequency: 500, q: 1.5, gain: -4, label: 'Mud cut', type: 'cut' },
      { frequency: 7000, q: 2.0, gain: 2, label: 'Shimmer', type: 'boost' },
      { frequency: 80, q: 1.0, gain: -3, label: 'Sub HPF', type: 'cut' }
    ]
  },
  fx: {
    element: 'fx',
    genre: 'hiphop',
    description: 'FX hits and sweeps',
    bands: [
      { frequency: 100, q: 1.0, gain: -4, label: 'Low rumble cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 4, label: 'Air/sparkle', type: 'boost' }
    ]
  },
  master: {
    element: 'master',
    genre: 'hiphop',
    description: 'Master bus for loud, bass-heavy mix',
    bands: [
      { frequency: 40, q: 1.0, gain: -2, label: 'Subsonic control', type: 'cut' },
      { frequency: 200, q: 1.0, gain: -2, label: 'Mud reduction', type: 'cut' },
      { frequency: 10000, q: 1.5, gain: 2, label: 'Air', type: 'boost' },
      { frequency: 60, q: 1.0, gain: 1.5, label: 'Sub punch', type: 'boost' }
    ]
  }
}

// ---------------------------------------------------------------------------
// ROCK EQ recommendations
// ---------------------------------------------------------------------------
const ROCK_EQS: Record<string, EqRecommendation> = {
  kick: {
    element: 'kick',
    genre: 'rock',
    description: 'Punchy rock kick with beater attack',
    bands: [
      { frequency: 60, q: 1.0, gain: 4, label: 'Punch/weight', type: 'boost' },
      { frequency: 400, q: 2.0, gain: -4, label: 'Boxiness/hollowness', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 3, label: 'Beater attack', type: 'boost' },
      { frequency: 100, q: 1.5, gain: -3, label: 'Mud cleanup', type: 'cut' }
    ]
  },
  snare: {
    element: 'snare',
    genre: 'rock',
    description: 'Powerful rock snare with crack',
    bands: [
      { frequency: 200, q: 1.5, gain: 4, label: 'Body/thickness', type: 'boost' },
      { frequency: 400, q: 2.0, gain: -4, label: 'Boxiness notch', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 4, label: 'Crack/snap', type: 'boost' },
      { frequency: 150, q: 1.5, gain: -2, label: 'Rumble cut', type: 'cut' }
    ]
  },
  hihat: {
    element: 'hihat',
    genre: 'rock',
    description: 'Natural hi-hat in rock mix',
    bands: [
      { frequency: 250, q: 1.0, gain: -3, label: 'Clank removal', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 3, label: 'Air/shine', type: 'boost' },
      { frequency: 10000, q: 2.0, gain: 2, label: 'Top sparkle', type: 'boost' }
    ]
  },
  tom: {
    element: 'tom',
    genre: 'rock',
    description: 'Big rock toms',
    bands: [
      { frequency: 100, q: 1.5, gain: 4, label: 'Weight/thump', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -4, label: 'Mud removal', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 3, label: 'Attack', type: 'boost' },
      { frequency: 80, q: 1.0, gain: -2, label: 'Sub cleaning', type: 'cut' }
    ]
  },
  bass: {
    element: 'bass',
    genre: 'rock',
    description: 'Growling rock bass',
    bands: [
      { frequency: 80, q: 1.0, gain: 3, label: 'Low thump', type: 'boost' },
      { frequency: 200, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 700, q: 2.0, gain: 4, label: 'Growl/mid attack', type: 'boost' },
      { frequency: 40, q: 1.0, gain: -3, label: 'Subsonic HPF', type: 'cut' }
    ]
  },
  vocals: {
    element: 'vocals',
    genre: 'rock',
    description: 'Rock vocals that cut through guitars',
    bands: [
      { frequency: 150, q: 1.5, gain: -3, label: 'Proximity cut', type: 'cut' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud reduction', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 4, label: 'Presence over guitars', type: 'boost' },
      { frequency: 10000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  guitar: {
    element: 'guitar',
    genre: 'rock',
    description: 'Crunchy rock guitars with bite',
    bands: [
      { frequency: 200, q: 1.5, gain: -3, label: 'Boxiness cut', type: 'cut' },
      { frequency: 2500, q: 2.0, gain: 5, label: 'Bite/presence', type: 'boost' },
      { frequency: 800, q: 1.5, gain: 3, label: 'Body/growl', type: 'boost' },
      { frequency: 100, q: 1.5, gain: -4, label: 'Rumble HPF', type: 'cut' }
    ]
  },
  piano: {
    element: 'piano',
    genre: 'rock',
    description: 'Rock piano presence',
    bands: [
      { frequency: 100, q: 1.5, gain: 2, label: 'Low body', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 4000, q: 2.0, gain: 3, label: 'Attack', type: 'boost' },
      { frequency: 80, q: 1.0, gain: -2, label: 'Rumble HPF', type: 'cut' }
    ]
  },
  strings: {
    element: 'strings',
    genre: 'rock',
    description: 'Rock strings body',
    bands: [
      { frequency: 150, q: 1.5, gain: 3, label: 'Body', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -2, label: 'Nasal cut', type: 'cut' },
      { frequency: 7000, q: 2.0, gain: 2, label: 'Air', type: 'boost' },
      { frequency: 60, q: 1.0, gain: -3, label: 'Sub cut', type: 'cut' }
    ]
  },
  pad: {
    element: 'pad',
    genre: 'rock',
    description: 'Rock pad support',
    bands: [
      { frequency: 150, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 500, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 6000, q: 2.0, gain: 2, label: 'Air', type: 'boost' },
      { frequency: 80, q: 1.0, gain: -3, label: 'Sub HPF', type: 'cut' }
    ]
  },
  fx: {
    element: 'fx',
    genre: 'rock',
    description: 'Rock FX basic cleanup',
    bands: [
      { frequency: 150, q: 1.0, gain: -3, label: 'Low cut', type: 'cut' },
      { frequency: 7000, q: 2.0, gain: 3, label: 'Air', type: 'boost' }
    ]
  },
  master: {
    element: 'master',
    genre: 'rock',
    description: 'Master bus for punchy rock',
    bands: [
      { frequency: 50, q: 1.0, gain: -2, label: 'Subsonic cut', type: 'cut' },
      { frequency: 250, q: 1.0, gain: -2, label: 'Mud reduction', type: 'cut' },
      { frequency: 2500, q: 1.5, gain: 2, label: 'Presence/punch', type: 'boost' },
      { frequency: 10000, q: 1.5, gain: 1.5, label: 'Air', type: 'boost' }
    ]
  }
}

// ---------------------------------------------------------------------------
// JAZZ EQ recommendations (natural, transparent)
// ---------------------------------------------------------------------------
const JAZZ_EQS: Record<string, EqRecommendation> = {
  kick: {
    element: 'kick',
    genre: 'jazz',
    description: 'Natural jazz kick — round and warm',
    bands: [
      { frequency: 60, q: 1.5, gain: 2, label: 'Warm body', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -2, label: 'Boxiness if needed', type: 'cut' },
      { frequency: 4000, q: 2.0, gain: 1, label: 'Subtle beater', type: 'boost' }
    ]
  },
  snare: {
    element: 'snare',
    genre: 'jazz',
    description: 'Natural jazz snare — woody and warm',
    bands: [
      { frequency: 200, q: 1.5, gain: 2, label: 'Woody body', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -3, label: 'Boxiness cut', type: 'cut' },
      { frequency: 6000, q: 2.0, gain: 2, label: 'Subtle snap', type: 'boost' },
      { frequency: 150, q: 1.5, gain: -2, label: 'Rumble cut', type: 'cut' }
    ]
  },
  hihat: {
    element: 'hihat',
    genre: 'jazz',
    description: 'Natural hi-hat with body preserved',
    bands: [
      { frequency: 5000, q: 2.0, gain: 2, label: 'Air', type: 'boost' },
      { frequency: 300, q: 1.0, gain: -2, label: 'Clank if needed', type: 'cut' }
    ]
  },
  tom: {
    element: 'tom',
    genre: 'jazz',
    description: 'Natural warm toms',
    bands: [
      { frequency: 100, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -2, label: 'Mud cut', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 2, label: 'Attack', type: 'boost' }
    ]
  },
  bass: {
    element: 'bass',
    genre: 'jazz',
    description: 'Natural upright/bass — round tone',
    bands: [
      { frequency: 50, q: 1.0, gain: 2, label: 'Sub warmth', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 800, q: 2.0, gain: 2, label: 'Finger attack', type: 'boost' },
      { frequency: 40, q: 1.0, gain: -2, label: 'Subsonic HPF', type: 'cut' }
    ]
  },
  vocals: {
    element: 'vocals',
    genre: 'jazz',
    description: 'Natural warm jazz vocals',
    bands: [
      { frequency: 150, q: 1.5, gain: -2, label: 'Proximity if needed', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 2, label: 'Subtle presence', type: 'boost' },
      { frequency: 10000, q: 2.0, gain: 1.5, label: 'Air', type: 'boost' }
    ]
  },
  guitar: {
    element: 'guitar',
    genre: 'jazz',
    description: 'Warm jazz guitar',
    bands: [
      { frequency: 200, q: 1.5, gain: 2, label: 'Body/warmth', type: 'boost' },
      { frequency: 2000, q: 2.0, gain: -2, label: 'Harshness cut', type: 'cut' },
      { frequency: 80, q: 1.0, gain: -2, label: 'Rumble HPF', type: 'cut' }
    ]
  },
  piano: {
    element: 'piano',
    genre: 'jazz',
    description: 'Natural jazz piano',
    bands: [
      { frequency: 100, q: 1.5, gain: 2, label: 'Low warmth', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -2, label: 'Mud if needed', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 2, label: 'Presence', type: 'boost' }
    ]
  },
  strings: {
    element: 'strings',
    genre: 'jazz',
    description: 'Natural strings',
    bands: [
      { frequency: 200, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 600, q: 1.5, gain: -2, label: 'Nasal cut', type: 'cut' },
      { frequency: 7000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  pad: {
    element: 'pad',
    genre: 'jazz',
    description: 'Subtle pad support',
    bands: [
      { frequency: 200, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 500, q: 1.5, gain: -2, label: 'Mud cut', type: 'cut' },
      { frequency: 6000, q: 2.0, gain: 1, label: 'Air', type: 'boost' }
    ]
  },
  fx: {
    element: 'fx',
    genre: 'jazz',
    description: 'Minimal FX EQ',
    bands: [
      { frequency: 150, q: 1.0, gain: -2, label: 'Low cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  master: {
    element: 'master',
    genre: 'jazz',
    description: 'Transparent master for jazz',
    bands: [
      { frequency: 40, q: 1.0, gain: -1, label: 'Subsonic cut', type: 'cut' },
      { frequency: 8000, q: 1.5, gain: 1, label: 'Subtle air', type: 'boost' }
    ]
  }
}

// ---------------------------------------------------------------------------
// CLASSICAL EQ recommendations (minimal processing)
// ---------------------------------------------------------------------------
const CLASSICAL_EQS: Record<string, EqRecommendation> = {
  kick: {
    element: 'kick', genre: 'classical',
    description: 'Natural orchestral bass drum',
    bands: [
      { frequency: 50, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 300, q: 1.0, gain: -2, label: 'Boxiness if needed', type: 'cut' }
    ]
  },
  snare: {
    element: 'snare', genre: 'classical',
    description: 'Natural orchestral snare',
    bands: [
      { frequency: 200, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 5000, q: 2.0, gain: 2, label: 'Snap', type: 'boost' },
      { frequency: 150, q: 1.0, gain: -2, label: 'Rumble cut', type: 'cut' }
    ]
  },
  hihat: {
    element: 'hihat', genre: 'classical',
    description: 'Natural cymbals',
    bands: [
      { frequency: 8000, q: 2.0, gain: 2, label: 'Air', type: 'boost' },
      { frequency: 300, q: 1.0, gain: -2, label: 'Body cut if needed', type: 'cut' }
    ]
  },
  tom: {
    element: 'tom', genre: 'classical',
    description: 'Natural orchestral toms',
    bands: [
      { frequency: 100, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 4000, q: 2.0, gain: 2, label: 'Attack', type: 'boost' }
    ]
  },
  bass: {
    element: 'bass', genre: 'classical',
    description: 'Natural double bass',
    bands: [
      { frequency: 50, q: 1.0, gain: 2, label: 'Low warmth', type: 'boost' },
      { frequency: 800, q: 2.0, gain: 2, label: 'Bow attack', type: 'boost' },
      { frequency: 200, q: 1.0, gain: -2, label: 'Mud cut if needed', type: 'cut' }
    ]
  },
  vocals: {
    element: 'vocals', genre: 'classical',
    description: 'Natural classical vocals (opera/choir)',
    bands: [
      { frequency: 300, q: 1.5, gain: -2, label: 'Mud cut if needed', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 2, label: 'Presence', type: 'boost' },
      { frequency: 10000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  guitar: {
    element: 'guitar', genre: 'classical',
    description: 'Natural classical guitar',
    bands: [
      { frequency: 200, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 2000, q: 2.0, gain: 2, label: 'Presence', type: 'boost' },
      { frequency: 80, q: 1.0, gain: -2, label: 'Rumble HPF', type: 'cut' }
    ]
  },
  piano: {
    element: 'piano', genre: 'classical',
    description: 'Natural concert piano',
    bands: [
      { frequency: 100, q: 1.5, gain: 2, label: 'Body warmth', type: 'boost' },
      { frequency: 300, q: 1.0, gain: -2, label: 'Subtle mud cut', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 2, label: 'Presence', type: 'boost' }
    ]
  },
  strings: {
    element: 'strings', genre: 'classical',
    description: 'Natural orchestral strings',
    bands: [
      { frequency: 200, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 6000, q: 2.0, gain: 2, label: 'Air', type: 'boost' },
      { frequency: 400, q: 1.0, gain: -2, label: 'Nasal cut', type: 'cut' }
    ]
  },
  pad: {
    element: 'pad', genre: 'classical',
    description: 'Subtle pad',
    bands: [
      { frequency: 200, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 500, q: 1.0, gain: -2, label: 'Mud cut', type: 'cut' },
      { frequency: 6000, q: 2.0, gain: 1, label: 'Air', type: 'boost' }
    ]
  },
  fx: {
    element: 'fx', genre: 'classical',
    description: 'Minimal FX',
    bands: [
      { frequency: 150, q: 1.0, gain: -2, label: 'Low cut', type: 'cut' },
      { frequency: 7000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  master: {
    element: 'master', genre: 'classical',
    description: 'Transparent master — minimal processing',
    bands: [
      { frequency: 30, q: 1.0, gain: -2, label: 'Subsonic cut', type: 'cut' },
      { frequency: 8000, q: 1.5, gain: 1, label: 'Air', type: 'boost' }
    ]
  }
}

// ---------------------------------------------------------------------------
// METAL EQ recommendations (aggressive, loud)
// ---------------------------------------------------------------------------
const METAL_EQS: Record<string, EqRecommendation> = {
  kick: {
    element: 'kick', genre: 'metal',
    description: 'Aggressive metal kick — clicky and tight',
    bands: [
      { frequency: 60, q: 1.0, gain: 4, label: 'Sub punch', type: 'boost' },
      { frequency: 400, q: 2.0, gain: -5, label: 'Hollow body notch', type: 'cut' },
      { frequency: 4000, q: 2.0, gain: 5, label: 'Click attack', type: 'boost' },
      { frequency: 100, q: 1.5, gain: -4, label: 'Mud cleanup', type: 'cut' }
    ]
  },
  snare: {
    element: 'snare', genre: 'metal',
    description: 'Tight metal snare with crack',
    bands: [
      { frequency: 200, q: 1.5, gain: 3, label: 'Body', type: 'boost' },
      { frequency: 400, q: 2.0, gain: -5, label: 'Boxiness notch', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 5, label: 'Crack', type: 'boost' },
      { frequency: 150, q: 1.5, gain: -3, label: 'Rumble cut', type: 'cut' }
    ]
  },
  hihat: {
    element: 'hihat', genre: 'metal',
    description: 'Cutting metal hi-hats',
    bands: [
      { frequency: 300, q: 1.0, gain: -4, label: 'Body cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 4, label: 'Shimmer', type: 'boost' },
      { frequency: 10000, q: 2.0, gain: 3, label: 'Top sparkle', type: 'boost' }
    ]
  },
  tom: {
    element: 'tom', genre: 'metal',
    description: 'Powerful metal toms',
    bands: [
      { frequency: 100, q: 1.5, gain: 4, label: 'Weight', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -4, label: 'Mud cut', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 4, label: 'Attack', type: 'boost' }
    ]
  },
  bass: {
    element: 'bass', genre: 'metal',
    description: 'Growling metal bass',
    bands: [
      { frequency: 60, q: 1.0, gain: 3, label: 'Sub weight', type: 'boost' },
      { frequency: 200, q: 1.5, gain: -4, label: 'Mud cut', type: 'cut' },
      { frequency: 800, q: 2.0, gain: 5, label: 'Growl/mid punch', type: 'boost' },
      { frequency: 40, q: 1.0, gain: -3, label: 'Subsonic HPF', type: 'cut' }
    ]
  },
  vocals: {
    element: 'vocals', genre: 'metal',
    description: 'Aggressive screamed/clean vocals',
    bands: [
      { frequency: 150, q: 1.5, gain: -4, label: 'Proximity cut', type: 'cut' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud reduction', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 5, label: 'Presence over guitars', type: 'boost' },
      { frequency: 8000, q: 2.0, gain: 3, label: 'Air', type: 'boost' }
    ]
  },
  guitar: {
    element: 'guitar', genre: 'metal',
    description: 'Crushing metal rhythm guitars',
    bands: [
      { frequency: 200, q: 1.5, gain: -4, label: 'Low boxiness cut', type: 'cut' },
      { frequency: 2000, q: 2.0, gain: 5, label: 'Bite/chug', type: 'boost' },
      { frequency: 800, q: 2.0, gain: 4, label: 'Body/growl', type: 'boost' },
      { frequency: 100, q: 1.5, gain: -5, label: 'Rumble HPF', type: 'cut' }
    ]
  },
  piano: {
    element: 'piano', genre: 'metal',
    description: 'Metal piano/keyboard clarity',
    bands: [
      { frequency: 100, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 4000, q: 2.0, gain: 3, label: 'Attack', type: 'boost' },
      { frequency: 80, q: 1.0, gain: -3, label: 'Rumble HPF', type: 'cut' }
    ]
  },
  strings: {
    element: 'strings', genre: 'metal',
    description: 'Metal strings',
    bands: [
      { frequency: 150, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -3, label: 'Nasal cut', type: 'cut' },
      { frequency: 7000, q: 2.0, gain: 3, label: 'Air', type: 'boost' }
    ]
  },
  pad: {
    element: 'pad', genre: 'metal',
    description: 'Metal pad',
    bands: [
      { frequency: 150, q: 1.5, gain: 2, label: 'Body warmth', type: 'boost' },
      { frequency: 500, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 6000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  fx: {
    element: 'fx', genre: 'metal',
    description: 'Metal FX',
    bands: [
      { frequency: 100, q: 1.0, gain: -3, label: 'Low cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 4, label: 'Air', type: 'boost' }
    ]
  },
  master: {
    element: 'master', genre: 'metal',
    description: 'Master for loud, aggressive metal',
    bands: [
      { frequency: 40, q: 1.0, gain: -3, label: 'Subsonic cut', type: 'cut' },
      { frequency: 250, q: 1.0, gain: -2, label: 'Mud reduction', type: 'cut' },
      { frequency: 2500, q: 1.5, gain: 3, label: 'Punch/presence', type: 'boost' },
      { frequency: 50, q: 1.0, gain: 1.5, label: 'Sub weight', type: 'boost' }
    ]
  }
}

// ---------------------------------------------------------------------------
// R&B EQ recommendations
// ---------------------------------------------------------------------------
const RNB_EQS: Record<string, EqRecommendation> = {
  kick: {
    element: 'kick', genre: 'rnb',
    description: 'Smooth R&B kick with sub',
    bands: [
      { frequency: 50, q: 1.0, gain: 4, label: 'Sub weight', type: 'boost' },
      { frequency: 200, q: 1.5, gain: -3, label: 'Boxiness cut', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 2, label: 'Beater attack', type: 'boost' }
    ]
  },
  snare: {
    element: 'snare', genre: 'rnb',
    description: 'Smooth R&B snare',
    bands: [
      { frequency: 200, q: 1.5, gain: 3, label: 'Body', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -3, label: 'Boxiness cut', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 3, label: 'Snap', type: 'boost' }
    ]
  },
  hihat: {
    element: 'hihat', genre: 'rnb',
    description: 'Smooth hi-hats',
    bands: [
      { frequency: 300, q: 1.0, gain: -4, label: 'Body cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 3, label: 'Shimmer', type: 'boost' }
    ]
  },
  tom: {
    element: 'tom', genre: 'rnb',
    description: 'Warm R&B toms',
    bands: [
      { frequency: 100, q: 1.5, gain: 3, label: 'Body', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 4000, q: 2.0, gain: 2, label: 'Attack', type: 'boost' }
    ]
  },
  bass: {
    element: 'bass', genre: 'rnb',
    description: 'Smooth R&B bass with sub',
    bands: [
      { frequency: 50, q: 1.0, gain: 4, label: 'Sub weight', type: 'boost' },
      { frequency: 200, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 800, q: 2.0, gain: 2, label: 'Attack/definition', type: 'boost' }
    ]
  },
  vocals: {
    element: 'vocals', genre: 'rnb',
    description: 'Buttery R&B vocals with air',
    bands: [
      { frequency: 120, q: 1.5, gain: -3, label: 'Proximity cut', type: 'cut' },
      { frequency: 300, q: 1.5, gain: -2, label: 'Mud reduction', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 3, label: 'Presence', type: 'boost' },
      { frequency: 10000, q: 2.0, gain: 3, label: 'Air/brightness', type: 'boost' }
    ]
  },
  guitar: {
    element: 'guitar', genre: 'rnb',
    description: 'Smooth R&B guitar',
    bands: [
      { frequency: 200, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 2000, q: 2.0, gain: 3, label: 'Presence', type: 'boost' },
      { frequency: 80, q: 1.0, gain: -3, label: 'Rumble HPF', type: 'cut' }
    ]
  },
  piano: {
    element: 'piano', genre: 'rnb',
    description: 'R&B piano/keyboard',
    bands: [
      { frequency: 100, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 3, label: 'Attack', type: 'boost' }
    ]
  },
  strings: {
    element: 'strings', genre: 'rnb',
    description: 'R&B strings',
    bands: [
      { frequency: 150, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -2, label: 'Nasal cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 3, label: 'Air', type: 'boost' }
    ]
  },
  pad: {
    element: 'pad', genre: 'rnb',
    description: 'R&B pad',
    bands: [
      { frequency: 150, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 500, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 7000, q: 2.0, gain: 2, label: 'Shimmer', type: 'boost' }
    ]
  },
  fx: {
    element: 'fx', genre: 'rnb',
    description: 'R&B FX',
    bands: [
      { frequency: 100, q: 1.0, gain: -3, label: 'Low cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 3, label: 'Air', type: 'boost' }
    ]
  },
  master: {
    element: 'master', genre: 'rnb',
    description: 'Master for smooth R&B',
    bands: [
      { frequency: 40, q: 1.0, gain: -2, label: 'Subsonic cut', type: 'cut' },
      { frequency: 200, q: 1.0, gain: -2, label: 'Mud control', type: 'cut' },
      { frequency: 10000, q: 1.5, gain: 2, label: 'Air', type: 'boost' },
      { frequency: 60, q: 1.0, gain: 1, label: 'Sub weight', type: 'boost' }
    ]
  }
}

// ---------------------------------------------------------------------------
// COUNTRY EQ recommendations
// ---------------------------------------------------------------------------
const COUNTRY_EQS: Record<string, EqRecommendation> = {
  kick: {
    element: 'kick', genre: 'country',
    description: 'Natural country kick',
    bands: [
      { frequency: 60, q: 1.0, gain: 3, label: 'Punch', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Boxiness cut', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 2, label: 'Beater', type: 'boost' }
    ]
  },
  snare: {
    element: 'snare', genre: 'country',
    description: 'Crisp country snare',
    bands: [
      { frequency: 200, q: 1.5, gain: 3, label: 'Body', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -3, label: 'Boxiness cut', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 3, label: 'Snap', type: 'boost' }
    ]
  },
  hihat: {
    element: 'hihat', genre: 'country',
    description: 'Natural hi-hat',
    bands: [
      { frequency: 300, q: 1.0, gain: -3, label: 'Body cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 3, label: 'Air', type: 'boost' }
    ]
  },
  tom: {
    element: 'tom', genre: 'country',
    description: 'Warm country toms',
    bands: [
      { frequency: 100, q: 1.5, gain: 3, label: 'Body', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 2, label: 'Attack', type: 'boost' }
    ]
  },
  bass: {
    element: 'bass', genre: 'country',
    description: 'Natural country bass',
    bands: [
      { frequency: 60, q: 1.0, gain: 2, label: 'Low weight', type: 'boost' },
      { frequency: 200, q: 1.0, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 800, q: 2.0, gain: 3, label: 'Attack/finger', type: 'boost' }
    ]
  },
  vocals: {
    element: 'vocals', genre: 'country',
    description: 'Clear country vocals with twang',
    bands: [
      { frequency: 150, q: 1.5, gain: -3, label: 'Proximity cut', type: 'cut' },
      { frequency: 300, q: 1.5, gain: -2, label: 'Mud reduction', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 3, label: 'Presence/twang', type: 'boost' },
      { frequency: 8000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  guitar: {
    element: 'guitar', genre: 'country',
    description: 'Twangy country guitar',
    bands: [
      { frequency: 200, q: 1.5, gain: -2, label: 'Boxiness cut', type: 'cut' },
      { frequency: 2500, q: 2.0, gain: 4, label: 'Twang/presence', type: 'boost' },
      { frequency: 100, q: 1.5, gain: -3, label: 'Rumble HPF', type: 'cut' },
      { frequency: 7000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  piano: {
    element: 'piano', genre: 'country',
    description: 'Country piano',
    bands: [
      { frequency: 100, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 3, label: 'Attack', type: 'boost' }
    ]
  },
  strings: {
    element: 'strings', genre: 'country',
    description: 'Country strings',
    bands: [
      { frequency: 150, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -2, label: 'Nasal cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  pad: {
    element: 'pad', genre: 'country',
    description: 'Country pad',
    bands: [
      { frequency: 200, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 500, q: 1.5, gain: -2, label: 'Mud cut', type: 'cut' },
      { frequency: 6000, q: 2.0, gain: 1, label: 'Air', type: 'boost' }
    ]
  },
  fx: {
    element: 'fx', genre: 'country',
    description: 'Country FX',
    bands: [
      { frequency: 150, q: 1.0, gain: -2, label: 'Low cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  master: {
    element: 'master', genre: 'country',
    description: 'Master for natural country',
    bands: [
      { frequency: 40, q: 1.0, gain: -2, label: 'Subsonic cut', type: 'cut' },
      { frequency: 200, q: 1.0, gain: -1.5, label: 'Mud reduction', type: 'cut' },
      { frequency: 8000, q: 1.5, gain: 1.5, label: 'Air', type: 'boost' }
    ]
  }
}

// ---------------------------------------------------------------------------
// LATIN EQ recommendations
// ---------------------------------------------------------------------------
const LATIN_EQS: Record<string, EqRecommendation> = {
  kick: {
    element: 'kick', genre: 'latin',
    description: 'Punchy Latin kick',
    bands: [
      { frequency: 60, q: 1.0, gain: 4, label: 'Punch', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Boxiness cut', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 3, label: 'Attack', type: 'boost' }
    ]
  },
  snare: {
    element: 'snare', genre: 'latin',
    description: 'Crisp Latin snare/timbale',
    bands: [
      { frequency: 200, q: 1.5, gain: 3, label: 'Body', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -3, label: 'Boxiness cut', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 4, label: 'Snap', type: 'boost' }
    ]
  },
  hihat: {
    element: 'hihat', genre: 'latin',
    description: 'Bright Latin percussion',
    bands: [
      { frequency: 300, q: 1.0, gain: -4, label: 'Body cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 4, label: 'Brightness', type: 'boost' },
      { frequency: 10000, q: 2.0, gain: 3, label: 'Sparkle', type: 'boost' }
    ]
  },
  tom: {
    element: 'tom', genre: 'latin',
    description: 'Warm Latin toms/congas',
    bands: [
      { frequency: 100, q: 1.5, gain: 3, label: 'Body', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 4000, q: 2.0, gain: 3, label: 'Attack', type: 'boost' }
    ]
  },
  bass: {
    element: 'bass', genre: 'latin',
    description: 'Groovy Latin bass',
    bands: [
      { frequency: 60, q: 1.0, gain: 3, label: 'Sub weight', type: 'boost' },
      { frequency: 200, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 800, q: 2.0, gain: 3, label: 'Attack/slap', type: 'boost' }
    ]
  },
  vocals: {
    element: 'vocals', genre: 'latin',
    description: 'Passionate Latin vocals',
    bands: [
      { frequency: 150, q: 1.5, gain: -3, label: 'Proximity cut', type: 'cut' },
      { frequency: 300, q: 1.5, gain: -2, label: 'Mud reduction', type: 'cut' },
      { frequency: 3000, q: 2.0, gain: 4, label: 'Presence', type: 'boost' },
      { frequency: 10000, q: 2.0, gain: 3, label: 'Air', type: 'boost' }
    ]
  },
  guitar: {
    element: 'guitar', genre: 'latin',
    description: 'Bright Latin guitar',
    bands: [
      { frequency: 200, q: 1.5, gain: -2, label: 'Boxiness cut', type: 'cut' },
      { frequency: 2500, q: 2.0, gain: 3, label: 'Presence', type: 'boost' },
      { frequency: 100, q: 1.0, gain: -3, label: 'Rumble HPF', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  piano: {
    element: 'piano', genre: 'latin',
    description: 'Latin piano',
    bands: [
      { frequency: 100, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 300, q: 1.5, gain: -3, label: 'Mud cut', type: 'cut' },
      { frequency: 5000, q: 2.0, gain: 3, label: 'Attack', type: 'boost' }
    ]
  },
  strings: {
    element: 'strings', genre: 'latin',
    description: 'Latin strings',
    bands: [
      { frequency: 150, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 400, q: 1.5, gain: -2, label: 'Nasal cut', type: 'cut' },
      { frequency: 7000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  pad: {
    element: 'pad', genre: 'latin',
    description: 'Latin pad',
    bands: [
      { frequency: 200, q: 1.5, gain: 2, label: 'Body', type: 'boost' },
      { frequency: 500, q: 1.5, gain: -2, label: 'Mud cut', type: 'cut' },
      { frequency: 6000, q: 2.0, gain: 2, label: 'Air', type: 'boost' }
    ]
  },
  fx: {
    element: 'fx', genre: 'latin',
    description: 'Latin FX',
    bands: [
      { frequency: 150, q: 1.0, gain: -3, label: 'Low cut', type: 'cut' },
      { frequency: 8000, q: 2.0, gain: 3, label: 'Air', type: 'boost' }
    ]
  },
  master: {
    element: 'master', genre: 'latin',
    description: 'Master for energetic Latin',
    bands: [
      { frequency: 40, q: 1.0, gain: -2, label: 'Subsonic cut', type: 'cut' },
      { frequency: 250, q: 1.0, gain: -2, label: 'Mud reduction', type: 'cut' },
      { frequency: 8000, q: 1.5, gain: 2, label: 'Air/brightness', type: 'boost' }
    ]
  }
}

// =============================================================================
// Genre-to-EQ mapping
// =============================================================================

/** Maps each genre to its EQ recommendation set */
const EQ_DATABASE: Record<string, Record<string, EqRecommendation>> = {
  pop: POP_EQS,
  rock: ROCK_EQS,
  electronic: ELECTRONIC_EQS,
  hiphop: HIPHOP_EQS,
  jazz: JAZZ_EQS,
  classical: CLASSICAL_EQS,
  metal: METAL_EQS,
  rnb: RNB_EQS,
  country: COUNTRY_EQS,
  latin: LATIN_EQS
}

// =============================================================================
// Public API Functions
// =============================================================================

/**
 * Get EQ recommendations for a specific mix element and genre.
 *
 * @param element - The mix element (kick, snare, vocals, etc.)
 * @param genre - The music genre (pop, rock, electronic, etc.)
 * @returns EQ recommendation with bands, or null if no data exists for that combo
 *
 * @example
 *   const eq = getEqRecommendations('kick', 'electronic')
 *   // => { element: 'kick', genre: 'electronic', description: '...', bands: [...] }
 *   // eq.bands.forEach(band => console.log(band.frequency, band.gain))
 */
export function getEqRecommendations(
  element: MixElement,
  genre: Genre
): EqRecommendation | null {
  const genreData = EQ_DATABASE[genre]
  if (!genreData) return null
  return genreData[element] ?? null
}

/**
 * Get complete EQ recommendations for ALL mix elements in a specific genre.
 *
 * @param genre - The music genre
 * @returns Complete genre mix with EQ for every element, or null if genre not found
 *
 * @example
 *   const mix = getGenreMixRecommendations('rock')
 *   // => { genre: 'rock', label: 'Rock', elements: [...] }
 *   // mix.elements.forEach(el => console.log(el.element, el.bands.length))
 */
export function getGenreMixRecommendations(
  genre: Genre
): GenreMixRecommendation | null {
  const genreData = EQ_DATABASE[genre]
  if (!genreData) return null

  const genreLabel = GENRES.find((g) => g.value === genre)?.label ?? genre
  return {
    genre,
    label: genreLabel,
    elements: MIX_ELEMENTS.map((el) => genreData[el.value])
      .filter((rec): rec is EqRecommendation => rec !== undefined)
  }
}

/**
 * Get all genres that have EQ data for a specific mix element.
 *
 * @param element - The mix element to check
 * @returns Array of genre values that have recommendations for this element
 *
 * @example
 *   const genres = getGenresForElement('kick')
 *   // => ['pop', 'rock', 'electronic', 'hiphop', ...]
 */
export function getGenresForElement(element: MixElement): Genre[] {
  const result: Genre[] = []
  for (const [genre, elements] of Object.entries(EQ_DATABASE)) {
    if (elements[element]) {
      result.push(genre as Genre)
    }
  }
  return result
}
