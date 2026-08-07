/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Mix Element Level Recommendations Module
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 * Provides recommended dB level ranges for common mix elements (kick, snare,
 * vocals, bass, etc.) to help beginners balance their mixes. Levels are given
 * as relative ranges (compared to kick drum as reference, which is standard
 * mixing practice).
 *
 * WHY THIS IS USEFUL:
 * Level balancing is one of the hardest skills for beginners. Having a reference
 * range for each element helps create a solid starting mix before applying
 * compression and effects. These values are based on professional mixing
 * standards with kick at ~-6dB to -10dB peak (depending on genre).
 *
 * HOW TO USE:
 *   import { getMixLevels, MIX_GROUPS } from '../core/mixLevels'
 *
 *   // Get all level recommendations
 *   const levels = getMixLevels('pop')
 *   // Returns array of { element, label, minDb, maxDb, description, priority }
 *
 *   // Get levels for a specific element
 *   const vocalLevel = getElementLevel('vocals', 'pop')
 *   // Returns { element, minDb, maxDb, ... }
 */

// =============================================================================
// Type Definitions
// =============================================================================

/** Available mix elements you'd typically balance in a mix */
export type MixElement =
  | 'kick'
  | 'snare'
  | 'hihat'
  | 'clap'
  | 'percussion'
  | 'tom'
  | 'bass'
  | 'vocalsLead'
  | 'vocalsBacking'
  | 'guitar'
  | 'piano'
  | 'strings'
  | 'synth'
  | 'fx'
  | 'master'

/** Mix group categories for organization */
export type MixGroup =
  | 'drums'
  | 'bass'
  | 'vocals'
  | 'instruments'
  | 'fx'
  | 'master'

/** Level recommendation for one mix element */
export interface MixLevelEntry {
  /** Unique identifier for the element */
  element: MixElement
  /** Display label shown in the UI */
  label: string
  /** Which group this element belongs to */
  group: MixGroup
  /** Recommended minimum dB level (e.g., -18 for vocals) */
  minDb: number
  /** Recommended maximum dB level (e.g., -12 for vocals) */
  maxDb: number
  /** Whether positive numbers mean louder (relative to reference) */
  relativeToReference: boolean
  /** Brief description of the role and mixing tip */
  description: string
  /** Priority in the mix — 'critical' means this is foundational */
  priority: 'critical' | 'important' | 'supplementary'
}

/** Complete mix level recommendations for one genre (or general) */
export interface MixLevelsResult {
  /** Genre name or 'general' */
  genre: string
  /** Display label */
  label: string
  /** Array of level entries grouped by category */
  groups: {
    /** Group identifier */
    group: MixGroup
    /** Group display label */
    label: string
    /** Members in this group */
    elements: MixLevelEntry[]
  }[]
  /** Flat array of all entries (for simple rendering) */
  all: MixLevelEntry[]
}

// =============================================================================
// Constants
// =============================================================================

/** Mix groups with display labels */
export const MIX_GROUPS: { value: MixGroup; label: string }[] = [
  { value: 'drums', label: 'Drums & Percussion' },
  { value: 'bass', label: 'Bass' },
  { value: 'vocals', label: 'Vocals' },
  { value: 'instruments', label: 'Instruments' },
  { value: 'fx', label: 'FX & Atmosphere' },
  { value: 'master', label: 'Master Bus' }
]

// =============================================================================
// Default / General Mix Level Recommendations
//
// These dB values assume:
//   - Kick drum peaks around -6dB to -10dB (used as mix foundation)
//   - All other elements are relative to the kick
//   - Headroom is left for mastering (-1dB to -3dB true peak on master)
//   - Values are for peak/RMS levels (not LUFS which is measured differently)
//
// IMPORTANT: These are STARTING POINTS. Every mix is different — trust your ears!
// =============================================================================

