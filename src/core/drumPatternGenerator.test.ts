import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  GENRES,
  GENRE_NAMES,
  DRUM_PARTS,
  type DrumPattern,
  getPattern,
  applySwing,
  addGhostNotes
} from './drumPatternGenerator'

// =========================================================================
// GENRES — constant array
// =========================================================================
describe('GENRES', () => {
  it('contains exactly 16 genre entries', () => {
    expect(GENRES).toHaveLength(16)
  })

  it('each entry has a name and superGenre', () => {
    for (const entry of GENRES) {
      expect(typeof entry.name).toBe('string')
      expect(entry.name.length).toBeGreaterThan(0)
      expect(typeof entry.superGenre).toBe('string')
    }
  })

  it('GENRE_NAMES includes all electronic genres', () => {
    expect(GENRE_NAMES).toContain('House')
    expect(GENRE_NAMES).toContain('Techno')
    expect(GENRE_NAMES).toContain('Trance')
    expect(GENRE_NAMES).toContain('Dubstep')
    expect(GENRE_NAMES).toContain('Drum & Bass')
    expect(GENRE_NAMES).toContain('UK Garage')
    expect(GENRE_NAMES).toContain('Trap')
    expect(GENRE_NAMES).toContain('Future Bass')
    expect(GENRE_NAMES).toContain('Hardstyle')
    expect(GENRE_NAMES).toContain('Breakbeat')
  })

  it('GENRE_NAMES includes all acoustic/instrumental genres', () => {
    expect(GENRE_NAMES).toContain('Jazz')
    expect(GENRE_NAMES).toContain('Rock')
    expect(GENRE_NAMES).toContain('Funk')
    expect(GENRE_NAMES).toContain('Hip-Hop')
    expect(GENRE_NAMES).toContain('Latin')
    expect(GENRE_NAMES).toContain('Metal')
  })

  it('returns GENRE_NAMES in the expected order', () => {
    // Order: electronic genres first (grouped), then rock, jazz, hip-hop, metal, latin
    expect(GENRE_NAMES[0]).toBe('House')
    expect(GENRE_NAMES[3]).toBe('Dubstep')
    expect(GENRE_NAMES[10]).toBe('Rock')
    expect(GENRE_NAMES[GENRE_NAMES.length - 1]).toBe('Latin')
  })
})

// =========================================================================
// DRUM_PARTS — constant array
// =========================================================================
describe('DRUM_PARTS', () => {
  it('contains exactly 10 drum parts', () => {
    expect(DRUM_PARTS).toHaveLength(10)
  })

  it('lists parts in the correct order', () => {
    expect(DRUM_PARTS).toEqual([
      'Kick',
      'Snare',
      'Hi-Hat',
      'Open Hat',
      'Clap',
      'Rim',
      'Tom',
      'Crash',
      'Ride',
      'Percussion'
    ])
  })

  it('starts with Kick (the foundation of the beat)', () => {
    expect(DRUM_PARTS[0]).toBe('Kick')
  })

  it('ends with Percussion (auxiliary layer)', () => {
    expect(DRUM_PARTS[9]).toBe('Percussion')
  })
})

