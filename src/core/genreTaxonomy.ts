/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Genre Taxonomy — Central Genre Classification System
 * =============================================================================
 *
 * WHAT THIS MODULE IS:
 * The single source of truth for genre classification across the entire app.
 * Every genre in every tool (song structure, drum patterns, chord progressions,
 * EQ recommendations, mix levels) is defined here with a super-genre family.
 *
 * WHY THIS EXISTS:
 * Previously, each core module maintained its own flat genre list with no
 * hierarchical organization. This module provides:
 *   - Consistent genre naming across all tools
 *   - Super-genre grouping (Electronic, Rock/Pop, Jazz/Blues, etc.)
 *   - Utility functions for filtering/querying by family
 *   - i18n key conventions for super-genre display labels
 *
 * HOW TO USE:
 *   import { getGenresBySuperGenre, ALL_GENRES, type GenreEntry } from '../core/genreTaxonomy'
 *
 *   // Get all electronic genres
 *   const electronicGenres = getGenresBySuperGenre('electronic')
 *
 *   // Reference the master list in a module's own GENRES export
 *   import { ALL_GENRES } from '../core/genreTaxonomy'
 *   export const GENRES = ALL_GENRES.filter(g => SUPPORTED.has(g.name))
 *
 * TAXONOMY REFERENCE:
 * This classification follows musicmap.info's genealogical approach, adapted
 * for practical music production workflow. Genres are grouped by shared
 * production techniques, rhythmic foundations, and harmonic conventions.
 *
 * Super-genre families:
 *   electronic      — All EDM / electronic dance music genres
 *   rockPop         — Guitar-driven rock and mainstream pop
 *   jazzBlues       — Jazz, Blues, Funk, and R&B (roots & improvisation)
 *   hipHop          — Beat-driven hip-hop / urban
 *   metal           — Heavy metal and hardcore
 *   folkCountry     — Acoustic, folk, country, and world / Latin
 *   classicalAmbient — Orchestral classical and atmospheric ambient
 *
 * @module genreTaxonomy
 */

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Super-genre family identifier.
 * Each genre belongs to exactly one super-genre family based on shared
 * production characteristics, rhythmic feel, and harmonic language.
 */
export type SuperGenre =
  | 'electronic'
  | 'rockPop'
  | 'jazzBlues'
  | 'hipHop'
  | 'metal'
  | 'folkCountry'
  | 'classicalAmbient'

/**
 * Genre entry — the canonical representation of a single music genre.
 *
 * Every genre in the app is identified by its `name` (the canonical title-case
 * string used as a data lookup key) and its `superGenre` family for
 * hierarchical grouping in the UI.
 */
export interface GenreEntry {
  /** Canonical genre name (e.g., 'Drum & Bass', 'Singer-Songwriter') */
  name: string
  /** Super-genre family this genre belongs to */
  superGenre: SuperGenre
}

// =============================================================================
// Master Genre List
// =============================================================================

/**
 * ALL_GENRES — Complete master list of every genre used in AkiMix.
 *
 * Single source of truth. Every core module should derive its own GENRES
 * array from this list (by filtering to its supported subset).
 *
 * @example
 *   ALL_GENRES.length                    // → 30
 *   ALL_GENRES.filter(g => g.superGenre === 'electronic').length  // → 16
 */
