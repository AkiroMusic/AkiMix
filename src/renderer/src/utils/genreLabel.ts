/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Genre Label Helper — Shared i18n Genre Name Resolution
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 * Provides a single shared helper for translating canonical genre names
 * (e.g. 'Drum & Bass', 'Singer-Songwriter') into localized display labels.
 *
 * WHY THIS EXISTS:
 * Previously each card component maintained its own GENRE_I18N_MAP with
 * duplicated, inconsistent, and sometimes wrong mappings (e.g. Trance labeled
 * as "EDM", Singer-Songwriter labeled as "Pop"). This module centralizes
 * genre label resolution so every card shows the correct translated name.
 *
 * HOW IT WORKS:
 * 1. GENRE_I18N_KEY maps each canonical genre name to a stable i18n slug
 * 2. getGenreLabel() looks up `taxonomy.genres.<slug>` in the active locale
 * 3. If no translation exists, the raw genre name is shown as fallback
 *
 * HOW TO USE:
 *   import { getGenreLabel } from '../utils/genreLabel'
 *   const label = getGenreLabel(t, 'Drum & Bass')  // → '鼓打贝斯 (Drum & Bass)' in zh-CN
 */

// =============================================================================
// Genre Name → i18n Slug Mapping
// =============================================================================

/**
 * Maps every canonical genre name used across all core modules to a stable
 * i18n key slug. Keys must cover:
 *   - songStructure.ts genres (22)
 *   - drumPatternGenerator.ts genres (16)
 *   - chordProgressions.ts genres (11, incl. 'EDM')
 *   - eqRecommendations.ts genre labels (10, incl. 'Electronic')
 */
const GENRE_I18N_KEY: Record<string, string> = {
  // ── Electronic / Dance ──
  House: 'house',
  Techno: 'techno',
  Trance: 'trance',
  Dubstep: 'dubstep',
  'Drum & Bass': 'dnb',
  'UK Garage': 'ukGarage',
  Trap: 'trap',
  'Future Bass': 'futureBass',
  'Progressive House': 'progressiveHouse',
  'Deep House': 'deepHouse',
  Hardstyle: 'hardstyle',
  Psytrance: 'psytrance',
  Breaks: 'breaks',
  'Electro House': 'electroHouse',
  Minimal: 'minimal',
  Breakbeat: 'breakbeat',
  EDM: 'edm',
  Electronic: 'edm',
  // ── Rock / Pop ──
  Pop: 'pop',
  Rock: 'rock',
  'Singer-Songwriter': 'singerSongwriter',
  // ── Jazz / Blues / R&B ──
  Jazz: 'jazz',
  Blues: 'blues',
  Funk: 'funk',
  'R&B': 'rnb',
  // ── Hip-Hop ──
  'Hip-Hop': 'hipHop',
  // ── Metal ──
  Metal: 'metal',
  // ── Folk / Country / World ──
  Folk: 'folk',
  Country: 'country',
  Latin: 'latin',
  // ── Classical / Ambient ──
  Classical: 'classical',
  Ambient: 'ambient'
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Resolve the localized display label for a canonical genre name.
 *
 * Looks up `taxonomy.genres.<slug>` via the i18n translation function.
 * Falls back to the raw genre name when no mapping or translation exists
 * (i18next returns the key itself for missing translations, which we detect
 * and convert back to the original genre name).
 *
 * @param t - i18n translation function from useTranslation()
 * @param genreName - Canonical genre name (e.g. 'Drum & Bass', 'Hip-Hop')
 * @returns Localized genre label, or the raw name as fallback
 *
 * @example
 *   getGenreLabel(t, 'House')   // zh-CN → '浩室 (House)', en-US → 'House'
 *   getGenreLabel(t, 'Unknown') // → 'Unknown' (fallback)
 */
export function getGenreLabel(t: (key: string) => string, genreName: string): string {
  const slug = GENRE_I18N_KEY[genreName]
  if (slug) {
    const fullKey = `taxonomy.genres.${slug}`
    const translated = t(fullKey)
    // i18next returns the key itself when no translation is found
    if (translated && translated !== fullKey) {
      return translated
    }
  }
  return genreName
}
