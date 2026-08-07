import { describe, it, expect, beforeEach } from 'vitest'
import {
  GENRES,
  GENRE_NAMES,
  getStructure,
  getEnergyMap,
  type SongSection,
  type SongStructure,
  type EnergyMapEntry
} from './songStructure'

describe('GENRES', () => {
  it('includes all 22 genres', () => {
    expect(GENRES).toHaveLength(22)
  })

  it('each entry has a non-empty name and a valid superGenre', () => {
    for (const entry of GENRES) {
      expect(typeof entry.name).toBe('string')
      expect(entry.name.length).toBeGreaterThan(0)
      expect(typeof entry.superGenre).toBe('string')
      expect(entry.superGenre.length).toBeGreaterThan(0)
    }
  })

  it('GENRE_NAMES contains the first 16 EDM genres in order', () => {
    // First 16 in GENRES are electronic + classicalAmbient (Ambient)
    expect(GENRE_NAMES.slice(0, 16)).toEqual([
      'House',
      'Techno',
      'Trance',
      'Dubstep',
      'Drum & Bass',
      'UK Garage',
      'Trap',
      'Future Bass',
      'Progressive House',
      'Deep House',
      'Hardstyle',
      'Psytrance',
      'Breaks',
      'Electro House',
      'Minimal',
      'Ambient'
    ])
  })

  it('GENRE_NAMES contains the remaining genres', () => {
    // Indexes 16+ are: Pop, Rock, Singer-Songwriter, Folk, Jazz, Classical
    expect(GENRE_NAMES.slice(16)).toEqual([
      'Pop',
      'Rock',
      'Singer-Songwriter',
      'Folk',
      'Jazz',
      'Classical'
    ])
  })
})

describe('getStructure', () => {
  describe('for unknown genres', () => {
    it('returns empty structure for empty string', () => {
      const result = getStructure('')
      expect(result.sections).toHaveLength(0)
      expect(result.totalBars).toBe(0)
      expect(result.bpmRange).toBe('')
      expect(result.typicalTotalMinutes).toBe('')
    })

    it('returns empty structure for non-existent genre', () => {
      const result = getStructure('NonExistentGenre')
      expect(result.sections).toHaveLength(0)
      expect(result.totalBars).toBe(0)
      expect(result.bpmRange).toBe('')
      expect(result.typicalTotalMinutes).toBe('')
    })
  })

  // Verify every single genre returns a valid structure
  // 验证每个曲风都返回有效结构
  describe.each(GENRE_NAMES)('%s', (genre: string) => {
    let structure: SongStructure

    beforeEach(() => {
      structure = getStructure(genre)
    })

    it('returns at least 4 sections', () => {
      expect(structure.sections.length).toBeGreaterThanOrEqual(4)
    })

    it('returns each section with all required fields', () => {
      for (const section of structure.sections) {
        expect(section).toHaveProperty('name')
        expect(section).toHaveProperty('bars')
        expect(section).toHaveProperty('energy')
        expect(section).toHaveProperty('description')
        expect(section).toHaveProperty('elements')
      }
    })

    it('each section has a non-empty name', () => {
      for (const section of structure.sections) {
        expect(typeof section.name).toBe('string')
        expect(section.name.length).toBeGreaterThan(0)
      }
    })

    it('each section has bars within 0-64 range (0 = variable)', () => {
      for (const section of structure.sections) {
        expect(section.bars).toBeGreaterThanOrEqual(0)
        expect(section.bars).toBeLessThanOrEqual(64)
      }
    })

    it('each section has energy within 1-10 range', () => {
      for (const section of structure.sections) {
        expect(section.energy).toBeGreaterThanOrEqual(1)
        expect(section.energy).toBeLessThanOrEqual(10)
      }
    })

    it('each section has a non-empty description', () => {
      for (const section of structure.sections) {
        expect(typeof section.description).toBe('string')
        expect(section.description.length).toBeGreaterThan(0)
      }
    })

    it('each section has at least one element', () => {
      for (const section of structure.sections) {
        expect(Array.isArray(section.elements)).toBe(true)
        expect(section.elements.length).toBeGreaterThanOrEqual(1)
      }
    })

    it('totalBars equals the sum of all section bars', () => {
      const expectedTotal = structure.sections.reduce(
        (sum: number, s: SongSection) => sum + s.bars,
        0
      )
      expect(structure.totalBars).toBe(expectedTotal)
    })

    it('returns non-empty bpmRange', () => {
      expect(typeof structure.bpmRange).toBe('string')
      expect(structure.bpmRange.length).toBeGreaterThan(0)
    })

    it('returns non-empty typicalTotalMinutes', () => {
      expect(typeof structure.typicalTotalMinutes).toBe('string')
      expect(structure.typicalTotalMinutes.length).toBeGreaterThan(0)
    })
  })

  describe('Classical (variable bars)', () => {
    it('has 4 sections all with bars=0', () => {
      const structure = getStructure('Classical')
      expect(structure.sections).toHaveLength(4)
      for (const section of structure.sections) {
        expect(section.bars).toBe(0)
      }
      expect(structure.totalBars).toBe(0)
    })

    it('sections are Exposition, Development, Recapitulation, Coda', () => {
      const structure = getStructure('Classical')
      const names = structure.sections.map((s) => s.name)
      expect(names).toEqual([
        'Exposition',
        'Development',
        'Recapitulation',
        'Coda'
      ])
    })
  })
})

