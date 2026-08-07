/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Loudness Standards Module (LUFS / True Peak)
 * =============================================================================
 *
 * WHAT THIS MODULE DOES:
 * Provides loudness reference standards for different streaming platforms
 * and delivery formats. Includes:
 *   - Integrated LUFS (loudness over entire track)
 *   - Short-term LUFS (momentary loudness windows)
 *   - True Peak ceiling (maximum sample value after reconstruction)
 *   - Loudness Range (LRA - dynamic range measurement)
 *
 * WHY THIS IS USEFUL:
 * Different platforms normalize audio to different loudness levels. A master
 * that sounds great in your DAW might be too quiet on Spotify or distorted on
 * YouTube. This module helps you target the right loudness for each platform.
 *
 * KEY CONCEPTS:
 *   LUFS (Loudness Units relative to Full Scale) — The standard for measuring
 *   perceived loudness. Lower values = quieter, higher values = louder.
 *   - Integrated LUFS: Average loudness over the entire program
 *   - Short-term LUFS: Average over a 3-second sliding window
 *   - True Peak: The absolute maximum level (in dBTP) after D/A reconstruction
 *   - LRA (Loudness Range): How much the loudness varies (higher = more dynamic)
 *
 * HOW TO USE:
 *   import { getPlatformTarget, ALL_PLATFORMS, type Platform } from '../core/loudnessStandards'
 *
 *   // Get target for a specific platform
 *   const spotify = getPlatformTarget('spotify')
 *   // => { platform: 'spotify', integratedLufs: -14, truePeak: -1, ... }
 *
 *   // Get all platforms
 *   const all = ALL_PLATFORMS
 */

// =============================================================================
// Type Definitions
// =============================================================================

/** Streaming platforms / delivery formats supported */
export type Platform =
  | 'spotify'
  | 'appleMusic'
  | 'youtube'
  | 'tidal'
  | 'amazonMusic'
  | 'deezer'
  | 'soundcloud'
  | 'bandcamp'
  | 'cd'
  | 'broadcastTV'
  | 'film'
  | 'podcast'
  | 'mastering'

/** A loudness target entry for one platform */
export interface LoudnessTarget {
  /** Platform identifier */
  platform: Platform
  /** Display name for the platform */
  label: string
  /** Target integrated LUFS (e.g., -14 for Spotify). More negative = quieter */
  integratedLufs: number
  /** Maximum true peak in dBTP (e.g., -1 means no sample should exceed -1dBTP) */
  truePeak: number
  /** Recommended short-term LUFS range (3-second window) */
  shortTermLufs: string
  /** Typical loudness range (LRA) in LU */
  lra: string
  /** Brief description of this platform's loudness policy */
  description: string
  /** Category for grouping */
  category: 'streaming' | 'broadcast' | 'physical' | 'reference'
}

/** Result from getAllTargets() */
export interface AllTargetsResult {
  /** All platforms grouped by category */
  categories: {
    /** Category name */
    category: LoudnessTarget['category']
    /** Display label */
    label: string
    /** Platforms in this category */
    platforms: LoudnessTarget[]
  }[]
  /** All platforms in a flat array */
  all: LoudnessTarget[]
}

// =============================================================================
// How Loudness Normalization Works
// =============================================================================
//
// Streaming services use loudness normalization to make all songs play at a
// consistent perceived volume. Here's how it works:
//
// 1. Spotify normalizes to -14 LUFS integrated
//    - If your master is -8 LUFS (louder), Spotify turns it down by 6dB
//    - If your master is -18 LUFS (quieter), Spotify turns it UP by 4dB
//    - Turning UP can cause clipping/ distortion! Keep your master close to -14 LUFS
//
// 2. Apple Music normalizes to -16 LUFS (Sound Check)
//    - Also supports Dolby Atmos which has different requirements
//    - True peak should never exceed -1dBTP (some engineers recommend -2dBTP for safety)
//
// 3. YouTube normalizes to -14 LUFS (loudness normalization since 2021)
//    - True peak: -1dBTP for stereo, -2dBTP for surround
//    - LRA of 8-12 LU is typical for music content
//
// RULE OF THUMB:
//   - Master to -14 LUFS integrated and you'll sound good everywhere
//   - True peak should NEVER exceed -1dBTP (leave headroom!)
//   - If you want more dynamic range, master to -16 LUFS or lower
//   - For EDM/electronic, -8 to -10 LUFS is common (listeners expect loudness)
//   - For classical/jazz, -18 to -22 LUFS is normal (wide dynamic range)
// =============================================================================

