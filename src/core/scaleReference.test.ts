import { describe, it, expect } from 'vitest'
import {
  ALL_KEYS,
  MODES,
  MODE_INTERVALS,
  MODE_CHORD_QUALITIES,
  getScale,
  getChordQualities
} from './scaleReference'

describe('ALL_KEYS', () => {
  it('contains exactly 12 chromatic notes from C to B', () => {
    expect(ALL_KEYS).toEqual(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])
  })

  it('has a length of 12 (one chromatic octave)', () => {
    expect(ALL_KEYS).toHaveLength(12)
  })

  it('starts with C (tonic of the natural scale)', () => {
    expect(ALL_KEYS[0]).toBe('C')
  })

  it('ends with B (leading tone of C major)', () => {
    expect(ALL_KEYS[11]).toBe('B')
  })
})

describe('MODES', () => {
  it('contains all 7 diatonic modes', () => {
    expect(MODES).toEqual([
      'Ionian',
      'Dorian',
      'Phrygian',
      'Lydian',
      'Mixolydian',
      'Aeolian',
      'Locrian'
    ])
  })

  it('has a length of 7', () => {
    expect(MODES).toHaveLength(7)
  })

  it('includes Ionian (major scale)', () => {
    expect(MODES).toContain('Ionian')
  })

  it('includes Aeolian (natural minor)', () => {
    expect(MODES).toContain('Aeolian')
  })
})

describe('MODE_INTERVALS', () => {
  it('Ionian has the major scale pattern [2,2,1,2,2,2,1]', () => {
    expect(MODE_INTERVALS['Ionian']).toEqual([2, 2, 1, 2, 2, 2, 1])
  })

  it('Dorian has pattern [2,1,2,2,2,1,2]', () => {
    expect(MODE_INTERVALS['Dorian']).toEqual([2, 1, 2, 2, 2, 1, 2])
  })

  it('Phrygian has pattern [1,2,2,2,1,2,2]', () => {
    expect(MODE_INTERVALS['Phrygian']).toEqual([1, 2, 2, 2, 1, 2, 2])
  })

  it('Lydian has pattern [2,2,2,1,2,2,1]', () => {
    expect(MODE_INTERVALS['Lydian']).toEqual([2, 2, 2, 1, 2, 2, 1])
  })

  it('Mixolydian has pattern [2,2,1,2,2,1,2]', () => {
    expect(MODE_INTERVALS['Mixolydian']).toEqual([2, 2, 1, 2, 2, 1, 2])
  })

  it('Aeolian has the natural minor pattern [2,1,2,2,1,2,2]', () => {
    expect(MODE_INTERVALS['Aeolian']).toEqual([2, 1, 2, 2, 1, 2, 2])
  })

  it('Locrian has pattern [1,2,2,1,2,2,2]', () => {
    expect(MODE_INTERVALS['Locrian']).toEqual([1, 2, 2, 1, 2, 2, 2])
  })

  it('each mode\'s intervals sum to 12 (one octave)', () => {
    for (const mode of MODES) {
      const sum = MODE_INTERVALS[mode].reduce((a, b) => a + b, 0)
      expect(sum).toBe(12)
    }
  })

  it('each mode has exactly 7 intervals', () => {
    for (const mode of MODES) {
      expect(MODE_INTERVALS[mode]).toHaveLength(7)
    }
  })
})