describe('getEnergyMap', () => {
  it('returns empty array for unknown genre', () => {
    expect(getEnergyMap('Unknown')).toEqual([])
  })

  describe.each(GENRE_NAMES)('%s', (genre: string) => {
    let energyMap: EnergyMapEntry[]
    let structure: SongStructure

    beforeEach(() => {
      energyMap = getEnergyMap(genre)
      structure = getStructure(genre)
    })

    it('has same number of entries as sections', () => {
      expect(energyMap).toHaveLength(structure.sections.length)
    })

    it('sections appear in the same order as getStructure', () => {
      const sectionNames = structure.sections.map((s) => s.name)
      const mapSectionNames = energyMap.map((e) => e.section)
      expect(mapSectionNames).toEqual(sectionNames)
    })

    it('each entry has section, barRange, and energy fields', () => {
      for (const entry of energyMap) {
        expect(entry).toHaveProperty('section')
        expect(entry).toHaveProperty('barRange')
        expect(entry).toHaveProperty('energy')
      }
    })

    it('each barRange is either "1-N" format or "Varies"', () => {
      for (const entry of energyMap) {
        if (entry.barRange === 'Varies') {
          // Classical sections use "Varies" — valid
          expect(entry.energy).toBeGreaterThanOrEqual(1)
          expect(entry.energy).toBeLessThanOrEqual(10)
        } else {
          // Normal barRange format: "Start-End"
          expect(entry.barRange).toMatch(/^\d+-\d+$/)
          const [start, end] = entry.barRange.split('-').map(Number)
          expect(start).toBeGreaterThanOrEqual(1)
          expect(end).toBeGreaterThanOrEqual(start)
        }
      }
    })

    it('energy values match the section data', () => {
      for (let i = 0; i < energyMap.length; i++) {
        expect(energyMap[i].energy).toBe(structure.sections[i].energy)
      }
    })

    it('bar ranges form a continuous sequence covering 1 to totalBars', () => {
      // Skip classical (variable bar lengths)
      // 跳过古典乐（可变小节长度）
      if (genre === 'Classical') {
        return
      }

      // First section always starts at 1
      expect(energyMap[0].barRange).toMatch(/^1-\d+$/)

      // Each subsequent section starts where the previous ended + 1
      for (let i = 1; i < energyMap.length; i++) {
        const prevEnd = parseInt(energyMap[i - 1].barRange.split('-')[1], 10)
        const currStart = parseInt(energyMap[i].barRange.split('-')[0], 10)
        expect(currStart).toBe(prevEnd + 1)
      }

      // Last bar range ends at totalBars
      const lastEnd = parseInt(
        energyMap[energyMap.length - 1].barRange.split('-')[1],
        10
      )
      expect(lastEnd).toBe(structure.totalBars)
    })
  })
})