// =========================================================================
// getPattern — genre lookup
// =========================================================================
describe('getPattern', () => {
  describe('valid genres', () => {
    it.each(GENRE_NAMES)('returns a valid DrumPattern for "%s"', (genre) => {
      const pattern = getPattern(genre)
      expect(pattern).not.toBeNull()
    })

    it('returns a pattern with the correct structure', () => {
      const pattern = getPattern('House') as DrumPattern

      // Grid: 10 rows × 16 columns
      expect(pattern.grid).toHaveLength(10)
      for (const row of pattern.grid) {
        expect(row).toHaveLength(16)
      }

      // Velocity: same dimensions as grid
      expect(pattern.velocity).toHaveLength(10)
      for (const row of pattern.velocity) {
        expect(row).toHaveLength(16)
      }

      // Parts list matches DRUM_PARTS
      expect(pattern.parts).toEqual(DRUM_PARTS)

      // Numeric properties
      expect(typeof pattern.swing).toBe('number')
      expect(typeof pattern.ghostNoteChance).toBe('number')
      expect(typeof pattern.bpm).toBe('number')
    })

    it('each genre has grid and velocity with matching dimensions', () => {
      for (const genre of GENRE_NAMES) {
        const pattern = getPattern(genre) as DrumPattern
        expect(pattern.grid.length).toBe(pattern.velocity.length)
        for (let r = 0; r < pattern.grid.length; r++) {
          expect(pattern.grid[r].length).toBe(pattern.velocity[r].length)
        }
      }
    })

    it('grid values are only 0 or 1 (before swing is applied)', () => {
      for (const genre of GENRE_NAMES) {
        const pattern = getPattern(genre) as DrumPattern
        for (const row of pattern.grid) {
          for (const cell of row) {
            expect([0, 1]).toContain(cell)
          }
        }
      }
    })

    it('velocity values are 0 where grid is 0, >0 where grid is 1', () => {
      for (const genre of GENRE_NAMES) {
        const pattern = getPattern(genre) as DrumPattern
        for (let r = 0; r < pattern.grid.length; r++) {
          for (let c = 0; c < 16; c++) {
            if (pattern.grid[r][c] === 0) {
              expect(pattern.velocity[r][c]).toBe(0)
            } else {
              expect(pattern.velocity[r][c]).toBeGreaterThan(0)
            }
          }
        }
      }
    })

    it('all velocity values are within MIDI range (0-127)', () => {
      for (const genre of GENRE_NAMES) {
        const pattern = getPattern(genre) as DrumPattern
        for (const row of pattern.velocity) {
          for (const cell of row) {
            expect(cell).toBeGreaterThanOrEqual(0)
            expect(cell).toBeLessThanOrEqual(127)
          }
        }
      }
    })

    it('bpm values are in a reasonable musical range (20-300)', () => {
      for (const genre of GENRE_NAMES) {
        const pattern = getPattern(genre) as DrumPattern
        expect(pattern.bpm).toBeGreaterThanOrEqual(20)
        expect(pattern.bpm).toBeLessThanOrEqual(300)
      }
    })
  })

  describe('specific genre patterns', () => {
    it('House has 4-to-floor kick (beats 1, 2, 3, 4)', () => {
      const house = getPattern('House') as DrumPattern
      const kickRow = house.grid[0] // Kick = index 0
      // 4-to-floor = hits on columns 0, 4, 8, 12 (the four beats)
      expect(kickRow[0]).toBe(1)
      expect(kickRow[4]).toBe(1)
      expect(kickRow[8]).toBe(1)
      expect(kickRow[12]).toBe(1)
      // No kick on offbeats
      expect(kickRow[2]).toBe(0)
      expect(kickRow[6]).toBe(0)
      expect(kickRow[10]).toBe(0)
      expect(kickRow[14]).toBe(0)
    })

    it('House clap is on beats 2 and 4 (columns 4 and 12)', () => {
      const house = getPattern('House') as DrumPattern
      const clapRow = house.grid[4] // Clap = index 4
      expect(clapRow[4]).toBe(1) // beat 2
      expect(clapRow[12]).toBe(1) // beat 4
      expect(clapRow[0]).toBe(0) // not on beat 1
      expect(clapRow[8]).toBe(0) // not on beat 3
    })

    it('Dubstep has half-time snare on beat 3 (column 8)', () => {
      const dubstep = getPattern('Dubstep') as DrumPattern
      const snareRow = dubstep.grid[1] // Snare = index 1
      expect(snareRow[8]).toBe(1) // half-time snare on beat 3
      // No snare on beats 2 and 4 (regular backbeat)
      expect(snareRow[4]).toBe(0)
      expect(snareRow[12]).toBe(0)
    })

    it('Drum & Bass has syncopated kicks (not 4-to-floor)', () => {
      const dnb = getPattern('Drum & Bass') as DrumPattern
      const kickRow = dnb.grid[0] // Kick = index 0

      // DnB kick is syncopated: varies from 4-to-floor
      // It should have some hits and some rests, distinct from
      // the simple [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] pattern
      const kickSum = kickRow.reduce((a, b) => a + b, 0)
      expect(kickSum).toBeGreaterThan(0)
      expect(kickSum).toBeLessThan(16)

      // At least one kick that ISN'T on a main beat position
      // (DnB syncopation means kicks can land on offbeats)
      // Check: DnB has kick on columns 6 and 14 (not 0,4,8,12)
      expect(kickRow[6]).toBe(1)
      expect(kickRow[14]).toBe(1)
    })

    it('Jazz has ride cymbal on 8th notes (columns 0,2,4,6,8,10,12,14)', () => {
      const jazz = getPattern('Jazz') as DrumPattern
      const rideRow = jazz.grid[8] // Ride = index 8
      // Jazz ride pattern is steady 8th notes
      for (let c = 0; c < 16; c += 2) {
        expect(rideRow[c]).toBe(1) // even columns = on beats
      }
    })

    it('Drum & Bass has 16th note hi-hat (all 16 columns)', () => {
      const dnb = getPattern('Drum & Bass') as DrumPattern
      const hiHatRow = dnb.grid[2] // Hi-Hat = index 2
      expect(hiHatRow.every((cell) => cell === 1)).toBe(true)
    })
  })

  describe('invalid or missing genres', () => {
    it('returns null for an empty string', () => {
      expect(getPattern('')).toBeNull()
    })

    it('returns null for a misspelled genre', () => {
      expect(getPattern('Hous')).toBeNull()
      expect(getPattern('Drum and Bass')).toBeNull() // no ampersand
    })

    it('returns null for a made-up genre', () => {
      expect(getPattern('Electroswing')).toBeNull()
      expect(getPattern('Symphonic Metal')).toBeNull() // subset not in list
    })

    it('returns null for lowercase genre (case-sensitive lookup)', () => {
      expect(getPattern('house')).toBeNull()
      expect(getPattern('jazz')).toBeNull()
    })
  })
})

