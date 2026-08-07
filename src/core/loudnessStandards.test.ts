/**
 * Unit tests for the Loudness Standards module.
 *
 * Tests cover:
 *   - Getting platform-specific targets
 *   - Getting all platforms grouped by category
 *   - Genre loudness recommendations
 *   - Loudness check function
 *   - Data integrity
 */

import { describe, it, expect } from 'vitest'
import {
  getPlatformTarget,
  getAllTargets,
  getGenreLoudnessRecommendation,
  checkLoudness,
  ALL_PLATFORMS,
  type Platform
} from './loudnessStandards'

describe('getPlatformTarget', () => {
  it('returns Spotify target with -14 LUFS', () => {
    const target = getPlatformTarget('spotify')
    expect(target).not.toBeNull()
    expect(target!.integratedLufs).toBe(-14)
    expect(target!.truePeak).toBe(-1)
    expect(target!.category).toBe('streaming')
  })

  it('returns Apple Music target with -16 LUFS', () => {
    const target = getPlatformTarget('appleMusic')
    expect(target).not.toBeNull()
    expect(target!.integratedLufs).toBe(-16)
    expect(target!.label).toBe('Apple Music')
  })

  it('returns broadcast target with -23 LUFS', () => {
    const target = getPlatformTarget('broadcastTV')
    expect(target).not.toBeNull()
    expect(target!.integratedLufs).toBe(-23)
    expect(target!.category).toBe('broadcast')
  })

  it('returns mastering reference', () => {
    const target = getPlatformTarget('mastering')
    expect(target).not.toBeNull()
    expect(target!.integratedLufs).toBe(-14)
    expect(target!.category).toBe('reference')
  })

  it('returns null for unknown platform', () => {
    const target = getPlatformTarget('unknown' as Platform)
    expect(target).toBeNull()
  })
})

describe('getAllTargets', () => {
  it('returns all platforms grouped', () => {
    const result = getAllTargets()
    expect(result.categories.length).toBeGreaterThan(0)
    expect(result.all.length).toBeGreaterThan(0)

    // Should have streaming category with Spotify et al
    const streaming = result.categories.find((c) => c.category === 'streaming')
    expect(streaming).toBeDefined()
    expect(streaming!.platforms.length).toBeGreaterThanOrEqual(6)

    // Should have broadcast category
    const broadcast = result.categories.find((c) => c.category === 'broadcast')
    expect(broadcast).toBeDefined()
  })

  it('flat list matches grouped total', () => {
    const result = getAllTargets()
    const groupedCount = result.categories.reduce((sum, c) => sum + c.platforms.length, 0)
    expect(groupedCount).toBe(result.all.length)
  })
})

describe('ALL_PLATFORMS', () => {
  it('includes all platforms', () => {
    expect(ALL_PLATFORMS.length).toBeGreaterThan(8)
    expect(ALL_PLATFORMS.map((p) => p.value)).toContain('spotify')
    expect(ALL_PLATFORMS.map((p) => p.value)).toContain('appleMusic')
    expect(ALL_PLATFORMS.map((p) => p.value)).toContain('youtube')
  })
})

describe('getGenreLoudnessRecommendation', () => {
  it('returns pop recommendation at -14 LUFS', () => {
    const rec = getGenreLoudnessRecommendation('pop')
    expect(rec.genre).toBe('pop')
    expect(rec.recommendedLufs).toBe(-14)
    expect(rec.description).toBeTruthy()
  })

  it('returns electronic recommendation at -10 LUFS', () => {
    const rec = getGenreLoudnessRecommendation('electronic')
    expect(rec.genre).toBe('electronic')
    expect(rec.recommendedLufs).toBe(-10)
  })

  it('returns hip-hop recommendation at -9 LUFS', () => {
    const rec = getGenreLoudnessRecommendation('hiphop')
    expect(rec.recommendedLufs).toBe(-9)
  })

  it('returns classical recommendation at -20 LUFS', () => {
    const rec = getGenreLoudnessRecommendation('classical')
    expect(rec.recommendedLufs).toBe(-20)
  })

  it('returns default for unknown genre', () => {
    const rec = getGenreLoudnessRecommendation('unknown')
    expect(rec.recommendedLufs).toBe(-14)
    expect(rec.description).toBeTruthy()
  })

  it('handles case sensitivity', () => {
    const rec = getGenreLoudnessRecommendation('POP')
    expect(rec.recommendedLufs).toBe(-14)
  })
})

describe('checkLoudness', () => {
  it('passes when within 1 LU of Spotify target', () => {
    const result = checkLoudness(-14, 'spotify')
    expect(result.pass).toBe(true)
    expect(result.targetLufs).toBe(-14)
    expect(result.yourLufs).toBe(-14)
  })

  it('passes when within 1.5 LU of Apple Music target', () => {
    const result = checkLoudness(-15, 'appleMusic')
    expect(result.pass).toBe(true)
  })

  it('warns when too loud for Spotify', () => {
    const result = checkLoudness(-8, 'spotify')
    expect(result.pass).toBe(false)
    expect(result.message).toContain('turned DOWN')
  })

  it('warns when too quiet for Spotify', () => {
    const result = checkLoudness(-20, 'spotify')
    expect(result.pass).toBe(false)
    expect(result.message).toContain('turned UP')
  })

  it('handles unknown platform gracefully', () => {
    const result = checkLoudness(-14, 'unknown' as Platform)
    expect(result.pass).toBe(true)
    expect(result.message).toContain('Unknown platform')
  })
})
