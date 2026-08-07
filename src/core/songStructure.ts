/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Song Structure Module
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 * Provides song/arrangement structure templates for various music genres.
 * Each genre has a typical arrangement with sections (Intro, Drop, Breakdown,
 * etc.), along with energy levels, bar lengths, and sonic element descriptions.
 *
 * WHY THIS IS USEFUL:
 * Beginners often struggle with song arrangement — where to put the drop, how
 * long the breakdown should be, what elements to include in each section. This
 * module gives a proven structural blueprint for each genre that can be used
 * as a starting point for production.
 *
 * 编曲结构模块 (Arrangement Structure Module):
 * 为不同音乐风格提供标准化的编曲模板，帮助初学者快速搭建歌曲框架。
 * 每个模板包含段落名称、小节数、能量等级和配器建议。
 *
 * HOW TO USE:
 *   import { getStructure, getEnergyMap, GENRES } from '../core/songStructure'
 *
 *   // Get full arrangement structure for a genre
 *   const structure = getStructure('House')
 *   // Returns: { sections: [...], totalBars: 184, bpmRange: '120-130', ... }
 *
 *   // Get energy level visualization across the arrangement
 *   const energy = getEnergyMap('House')
 *   // Returns: [{ section: 'Intro', barRange: '1-32', energy: 3 }, ...]
 */

// =============================================================================
// Imports
// =============================================================================

import type { GenreEntry } from './genreTaxonomy'

// =============================================================================
// Type Definitions
// =============================================================================

/** Represents one section (段落) of a song arrangement */
export interface SongSection {
  /** Section name (e.g., 'Intro', 'Drop', 'Breakdown') */
  name: string
  /** Length in bars (小节数) — 0 means variable length */
  bars: number
  /** Energy intensity from 1 (lowest) to 10 (highest) */
  energy: number
  /** Description of what happens musically in this section */
  description: string
  /** Key sonic elements present in this section */
  elements: string[]
}

/** Complete song arrangement structure for one genre */
export interface SongStructure {
  /** Ordered array of arrangement sections */
  sections: SongSection[]
  /** Total bars across all sections (总和) */
  totalBars: number
  /** Typical BPM range for this genre (e.g., '120-130') */
  bpmRange: string
  /** Typical total duration in minutes (e.g., '5-8 min') */
  typicalTotalMinutes: string
}

/** One entry in the energy map — maps section name to energy over a bar range */
export interface EnergyMapEntry {
  /** Section name */
  section: string
  /** Bar range as a string (e.g., '1-32', '33-48') */
  barRange: string
  /** Energy level 1-10 */
  energy: number
}

// =============================================================================
// Internal data structures — each genre's arrangement blueprint
// =============================================================================

interface GenreData {
  sections: SongSection[]
  bpmRange: string
  typicalTotalMinutes: string
}

// =============================================================================
// Constants
// =============================================================================

/**
 * All supported music genres — 22 total, organized by super-genre family.
 *
 * 曲风列表 — 共22种风格，按超类流派分组的层级分类体系。
 * - 16 Electronic/Dance: 电子舞曲类
 * - 3 Rock/Pop: 摇滚/流行类
 * - 1 Jazz: 爵士类
 * - 2 Classical/Ambient: 古典/氛围类
 *
 * Each entry includes its super-genre family for hierarchical grouping in the UI.
 * The genre `name` is the canonical lookup key for STRUCTURES data.
 */
export const GENRES: GenreEntry[] = [
  // ── Electronic / Dance ──
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
  // ── Classical / Ambient ──
  { name: 'Ambient', superGenre: 'classicalAmbient' },
  // ── Rock / Pop ──
  { name: 'Pop', superGenre: 'rockPop' },
  { name: 'Rock', superGenre: 'rockPop' },
  { name: 'Singer-Songwriter', superGenre: 'rockPop' },
  // ── Folk / Country / World ──
  { name: 'Folk', superGenre: 'folkCountry' },
  // ── Jazz / Blues / R&B ──
  { name: 'Jazz', superGenre: 'jazzBlues' },
  // ── Classical / Ambient ──
  { name: 'Classical', superGenre: 'classicalAmbient' }
]

/** Convenience export: just the genre name strings (backward compat) */
export const GENRE_NAMES: string[] = GENRES.map((g) => g.name)

// =============================================================================
// Genre Structure Database (曲风结构数据库)
//
// Each entry defines the standard arrangement pattern for one genre.
// Sections are ordered as they appear in a typical track.
// All values based on common production practices in each genre.
// =============================================================================