/** Master database of mix level recommendations (genre-general) */
const GENERAL_LEVELS: MixLevelEntry[] = [
  // ===== Drums =====
  {
    element: 'kick',
    label: 'Kick Drum',
    group: 'drums',
    minDb: -10,
    maxDb: -6,
    relativeToReference: false,
    description: 'Foundation of the mix. Set kick first, then build everything around it. Should be clearly audible but not overpowering.',
    priority: 'critical'
  },
  {
    element: 'snare',
    label: 'Snare Drum',
    group: 'drums',
    minDb: -12,
    maxDb: -8,
    relativeToReference: false,
    description: 'Snare should cut through but sit slightly behind the kick. In rock/metal it may be closer to -8dB for punch.',
    priority: 'critical'
  },
  {
    element: 'hihat',
    label: 'Hi-Hat / Cymbals',
    group: 'drums',
    minDb: -24,
    maxDb: -16,
    relativeToReference: false,
    description: 'Hi-hats should be felt, not heard. If people notice the hi-hat, it\'s probably too loud. Aim for -18dB to -20dB.',
    priority: 'important'
  },
  {
    element: 'clap',
    label: 'Clap / Rim',
    group: 'drums',
    minDb: -18,
    maxDb: -12,
    relativeToReference: false,
    description: 'Claps sit between snare and hi-hat. They add groove but shouldn\'t compete with the snare.',
    priority: 'important'
  },
  {
    element: 'percussion',
    label: 'Percussion (Shaker, Tambourine, etc.)',
    group: 'drums',
    minDb: -24,
    maxDb: -16,
    relativeToReference: false,
    description: 'Percussion adds texture and movement. Keep it low in the mix — barely noticeable when listening, but missed when removed.',
    priority: 'supplementary'
  },
  {
    element: 'tom',
    label: 'Toms',
    group: 'drums',
    minDb: -14,
    maxDb: -10,
    relativeToReference: false,
    description: 'Toms should be slightly quieter than the snare. They\'re fills, not the main focus. Use automation if needed.',
    priority: 'supplementary'
  },

  // ===== Bass =====
  {
    element: 'bass',
    label: 'Bass (Sub / 808 / Bass Guitar)',
    group: 'bass',
    minDb: -12,
    maxDb: -8,
    relativeToReference: false,
    description: 'Bass and kick should work together. If they fight, you need sidechain compression. Bass should feel powerful without overwhelming the kick.',
    priority: 'critical'
  },

  // ===== Vocals =====
  {
    element: 'vocalsLead',
    label: 'Lead Vocals',
    group: 'vocals',
    minDb: -12,
    maxDb: -6,
    relativeToReference: false,
    description: 'Lead vocals should sit ON TOP of the mix, not buried in it. In pop, vocals are often the loudest element at -6dB. Use compression to maintain consistent level.',
    priority: 'critical'
  },
  {
    element: 'vocalsBacking',
    label: 'Backing Vocals',
    group: 'vocals',
    minDb: -20,
    maxDb: -14,
    relativeToReference: false,
    description: 'Backing vocals should support the lead, not compete. Usually 6-8dB below lead vocals. Widen them with stereo delay/reverb for depth.',
    priority: 'important'
  },

  // ===== Instruments =====
  {
    element: 'guitar',
    label: 'Guitar (Acoustic / Electric)',
    group: 'instruments',
    minDb: -18,
    maxDb: -10,
    relativeToReference: false,
    description: 'Guitars occupy the midrange — the busiest area of the mix. Use EQ to carve space. Acoustic guitars sit around -14dB, electric rhythm around -12dB.',
    priority: 'important'
  },
  {
    element: 'piano',
    label: 'Piano / Keys / Organ',
    group: 'instruments',
    minDb: -20,
    maxDb: -12,
    relativeToReference: false,
    description: 'Piano is wide-bandwidth and can easily clutter the mix. Use EQ to remove muddy lows and let other elements breathe. Pad/background keys at -18dB.',
    priority: 'important'
  },
  {
    element: 'strings',
    label: 'Strings / Orchestral',
    group: 'instruments',
    minDb: -24,
    maxDb: -14,
    relativeToReference: false,
    description: 'Strings add emotional depth but should sit behind the main elements. They work best around -18dB to -14dB for pop, quieter for rock.',
    priority: 'supplementary'
  },
  {
    element: 'synth',
    label: 'Synth / Lead / Pluck',
    group: 'instruments',
    minDb: -18,
    maxDb: -10,
    relativeToReference: false,
    description: 'Synth leads should be prominent but not overpowering. Bass synths sit closer to -12dB, lead synths around -10dB, pad synths at -16dB.',
    priority: 'important'
  },

  // ===== FX =====
  {
    element: 'fx',
    label: 'FX (Risers, Impacts, Sweeps)',
    group: 'fx',
    minDb: -24,
    maxDb: -12,
    relativeToReference: false,
    description: 'FX are accents — loud enough to be felt, quiet enough to not distract. Impacts may peak at -12dB, risers/sweeps at -20dB with automation.',
    priority: 'supplementary'
  },

  // ===== Master =====
  {
    element: 'master',
    label: 'Master Bus (Final Output)',
    group: 'master',
    minDb: -3,
    maxDb: -1,
    relativeToReference: false,
    description: 'Master bus should peak between -3dB and -1dB before mastering/limiting. True peak should never exceed 0dB. For streaming, aim for -14dB to -16dB integrated LUFS.',
    priority: 'critical'
  }
]

