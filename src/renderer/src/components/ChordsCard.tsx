/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Chord Progressions Card
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * Provides an interactive chord progression reference for music producers and
 * songwriters. Users can explore common chord progressions across 11 genres,
 * build extended chords (maj7, min7, sus2, etc.), and borrow chords from
 * parallel modes (modal interchange).
 *
 * HOW IT WORKS:
 * 1. Genre selector — pick a music genre → shows relevant chord progressions
 * 2. Progression table — each row shows roman numerals, example chords,
 *    description, and energy level (1–10)
 * 3. Extended chord builder — pick a root note + chord type → shows the notes
 *    and interval pattern of that chord
 * 4. Modal interchange — pick a root key → shows borrowed chords from 6
 *    parallel modes (Dorian, Phrygian, Lydian, etc.)
 *
 * WHY THIS IS USEFUL:
 * Beginners can discover which progressions work in their genre, learn how
 * extended chords are constructed, and add harmonic interest by borrowing
 * chords from parallel modes — all without memorizing music theory tables.
 *
 * DATA SOURCE:
 * All chord data comes from src/core/chordProgressions.ts
 *
 * RELATED COMPONENTS:
 * - ScalesCard: scale and mode reference (companion music theory card)
 * - EqCard: EQ frequency recommendations for mixing
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { desc } from '../i18n/desc'
import {
  getProgressions,
  extendedChord,
  modalInterchange,
  GENRES,
  type Progression,
  type ExtendedChordType,
  type ModalInterchange
} from '../../../core/chordProgressions'
import {
  SUPERGENRE_ORDER,
  SUPERGENRE_I18N_KEY,
  type SuperGenre
} from '../../../core/genreTaxonomy'
import { getGenreLabel } from '../utils/genreLabel'
import Card from './Card'

/**
 * Chromatic note order for computing semitone differences between notes.
 * 半音阶顺序，用于计算音符之间的半音差。
 */
const CHROMATIC: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/**
 * Interval name labels for semitone distances (used in chord builder display).
 * 半音距离对应的音程名称（用于和弦构建器显示）。
 */
const INTERVAL_NAMES: Record<number, string> = {
  0: 'Root',
  1: 'Minor 2nd',
  2: 'Major 2nd',
  3: 'Minor 3rd',
  4: 'Major 3rd',
  5: 'Perfect 4th',
  6: 'Tritone',
  7: 'Perfect 5th',
  8: 'Minor 6th',
  9: 'Major 6th',
  10: 'Minor 7th',
  11: 'Major 7th',
  12: 'Octave',
  14: 'Major 9th'
}

/**
 * All 12 roots available for the extended chord builder.
 * 和弦构建器中可用的12个根音。
 */
const ALL_ROOTS: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/**
 * All supported extended chord types for the chord type selector.
 * 支持的延伸和弦类型列表。
 */
const CHORD_TYPES: ExtendedChordType[] = [
  'maj7', 'min7', 'dom7', 'dim7', 'aug',
  'sus2', 'sus4', 'maj9', 'min9', 'dom9'
]

/**
 * Human-readable description for each chord type.
 * Each description explains the chord's quality and emotional character
 * so beginners can make informed harmonic choices.
 */
const CHORD_TYPE_INFO: Record<ExtendedChordType, string> = {
  maj7: 'Major 7th — warm, jazzy, and resolved. Common in jazz, R&B, and lo-fi.',
  min7: 'Minor 7th — mellow, soulful, and smooth. A staple of jazz and neo-soul.',
  dom7: 'Dominant 7th — bluesy, tense, and unresolved. The sound of the blues.',
  dim7: 'Diminished 7th — dark, tense, and unstable. Used for passing chords and drama.',
  aug: 'Augmented — dreamy, floating, and unresolved. Creates a sense of wonder.',
  sus2: 'Suspended 2nd — open, airy, and ambiguous. No major or minor third.',
  sus4: 'Suspended 4th — bright, expectant, and resolving. Wants to resolve to the major.',
  maj9: 'Major 9th — lush, rich, and sophisticated. Extended jazz harmony.',
  min9: 'Minor 9th — dark, complex, and emotional. Deep minor color.',
  dom9: 'Dominant 9th — funky, extended blues. Richer than a simple dom7.'
}