// =============================================================================
// Platform Loudness Standards Database
//
// Sources: Official platform documentation, EBU R128, ITU-R BS.1770-4
// Note: Values change over time. These are current as of 2026.
// =============================================================================

/** Complete database of loudness targets by platform */
const PLATFORM_TARGETS: LoudnessTarget[] = [
  // ===== Streaming Platforms =====
  {
    platform: 'spotify',
    label: 'Spotify',
    integratedLufs: -14,
    truePeak: -1,
    shortTermLufs: '-18 to -12',
    lra: '6-12 LU',
    description: 'Normalizes to -14 LUFS integrated. Great default target. Tracks mastered louder will be turned down; tracks mastered quieter will be turned up (risking limiting artifacts).',
    category: 'streaming'
  },
  {
    platform: 'appleMusic',
    label: 'Apple Music',
    integratedLufs: -16,
    truePeak: -1,
    shortTermLufs: '-20 to -14',
    lra: '6-14 LU',
    description: 'Uses "Sound Check" normalization to -16 LUFS. More dynamic range than Spotify. Apple recommends -16 LUFS integrated with -1dBTP true peak. Dolby Atmos has separate requirements.',
    category: 'streaming'
  },
  {
    platform: 'youtube',
    label: 'YouTube',
    integratedLufs: -14,
    truePeak: -1,
    shortTermLufs: '-18 to -12',
    lra: '8-12 LU',
    description: 'Normalizes to -14 LUFS (as of 2021). True peak limit of -1dBTP for stereo content. Content significantly louder than -14 LUFS will be turned down and may sound worse.',
    category: 'streaming'
  },
  {
    platform: 'tidal',
    label: 'TIDAL',
    integratedLufs: -14,
    truePeak: -1,
    shortTermLufs: '-18 to -12',
    lra: '6-12 LU',
    description: 'Matches Spotify\'s -14 LUFS target. TIDAL Masters (MQA) may have different specs. HiFi tier plays original PCM (no normalization applied).',
    category: 'streaming'
  },
  {
    platform: 'amazonMusic',
    label: 'Amazon Music',
    integratedLufs: -14,
    truePeak: -1,
    shortTermLufs: '-18 to -12',
    lra: '6-12 LU',
    description: 'Normalizes to -14 LUFS (same as Spotify). Also offers Ultra HD (24-bit/192kHz) which bypasses normalization. For standard streaming, aim for -14 LUFS.',
    category: 'streaming'
  },
  {
    platform: 'deezer',
    label: 'Deezer',
    integratedLufs: -14,
    truePeak: -1,
    shortTermLufs: '-18 to -12',
    lra: '6-12 LU',
    description: 'Normalizes to -14 LUFS. Deezer uses the same loudness target as Spotify and YouTube. True peak at -1dBTP for safety.',
    category: 'streaming'
  },
  {
    platform: 'soundcloud',
    label: 'SoundCloud',
    integratedLufs: -10,
    truePeak: -1,
    shortTermLufs: '-14 to -8',
    lra: '6-14 LU',
    description: 'SoundCloud does NOT normalize loudness. Master to -10 LUFS for competitive loudness. True peak limit of -1dBTP. 128kbps MP3 streaming reduces quality.',
    category: 'streaming'
  },
  {
    platform: 'bandcamp',
    label: 'Bandcamp',
    integratedLufs: -12,
    truePeak: -1,
    shortTermLufs: '-16 to -10',
    lra: '6-14 LU',
    description: 'No loudness normalization. Fans can download original files (FLAC/WAV). Master to -12 LUFS for playback, but deliver unmastered high-res files for download.',
    category: 'streaming'
  },

  // ===== Physical Media =====
  {
    platform: 'cd',
    label: 'CD (Red Book)',
    integratedLufs: -10,
    truePeak: -0.3,
    shortTermLufs: '-14 to -8',
    lra: '6-16 LU',
    description: 'CD (Red Book 16-bit PCM). Master between -8 to -12 LUFS with true peak at -0.3dBTP to avoid intersample peaks on consumer DACs.',
    category: 'physical'
  },

  // ===== Broadcast Standards =====
  {
    platform: 'broadcastTV',
    label: 'Broadcast TV (EBU R128 / ATSC A/85)',
    integratedLufs: -23,
    truePeak: -2,
    shortTermLufs: '-26 to -20',
    lra: '8-16 LU',
    description: 'Strict broadcast standard. EBU R128 (Europe): -23 LUFS ±0.5 LU. ATSC A/85 (US): -24 LUFS. True peak ≤ -2dBTP. This is MUCH quieter than music. Required for TV/radio broadcast.',
    category: 'broadcast'
  },
  {
    platform: 'film',
    label: 'Film / Cinema (Dolby LM100)',
    integratedLufs: -27,
    truePeak: -3,
    shortTermLufs: '-32 to -24',
    lra: '10-20 LU',
    description: 'Film mixes are VERY quiet in LUFS because they\'re played back in calibrated cinemas at high volume. -27 LUFS integrated is typical for theatrical mixes. Huge dynamic range (10-20 LU).',
    category: 'broadcast'
  },
  {
    platform: 'podcast',
    label: 'Podcast (ITU-R BS.1770-4)',
    integratedLufs: -16,
    truePeak: -2,
    shortTermLufs: '-20 to -14',
    lra: '4-8 LU',
    description: 'Podcasts need consistent loudness with low dynamic range. -16 LUFS is the common target. True peak at -2dBTP for safety. Speech should sit at -16 LUFS with minimal variation (LRA 4-8).',
    category: 'broadcast'
  },

  // ===== Reference Standard =====
  {
    platform: 'mastering',
    label: 'Mastering Reference',
    integratedLufs: -14,
    truePeak: -1,
    shortTermLufs: '-18 to -12',
    lra: '6-14 LU',
    description: 'General mastering reference. -14 LUFS integrated with -1dBTP true peak is the "universal" target that works well across most platforms. Always leave headroom for the mastering engineer.',
    category: 'reference'
  }
]