// =============================================================================
// Genre-specific level adjustments
//
// Each genre provides OFFSETS relative to the general levels above.
// This keeps the base data DRY while allowing genre-specific character.
// =============================================================================

/** Per-genre offset adjustments (applied to general levels) */
const GENRE_OFFSETS: Record<string, Record<MixElement, number>> = {
  // Pop: Standard mix, vocals slightly forward
  pop: {
    kick: 0, snare: 0, hihat: 0, clap: 0, percussion: 0, tom: 0,
    bass: 0, vocalsLead: 1, vocalsBacking: 2, guitar: 0, piano: 0,
    strings: 0, synth: 0, fx: 0, master: 0
  },
  // Rock: Drums and guitars louder
  rock: {
    kick: 1, snare: 2, hihat: 0, clap: 0, percussion: 0, tom: 2,
    bass: 1, vocalsLead: -1, vocalsBacking: 0, guitar: 2, piano: -2,
    strings: -2, synth: -2, fx: 0, master: 0
  },
  // Electronic: Kick and bass dominant
  electronic: {
    kick: 3, snare: 1, hihat: 0, clap: 1, percussion: 1, tom: 0,
    bass: 3, vocalsLead: 0, vocalsBacking: 2, guitar: -4, piano: -4,
    strings: -4, synth: 1, fx: 1, master: 0
  },
  // Hip-Hop: Massive low end, vocals forward
  hiphop: {
    kick: 4, snare: 2, hihat: 0, clap: 1, percussion: 1, tom: 0,
    bass: 4, vocalsLead: 2, vocalsBacking: 3, guitar: -6, piano: -4,
    strings: -4, synth: -2, fx: 0, master: 0
  },
  // Jazz: Dynamic range, everything natural
  jazz: {
    kick: -2, snare: -2, hihat: -2, clap: 0, percussion: -2, tom: -2,
    bass: -1, vocalsLead: -2, vocalsBacking: -2, guitar: 0, piano: 0,
    strings: 0, synth: 0, fx: -4, master: -1
  },
  // Classical: Wide dynamic range, quieter overall
  classical: {
    kick: -4, snare: -4, hihat: -4, clap: 0, percussion: -4, tom: -4,
    bass: -3, vocalsLead: -3, vocalsBacking: -2, guitar: -2, piano: -2,
    strings: -1, synth: 0, fx: -6, master: -2
  },
  // Metal: Everything loud, but controlled
  metal: {
    kick: 2, snare: 3, hihat: 1, clap: 0, percussion: 0, tom: 2,
    bass: 2, vocalsLead: 0, vocalsBacking: 0, guitar: 3, piano: -4,
    strings: -4, synth: -3, fx: 1, master: 1
  },
  // R&B: Smooth, vocals forward
  rnb: {
    kick: 1, snare: 0, hihat: -1, clap: 0, percussion: -1, tom: -1,
    bass: 2, vocalsLead: 2, vocalsBacking: 2, guitar: 0, piano: 0,
    strings: 0, synth: 1, fx: -1, master: 0
  },
  // Country: Instruments balanced, vocals clear
  country: {
    kick: 0, snare: 0, hihat: 0, clap: 0, percussion: 0, tom: 0,
    bass: 0, vocalsLead: 1, vocalsBacking: 1, guitar: 1, piano: 0,
    strings: 0, synth: -2, fx: -2, master: 0
  },
  // Latin: Percussion forward, energetic
  latin: {
    kick: 2, snare: 2, hihat: 1, clap: 2, percussion: 2, tom: 1,
    bass: 1, vocalsLead: 1, vocalsBacking: 2, guitar: 1, piano: 0,
    strings: 0, synth: 0, fx: 1, master: 0
  }
}