/**
 * Chromatic index of a note name (0–11).
 * Uses the CHROMATIC array for position lookup.
 *
 * @param note — Note name (e.g., 'C', 'F#', 'Bb')
 * @returns Index 0–11, or -1 if not found
 */
function noteToIndex(note: string): number {
  return CHROMATIC.indexOf(note)
}

/**
 * Compute the semitone interval between two note names (distance from root to note).
 * Wraps modulo 12 so intervals larger than an octave are folded down.
 *
 * @param root — Root note name
 * @param note — Target note name
 * @returns Semitone distance (0–11, or 14 for extended intervals)
 */
function getSemitoneInterval(root: string, note: string): number {
  const rootIdx = noteToIndex(root)
  const noteIdx = noteToIndex(note)
  if (rootIdx === -1 || noteIdx === -1) return 0
  // If note index is ahead of root, it's a simple difference
  if (noteIdx >= rootIdx) return noteIdx - rootIdx
  // If note index is behind root, it wraps around the octave
  return noteIdx + 12 - rootIdx
}

/**
 * Map a genre name to the key used by getProgressions().
 * Simply lowercases and trims — matches the module's lookup logic.
 *
 * @param genre — Genre name from the GENRES array
 * @returns Lowercased lookup key
 */
function genreLookupKey(genre: string): string {
  return genre.toLowerCase().trim()
}