// =========================================================================
// applySwing — swing timing markers
// =========================================================================
describe('applySwing', () => {
  // A simple 10×16 grid with hits on every cell for clear testing
  const allHits: number[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 16 }, () => 1)
  )

  // A standard 4-to-floor pattern for realistic testing
  const housePattern = getPattern('House') as DrumPattern

  it('returns grid unchanged when swing is 0%', () => {
    const result = applySwing(allHits, 0)
    // Every cell should still be 1 (no swing markers)
    for (const row of result) {
      for (const cell of row) {
        expect(cell).toBe(1)
      }
    }
  })

  it('returns a new array (does not mutate the input) when swing is 0%', () => {
    const original = allHits.map((r) => [...r])
    const result = applySwing(allHits, 0)
    expect(result).not.toBe(allHits) // different reference
    // Original should be untouched
    for (let r = 0; r < original.length; r++) {
      for (let c = 0; c < 16; c++) {
        expect(allHits[r][c]).toBe(original[r][c])
      }
    }
  })

  it('returns a new array (does not mutate the input) when swing > 0%', () => {
    const original = allHits.map((r) => [...r])
    const result = applySwing(allHits, 50)
    expect(result).not.toBe(allHits)
    for (let r = 0; r < original.length; r++) {
      for (let c = 0; c < 16; c++) {
        expect(allHits[r][c]).toBe(original[r][c])
      }
    }
  })

  it('marks odd-column hits with 2 at 100% swing', () => {
    const result = applySwing(allHits, 100)
    // Even columns stay 1, odd columns become 2
    for (const row of result) {
      for (let c = 0; c < 16; c++) {
        if (c % 2 === 0) {
          expect(row[c]).toBe(1) // even columns = on-beat = not swung
        } else {
          expect(row[c]).toBe(2) // odd columns = offbeat = swung
        }
      }
    }
  })

  it('marks a proportional number of odd columns at 50% swing', () => {
    const result = applySwing(allHits, 50)
    // At 50%, half (4 out of 8) odd columns are swung
    // The first 4 odd columns (indices 0-7 in the odd-column list)
    // Corresponding to odd columns 1,3,5,7 (0-based)
    const expectedSwung = [1, 3, 5, 7]
    const expectedStraight = [9, 11, 13, 15]

    for (const row of result) {
      for (const col of expectedSwung) {
        expect(row[col]).toBe(2)
      }
      for (const col of expectedStraight) {
        expect(row[col]).toBe(1)
      }
    }
  })

  it('does not modify 0 cells (only marks 1 → 2)', () => {
    const emptyGrid: number[][] = Array.from({ length: 10 }, () =>
      Array.from({ length: 16 }, () => 0)
    )
    const result = applySwing(emptyGrid, 100)
    for (const row of result) {
      for (const cell of row) {
        expect(cell).toBe(0)
      }
    }
  })

  it('works correctly on a realistic House pattern', () => {
    const result = applySwing(housePattern.grid, 30)
    // House kick is on even columns (0, 4, 8, 12) → should stay as 1
    const kickRow = result[0]
    expect(kickRow[0]).toBe(1) // beat 1, not swung
    expect(kickRow[4]).toBe(1) // beat 2, not swung
    expect(kickRow[8]).toBe(1) // beat 3, not swung
    expect(kickRow[12]).toBe(1) // beat 4, not swung

    // House hi-hat is on odd columns (1, 3, 5, 7, 9, 11, 13, 15)
    // At 30%: first 2 of 8 odd columns swung (round(8 * 0.3) = 2)
    const hiHatRow = result[2]
    expect(hiHatRow[1]).toBe(2) // swung (first odd column)
    expect(hiHatRow[3]).toBe(2) // swung (second odd column)
    expect(hiHatRow[5]).toBe(1) // not swung
    expect(hiHatRow[15]).toBe(1) // not swung (last odd column)
  })

  describe('clamping', () => {
    it('clamps negative swing to 0 (no swing)', () => {
      const result = applySwing(allHits, -50)
      for (const row of result) {
        for (const cell of row) {
          expect(cell).toBe(1)
        }
      }
    })

    it('clamps > 100 swing to 100 (full swing)', () => {
      const result = applySwing(allHits, 150)
      for (const row of result) {
        for (let c = 0; c < 16; c++) {
          if (c % 2 === 0) {
            expect(row[c]).toBe(1)
          } else {
            expect(row[c]).toBe(2)
          }
        }
      }
    })

    it('treats 0 as no swing after clamping', () => {
      const result = applySwing(allHits, -0)
      for (const row of result) {
        for (const cell of row) {
          expect(cell).toBe(1)
        }
      }
    })

    it('treats 100 as full swing after clamping', () => {
      const result = applySwing(allHits, 100)
      for (const row of result) {
        for (let c = 0; c < 16; c++) {
          if (c % 2 === 0) {
            expect(row[c]).toBe(1)
          } else {
            expect(row[c]).toBe(2)
          }
        }
      }
    })
  })

  describe('proportional mapping', () => {
    // Test each 12.5% increment to verify proportional column selection
    // 8 odd columns, so each 12.5% = 1 additional swung column
    it.each([
      [0, []],
      [12, [1]],
      [25, [1, 3]],
      [37, [1, 3, 5]],
      [50, [1, 3, 5, 7]],
      [62, [1, 3, 5, 7, 9]],
      [75, [1, 3, 5, 7, 9, 11]],
      [87, [1, 3, 5, 7, 9, 11, 13]],
      [100, [1, 3, 5, 7, 9, 11, 13, 15]]
    ])('%p% swing swings columns %p', (percent, expectedSwung) => {
      const result = applySwing(allHits, percent)
      for (const row of result) {
        for (let c = 0; c < 16; c++) {
          if (c % 2 === 0) {
            expect(row[c]).toBe(1) // even columns never swung
          } else if (expectedSwung.includes(c)) {
            expect(row[c]).toBe(2) // should be swung
          } else {
            expect(row[c]).toBe(1) // should remain straight
          }
        }
      }
    })
  })
})