const STRUCTURES: Record<string, GenreData> = {
  // ---------------------------------------------------------------------------
  // House — 4/4 groove foundation, filtered builds and drops
  // 浩室 — 四四拍律动基础，滤波铺垫与段落起伏
  // ---------------------------------------------------------------------------
  House: {
    bpmRange: '120-130',
    typicalTotalMinutes: '5-8 min',
    sections: [
      {
        name: 'Intro',
        bars: 32,
        energy: 3,
        description: 'Filtered percussion and pad hint',
        elements: ['Kick', 'Hi-hats', 'Filtered pad']
      },
      {
        name: 'Main Groove',
        bars: 32,
        energy: 6,
        description: 'Bassline and full percussion enter',
        elements: ['Bassline', 'Full drums', 'Stab chords']
      },
      {
        name: 'Build',
        bars: 16,
        energy: 8,
        description: 'Filter sweep with snare roll acceleration',
        elements: ['Riser', 'Snare roll', 'Filter sweep']
      },
      {
        name: 'Drop 1',
        bars: 32,
        energy: 9,
        description: 'Full groove with main hook',
        elements: ['Full bass', 'Main hook', 'Open hi-hats']
      },
      {
        name: 'Breakdown',
        bars: 16,
        energy: 4,
        description: 'Stripped to pads and filtered elements',
        elements: ['Pads', 'Filtered vocal', 'Soft kick']
      },
      {
        name: 'Build 2',
        bars: 8,
        energy: 8,
        description: 'Quick rebuild with added layers',
        elements: ['Riser', 'Snare roll', 'Additional percussion']
      },
      {
        name: 'Drop 2',
        bars: 32,
        energy: 9,
        description: 'Drop variation with new elements',
        elements: ['Variation bass', 'Additional synth', 'Full drums']
      },
      {
        name: 'Outro',
        bars: 16,
        energy: 2,
        description: 'Strip back for DJ mix-out',
        elements: ['Percussion fade', 'Reverb tail']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Trance — atmospheric, emotional builds, supersaw drops
  // 迷幻 — 氛围铺垫，情绪递进，锯齿波主导
  // ---------------------------------------------------------------------------
  Trance: {
    bpmRange: '130-140',
    typicalTotalMinutes: '6-9 min',
    sections: [
      {
        name: 'Intro',
        bars: 32,
        energy: 2,
        description: 'Atmospheric pads, kick enters',
        elements: ['Atmospheric pad', 'Kick', 'Rolling sub-bass']
      },
      {
        name: 'Build 1',
        bars: 16,
        energy: 5,
        description: 'Melodic elements enter, filter opens',
        elements: ['Plucks', 'Arpeggio', 'Bassline']
      },
      {
        name: 'Drop 1',
        bars: 32,
        energy: 8,
        description: 'Supersaw lead and full energy',
        elements: ['Supersaw lead', 'Full bass', 'Rolling hi-hats']
      },
      {
        name: 'Breakdown',
        bars: 48,
        energy: 3,
        description: 'Emotional centerpiece — no kick',
        elements: ['Piano', 'Pads', 'Vocal', 'Reverb wash']
      },
      {
        name: 'Build 2',
        bars: 24,
        energy: 7,
        description: 'Gradual reintroduction with snare rolls',
        elements: ['Snare roll', 'Riser', 'Kick re-entry']
      },
      {
        name: 'Drop 2',
        bars: 40,
        energy: 9,
        description: 'Variation with orchestral layers',
        elements: ['Orchestral stabs', 'Extra lead', 'Bigger reverb']
      },
      {
        name: 'Outro',
        bars: 32,
        energy: 2,
        description: 'Elements fade, DJ-friendly loop',
        elements: ['Kick loop', 'Reverb tail', 'Pad fade']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Dubstep — half-time heavy bass, maximum energy drops
  // 回响贝斯 — 半速重低音，高潮段落能量满格
  // ---------------------------------------------------------------------------
  Dubstep: {
    bpmRange: '140-150',
    typicalTotalMinutes: '3-4 min',
    sections: [
      {
        name: 'Intro',
        bars: 16,
        energy: 3,
        description: 'Atmosphere with tension',
        elements: ['Atmospheric pad', 'Reversed cymbal', 'Sub-bass hint']
      },
      {
        name: 'Build',
        bars: 8,
        energy: 7,
        description: 'Vocal sample and accelerating snare',
        elements: ['Vocal sample', 'Snare roll', 'Riser']
      },
      {
        name: 'Drop 1',
        bars: 16,
        energy: 10,
        description: 'Maximum bass weight, half-time feel',
        elements: ['Heavy wub bass', 'Half-time drums', 'Impacts']
      },
      {
        name: 'Breakdown',
        bars: 8,
        energy: 3,
        description: 'Pads and sub only, tension rebuild',
        elements: ['Pads', 'Sub-bass', 'Atmospheric FX']
      },
      {
        name: 'Build 2',
        bars: 8,
        energy: 8,
        description: 'Intensified rebuild',
        elements: ['Intense riser', 'Layered snare']
      },
      {
        name: 'Drop 2',
        bars: 24,
        energy: 10,
        description: 'Different bass pattern, same energy',
        elements: ['New bass pattern', 'Extra percussion', 'Full power']
      },
      {
        name: 'Outro',
        bars: 8,
        energy: 2,
        description: 'Reversed elements trail off',
        elements: ['Reversed FX', 'Reverb wash']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Drum & Bass — fast breakbeats, rolling sub-bass
  // 鼓打贝斯 — 快速碎拍，滚奏低音
  // ---------------------------------------------------------------------------
  'Drum & Bass': {
    bpmRange: '170-180',
    typicalTotalMinutes: '4-6 min',
    sections: [
      {
        name: 'Intro',
        bars: 24,
        energy: 4,
        description: 'Filtered break, atmospheric',
        elements: ['Filtered break', 'Atmospheric pad', 'Sub-bass hint']
      },
      {
        name: 'Build',
        bars: 12,
        energy: 7,
        description: 'Hat acceleration, break intensifies',
        elements: ['Hat roll', 'Reverb snare', 'Riser']
      },
      {
        name: 'Drop 1',
        bars: 32,
        energy: 9,
        description: 'Full breakbeat and rolling sub',
        elements: ['Full break', 'Sub-bass', 'Lead hook']
      },
      {
        name: 'Breakdown',
        bars: 12,
        energy: 3,
        description: 'Half-time feel, pads, vocal',
        elements: ['Pads', 'Vocal', 'Half-time drums']
      },
      {
        name: 'Build 2',
        bars: 12,
        energy: 7,
        description: 'Energy rebuild with added vocal',
        elements: ['Vocal build', 'Riser', 'Hat acceleration']
      },
      {
        name: 'Drop 2',
        bars: 32,
        energy: 9,
        description: 'Different bass pattern, additional layers',
        elements: ['New bass', 'Extra drum layers', 'Variation hook']
      },
      {
        name: 'Outro',
        bars: 16,
        energy: 2,
        description: 'Break strip-down, reverb fade',
        elements: ['Simplified break', 'Reverb tail']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Techno — hypnotic repetition, minimal evolution, long format
  // 科技舞曲 — 催眠重复，极简演变，长格式编排
  // ---------------------------------------------------------------------------
  Techno: {
    bpmRange: '124-132',
    typicalTotalMinutes: '6-8 min',
    sections: [
      {
        name: 'Intro',
        bars: 32,
        energy: 3,
        description: 'Kick and minimal percussion establish groove',
        elements: ['Kick', 'Hi-hats', 'Minimal atmosphere']
      },
      {
        name: 'Groove',
        bars: 48,
        energy: 6,
        description: 'Bassline enters, linear evolution begins',
        elements: ['Bassline', 'Synth stab', 'Additional percussion']
      },
      {
        name: 'Main Section',
        bars: 64,
        energy: 8,
        description: 'Hypnotic repetition with micro-variations',
        elements: ['Full groove', 'Filter movement', 'FX textures']
      },
      {
        name: 'Breakdown',
        bars: 24,
        energy: 4,
        description: 'Filtered textures, kick may drop',
        elements: ['Filtered noise', 'FX', 'Ambient texture']
      },
      {
        name: 'Re-entry',
        bars: 24,
        energy: 7,
        description: 'Gradual re-entry of elements',
        elements: ['Kick re-entry', 'Filter opening', 'Bass return']
      },
      {
        name: 'Outro',
        bars: 32,
        energy: 2,
        description: 'Strip to kick+percussion, long fade',
        elements: ['Kick', 'Minimal percussion', 'Long reverb fade']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Progressive House — layered builds, melodic drops, emotional journey
  // 渐进浩室 — 层层推进，旋律化高潮，情绪旅程
  // ---------------------------------------------------------------------------
  'Progressive House': {
    bpmRange: '126-132',
    typicalTotalMinutes: '5-8 min',
    sections: [
      {
        name: 'Intro',
        bars: 24,
        energy: 2,
        description: 'Atmospheric intro with shaker and filtered kick',
        elements: ['Shaker', 'Filtered kick', 'Atmospheric pad']
      },
      {
        name: 'Verse',
        bars: 24,
        energy: 5,
        description: 'Melodic elements enter gradually',
        elements: ['Arp/pluck', 'Open hat', 'Sub-bass hint']
      },
      {
        name: 'Build 1',
        bars: 16,
        energy: 7,
        description: 'Pad filter sweep, vocal chop',
        elements: ['Filter sweep', 'Vocal chop', 'Snare roll']
      },
      {
        name: 'Drop 1',
        bars: 32,
        energy: 9,
        description: 'Supersaw chords and full groove',
        elements: ['Supersaw chords', 'Reese bass', 'Sidechain pump']
      },
      {
        name: 'Breakdown',
        bars: 24,
        energy: 4,
        description: 'Piano/pad chords, kick removed',
        elements: ['Piano', 'Pads', 'Reverb wash']
      },
      {
        name: 'Build 2',
        bars: 16,
        energy: 8,
        description: 'Build with counter-melody added',
        elements: ['Counter-melody', 'Intense riser', 'Snare roll']
      },
      {
        name: 'Drop 2',
        bars: 32,
        energy: 10,
        description: 'Drop variation with extra synth layer',
        elements: ['Additional synth', 'Filter modulation', 'Full energy']
      },
      {
        name: 'Outro',
        bars: 16,
        energy: 2,
        description: 'Reverse crash, elements strip away',
        elements: ['Reverse crash', 'Element strip', 'Reverb tail']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Deep House — warm, soulful, groovy
  // 深度浩室 — 温暖圆润，灵魂律动
  // ---------------------------------------------------------------------------
  'Deep House': {
    bpmRange: '118-126',
    typicalTotalMinutes: '5-7 min',
    sections: [
      {
        name: 'Intro',
        bars: 24,
        energy: 3,
        description: 'Soulful pad and gentle percussion',
        elements: ['Warm pad', 'Soft kick', 'Shaker']
      },
      {
        name: 'Groove',
        bars: 32,
        energy: 6,
        description: 'Sub-bass enters, deep groove established',
        elements: ['Sub-bass', 'Full percussion', 'Organ stab']
      },
      {
        name: 'Breakdown',
        bars: 24,
        energy: 3,
        description: 'Vocal hook over filtered pads',
        elements: ['Vocal', 'Filtered pads', 'Space']
      },
      {
        name: 'Build',
        bars: 12,
        energy: 6,
        description: 'Gradual filter open, conga rolls',
        elements: ['Conga roll', 'Filter open', 'Hat acceleration']
      },
      {
        name: 'Drop',
        bars: 32,
        energy: 8,
        description: 'Full groove with main hook',
        elements: ['Full groove', 'Main hook', 'Brass/key stab']
      },
      {
        name: 'Breakdown 2',
        bars: 16,
        energy: 3,
        description: 'Piano/vocal stripped section',
        elements: ['Piano', 'Vocal', 'Space']
      },
      {
        name: 'Drop 2',
        bars: 32,
        energy: 8,
        description: 'Variation with extra percussion',
        elements: ['Extra percussion', 'Additional instrument', 'Full groove']
      },
      {
        name: 'Outro',
        bars: 16,
        energy: 2,
        description: 'Slow strip-down, reverb tail',
        elements: ['Hat fade', 'Kick loop', 'Reverb tail']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // UK Garage — 2-step shuffle, swung percussion
  // 英式车库 — 两步 shuffle，摇摆打击乐
  // ---------------------------------------------------------------------------
  'UK Garage': {
    bpmRange: '130-140',
    typicalTotalMinutes: '5-6 min',
    sections: [
      {
        name: 'Intro',
        bars: 16,
        energy: 3,
        description: 'Shuffled percussion establishes groove',
        elements: ['Shuffled hat', 'Kick', 'Sparse sub']
      },
      {
        name: 'Verse',
        bars: 24,
        energy: 5,
        description: 'Bassline and chopped vocal',
        elements: ['Bassline', 'Chopped vocal', '2-step drums']
      },
      {
        name: 'Build',
        bars: 8,
        energy: 7,
        description: 'Swing intensifies, filter sweeps',
        elements: ['Filter sweep', 'Percussion build', 'Vocal phrase']
      },
      {
        name: 'Drop 1',
        bars: 24,
        energy: 8,
        description: 'Full 2-step groove with bass weight',
        elements: ['Full 2-step', 'Sub-bass', 'Vocal hook']
      },
      {
        name: 'Breakdown',
        bars: 16,
        energy: 3,
        description: 'Stripped to pads and spoken vocal',
        elements: ['Warm pads', 'Vocals', 'Minimal percussion']
      },
      {
        name: 'Drop 2',
        bars: 24,
        energy: 8,
        description: 'Variation with new bass pattern',
        elements: ['New bass pattern', 'Extra percussion', 'Full groove']
      },
      {
        name: 'Outro',
        bars: 16,
        energy: 2,
        description: 'Elements stripped for DJ mix',
        elements: ['Percussion fade', 'Sub fade', 'Reverb']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Trap — 808 heavy, hi-hat rolls, dark atmosphere
  // 陷阱 — 808重低音，镲片滚奏，暗黑氛围
  // ---------------------------------------------------------------------------
  Trap: {
    bpmRange: '140-150',
    typicalTotalMinutes: '3-4 min',
    sections: [
      {
        name: 'Intro',
        bars: 8,
        energy: 3,
        description: 'Dark atmosphere with 808 pattern',
        elements: ['808', 'Hi-hat groove', 'Dark atmosphere']
      },
      {
        name: 'Verse',
        bars: 12,
        energy: 5,
        description: 'Sparse beat with simple melody',
        elements: ['Sparse drums', '808 pattern', 'Simple melody']
      },
      {
        name: 'Build',
        bars: 6,
        energy: 8,
        description: 'Hi-hat roll acceleration 16th→32nd',
        elements: ['Hat roll', 'Snare riser', 'Filter sweep']
      },
      {
        name: 'Drop 1',
        bars: 24,
        energy: 9,
        description: 'Heavy 808 with layered percussion',
        elements: ['Heavy 808', 'Layered percussion', 'Bell melody']
      },
      {
        name: 'Breakdown',
        bars: 12,
        energy: 3,
        description: 'Vocal sustain, minimal hats',
        elements: ['Vocal', '808 sustain', 'Sparse hat']
      },
      {
        name: 'Build 2',
        bars: 6,
        energy: 8,
        description: 'Quick rebuild with added vocal',
        elements: ['Vocal build', 'Intense hat roll', 'Big riser']
      },
      {
        name: 'Drop 2',
        bars: 24,
        energy: 9,
        description: 'Pattern variation with added synth',
        elements: ['Added synth', 'Different hats', '888 variation']
      },
      {
        name: 'Outro',
        bars: 6,
        energy: 2,
        description: '808 fade, reverb tail',
        elements: ['808 fade', 'Reverb tail']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Future Bass — supersaw chords, vocal chops, bright energy
  // 未来贝斯 — 锯齿和弦，人声切片，明亮能量
  // ---------------------------------------------------------------------------
  'Future Bass': {
    bpmRange: '140-160',
    typicalTotalMinutes: '3-4 min',
    sections: [
      {
        name: 'Intro',
        bars: 12,
        energy: 3,
        description: 'Atmospheric pad with vocal chop',
        elements: ['Atmospheric pad', 'Vocal chop', 'Minimal percussion']
      },
      {
        name: 'Verse',
        bars: 16,
        energy: 4,
        description: 'Reduced feel, simple pad',
        elements: ['Simple pad', 'Reduced drums', 'Melodic hint']
      },
      {
        name: 'Build',
        bars: 12,
        energy: 7,
        description: 'Filter opening and hat density increase',
        elements: ['Filter sweep', 'Hat increase', 'Riser']
      },
      {
        name: 'Drop 1',
        bars: 32,
        energy: 9,
        description: 'Supersaw chords with sidechain pump',
        elements: ['Supersaw chords', 'Vocal chops', 'Layered claps']
      },
      {
        name: 'Breakdown',
        bars: 12,
        energy: 3,
        description: 'Piano and vocal, kick removed',
        elements: ['Piano', 'Vocal', 'Wide reverb']
      },
      {
        name: 'Build 2',
        bars: 12,
        energy: 7,
        description: 'Vocal sample build-up',
        elements: ['Vocal sample', 'Hat roll', 'Riser']
      },
      {
        name: 'Drop 2',
        bars: 32,
        energy: 9,
        description: 'Variation with chopped vocals',
        elements: ['Chopped vocals', 'New counter-melody', 'Full energy']
      },
      {
        name: 'Outro',
        bars: 8,
        energy: 2,
        description: 'Resolution chord, reverb fade',
        elements: ['Resolution chord', 'Reverb fade']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Hardstyle — distorted kicks, reverse bass, anthemic leads
  // 硬派 — 失真底鼓，反向贝斯，颂歌式主旋律
  // ---------------------------------------------------------------------------
  Hardstyle: {
    bpmRange: '150',
    typicalTotalMinutes: '5-7 min',
    sections: [
      {
        name: 'Intro',
        bars: 16,
        energy: 2,
        description: 'Atmospheric intro with melody hint',
        elements: ['Atmospheric pads', 'Melody hint']
      },
      {
        name: 'Mid-Intro',
        bars: 16,
        energy: 6,
        description: 'Hardstyle kick enters first time',
        elements: ['Hardstyle kick', 'Screech', 'Percussion']
      },
      {
        name: 'Breakdown',
        bars: 32,
        energy: 3,
        description: 'Emotional melody, no kick',
        elements: ['Emotional lead', 'Vocal', 'Piano']
      },
      {
        name: 'Drop',
        bars: 48,
        energy: 10,
        description: 'Full anthem — distorted kick and lead',
        elements: ['Distorted kick', 'Reverse bass', 'Lead melody', 'Vocals']
      },
      {
        name: 'Mid-Outro',
        bars: 16,
        energy: 5,
        description: 'Bridging out, energy decreases',
        elements: ['Kick', 'Screech', 'Reduced elements']
      },
      {
        name: 'Outro',
        bars: 16,
        energy: 2,
        description: 'DJ-friendly exit',
        elements: ['Kick loop', 'Reverb fade']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Psytrance — rolling basslines, psychedelic FX, forest/water themes
  // 迷幻出神 — 滚奏贝斯线，迷幻效果，自然主题
  // ---------------------------------------------------------------------------
  Psytrance: {
    bpmRange: '140-148',
    typicalTotalMinutes: '6-8 min',
    sections: [
      {
        name: 'Intro',
        bars: 24,
        energy: 3,
        description: 'Atmospheric FX, water/forest sounds',
        elements: ['Atmospheric FX', 'Nature sounds', 'Filtering']
      },
      {
        name: 'Main Bass',
        bars: 32,
        energy: 6,
        description: 'Rolling bassline enters, full percussion',
        elements: ['Kick', 'Rolling bassline', 'Percussion', 'Hat rolls']
      },
      {
        name: 'Build',
        bars: 12,
        energy: 8,
        description: 'Open-hat rolls, lead tease',
        elements: ['Hat roll', 'Filter sweep', 'Lead tease']
      },
      {
        name: 'Drop 1',
        bars: 48,
        energy: 10,
        description: 'Explosive full bass and lead melody',
        elements: ['Full bass', 'Lead melody', 'Layered synths']
      },
      {
        name: 'Break',
        bars: 24,
        energy: 3,
        description: 'Kick removed, atmospheric pads',
        elements: ['Pads', 'FX', 'Filter sweeps']
      },
      {
        name: 'Build 2',
        bars: 12,
        energy: 8,
        description: 'Intensified rebuild',
        elements: ['Intense build', 'Lead elements']
      },
      {
        name: 'Drop 2',
        bars: 48,
        energy: 10,
        description: 'New lead pattern, altered bass',
        elements: ['New lead', 'Altered bass', 'Added layers']
      },
      {
        name: 'Outro',
        bars: 24,
        energy: 2,
        description: 'Reverse FX, elements fade',
        elements: ['Reverse FX', 'Element fade', 'Reverb']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Breaks — filtered breakbeats, build/drop structure
  // 碎拍 — 滤波碎拍，起承转合
  // ---------------------------------------------------------------------------
  Breaks: {
    bpmRange: '125-140',
    typicalTotalMinutes: '5-7 min',
    sections: [
      {
        name: 'Intro',
        bars: 24,
        energy: 3,
        description: 'Filtered break, building anticipation',
        elements: ['Filtered break', 'Atmosphere']
      },
      {
        name: 'Build',
        bars: 12,
        energy: 7,
        description: 'Bass enters, break intensifies',
        elements: ['Bass', 'Break build', 'FX rise']
      },
      {
        name: 'Drop 1',
        bars: 32,
        energy: 9,
        description: 'Full breakbeat with bass and hooks',
        elements: ['Full break', 'Bassline', 'Hook']
      },
      {
        name: 'Breakdown',
        bars: 16,
        energy: 3,
        description: 'Stripped breaks and pads',
        elements: ['Filtered break', 'Pads', 'Space']
      },
      {
        name: 'Drop 2',
        bars: 32,
        energy: 9,
        description: 'Energy return with variation',
        elements: ['Variation break', 'Full bass']
      },
      {
        name: 'Outro',
        bars: 16,
        energy: 2,
        description: 'Break strip, reverb tail',
        elements: ['Break fade', 'Reverb']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Electro House — heavy bass, punchy drops, lead hooks
  // 电子浩室 — 重低音，冲击段落，主旋律 Hook
  // ---------------------------------------------------------------------------
  'Electro House': {
    bpmRange: '126-132',
    typicalTotalMinutes: '3-5 min',
    sections: [
      {
        name: 'Intro',
        bars: 12,
        energy: 4,
        description: 'Filtered lead tease with kick',
        elements: ['Kick', 'Percussion', 'Filtered lead']
      },
      {
        name: 'Verse',
        bars: 16,
        energy: 6,
        description: 'Chord stabs and bass groove',
        elements: ['Chord stabs', 'Bass groove', 'Vocal snippet']
      },
      {
        name: 'Build',
        bars: 12,
        energy: 8,
        description: 'Snare roll and white noise riser',
        elements: ['Snare roll', 'White noise', 'Pitch rise']
      },
      {
        name: 'Drop 1',
        bars: 24,
        energy: 10,
        description: 'Heavy bass and lead hook',
        elements: ['Heavy bass', 'Lead hook', 'Punchy kick']
      },
      {
        name: 'Breakdown',
        bars: 12,
        energy: 3,
        description: 'Pads and processed vocal',
        elements: ['Pads', 'Processed vocal', 'FX']
      },
      {
        name: 'Build 2',
        bars: 12,
        energy: 8,
        description: 'Bigger riser and intensified build',
        elements: ['Big riser', 'Intense snare roll']
      },
      {
        name: 'Drop 2',
        bars: 24,
        energy: 10,
        description: 'Drop variation with new synth',
        elements: ['New synth layer', 'Variation hook', 'Full energy']
      },
      {
        name: 'Outro',
        bars: 8,
        energy: 2,
        description: 'Quick element strip',
        elements: ['Kick fade', 'Element strip']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Minimal — repetition, subtle changes, long format
  // 微素 — 重复性极简编排，微妙变化，长时间演绎
  // ---------------------------------------------------------------------------
  Minimal: {
    bpmRange: '124-130',
    typicalTotalMinutes: '7-10 min',
    sections: [
      {
        name: 'Intro',
        bars: 48,
        energy: 2,
        description: 'Very sparse kick and one element',
        elements: ['Sparse kick', 'Single percussion']
      },
      {
        name: 'Groove',
        bars: 64,
        energy: 4,
        description: 'Second element added, subtle change',
        elements: ['Added element', 'Filter movement']
      },
      {
        name: 'Deep Section',
        bars: 64,
        energy: 5,
        description: 'Bass pulse with micro-variations',
        elements: ['Bass pulse', 'Subtle texture', 'Controlled chaos']
      },
      {
        name: 'Break',
        bars: 24,
        energy: 2,
        description: 'Noise sweep, filtered tail',
        elements: ['Noise sweep', 'Filtered tail']
      },
      {
        name: 'Re-entry',
        bars: 48,
        energy: 5,
        description: 'Full groove returns with subtle change',
        elements: ['Returning groove', 'Subtle variation']
      },
      {
        name: 'Outro',
        bars: 32,
        energy: 2,
        description: 'Click, fade, minimal exit',
        elements: ['Click', 'Fade']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Ambient — slow-evolving soundscapes, drone textures
  // 氛围 — 缓慢演变的声音景观，持续音纹理
  // ---------------------------------------------------------------------------
  Ambient: {
    bpmRange: '60-90',
    typicalTotalMinutes: '6-15 min',
    sections: [
      {
        name: 'Intro',
        bars: 32,
        energy: 2,
        description: 'Drone texture establishes atmosphere',
        elements: ['Drone', 'Reverb tail']
      },
      {
        name: 'Section 1',
        bars: 48,
        energy: 3,
        description: 'Pad layer enters, slow evolution',
        elements: ['Slow pad', 'Texture layer']
      },
      {
        name: 'Section 2',
        bars: 48,
        energy: 4,
        description: 'Deeper harmonic movement',
        elements: ['Harmonic shift', 'Additional texture']
      },
      {
        name: 'Section 3',
        bars: 48,
        energy: 5,
        description: 'Peak density and warmth',
        elements: ['Peak texture', 'Full pad']
      },
      {
        name: 'Resolution',
        bars: 48,
        energy: 3,
        description: 'Gradual dissolution',
        elements: ['Element removal', 'Slow fade']
      },
      {
        name: 'Outro',
        bars: 32,
        energy: 1,
        description: 'Drone decays to silence',
        elements: ['Final drone', 'Silence']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Pop — verse/chorus structure, catchy hooks
  // 流行 — 主歌/副歌结构，洗脑旋律
  // ---------------------------------------------------------------------------
  Pop: {
    bpmRange: '80-120',
    typicalTotalMinutes: '3-3.5 min',
    sections: [
      {
        name: 'Intro',
        bars: 4,
        energy: 4,
        description: 'Hook preview establishing vibe',
        elements: ['Instrumental hook', 'Light percussion']
      },
      {
        name: 'Verse 1',
        bars: 12,
        energy: 5,
        description: 'Story begins, lower energy',
        elements: ['Vocals', 'Guitar/piano', 'Bass']
      },
      {
        name: 'Pre-Chorus',
        bars: 6,
        energy: 7,
        description: 'Tension building, rising',
        elements: ['Building vocals', 'Drum fill', 'Rising synth']
      },
      {
        name: 'Chorus',
        bars: 12,
        energy: 9,
        description: 'Main hook, full band',
        elements: ['Full band', 'Lead vocal', 'Catchy hook']
      },
      {
        name: 'Verse 2',
        bars: 12,
        energy: 6,
        description: 'Narrative escalates',
        elements: ['Vocals', 'Added instrument', 'Driving beat']
      },
      {
        name: 'Pre-Chorus',
        bars: 6,
        energy: 7,
        description: 'Higher tension than first',
        elements: ['Stronger build', 'Backing vocals']
      },
      {
        name: 'Chorus',
        bars: 12,
        energy: 9,
        description: 'Repeat hook with more energy',
        elements: ['Full band', 'Ad-libs', 'Bigger energy']
      },
      {
        name: 'Bridge',
        bars: 8,
        energy: 5,
        description: 'Contrasting section before final',
        elements: ['Dynamic shift', 'New chord pattern', 'Stripped']
      },
      {
        name: 'Final Chorus',
        bars: 16,
        energy: 10,
        description: 'Extended, ad-libs, climax',
        elements: ['Maximum energy', 'Ad-libs', 'Extended outro']
      },
      {
        name: 'Outro',
        bars: 4,
        energy: 3,
        description: 'Hook repeat fade-out',
        elements: ['Hook repeat', 'Fade out']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Rock — guitar-driven, power chords, anthemic choruses
  // 摇滚 — 吉他驱动，强力和弦，颂歌式副歌
  // ---------------------------------------------------------------------------
  Rock: {
    bpmRange: '100-160',
    typicalTotalMinutes: '3-5 min',
    sections: [
      {
        name: 'Intro',
        bars: 6,
        energy: 5,
        description: 'Iconic riff establishes song',
        elements: ['Guitar riff', 'Bass', 'Light drums']
      },
      {
        name: 'Verse',
        bars: 12,
        energy: 6,
        description: 'Power chords, less dense',
        elements: ['Power chords', 'Vocals', 'Bass']
      },
      {
        name: 'Chorus',
        bars: 10,
        energy: 9,
        description: 'Open chords, full band, anthemic',
        elements: ['Open chords', 'Full band', 'Anthemic vocal']
      },
      {
        name: 'Verse 2',
        bars: 12,
        energy: 6,
        description: 'Same structure, lyrical variation',
        elements: ['Power chords', 'Vocals', 'Tighter drums']
      },
      {
        name: 'Chorus',
        bars: 10,
        energy: 9,
        description: 'Repeat chorus, bigger',
        elements: ['Full band', 'More energy']
      },
      {
        name: 'Solo',
        bars: 12,
        energy: 8,
        description: 'Guitar solo over changes',
        elements: ['Guitar solo', 'Rhythm section']
      },
      {
        name: 'Bridge',
        bars: 8,
        energy: 5,
        description: 'Dynamic shift before final',
        elements: ['Quieter section', 'Different feel']
      },
      {
        name: 'Final Chorus',
        bars: 12,
        energy: 10,
        description: 'Maximum energy, extended',
        elements: ['Maximum energy', 'Extended ending']
      },
      {
        name: 'Outro',
        bars: 6,
        energy: 4,
        description: 'Riff repeat, fade-out',
        elements: ['Riff', 'Fade out']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Singer-Songwriter — acoustic, intimate, emotional
  // 唱作人 — 原声，私密，情感化
  // ---------------------------------------------------------------------------
  'Singer-Songwriter': {
    bpmRange: '70-100',
    typicalTotalMinutes: '3-4 min',
    sections: [
      {
        name: 'Intro',
        bars: 4,
        energy: 2,
        description: 'Fingerpicked guitar or piano solo',
        elements: ['Acoustic guitar', 'Piano']
      },
      {
        name: 'Verse 1',
        bars: 12,
        energy: 4,
        description: 'Vocal with sparse accompaniment',
        elements: ['Vocals', 'Light guitar/piano']
      },
      {
        name: 'Chorus',
        bars: 8,
        energy: 7,
        description: 'Full accompaniment, emotional peak',
        elements: ['Full accompaniment', 'Emotional vocal', 'Gentle drums']
      },
      {
        name: 'Verse 2',
        bars: 12,
        energy: 5,
        description: 'Narrative continues with subtle layers',
        elements: ['Vocals', 'Added instrument', 'Deeper arrangement']
      },
      {
        name: 'Chorus',
        bars: 8,
        energy: 8,
        description: 'Bigger chorus with backing vocals',
        elements: ['Backing vocals', 'Richer arrangement']
      },
      {
        name: 'Bridge',
        bars: 8,
        energy: 4,
        description: 'Introspective moment',
        elements: ['Stripped back', 'Reflective lyric']
      },
      {
        name: 'Final Chorus',
        bars: 12,
        energy: 8,
        description: 'Emotional climax',
        elements: ['Climax', 'Full arrangement', 'Resolve']
      },
      {
        name: 'Outro',
        bars: 6,
        energy: 2,
        description: 'Gentle fade, single instrument',
        elements: ['Single instrument', 'Fade out']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Folk — acoustic storytelling, harmonies
  // 民谣 — 原声叙事，和声伴唱
  // ---------------------------------------------------------------------------
  Folk: {
    bpmRange: '80-120',
    typicalTotalMinutes: '3-4 min',
    sections: [
      {
        name: 'Intro',
        bars: 4,
        energy: 3,
        description: 'Acoustic instrumental intro',
        elements: ['Acoustic guitar', 'Fiddle/mandolin']
      },
      {
        name: 'Verse',
        bars: 12,
        energy: 5,
        description: 'Story-telling verse with strummed guitar',
        elements: ['Acoustic guitar', 'Vocals', 'Light percussion']
      },
      {
        name: 'Chorus',
        bars: 8,
        energy: 7,
        description: 'Catchy sing-along chorus',
        elements: ['Full arrangement', 'Harmonies', 'Sing-along melody']
      },
      {
        name: 'Verse 2',
        bars: 12,
        energy: 5,
        description: 'Narrative continues',
        elements: ['Acoustic guitar', 'Vocals', 'Added instrument']
      },
      {
        name: 'Chorus',
        bars: 8,
        energy: 8,
        description: 'Chorus with more instruments',
        elements: ['Fuller arrangement', 'More harmonies']
      },
      {
        name: 'Instrumental',
        bars: 8,
        energy: 6,
        description: 'Instrumental break (fiddle/banjo solo)',
        elements: ['Instrumental solo', 'Rhythm section']
      },
      {
        name: 'Final Chorus',
        bars: 12,
        energy: 8,
        description: 'Extended sing-along ending',
        elements: ['Full arrangement', 'Group vocals']
      },
      {
        name: 'Outro',
        bars: 4,
        energy: 3,
        description: 'Instrumental tag, resolve',
        elements: ['Instrumental tag', 'Final chord']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Jazz — head/solos/head structure, improvisation
  // 爵士 — 主题/即兴/主题结构，即兴演奏
  // ---------------------------------------------------------------------------
  Jazz: {
    bpmRange: '60-300',
    typicalTotalMinutes: '4-8 min',
    sections: [
      {
        name: 'Head',
        bars: 24,
        energy: 5,
        description: 'Main melody stated by ensemble',
        elements: ['Melody', 'Comping', 'Walking bass']
      },
      {
        name: 'Solo 1',
        bars: 48,
        energy: 6,
        description: 'First improvisation over changes',
        elements: ['Solo instrument', 'Rhythm section']
      },
      {
        name: 'Solo 2',
        bars: 48,
        energy: 7,
        description: 'Second soloist trades phrases',
        elements: ['Second soloist', 'Trading']
      },
      {
        name: 'Piano/Bass Break',
        bars: 12,
        energy: 4,
        description: 'Stripped section for piano/bass feature',
        elements: ['Piano', 'Bass']
      },
      {
        name: 'Drum Solo',
        bars: 12,
        energy: 8,
        description: 'Trading fours with drums',
        elements: ['Drums', 'Band hits']
      },
      {
        name: 'Head Out',
        bars: 24,
        energy: 5,
        description: 'Return to melody, tag ending',
        elements: ['Melody return', 'Tag', 'Resolve']
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Classical — sonata form, exposition/development/recapitulation
  // 古典 — 奏鸣曲式，呈示/展开/再现
  //
  // NOTE: Classical sections have variable bar lengths ("Varies") because
  // sonata form depends heavily on the specific piece. Use bars=0 to
  // indicate flexible/variable section length.
  // 注意：古典乐段落小节数因具体作品而异，用 0 表示可变长度。
  // ---------------------------------------------------------------------------
  Classical: {
    bpmRange: '40-160',
    typicalTotalMinutes: '20-45 min',
    sections: [
      {
        name: 'Exposition',
        bars: 0,
        energy: 5,
        description: 'Main themes introduced',
        elements: ['Theme 1', 'Theme 2', 'Transition']
      },
      {
        name: 'Development',
        bars: 0,
        energy: 7,
        description: 'Thematic fragmentation, modulation',
        elements: ['Modulation', 'Fragmentation', 'Tension']
      },
      {
        name: 'Recapitulation',
        bars: 0,
        energy: 6,
        description: 'Themes return in tonic key',
        elements: ['Theme 1 return', 'Theme 2 in tonic', 'Resolution']
      },
      {
        name: 'Coda',
        bars: 0,
        energy: 4,
        description: 'Final closing statement',
        elements: ['Final cadence', 'Closing gesture']
      }
    ]
  }
}

// =============================================================================
// Public Functions (公开函数)
// =============================================================================

/**
 * Get the full arrangement structure for a given genre.
 *
 * Returns the song sections with bar lengths, energy levels, descriptions,
 * and key sonic elements. Also includes total bar count, BPM range, and
 * typical duration.
 *
 * 获取指定曲风的完整编曲结构，包含段落信息、能量等级和配器建议。
 *
 * @param genre - The music genre name (must be in GENRES list)
 * @returns SongStructure with sections, totalBars, bpmRange, and
 *   typicalTotalMinutes. If the genre is not found, returns an empty
 *   structure with no sections and 0 total bars.
 *
 * @example
 *   getStructure('House')
 *   // => { sections: [...], totalBars: 184, bpmRange: '120-130', ... }
 */
export function getStructure(genre: string): SongStructure {
  const data = STRUCTURES[genre]

  if (!data) {
    return {
      sections: [],
      totalBars: 0,
      bpmRange: '',
      typicalTotalMinutes: ''
    }
  }

  const totalBars = data.sections.reduce((sum, s) => sum + s.bars, 0)

  return {
    sections: data.sections,
    totalBars,
    bpmRange: data.bpmRange,
    typicalTotalMinutes: data.typicalTotalMinutes
  }
}

/**
 * Generate a visual energy mapping across the arrangement sections.
 *
 * Each entry maps a section name to its energy level over a specific bar range.
 * Bar ranges are cumulative (e.g., '1-32', '33-48') so you can visualize
 * how energy changes throughout the track.
 *
 * 生成编曲能量映射图，展示每个段落在完整曲目中的能量变化。
 * 小节范围是累积计算的，可用于可视化整曲的能量起伏。
 *
 * @param genre - The music genre name (must be in GENRES list)
 * @returns Array of energy map entries with section name, bar range, and
 *   energy level. Returns empty array if genre not found. For genres with
 *   variable-length sections (e.g., Classical), bar ranges are "Varies".
 *
 * @example
 *   getEnergyMap('House')
 *   // => [{ section: 'Intro', barRange: '1-32', energy: 3 }, ...]
 */
export function getEnergyMap(genre: string): EnergyMapEntry[] {
  const structure = getStructure(genre)

  if (structure.sections.length === 0) {
    return []
  }

  const entries: EnergyMapEntry[] = []
  let currentBar = 1

  for (const section of structure.sections) {
    if (section.bars === 0) {
      // Variable-length section (e.g., Classical)
      // 可变长度段落（如古典乐）
      entries.push({
        section: section.name,
        barRange: 'Varies',
        energy: section.energy
      })
    } else {
      const endBar = currentBar + section.bars - 1
      entries.push({
        section: section.name,
        barRange: `${currentBar}-${endBar}`,
        energy: section.energy
      })
      currentBar = endBar + 1
    }
  }

  return entries
}
