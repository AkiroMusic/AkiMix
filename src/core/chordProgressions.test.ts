import { describe, it, expect } from 'vitest'
import {
  GENRES,
  GENRE_NAMES,
  getProgressions,
  extendedChord,
  modalInterchange,
  type Progression,
  type ExtendedChordType
} from './chordProgressions'

// =============================================================================
// GENRES
// =============================================================================

describe('GENRES', () => {
  it('contains exactly 11 genre entries', () => {
    expect(GENRES).toHaveLength(11)
  })

  it('each entry has a name and superGenre', () => {
    for (const entry of GENRES) {
      expect(typeof entry.name).toBe('string')
      expect(entry.name.length).toBeGreaterThan(0)
      expect(typeof entry.superGenre).toBe('string')
    }
  })

  it('GENRE_NAMES includes all expected genres', () => {
    expect(GENRE_NAMES).toContain('Pop')
    expect(GENRE_NAMES).toContain('Rock')
    expect(GENRE_NAMES).toContain('EDM')
    expect(GENRE_NAMES).toContain('Hip-Hop')
    expect(GENRE_NAMES).toContain('Jazz')
    expect(GENRE_NAMES).toContain('Classical')
    expect(GENRE_NAMES).toContain('Metal')
    expect(GENRE_NAMES).toContain('R&B')
    expect(GENRE_NAMES).toContain('Country')
    expect(GENRE_NAMES).toContain('Latin')
    expect(GENRE_NAMES).toContain('Blues')
  })

  it('contains no duplicate genre names', () => {
    const names = GENRES.map((g) => g.name)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })
})

// =============================================================================
// getProgressions
// =============================================================================

describe('getProgressions', () => {
  it.each([
    'Pop', 'Rock', 'EDM', 'Hip-Hop', 'Jazz',
    'Classical', 'Metal', 'R&B', 'Country', 'Latin', 'Blues'
  ])('returns at least 6 progressions for genre "%s"', (genre) => {
    const result = getProgressions(genre)
    expect(result.length).toBeGreaterThanOrEqual(6)
  })

  it('returns empty array for unknown genre', () => {
    expect(getProgressions('Unknown')).toEqual([])
    expect(getProgressions('')).toEqual([])
  })

  it('is case-insensitive', () => {
    const lower = getProgressions('pop')
    const upper = getProgressions('POP')
    const mixed = getProgressions('PoP')
    expect(lower).toHaveLength(6)
    expect(lower).toEqual(upper)
    expect(lower).toEqual(mixed)
  })

  it('trims whitespace from genre input', () => {
    const trimmed = getProgressions('  Pop  ')
    const normal = getProgressions('Pop')
    expect(trimmed).toEqual(normal)
  })

  it.each([
    'Pop', 'Rock', 'EDM', 'Hip-Hop', 'Jazz',
    'Classical', 'Metal', 'R&B', 'Country', 'Latin', 'Blues'
  ])('every progression in "%s" has required fields', (genre) => {
    const result = getProgressions(genre)
    for (const progression of result) {
      expect(progression).toHaveProperty('roman')
      expect(progression).toHaveProperty('chords')
      expect(progression).toHaveProperty('description')
      expect(progression).toHaveProperty('energy')
      expect(progression).toHaveProperty('commonKeys')

      expect(typeof progression.roman).toBe('string')
      expect(progression.roman.length).toBeGreaterThan(0)

      expect(Array.isArray(progression.chords)).toBe(true)
      expect(progression.chords.length).toBeGreaterThan(0)

      expect(typeof progression.description).toBe('string')
      expect(progression.description.length).toBeGreaterThan(0)

      expect(typeof progression.energy).toBe('number')
      expect(progression.energy).toBeGreaterThanOrEqual(1)
      expect(progression.energy).toBeLessThanOrEqual(10)

      expect(Array.isArray(progression.commonKeys)).toBe(true)
      expect(progression.commonKeys.length).toBeGreaterThan(0)
    }
  })

  it('commonKeys contains expected keys for Pop', () => {
    const pop = getProgressions('Pop')
    expect(pop[0].commonKeys).toEqual(['C', 'G', 'D', 'A', 'E♭'])
  })

  it('Pop has roman "I–V–vi–IV" as first entry', () => {
    const pop = getProgressions('Pop')
    expect(pop[0].roman).toBe('I–V–vi–IV')
    expect(pop[0].chords).toEqual(['C', 'G', 'Am', 'F'])
    expect(pop[0].description).toBe('Classic anthemic pop progression — the foundation of countless hits')
    expect(pop[0].energy).toBe(7)
  })

  it('Rock has minor anthems', () => {
    const rock = getProgressions('Rock')
    const minorRock = rock.find((p) => p.roman === 'i–VII–VI')
    expect(minorRock).toBeDefined()
    expect(minorRock!.chords).toEqual(['Am', 'G', 'F'])
  })

  it('EDM has 7 progressions', () => {
    expect(getProgressions('EDM')).toHaveLength(7)
  })

  it('Blues includes the 12-bar template with 12 chords', () => {
    const blues = getProgressions('Blues')
    const twelveBar = blues.find((p) => p.description.includes('complete 12-bar'))
    expect(twelveBar).toBeDefined()
    expect(twelveBar!.chords.length).toBe(12)
  })

  it('Country progressions use G key', () => {
    const country = getProgressions('Country')
    expect(country[0].chords).toEqual(['G', 'C', 'D'])
    expect(country[0].roman).toBe('I–IV–V')
    expect(country[0].commonKeys).toContain('G')
  })
})