describe('MODE_CHORD_QUALITIES', () => {
  it('Ionian: Major, Minor, Minor, Major, Major, Minor, Diminished', () => {
    expect(MODE_CHORD_QUALITIES['Ionian']).toEqual([
      'Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor', 'Diminished'
    ])
  })

  it('Dorian: Minor, Minor, Major, Major, Minor, Diminished, Major', () => {
    expect(MODE_CHORD_QUALITIES['Dorian']).toEqual([
      'Minor', 'Minor', 'Major', 'Major', 'Minor', 'Diminished', 'Major'
    ])
  })

  it('Phrygian: Minor, Major, Major, Minor, Diminished, Major, Minor', () => {
    expect(MODE_CHORD_QUALITIES['Phrygian']).toEqual([
      'Minor', 'Major', 'Major', 'Minor', 'Diminished', 'Major', 'Minor'
    ])
  })

  it('Lydian: Major, Major, Minor, Diminished, Major, Minor, Minor', () => {
    expect(MODE_CHORD_QUALITIES['Lydian']).toEqual([
      'Major', 'Major', 'Minor', 'Diminished', 'Major', 'Minor', 'Minor'
    ])
  })

  it('Mixolydian: Major, Minor, Diminished, Major, Minor, Minor, Major', () => {
    expect(MODE_CHORD_QUALITIES['Mixolydian']).toEqual([
      'Major', 'Minor', 'Diminished', 'Major', 'Minor', 'Minor', 'Major'
    ])
  })

  it('Aeolian: Minor, Diminished, Major, Minor, Minor, Major, Major', () => {
    expect(MODE_CHORD_QUALITIES['Aeolian']).toEqual([
      'Minor', 'Diminished', 'Major', 'Minor', 'Minor', 'Major', 'Major'
    ])
  })

  it('Locrian: Diminished, Major, Minor, Minor, Major, Major, Minor', () => {
    expect(MODE_CHORD_QUALITIES['Locrian']).toEqual([
      'Diminished', 'Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor'
    ])
  })

  it('each mode has exactly 7 chord qualities', () => {
    for (const mode of MODES) {
      expect(MODE_CHORD_QUALITIES[mode]).toHaveLength(7)
    }
  })
})

describe('getScale', () => {
  describe('C Ionian (C major scale)', () => {
    const scale = getScale('C', 'Ionian')

    it('returns 7 notes (one per degree)', () => {
      expect(scale).toHaveLength(7)
    })

    it('has the correct note sequence: C, D, E, F, G, A, B', () => {
      const noteNames = scale.map((n) => n.note)
      expect(noteNames).toEqual(['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'])
    })

    it('has correct semitone distances from root', () => {
      const semitones = scale.map((n) => n.semitoneFromRoot)
      expect(semitones).toEqual([0, 2, 4, 5, 7, 9, 11])
    })

    it('has correct interval names for the major scale', () => {
      const intervals = scale.map((n) => n.interval)
      expect(intervals).toEqual([
        'Unison',
        'Major 2nd',
        'Major 3rd',
        'Perfect 4th',
        'Perfect 5th',
        'Major 6th',
        'Major 7th'
      ])
    })

    it('has correct frequencies derived from A4 = 440Hz tuning standard', () => {
      const freqs = scale.map((n) => n.frequency)
      expect(freqs).toEqual([130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94])
    })

    it('has 1-based degree numbering', () => {
      const degrees = scale.map((n) => n.degree)
      expect(degrees).toEqual([1, 2, 3, 4, 5, 6, 7])
    })
  })

  describe('A Aeolian (A natural minor — relative to C Ionian)', () => {
    const scale = getScale('A', 'Aeolian')

    it('returns 7 notes', () => {
      expect(scale).toHaveLength(7)
    })

    it('has the same pitch class set as C Ionian: A, B, C, D, E, F, G', () => {
      const noteNames = scale.map((n) => n.note)
      // A Aeolian = C Ionian starting from A: A B C D E F G
      expect(noteNames).toEqual(['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'])
    })

    it('starts on A (tonic) at 220Hz (A3)', () => {
      expect(scale[0]).toMatchObject({
        note: 'A3',
        degree: 1,
        semitoneFromRoot: 0,
        frequency: 220.00,
        interval: 'Unison'
      })
    })

    it('has correct Aeolian intervals: P1, M2, m3, P4, P5, m6, m7', () => {
      const intervals = scale.map((n) => n.interval)
      expect(intervals).toEqual([
        'Unison',
        'Major 2nd',
        'Minor 3rd',
        'Perfect 4th',
        'Perfect 5th',
        'Minor 6th',
        'Minor 7th'
      ])
    })

    it('has semitones matching natural minor pattern', () => {
      const semitones = scale.map((n) => n.semitoneFromRoot)
      // A→B=2, B→C=1, C→D=2, D→E=2, E→F=1, F→G=2
      expect(semitones).toEqual([0, 2, 3, 5, 7, 8, 10])
    })
  })

  describe('D Dorian', () => {
    const scale = getScale('D', 'Dorian')

    it('has the correct note sequence: D, E, F, G, A, B, C', () => {
      const noteNames = scale.map((n) => n.note)
      expect(noteNames).toEqual(['D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'])
    })

    it('has Dorian intervals: P1, M2, m3, P4, P5, M6, m7', () => {
      const intervals = scale.map((n) => n.interval)
      expect(intervals).toEqual([
        'Unison',
        'Major 2nd',
        'Minor 3rd',
        'Perfect 4th',
        'Perfect 5th',
        'Major 6th',
        'Minor 7th'
      ])
    })
  })

  describe('G Mixolydian', () => {
    const scale = getScale('G', 'Mixolydian')

    it('has the correct note sequence: G, A, B, C, D, E, F', () => {
      const noteNames = scale.map((n) => n.note)
      expect(noteNames).toEqual(['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4'])
    })

    it('has a b7 (Minor 7th) as the characteristic Mixolydian note', () => {
      const last = scale[6]
      expect(last.interval).toBe('Minor 7th')
      expect(last.semitoneFromRoot).toBe(10)
    })
  })

  describe('E Phrygian', () => {
    const scale = getScale('E', 'Phrygian')

    it('has a b2 (Minor 2nd) as the characteristic Phrygian interval', () => {
      expect(scale[1].interval).toBe('Minor 2nd')
      expect(scale[1].semitoneFromRoot).toBe(1)
    })
  })

  describe('F Lydian', () => {
    const scale = getScale('F', 'Lydian')

    it('has a #4 (Tritone) as the characteristic Lydian interval', () => {
      expect(scale[3].interval).toBe('Tritone')
      expect(scale[3].semitoneFromRoot).toBe(6)
    })
  })

  describe('B Locrian', () => {
    const scale = getScale('B', 'Locrian')

    it('has b2 (Minor 2nd) on degree 2', () => {
      expect(scale[1].interval).toBe('Minor 2nd')
    })

    it('has b5 (Tritone) on degree 5', () => {
      expect(scale[4].interval).toBe('Tritone')
    })
  })

  describe('edge cases — sharp keys', () => {
    it('F# Ionian: F#, G#, A#, B, C#, D#, F (E# enharmonic)', () => {
      const scale = getScale('F#', 'Ionian')
      const noteNames = scale.map((n) => n.note)
      // E# is enharmonic to F natural — our naming uses the chromatic ALL_KEYS
      expect(noteNames).toEqual(['F#3', 'G#3', 'A#3', 'B3', 'C#4', 'D#4', 'F4'])
    })
  })

  describe('error handling', () => {
    it('returns empty array for an invalid key', () => {
      expect(getScale('X', 'Ionian')).toEqual([])
    })

    it('returns empty array for an invalid mode', () => {
      expect(getScale('C', 'Unknown')).toEqual([])
    })

    it('returns empty array when both key and mode are invalid', () => {
      expect(getScale('X', 'Unknown')).toEqual([])
    })

    it('returns empty array for lowercase mode (case-sensitive)', () => {
      expect(getScale('C', 'ionian')).toEqual([])
    })
  })
})