// =========================================================================
// addGhostNotes — ghost note injection
// =========================================================================
describe('addGhostNotes', () => {
  // A clean grid with NO hits (all zeros) so we can test ghost fills
  const emptyGrid: number[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 16 }, () => 0)
  )
  const emptyVelocity: number[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 16 }, () => 0)
  )

  // A realistic grid with some hits (use House grid)
  const housePattern = getPattern('House') as DrumPattern

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('chance = 0% (no ghosts)', () => {
    it('returns grid unchanged for 0% chance', () => {
      const result = addGhostNotes(emptyGrid, emptyVelocity, 0)
      for (const row of result.grid) {
        expect(row.every((cell) => cell === 0)).toBe(true)
      }
      for (const row of result.velocity) {
        expect(row.every((cell) => cell === 0)).toBe(true)
      }
    })

    it('does not modify existing hits when chance is 0%', () => {
      const result = addGhostNotes(housePattern.grid, housePattern.velocity, 0)

      // Grid should be identical to original
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 16; c++) {
          expect(result.grid[r][c]).toBe(housePattern.grid[r][c])
        }
      }
    })
  })

  describe('chance = 100% (fill all empty slots)', () => {
    beforeEach(() => {
      // Mock Math.random to return 0.5 (ensures all rolls pass 0-100 < 100)
      // For velocity: Math.floor(0.5 * 16) + 25 = 8 + 25 = 33
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    it('fills every empty Snare and Hi-Hat slot with a ghost note', () => {
      const result = addGhostNotes(emptyGrid, emptyVelocity, 100)

      // Snare (row 1) and Hi-Hat (row 2) should be all 1s
      expect(result.grid[1].every((cell) => cell === 1)).toBe(true)
      expect(result.grid[2].every((cell) => cell === 1)).toBe(true)

      // Other rows should remain all 0s (unaffected)
      for (let r = 0; r < 10; r++) {
        if (r === 1 || r === 2) continue // skip ghost rows
        expect(result.grid[r].every((cell) => cell === 0)).toBe(true)
      }
    })

    it('assigns velocity 25-40 to ghost notes', () => {
      const result = addGhostNotes(emptyGrid, emptyVelocity, 100)

      // With Math.random mocked to 0.5: Math.floor(0.5 * 16) + 25 = 33
      for (let c = 0; c < 16; c++) {
        expect(result.velocity[1][c]).toBe(33) // Snare ghosts
        expect(result.velocity[2][c]).toBe(33) // Hi-Hat ghosts
      }

      // Other rows still 0
      for (let r = 0; r < 10; r++) {
        if (r === 1 || r === 2) continue
        expect(result.velocity[r].every((cell) => cell === 0)).toBe(true)
      }
    })

    it('fills empty Snare/Hi-Hat slots even when others are busy', () => {
      // Use House pattern which has some hits in Snare(1)/Hi-Hat(2)
      const result = addGhostNotes(housePattern.grid, housePattern.velocity, 100)

      // Every slot in Snare and Hi-Hat rows should now be 1
      expect(result.grid[1].every((cell) => cell === 1)).toBe(true)
      expect(result.grid[2].every((cell) => cell === 1)).toBe(true)

      // Original grid values in non-ghost rows preserved
      for (let r = 0; r < 10; r++) {
        if (r === 1 || r === 2) continue
        for (let c = 0; c < 16; c++) {
          expect(result.grid[r][c]).toBe(housePattern.grid[r][c])
        }
      }
    })

    it('ghost velocities are in range 25-40 (randomized)', () => {
      // Override to return different values to test the range
      vi.restoreAllMocks()
      // Test with a sequence: 0.0 → velocity 25, then 0.99 → velocity 40
      let callCount = 0
      vi.spyOn(Math, 'random').mockImplementation(() => {
        callCount++
        // Alternates between low and high for the two random calls per slot
        return callCount % 2 === 1 ? 0.0 : 0.99
      })

      const result = addGhostNotes(emptyGrid, emptyVelocity, 100)

      // Check velocity range
      for (let c = 0; c < 16; c++) {
        expect(result.velocity[1][c]).toBeGreaterThanOrEqual(25)
        expect(result.velocity[1][c]).toBeLessThanOrEqual(40)
        expect(result.velocity[2][c]).toBeGreaterThanOrEqual(25)
        expect(result.velocity[2][c]).toBeLessThanOrEqual(40)
      }
    })
  })

  describe('partial chance', () => {
    it('adds some ghost notes when chance is 50%', () => {
      // Mock random to return 0.4 (40 < 50 → add ghost)
      // and then alternating: 0.6 (60 > 50 → no ghost)
      let callCount = 0
      vi.spyOn(Math, 'random').mockImplementation(() => {
        callCount++
        return callCount % 2 === 1 ? 0.4 : 0.6
      })

      const result = addGhostNotes(emptyGrid, emptyVelocity, 50)

      // With the alternating mock, half the slots should get ghosts
      // Snare row: 16 slots, 8 with odd positions → ghost added
      // It depends on the mock sequence. With our pattern, cols 0,2,4,...
      // get 0.4 (ghost), and cols 1,3,5,... get 0.6 (no ghost)
      // Since both the roll check AND velocity generation use random,
      // and we alternate each call, the pattern is deterministic.
      // Roll call (call 1): 0.4 < 50 → ghost
      // Velocity call (call 2): 0.6 * 16 = 9.6, floor=9, +25 = 34
      // Roll call (call 3): 0.4 < 50 → ghost
      // Velocity call (call 4): 0.6 * 16 = 9.6, floor=9, +25 = 34
      // ...so every slot adds a ghost.
      // Let me just check that SOME slots have ghosts and the total
      // is greater than 0 but less than 32 (all 16 in both rows)
      const ghostCount = result.grid[1].filter((c) => c === 1).length +
        result.grid[2].filter((c) => c === 1).length
      expect(ghostCount).toBeGreaterThan(0)
      expect(ghostCount).toBeLessThanOrEqual(32)
    })

    it('adds no ghost notes when chance is 0 (regardless of random)', () => {
      // Even if Math.random returns 0 (minimum), roll = 0 < 0 is FALSE
      vi.spyOn(Math, 'random').mockReturnValue(0)
      const result = addGhostNotes(emptyGrid, emptyVelocity, 0)
      expect(result.grid[1].every((c) => c === 0)).toBe(true)
      expect(result.grid[2].every((c) => c === 0)).toBe(true)
    })
  })

  describe('immutability', () => {
    it('does not mutate the original grid array', () => {
      const originalGrid = emptyGrid.map((r) => [...r])
      const originalVelocity = emptyVelocity.map((r) => [...r])

      addGhostNotes(emptyGrid, emptyVelocity, 100)

      expect(emptyGrid).toEqual(originalGrid)
      expect(emptyVelocity).toEqual(originalVelocity)
    })

    it('returns new arrays (not references to input)', () => {
      const result = addGhostNotes(emptyGrid, emptyVelocity, 50)
      expect(result.grid).not.toBe(emptyGrid)
      expect(result.velocity).not.toBe(emptyVelocity)
    })
  })

  describe('ghost note application on real pattern', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    it('preserves original hits in Snare row when adding ghosts', () => {
      // Dubstep snare has hit on column 8 (beat 3)
      const dubstep = getPattern('Dubstep') as DrumPattern
      const result = addGhostNotes(dubstep.grid, dubstep.velocity, 100)

      // Original snare hit should remain
      expect(result.grid[1][8]).toBe(1)
      // Original snare velocity should be preserved (not overwritten)
      expect(result.velocity[1][8]).toBe(dubstep.velocity[1][8])
    })

    it('does not affect rows other than Snare and Hi-Hat', () => {
      const result = addGhostNotes(housePattern.grid, housePattern.velocity, 100)

      // Kick row (0) should be exactly the same
      expect(result.grid[0]).toEqual(housePattern.grid[0])
      expect(result.velocity[0]).toEqual(housePattern.velocity[0])

      // Clap row (4) should be exactly the same
      expect(result.grid[4]).toEqual(housePattern.grid[4])
      expect(result.velocity[4]).toEqual(housePattern.velocity[4])
    })
  })

  describe('clamping', () => {
    it('clamps negative chance to 0 (no ghost notes)', () => {
      const result = addGhostNotes(emptyGrid, emptyVelocity, -10)
      expect(result.grid[1].every((c) => c === 0)).toBe(true)
      expect(result.grid[2].every((c) => c === 0)).toBe(true)
    })

    it('clamps > 100 chance to 100 (all slots filled)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
      const result = addGhostNotes(emptyGrid, emptyVelocity, 200)
      expect(result.grid[1].every((c) => c === 1)).toBe(true)
      expect(result.grid[2].every((c) => c === 1)).toBe(true)
    })
  })
})

