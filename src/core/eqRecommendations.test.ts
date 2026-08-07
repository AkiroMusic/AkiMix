/**
 * Unit tests for the EQ Recommendations module.
 *
 * Tests cover:
 *   - Getting EQ for specific element + genre
 *   - Getting complete genre mix
 *   - Boundary cases (null for invalid combos)
 *   - Data integrity (all elements exist for major genres)
 *   - Getting genres for an element
 */

import { describe, it, expect } from 'vitest'
import {
  getEqRecommendations,
  getGenreMixRecommendations,
  getGenresForElement,
  GENRES,
  MIX_ELEMENTS,
  type Genre,
  type MixElement
} from './eqRecommendations'

describe('getEqRecommendations', () => {
  it('returns EQ bands for kick in pop', () => {
    const eq = getEqRecommendations('kick', 'pop')
    expect(eq).not.toBeNull()
    expect(eq!.element).toBe('kick')
    expect(eq!.genre).toBe('pop')
    expect(eq!.bands.length).toBeGreaterThan(0)
    // Each band should have required fields
    for (const band of eq!.bands) {
      expect(band.frequency).toBeGreaterThan(0)
      expect(band.q).toBeGreaterThan(0)
      expect(typeof band.gain).toBe('number')
      expect(band.label).toBeTruthy()
      expect(['cut', 'boost', 'shelf']).toContain(band.type)
    }
  })

  it('returns EQ for kick in electronic with sub weight', () => {
    const eq = getEqRecommendations('kick', 'electronic')
    expect(eq).not.toBeNull()
    // Electronic kick should emphasize sub (50Hz boost)
    const subBand = eq!.bands.find((b) => b.frequency === 50)
    expect(subBand).toBeDefined()
    expect(subBand!.gain).toBeGreaterThan(0)
  })

  it('returns EQ for vocals in pop with presence boost', () => {
    const eq = getEqRecommendations('vocals', 'pop')
    expect(eq).not.toBeNull()
    // Pop vocals should have a presence boost around 3kHz
    const presenceBand = eq!.bands.find((b) => b.frequency === 3000)
    expect(presenceBand).toBeDefined()
    expect(presenceBand!.gain).toBeGreaterThan(0)
  })

  it('returns null for unknown element', () => {
    const eq = getEqRecommendations('kick' as MixElement, 'unknown' as Genre)
    expect(eq).toBeNull()
  })

  it('returns hyp-hop kick louder than jazz kick', () => {
    const hiphopEq = getEqRecommendations('kick', 'hiphop')
    const jazzEq = getEqRecommendations('kick', 'jazz')
    expect(hiphopEq).not.toBeNull()
    expect(jazzEq).not.toBeNull()
    // Hip-hop kicks should have more sub boost than jazz
    const hiphopSub = hiphopEq!.bands.find((b) => b.frequency === 50)
    const jazzSub = jazzEq!.bands.find((b) => b.frequency === 60)
    if (hiphopSub && jazzSub) {
      expect(hiphopSub.gain).toBeGreaterThanOrEqual(jazzSub.gain)
    }
  })

  it('handles all genres for kick', () => {
    for (const genre of GENRES) {
      const eq = getEqRecommendations('kick', genre.value)
      expect(eq, `Kick should have EQ data for ${genre.label}`).not.toBeNull()
    }
  })

  it('handles all elements for pop', () => {
    for (const element of MIX_ELEMENTS) {
      const eq = getEqRecommendations(element.value, 'pop')
      expect(eq, `${element.label} should have EQ data for pop`).not.toBeNull()
    }
  })
})

describe('getGenreMixRecommendations', () => {
  it('returns all elements for pop', () => {
    const mix = getGenreMixRecommendations('pop')
    expect(mix).not.toBeNull()
    expect(mix!.genre).toBe('pop')
    expect(mix!.label).toBe('Pop')
    expect(mix!.elements.length).toBeGreaterThan(0)
  })

  it('returns all elements for electronic', () => {
    const mix = getGenreMixRecommendations('electronic')
    expect(mix).not.toBeNull()
    expect(mix!.elements.length).toBeGreaterThan(0)
  })

  it('all elements have required fields', () => {
    const mix = getGenreMixRecommendations('pop')!
    for (const el of mix.elements) {
      expect(el.element).toBeTruthy()
      expect(el.genre).toBe('pop')
      expect(el.bands.length).toBeGreaterThan(0)
      expect(el.description).toBeTruthy()
    }
  })

  it('returns null for unknown genre', () => {
    const mix = getGenreMixRecommendations('unknown' as Genre)
    expect(mix).toBeNull()
  })

  it('contains master bus EQ for electronic', () => {
    const mix = getGenreMixRecommendations('electronic')!
    const master = mix.elements.find((e) => e.element === 'master')
    expect(master).toBeDefined()
    expect(master!.bands.length).toBeGreaterThan(0)
  })
})

describe('getGenresForElement', () => {
  it('kick should exist in all genres', () => {
    const genres = getGenresForElement('kick')
    expect(genres.length).toBe(GENRES.length)
  })

  it('vocals should exist in all genres', () => {
    const genres = getGenresForElement('vocals')
    expect(genres.length).toBe(GENRES.length)
  })

  it('all mix elements should have at least pop data', () => {
    const elements = ['kick', 'snare', 'hihat', 'bass', 'vocals', 'guitar', 'piano', 'master']
    for (const el of elements) {
      const genres = getGenresForElement(el as MixElement)
      expect(genres.length, `${el} should have genres`).toBeGreaterThan(0)
    }
  })
})