// =============================================================================
// Public API Functions
// =============================================================================

/**
 * Apply a dB offset to a level range.
 *
 * @param minDb - The minimum dB value
 * @param maxDb - The maximum dB value
 * @param offset - The offset to apply (can be positive or negative)
 * @returns Adjusted [minDb, maxDb] tuple
 */
function applyOffset(minDb: number, maxDb: number, offset: number): [number, number] {
  return [minDb + offset, maxDb + offset]
}

/**
 * Get mix level recommendations for all elements.
 *
 * @param genre - Optional genre for genre-specific adjustments (default: 'pop')
 * @returns Complete mix levels result with grouped elements
 *
 * @example
 *   // General recommendations
 *   const levels = getMixLevels()
 *
 *   // Genre-specific
 *   const rockLevels = getMixLevels('rock')
 *   // rockLevels.all[0] might show kick at -9 to -5 (louder than general)
 */
export function getMixLevels(genre: string = 'pop'): MixLevelsResult {
  const offsets = GENRE_OFFSETS[genre] ?? GENRE_OFFSETS['pop']
  const genreLabel =
    genre === 'pop' ? 'Pop (General)' :
    GENRES_MAP[genre] ?? genre

  // Apply offsets to all elements
  const adjusted = GENERAL_LEVELS.map((entry) => {
    const offset = offsets[entry.element] ?? 0
    const [minDb, maxDb] = applyOffset(entry.minDb, entry.maxDb, offset)
    return { ...entry, minDb, maxDb }
  })

  // Group by mix group
  const groups = MIX_GROUPS.map((group) => ({
    group: group.value as MixGroup,
    label: group.label,
    elements: adjusted.filter((e) => e.group === group.value)
  })).filter((g) => g.elements.length > 0)

  return {
    genre,
    label: genreLabel,
    groups,
    all: adjusted
  }
}

/**
 * Get level recommendation for a specific mix element.
 *
 * @param element - The mix element to find
 * @param genre - Optional genre (default: 'pop')
 * @returns The level entry or null if not found
 *
 * @example
 *   const vocal = getElementLevel('vocalsLead', 'pop')
 *   // => { element: 'vocalsLead', minDb: -12, maxDb: -6, ... }
 */
export function getElementLevel(
  element: MixElement,
  genre: string = 'pop'
): MixLevelEntry | null {
  const levels = getMixLevels(genre)
  return levels.all.find((e) => e.element === element) ?? null
}

/**
 * Get ALL level entries for a specific mix group (e.g., 'drums').
 *
 * @param group - The mix group to filter by
 * @param genre - Optional genre (default: 'pop')
 * @returns Array of level entries in that group
 */
export function getGroupLevels(
  group: MixGroup,
  genre: string = 'pop'
): MixLevelEntry[] {
  const levels = getMixLevels(genre)
  const groupInfo = levels.groups.find((g) => g.group === group)
  return groupInfo?.elements ?? []
}

/** Internal genre name map */
const GENRES_MAP: Record<string, string> = {
  pop: 'Pop (General)',
  rock: 'Rock',
  electronic: 'Electronic / Dance',
  hiphop: 'Hip-Hop / Trap',
  jazz: 'Jazz',
  classical: 'Classical',
  metal: 'Metal',
  rnb: 'R&B / Soul',
  country: 'Country',
  latin: 'Latin'
}