// =============================================================================
// Public API Functions
// =============================================================================

/**
 * Get the loudness target for a specific platform.
 *
 * @param platform - The platform to look up
 * @returns The loudness target, or null if not found
 *
 * @example
 *   const target = getPlatformTarget('spotify')
 *   // => { platform: 'spotify', integratedLufs: -14, truePeak: -1, ... }
 *   console.log(`Master to ${target.integratedLufs} LUFS for ${target.label}`)
 */
export function getPlatformTarget(platform: Platform): LoudnessTarget | null {
  return PLATFORM_TARGETS.find((p) => p.platform === platform) ?? null
}

/**
 * Get all loudness targets, grouped by category.
 *
 * @returns AllTargetsResult with grouped and flat arrays
 *
 * @example
 *   const all = getAllTargets()
 *   all.categories.forEach(cat => console.log(cat.label, cat.platforms.length))
 *   all.all.forEach(p => console.log(p.label, p.integratedLufs))
 */
export function getAllTargets(): AllTargetsResult {
  // Create one grouping bucket per category
  const categories: AllTargetsResult['categories'] = [
    { category: 'streaming', label: 'Streaming Platforms', platforms: [] },
    { category: 'broadcast', label: 'Broadcast & Film', platforms: [] },
    { category: 'physical', label: 'Physical Media', platforms: [] },
    { category: 'reference', label: 'Reference Standards', platforms: [] }
  ]

  // Distribute each platform into its category's bucket
  for (const target of PLATFORM_TARGETS) {
    const cat = categories.find((c) => c.category === target.category)
    if (cat) cat.platforms.push(target)
  }

  return {
    categories,
    all: [...PLATFORM_TARGETS]
  }
}

/**
 * Get a simplified loudness recommendation based on music genre.
 * Useful for beginners who don't know which platform target to use.
 *
 * @param genre - Music genre
 * @returns Recommended integrated LUFS and description
 *
 * @example
 *   const rec = getGenreLoudnessRecommendation('electronic')
 *   // => { genre: 'electronic', recommendedLufs: -10, range: '-12 to -8', ... }
 */