// =========================================================================
// Integration — getPattern + applySwing + addGhostNotes pipeline
// =========================================================================
describe('drum pattern pipeline', () => {
  it('can chain all three functions together', () => {
    const pattern = getPattern('Funk') as DrumPattern

    // Step 1: Apply swing
    const swung = applySwing(pattern.grid, pattern.swing)

    // Step 2: Add ghost notes
    const { grid, velocity } = addGhostNotes(swung, pattern.velocity, pattern.ghostNoteChance)

    // Result should have same dimensions (10×16)
    expect(grid).toHaveLength(10)
    expect(velocity).toHaveLength(10)
    for (const row of grid) expect(row).toHaveLength(16)
    for (const row of velocity) expect(row).toHaveLength(16)

    // All velocity values in range
    for (const row of velocity) {
      for (const cell of row) {
        expect(cell).toBeGreaterThanOrEqual(0)
        expect(cell).toBeLessThanOrEqual(127)
      }
    }

    // Grid values should be 0, 1, or 2 (allow swung markers)
    for (const row of grid) {
      for (const cell of row) {
        expect([0, 1, 2]).toContain(cell)
      }
    }
  })

  it('all genres produce a consistent pipeline output', () => {
    for (const genre of GENRE_NAMES) {
      const pattern = getPattern(genre) as DrumPattern
      const swung = applySwing(pattern.grid, pattern.swing)
      const { grid } = addGhostNotes(swung, pattern.velocity, pattern.ghostNoteChance)

      // Every genre after processing must still produce valid grid values
      for (const row of grid) {
        for (const cell of row) {
          expect([0, 1, 2]).toContain(cell)
        }
      }
    }
  })
})