describe('getChordQualities', () => {
  it('Ionian = Major, Minor, Minor, Major, Major, Minor, Diminished', () => {
    expect(getChordQualities('Ionian')).toEqual([
      'Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor', 'Diminished'
    ])
  })

  it('Aeolian = Minor, Diminished, Major, Minor, Minor, Major, Major', () => {
    expect(getChordQualities('Aeolian')).toEqual([
      'Minor', 'Diminished', 'Major', 'Minor', 'Minor', 'Major', 'Major'
    ])
  })

  it('returns a copy, not the original array (immutable)', () => {
    const result = getChordQualities('Ionian')
    expect(result).not.toBe(MODE_CHORD_QUALITIES['Ionian'])
  })

  it('returns empty array for an unknown mode', () => {
    expect(getChordQualities('Unknown')).toEqual([])
  })

  it('returns empty array for lowercase (case-sensitive)', () => {
    expect(getChordQualities('ionian')).toEqual([])
  })
})

describe('frequency derivation (A4 = 440Hz tuning standard)', () => {
  it('A3 frequency is exactly 220Hz (one octave below A4)', () => {
    const scale = getScale('C', 'Ionian')
    // In C Ionian, A is degree 6, at semitone 9 from root
    const aNote = scale.find((n) => n.note === 'A3')
    expect(aNote?.frequency).toBe(220.00)
  })

  it('A4=440Hz is the reference that all frequencies derive from', () => {
    // A3 = 220Hz (half of 440, one octave below A4)
    // Each octave halves/doubles the frequency
    const scale = getScale('A', 'Aeolian')
    // A Aeolian tonic is A3 = MIDI 57 = 220Hz
    expect(scale[0].frequency).toBe(220.00)
  })
})