export function getGenreLoudnessRecommendation(genre: string): {
  genre: string
  recommendedLufs: number
  range: string
  description: string
} {
  const recommendations: Record<string, { lufs: number; range: string; desc: string }> = {
    pop:        { lufs: -14, range: '-14 to -12', desc: 'Pop music typically targets -14 to -12 LUFS. Clean, consistent loudness with minimal dynamic range.' },
    rock:       { lufs: -11, range: '-12 to -9',  desc: 'Rock benefits from punch. Master around -11 LUFS for impact while keeping some dynamics.' },
    electronic: { lufs: -10, range: '-12 to -8',  desc: 'EDM/electronic is mastered loud. -10 LUFS or even -8 LUFS for club/dance tracks.' },
    hiphop:     { lufs: -9,  range: '-11 to -8',  desc: 'Hip-hop/trap pushes loudness. -9 LUFS is common, some go to -8 LUFS for competitive loudness.' },
    jazz:       { lufs: -16, range: '-18 to -14', desc: 'Jazz preserves dynamics. -16 LUFS or quieter allows natural dynamic expression.' },
    classical:  { lufs: -20, range: '-24 to -18', desc: 'Classical has wide dynamic range. -18 to -24 LUFS is normal. Do NOT squash classical dynamics.' },
    metal:      { lufs: -9,  range: '-11 to -8',  desc: 'Metal is often heavily compressed and loud. -9 LUFS is typical for modern metal productions.' },
    rnb:        { lufs: -12, range: '-14 to -10', desc: 'R&B balances loudness with groove. -12 LUFS is a good starting point.' },
    country:    { lufs: -13, range: '-14 to -11', desc: 'Country music sits in the middle. -13 LUFS keeps things natural but present.' },
    latin:      { lufs: -11, range: '-12 to -9',  desc: 'Latin music is energetic and loud. -11 LUFS is a good target for competitive playback.' }
  }

  const rec = recommendations[genre.toLowerCase()]
  if (!rec) {
    return {
      genre: genre || 'pop',
      recommendedLufs: -14,
      range: '-14 to -12',
      description: 'No specific recommendation for this genre. Default to -14 LUFS (Spotify standard) as a safe starting point.'
    }
  }

  return {
    genre: genre.toLowerCase(),
    recommendedLufs: rec.lufs,
    range: rec.range,
    description: rec.desc
  }
}

/**
 * Check if a given LUFS value meets a specific platform's target.
 *
 * @param platform - The platform to check against
 * @param lufsValue - Your track's integrated LUFS value
 * @returns Whether it passes, and how much adjustment is needed
 *
 * @example
 *   const result = checkLoudness(-12, 'spotify')
 *   // => { platform: 'spotify', targetLufs: -14, yourLufs: -12, pass: true, adjustmentNeeded: 0 }
 *   // For -8 LUFS on Spotify:
 *   // => { pass: false, adjustmentNeeded: -6 } (Spotify will turn it down by 6dB)
 */
export function checkLoudness(
  lufsValue: number,
  platform: Platform
): {
  platform: Platform
  platformLabel: string
  targetLufs: number
  yourLufs: number
  pass: boolean
  adjustmentNeeded: number
  message: string
} {
  const target = getPlatformTarget(platform)
  if (!target) {
    return {
      platform,
      platformLabel: platform,
      targetLufs: -14,
      yourLufs: lufsValue,
      pass: true,
      adjustmentNeeded: 0,
      message: 'Unknown platform — no check available.'
    }
  }

  const diff = lufsValue - target.integratedLufs
  const adjustment = target.integratedLufs - lufsValue  // negative = will be turned down, positive = will be turned up (risky)

  let message: string
  if (Math.abs(diff) <= 1) {
    message = `✅ Great! Your -${Math.abs(lufsValue).toFixed(1)} LUFS is within 1 LU of ${target.label}'s -${Math.abs(target.integratedLufs)} LUFS target.`
  } else if (lufsValue < target.integratedLufs) {
    message = `⚠️ Your track (-${Math.abs(lufsValue).toFixed(1)} LUFS) is quieter than ${target.label}'s target (-${Math.abs(target.integratedLufs)} LUFS). It will be turned UP by ${Math.abs(adjustment).toFixed(1)}dB, which may cause limiting artifacts.`
  } else {
    message = `⚠️ Your track (-${Math.abs(lufsValue).toFixed(1)} LUFS) is louder than ${target.label}'s target (-${Math.abs(target.integratedLufs)} LUFS). It will be turned DOWN by ${Math.abs(adjustment).toFixed(1)}dB.`
  }

  return {
    platform,
    platformLabel: target.label,
    targetLufs: target.integratedLufs,
    yourLufs: lufsValue,
    pass: Math.abs(diff) <= 1.5,
    adjustmentNeeded: parseFloat(adjustment.toFixed(1)),
    message
  }
}

/**
 * Get all platform identifiers.
 */
export const ALL_PLATFORMS: { value: Platform; label: string }[] = PLATFORM_TARGETS.map((p) => ({
  value: p.platform,
  label: p.label
}))

/**
 * Get all categories for UI filtering.
 */
export const LOUDNESS_CATEGORIES: { value: LoudnessTarget['category']; label: string }[] = [
  { value: 'streaming', label: 'Streaming Platforms' },
  { value: 'broadcast', label: 'Broadcast & Film' },
  { value: 'physical', label: 'Physical Media' },
  { value: 'reference', label: 'Reference Standards' }
]