function ChordsCard(): JSX.Element {
  const { t } = useTranslation()

  // ============================================================================
  // State
  // ============================================================================
  // Currently selected genre for the progressions table
  const [selectedGenre, setSelectedGenre] = useState<string>(GENRES[0]?.name ?? 'Pop')
  // Root note for the extended chord builder
  const [chordRoot, setChordRoot] = useState<string>('C')
  // Chord type for the extended chord builder
  const [chordType, setChordType] = useState<ExtendedChordType>('maj7')
  // Root key for modal interchange
  const [modalKey, setModalKey] = useState<string>('C')

  // ============================================================================
  // Derived data (memoized)
  // ============================================================================

  /**
   * Progressions for the selected genre.
   * Recalculated whenever the user picks a different genre.
   */
  const progressions: Progression[] = useMemo(
    () => getProgressions(genreLookupKey(selectedGenre)),
    [selectedGenre]
  )

  /**
   * Notes of the currently selected extended chord.
   * e.g., extendedChord('C', 'maj7') → ['C', 'E', 'G', 'B']
   */
  const chordNotes: string[] = useMemo(
    () => extendedChord(chordRoot, chordType),
    [chordRoot, chordType]
  )

  /**
   * Compute the interval names for each note in the extended chord.
   * Pairs each note with its human-readable interval name.
   */
  const chordNotesWithIntervals: { note: string; interval: string; semitones: number }[] = useMemo(
    () =>
      chordNotes.map((note) => {
        const semitones = getSemitoneInterval(chordRoot, note)
        return {
          note,
          interval: INTERVAL_NAMES[semitones] ?? `${semitones} semitones`,
          semitones
        }
      }),
    [chordNotes, chordRoot]
  )

  /**
   * Modal interchange data for the selected key.
   * Shows which chords can be borrowed from each parallel mode.
   */
  const modalData: ModalInterchange[] = useMemo(
    () => modalInterchange(modalKey),
    [modalKey]
  )

  /**
   * Genre buttons data: pairs each genre name with its translated label.
   * Uses the shared taxonomy genre-label helper so every genre has a
   * correct localized name in both languages.
   */
  const genreButtons = useMemo(
    () =>
      GENRES.map((entry) => ({
        value: entry.name,
        label: getGenreLabel(t, entry.name)
      })),
    [t]
  )

  /**
   * Group genres by super-genre family for hierarchical pill display.
   * 按超类流派分组展示风格标签。
   */
  const groupedGenres = useMemo(
    () =>
      SUPERGENRE_ORDER.map((sg: SuperGenre) => ({
        superGenre: sg,
        genres: GENRES.filter((g) => g.superGenre === sg)
      })).filter((g) => g.genres.length > 0),
    []
  )

  /**
   * Chord type buttons data: each type paired with its translated label.
   */
  const chordTypeButtons = useMemo(
    () =>
      CHORD_TYPES.map((type) => ({
        value: type,
        label: t(`chords.qualities.${type}`)
      })),
    [t]
  )

  // ============================================================================
  // Event handlers
  // ============================================================================

  /**
   * Handle genre pill click: switch the progression view to the selected genre.
   */
  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenre(genre)
  }, [])

  /**
   * Handle chord type pill click: update the extended chord type.
   */
  const handleChordTypeChange = useCallback((type: ExtendedChordType) => {
    setChordType(type)
  }, [])

  /**
   * Handle root note change for the chord builder (select/dropdown).
   */
  const handleChordRootChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setChordRoot(e.target.value)
    },
    []
  )

  /**
   * Handle root key change for modal interchange (select/dropdown).
   */
  const handleModalKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setModalKey(e.target.value)
    },
    []
  )

  /**
   * Get the energy bar width percentage (0–100%).
   * Maps energy (1–10) to 10%–100% width.
   */
  const energyPercent = useCallback((energy: number): string => {
    return `${Math.max(10, Math.min(100, energy * 10))}%`
  }, [])

  /**
   * Get the energy bar color based on intensity.
   * Low energy (1–3) = calm green, Mid (4–7) = amber, High (8–10) = red accent.
   */
  const energyColor = useCallback((energy: number): string => {
    if (energy <= 3) return 'var(--success)'
    if (energy <= 7) return '#FFA500'
    return 'var(--error)'
  }, [])

  return (
    <Card title={t('chords.title')} subtitle={t('chords.subtitle')}>

      {/* ===================================================================== */}
      {/* SECTION 1: Genre Pills + Progressions Table                          */}
      {/* ===================================================================== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        {/* Label */}
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          {t('chords.genre')}
        </label>

        {/* Grouped genre pills by super-genre family */}
        {/* 按超类流派分组展示风格标签 */}
        {groupedGenres.map(({ superGenre, genres }) => (
          <div key={superGenre} style={{ marginBottom: 'var(--space-2)' }}>
            {/* Super-genre group label */}
            <div
              style={{
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 'var(--space-1)',
                paddingLeft: '2px'
              }}
            >
              {t(SUPERGENRE_I18N_KEY[superGenre])}
            </div>
            {/* Genre pill buttons for this group */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
              {genres.map((entry) => {
                const isActive = selectedGenre === entry.name
                const label = genreButtons.find((g) => g.value === entry.name)?.label ?? entry.name
                return (
                  <button
                    key={entry.name}
                    onClick={() => handleGenreChange(entry.name)}
                    style={{
                      padding: '4px 12px',
                      border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      transition: 'all var(--duration-spring) var(--ease-spring)'
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* ===== Progressions Table ===== */}
        {progressions.length > 0 ? (
          <div
            style={{
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              overflow: 'hidden'
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 60px',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--surface-1)',
                borderBottom: '1px solid var(--border)',
                fontSize: '11px',
                color: 'var(--text-tertiary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              <span>{t('chords.progression')}</span>
              <span>{t('chords.description')}</span>
              <span style={{ textAlign: 'center' }}>{t('chords.energy')}</span>
            </div>

            {/* Table Rows — one per progression */}
            {progressions.map((prog, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 60px',
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: idx < progressions.length - 1 ? '1px solid var(--border)' : 'none',
                  fontSize: '13px',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-base)'
                }}
              >
                {/* Left column: roman numeral + example chords */}
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent)',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    {prog.roman}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      gap: 'var(--space-1)',
                      flexWrap: 'wrap',
                      marginTop: 'var(--space-1)'
                    }}
                  >
                    {prog.chords.map((chord, cIdx) => (
                      <span
                        key={cIdx}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--surface-2)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {chord}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Middle column: description */}
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {desc(t, prog.description)}
                </span>

                {/* Right column: energy bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      backgroundColor: 'var(--surface-2)',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: energyPercent(prog.energy),
                        height: '100%',
                        borderRadius: '2px',
                        backgroundColor: energyColor(prog.energy),
                        transition: 'width 200ms ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    {prog.energy}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
            {t('chords.noData')}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* SECTION 2: Extended Chord Builder                                    */}
      {/* ===================================================================== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-3)',
            fontWeight: 600
          }}
        >
          {t('chords.type')}
        </label>

        {/* Chord root selector (dropdown) */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                color: 'var(--text-tertiary)',
                marginBottom: 'var(--space-1)'
              }}
            >
              {t('chords.root')}
            </label>
            <select
              value={chordRoot}
              onChange={handleChordRootChange}
              style={{
                width: '80px',
                padding: '6px 10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {ALL_ROOTS.map((root) => (
                <option key={root} value={root}>
                  {root}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chord type pills */}
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          {t('chords.quality')}
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          {CHORD_TYPES.map((type) => {
            const isActive = chordType === type
            return (
              <button
                key={type}
                onClick={() => handleChordTypeChange(type)}
                style={{
                  padding: '4px 10px',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  transition: 'all var(--duration-spring) var(--ease-spring)'
                }}
              >
                {t(`chords.qualities.${type}`)}
              </button>
            )
          })}
        </div>

        {/* Chord result display */}
        <div
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border)'
          }}
        >
          {/* Notes display */}
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                color: 'var(--text-tertiary)',
                marginBottom: 'var(--space-1)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {t('chords.notes')}
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {chordNotesWithIntervals.length > 0 ? (
                chordNotesWithIntervals.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '14px',
                      color: 'var(--accent)',
                      fontWeight: 600,
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'color-mix(in srgb, var(--accent) 8%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)'
                    }}
                  >
                    {item.note}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>—</span>
              )}
            </div>
          </div>

          {/* Intervals display */}
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                color: 'var(--text-tertiary)',
                marginBottom: 'var(--space-1)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {t('chords.intervals')}
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {chordNotesWithIntervals.length > 0 ? (
                chordNotesWithIntervals.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface-2)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {desc(t, item.interval)}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>—</span>
              )}
            </div>
          </div>

          {/* Chord type description */}
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                color: 'var(--text-tertiary)',
                marginBottom: 'var(--space-1)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {t('chords.description')}
            </span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {desc(t, CHORD_TYPE_INFO[chordType])}
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 3: Modal Interchange                                         */}
      {/* ===================================================================== */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-3)',
            fontWeight: 600
          }}
        >
          {t('chords.interchange')}
        </label>

        {/* Key selector for modal interchange */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              marginBottom: 'var(--space-1)'
            }}
          >
            {t('chords.key')}
          </label>
          <select
            value={modalKey}
            onChange={handleModalKeyChange}
            style={{
              width: '80px',
              padding: '6px 10px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              backgroundColor: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {ALL_ROOTS.map((root) => (
              <option key={root} value={root}>
                {root}
              </option>
            ))}
          </select>
        </div>

        {/* Modal interchange table */}
        {modalData.length > 0 ? (
          <div
            style={{
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              overflow: 'hidden'
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--surface-1)',
                borderBottom: '1px solid var(--border)',
                fontSize: '11px',
                color: 'var(--text-tertiary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              <span>{t('chords.mode')}</span>
              <span>{t('chords.borrowed')}</span>
            </div>

            {/* Data rows */}
            {modalData.map((mode, idx) => (
              <div
                key={mode.mode}
                style={{
                  borderBottom: idx < modalData.length - 1 ? '1px solid var(--border)' : 'none'
                }}
              >
                {/* Mode row with borrowed chords + description */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--bg-base)',
                    fontSize: '13px',
                    alignItems: 'start'
                  }}
                >
                  {/* Mode name */}
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {desc(t, mode.mode)}
                  </span>

                  {/* Borrowed chords */}
                  <div>
                    {mode.borrowedChords.length > 0 ? (
                      <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', marginBottom: 'var(--space-1)' }}>
                        {mode.borrowedChords.map((chord, cIdx) => (
                          <span
                            key={cIdx}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              color: 'var(--accent)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'color-mix(in srgb, var(--accent) 8%, transparent)',
                              border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {chord}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                        {t('chords.borrowedNone')}
                      </span>
                    )}
                    {/* Description */}
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', lineHeight: 1.4 }}>
                      {desc(t, mode.description)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
            {t('chords.noData')}
          </div>
        )}
      </div>
    </Card>
  )
}

export default ChordsCard