// =============================================================================
// extendedChord
// =============================================================================

describe('extendedChord', () => {
  it('Cmaj7 returns [C, E, G, B]', () => {
    const result = extendedChord('C', 'maj7')
    expect(result).toEqual(['C', 'E', 'G', 'B'])
  })

  it('Dmin7 returns [D, F, A, C]', () => {
    const result = extendedChord('D', 'min7')
    expect(result).toEqual(['D', 'F', 'A', 'C'])
  })

  it('Gdom7 returns [G, B, D, F]', () => {
    const result = extendedChord('G', 'dom7')
    expect(result).toEqual(['G', 'B', 'D', 'F'])
  })

  it('aug raises the 5th — Caug returns [C, E, G#]', () => {
    const result = extendedChord('C', 'aug')
    expect(result).toEqual(['C', 'E', 'G#'])
  })

  it('dim7 returns four notes a minor 3rd apart', () => {
    const result = extendedChord('C', 'dim7')
    expect(result).toEqual(['C', 'Eb', 'Gb', 'A'])
  })

  it('sus2 replaces 3rd with 2nd — Csus2 returns [C, D, G]', () => {
    const result = extendedChord('C', 'sus2')
    expect(result).toEqual(['C', 'D', 'G'])
  })

  it('sus4 replaces 3rd with 4th — Csus4 returns [C, F, G]', () => {
    const result = extendedChord('C', 'sus4')
    expect(result).toEqual(['C', 'F', 'G'])
  })

  it('maj9 returns 5 notes — Cmaj9 returns [C, E, G, B, D]', () => {
    const result = extendedChord('C', 'maj9')
    expect(result).toEqual(['C', 'E', 'G', 'B', 'D'])
  })

  it('min9 returns 5 notes — Cmin9 returns [C, Eb, G, Bb, D]', () => {
    const result = extendedChord('C', 'min9')
    expect(result).toEqual(['C', 'Eb', 'G', 'Bb', 'D'])
  })

  it('dom9 returns 5 notes — Cdom9 returns [C, E, G, Bb, D]', () => {
    const result = extendedChord('C', 'dom9')
    expect(result).toEqual(['C', 'E', 'G', 'Bb', 'D'])
  })

  it('handles sharp root — F#maj7 returns [F#, A#, C#, F]', () => {
    const result = extendedChord('F#', 'maj7')
    expect(result).toEqual(['F#', 'A#', 'C#', 'F'])
  })

  it('handles flat root — Bbmaj7 returns [Bb, D, F, A]', () => {
    const result = extendedChord('Bb', 'maj7')
    expect(result).toEqual(['Bb', 'D', 'F', 'A'])
  })

  it('returns empty array for invalid root', () => {
    // @ts-expect-error — testing runtime behavior with invalid input
    const result = extendedChord('X', 'maj7')
    expect(result).toEqual([])
  })

  it('all chord types produce correct number of notes', () => {
    const typeNoteCounts: Record<ExtendedChordType, number> = {
      maj7: 4,
      min7: 4,
      dom7: 4,
      dim7: 4,
      aug: 3,
      sus2: 3,
      sus4: 3,
      maj9: 5,
      min9: 5,
      dom9: 5
    }

    for (const [type, count] of Object.entries(typeNoteCounts)) {
      const result = extendedChord('C', type as ExtendedChordType)
      expect(result).toHaveLength(count)
    }
  })
})

// =============================================================================
// modalInterchange
// =============================================================================