export const ALL_GENRES: GenreEntry[] = [
  // ===========================================================================
  // Electronic / Dance
  // 电子舞曲 — 4/4 kick foundations, synthesizer-driven, production-heavy
  // ===========================================================================
  { name: 'House', superGenre: 'electronic' },
  { name: 'Techno', superGenre: 'electronic' },
  { name: 'Trance', superGenre: 'electronic' },
  { name: 'Dubstep', superGenre: 'electronic' },
  { name: 'Drum & Bass', superGenre: 'electronic' },
  { name: 'UK Garage', superGenre: 'electronic' },
  { name: 'Trap', superGenre: 'electronic' },
  { name: 'Future Bass', superGenre: 'electronic' },
  { name: 'Progressive House', superGenre: 'electronic' },
  { name: 'Deep House', superGenre: 'electronic' },
  { name: 'Hardstyle', superGenre: 'electronic' },
  { name: 'Psytrance', superGenre: 'electronic' },
  { name: 'Breaks', superGenre: 'electronic' },
  { name: 'Electro House', superGenre: 'electronic' },
  { name: 'Minimal', superGenre: 'electronic' },
  { name: 'Breakbeat', superGenre: 'electronic' },

  // ===========================================================================
  // Rock / Pop
  // 摇滚/流行 — Guitar-centric, verse-chorus structure, vocal-driven
  // ===========================================================================
  { name: 'Pop', superGenre: 'rockPop' },
  { name: 'Rock', superGenre: 'rockPop' },
  { name: 'Singer-Songwriter', superGenre: 'rockPop' },

  // ===========================================================================
  // Jazz / Blues / R&B
  // 爵士/布鲁斯 — Extended harmonies, improvisation, groove-based
  // ===========================================================================
  { name: 'Jazz', superGenre: 'jazzBlues' },
  { name: 'Blues', superGenre: 'jazzBlues' },
  { name: 'Funk', superGenre: 'jazzBlues' },
  { name: 'R&B', superGenre: 'jazzBlues' },

  // ===========================================================================
  // Hip-Hop / Urban
  // 嘻哈 — Sampled beats, loop-based, groove and swing emphasis
  // ===========================================================================
  { name: 'Hip-Hop', superGenre: 'hipHop' },

  // ===========================================================================
  // Metal
  // 金属 — Distorted guitars, aggressive rhythms, technical drumming
  // ===========================================================================
  { name: 'Metal', superGenre: 'metal' },

  // ===========================================================================
  // Folk / Country / World
  // 民谣/乡村/世界 — Acoustic instruments, storytelling, traditional roots
  // ===========================================================================
  { name: 'Folk', superGenre: 'folkCountry' },
  { name: 'Country', superGenre: 'folkCountry' },
  { name: 'Latin', superGenre: 'folkCountry' },

  // ===========================================================================
  // Classical / Ambient
  // 古典/氛围 — Orchestral textures, dynamic range, atmospheric
  // ===========================================================================
  { name: 'Classical', superGenre: 'classicalAmbient' },
  { name: 'Ambient', superGenre: 'classicalAmbient' }
]

// =============================================================================
// Derived Constants
// =============================================================================

/**
 * Ordered list of all super-genre keys for deterministic iteration in the UI.
 * Display order: most production-heavy genres first, acoustic last.
 */
export const SUPERGENRE_ORDER: SuperGenre[] = [
  'electronic',
  'rockPop',
  'jazzBlues',
  'hipHop',
  'metal',
  'folkCountry',
  'classicalAmbient'
]

/**
 * Full i18n keys for each super-genre display label.
 * Usage: t(SUPERGENRE_I18N_KEY[sg])
 */
export const SUPERGENRE_I18N_KEY: Record<SuperGenre, string> = {
  electronic: 'taxonomy.superGenres.electronic',
  rockPop: 'taxonomy.superGenres.rockPop',
  jazzBlues: 'taxonomy.superGenres.jazzBlues',
  hipHop: 'taxonomy.superGenres.hipHop',
  metal: 'taxonomy.superGenres.metal',
  folkCountry: 'taxonomy.superGenres.folkCountry',
  classicalAmbient: 'taxonomy.superGenres.classicalAmbient'
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get all genre entries belonging to a specific super-genre family.
 *
 * @param sg - The super-genre to filter by
 * @returns Array of GenreEntry objects in the given family
 *
 * @example
 *   getGenresBySuperGenre('electronic')
 *   // → [{ name: 'House', superGenre: 'electronic' }, { name: 'Techno', ... }, ...]
 */
export function getGenresBySuperGenre(sg: SuperGenre): GenreEntry[] {
  return ALL_GENRES.filter((g) => g.superGenre === sg)
}

/**
 * Convenience helper: get just the genre names for a super-genre family.
 *
 * @param sg - The super-genre to filter by
 * @returns Array of genre name strings
 *
 * @example
 *   getGenreNamesBySuperGenre('jazzBlues')
 *   // → ['Jazz', 'Blues', 'Funk', 'R&B']
 */
export function getGenreNamesBySuperGenre(sg: SuperGenre): string[] {
  return ALL_GENRES.filter((g) => g.superGenre === sg).map((g) => g.name)
}

/**
 * Resolve the super-genre for a given genre name.
 *
 * @param genreName - Canonical genre name to look up
 * @returns The SuperGenre if found, or undefined for unknown genres
 *
 * @example
 *   getSuperGenre('House')    // → 'electronic'
 *   getSuperGenre('Funk')     // → 'jazzBlues'
 *   getSuperGenre('Unknown')  // → undefined
 */
export function getSuperGenre(genreName: string): SuperGenre | undefined {
  return ALL_GENRES.find((g) => g.name === genreName)?.superGenre
}
