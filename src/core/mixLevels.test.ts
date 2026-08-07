/**
 * Unit tests for the Mix Element Levels module.
 *
 * Tests cover:
 *   - Getting all mix levels for a genre
 *   - Getting a specific element's level
 *   - Genre-specific adjustments
 *   - Group filtering
 *   - Data integrity checks
 */

import { describe, it, expect } from 'vitest'
import {
  getMixLevels,
  getElementLevel,
  getGroupLevels,
  MIX_GROUPS,
  type MixElement,
  type MixGroup
} from './mixLevels'

describe('getMixLevels', () => {
  it('returns all elements for pop', () => {
    const levels = getMixLevels('pop')
    expect(levels.genre).toBe('pop')
    expect(levels.label).toBe('Pop (General)')
    expect(levels.all.length).toBeGreaterThan(0)
    expect(levels.groups.length).toBeGreaterThan(0)
  })

  it('each element has required fields', () => {
    const levels = getMixLevels()
    for (const entry of levels.all) {
      expect(entry.element).toBeTruthy()
      expect(entry.label).toBeTruthy()
      expect(entry.group).toBeTruthy()
      expect(typeof entry.minDb).toBe('number')
      expect(typeof entry.maxDb).toBe('number')
      expect(entry.maxDb).toBeGreaterThanOrEqual(entry.minDb)
      expect(entry.description).toBeTruthy()
      expect(['critical', 'important', 'supplementary']).toContain(entry.priority)
    }
  })

  it('kick is always prioritized critical', () => {
    const levels = getMixLevels()
    const kick = levels.all.find((e) => e.element === 'kick')
    expect(kick).toBeDefined()
    expect(kick!.priority).toBe('critical')
  })
})

describe('genre-specific adjustments', () => {
  it('hip-hop has louder kick and bass than pop', () => {
    const popLevels = getMixLevels('pop')
    const hiphopLevels = getMixLevels('hiphop')

    const popKick = popLevels.all.find((e) => e.element === 'kick')!
    const hiphopKick = hiphopLevels.all.find((e) => e.element === 'kick')!
    expect(hiphopKick.maxDb).toBeGreaterThan(popKick.maxDb)

    const popBass = popLevels.all.find((e) => e.element === 'bass')!
    const hiphopBass = hiphopLevels.all.find((e) => e.element === 'bass')!
    expect(hiphopBass.maxDb).toBeGreaterThan(popBass.maxDb)
  })

  it('classical has quieter levels overall than pop', () => {
    const popLevels = getMixLevels('pop')
    const classicalLevels = getMixLevels('classical')

    // Most classical elements should not be louder than pop
    const popSnare = popLevels.all.find((e) => e.element === 'snare')!
    const classicalSnare = classicalLevels.all.find((e) => e.element === 'snare')!
    expect(classicalSnare.maxDb).toBeLessThanOrEqual(popSnare.maxDb)
  })

  it('electronic has louder kick than general', () => {
    const popKick = getMixLevels('pop').all.find((e) => e.element === 'kick')!
    const electronicKick = getMixLevels('electronic').all.find((e) => e.element === 'kick')!
    expect(electronicKick.maxDb).toBeGreaterThanOrEqual(popKick.maxDb)
  })

  it('falls back to pop for unknown genre', () => {
    const levels = getMixLevels('nonexistent')
    const popLevels = getMixLevels('pop')
    expect(levels.all.length).toBe(popLevels.all.length)
  })
})

describe('getElementLevel', () => {
  it('returns correct element for vocals', () => {
    const vocals = getElementLevel('vocalsLead')
    expect(vocals).not.toBeNull()
    expect(vocals!.element).toBe('vocalsLead')
    expect(vocals!.minDb).toBeLessThan(vocals!.maxDb)
  })

  it('returns element for specific genre', () => {
    const snareRock = getElementLevel('snare', 'rock')
    expect(snareRock).not.toBeNull()
    // Rock snare should be louder than general
    const snarePop = getElementLevel('snare', 'pop')
    expect(snareRock!.maxDb).toBeGreaterThan(snarePop!.maxDb)
  })

  it('returns null for unknown element', () => {
    const el = getElementLevel('unknown' as MixElement)
    expect(el).toBeNull()
  })
})

describe('getGroupLevels', () => {
  it('returns drums group with kick, snare, hihat', () => {
    const drums = getGroupLevels('drums')
    expect(drums.length).toBeGreaterThan(0)
    const elements = drums.map((d) => d.element)
    expect(elements).toContain('kick')
    expect(elements).toContain('snare')
    expect(elements).toContain('hihat')
  })

  it('returns master group', () => {
    const master = getGroupLevels('master')
    expect(master.length).toBeGreaterThan(0)
    expect(master[0].element).toBe('master')
  })

  it('all groups have at least one element', () => {
    for (const group of MIX_GROUPS) {
      const elements = getGroupLevels(group.value as MixGroup)
      expect(elements.length, `Group ${group.label} should have elements`).toBeGreaterThan(0)
    }
  })
})

describe('data integrity', () => {
  it('all mix elements have unique IDs', () => {
    const levels = getMixLevels()
    const ids = levels.all.map((e) => e.element)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('master bus has correct specs', () => {
    const master = getElementLevel('master')
    expect(master).not.toBeNull()
    expect(master!.maxDb).toBeLessThanOrEqual(-1) // Never above -1dB
    expect(master!.minDb).toBeLessThan(master!.maxDb)
  })
})