describe('modalInterchange', () => {
  it('returns 6 modes for C major', () => {
    const result = modalInterchange('C')
    expect(result).toHaveLength(6)
  })

  it('Dorian has borrowed chords [Dm, G]', () => {
    const result = modalInterchange('C')
    const dorian = result.find((m) => m.mode === 'Dorian')
    expect(dorian).toBeDefined()
    expect(dorian!.borrowedChords).toEqual(['Dm', 'G'])
  })

  it('Aeolian has borrowed chords [F, G, Am]', () => {
    const result = modalInterchange('C')
    const aeolian = result.find((m) => m.mode === 'Aeolian (natural minor)')
    expect(aeolian).toBeDefined()
    expect(aeolian!.borrowedChords).toEqual(['F', 'G', 'Am'])
  })

  it('Lydian has borrowed chords [D, F#dim]', () => {
    const result = modalInterchange('C')
    const lydian = result.find((m) => m.mode === 'Lydian')
    expect(lydian).toBeDefined()
    expect(lydian!.borrowedChords).toEqual(['D', 'F#dim'])
  })

  it('Phrygian has dark Spanish description', () => {
    const result = modalInterchange('C')
    const phrygian = result.find((m) => m.mode === 'Phrygian')
    expect(phrygian).toBeDefined()
    expect(phrygian!.description).toBe('Dark, Spanish-flavored minor')
    expect(phrygian!.borrowedChords).toEqual(['Fm', 'Bb'])
  })

  it('Mixolydian has bluesy description', () => {
    const result = modalInterchange('C')
    const mixo = result.find((m) => m.mode === 'Mixolydian')
    expect(mixo).toBeDefined()
    expect(mixo!.description).toContain('Bluesy')
    expect(mixo!.borrowedChords).toEqual(['Bb', 'F'])
  })

  it('Locrian has empty borrowed chords', () => {
    const result = modalInterchange('C')
    const locrian = result.find((m) => m.mode === 'Locrian')
    expect(locrian).toBeDefined()
    expect(locrian!.borrowedChords).toEqual([])
    expect(locrian!.description).toBe('Rarely used for borrowing')
  })

  it('every mode has mode, borrowedChords, and description fields', () => {
    const result = modalInterchange('C')
    for (const mode of result) {
      expect(mode).toHaveProperty('mode')
      expect(mode).toHaveProperty('borrowedChords')
      expect(mode).toHaveProperty('description')
      expect(typeof mode.mode).toBe('string')
      expect(Array.isArray(mode.borrowedChords)).toBe(true)
      expect(typeof mode.description).toBe('string')
    }
  })

  it('returns empty array for invalid key', () => {
    const result = modalInterchange('X')
    expect(result).toEqual([])
  })

  // --- Transposition tests ---

  it('transposes Dorian chords for key G (7 semitones up)', () => {
    const result = modalInterchange('G')
    const dorian = result.find((m) => m.mode === 'Dorian')
    expect(dorian).toBeDefined()
    // C Dorian: Dm → Am (up 7), G → D (up 7)
    expect(dorian!.borrowedChords).toEqual(['Am', 'D'])
  })

  it('transposes Aeolian for key G', () => {
    const result = modalInterchange('G')
    const aeolian = result.find((m) => m.mode === 'Aeolian (natural minor)')
    expect(aeolian).toBeDefined()
    // C Aeolian: F→C, G→D, Am→Em
    expect(aeolian!.borrowedChords).toEqual(['C', 'D', 'Em'])
  })

  it('transposes Lydian for key F (5 semitones up from C)', () => {
    const result = modalInterchange('F')
    const lydian = result.find((m) => m.mode === 'Lydian')
    expect(lydian).toBeDefined()
    // C Lydian: D→G, F#dim→Bdim
    expect(lydian!.borrowedChords).toEqual(['G', 'Bdim'])
  })

  it('preserves descriptions after transposition', () => {
    const cResult = modalInterchange('C')
    const gResult = modalInterchange('G')
    expect(gResult).toHaveLength(cResult.length)
    for (let i = 0; i < cResult.length; i++) {
      expect(gResult[i].mode).toBe(cResult[i].mode)
      expect(gResult[i].description).toBe(cResult[i].description)
    }
  })

  it('handles flat keys for transposition', () => {
    const result = modalInterchange('Bb')
    const dorian = result.find((m) => m.mode === 'Dorian')
    expect(dorian).toBeDefined()
    // C=0, Bb=10, so semitones = 10
    // Dm(2)→12=0→C, G(7)→17=5→F
    // But Bb prefers flat notation, so Dm transposed by 10 should use flat
    // D=2, 2+10=12 → C (natural, no accidental needed)
    // G=7, 7+10=17 → 17%12=5 → F
    expect(dorian!.borrowedChords).toEqual(['Cm', 'F'])
  })
})
