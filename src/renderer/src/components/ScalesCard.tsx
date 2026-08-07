/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Scale Reference Card
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * Provides an interactive musical scale and mode reference. Users can pick any
 * root note and mode to see the complete scale with note names, intervals, and
 * frequencies. It also shows the diatonic chord qualities for each mode and a
 * comparison table of all 7 modes' interval patterns.
 *
 * HOW IT WORKS:
 * 1. Root note selector — click a note (piano-key-style buttons) to set the
 *    tonic/key of the scale
 * 2. Mode selector — pick a diatonic mode (Ionian, Dorian, etc.)
 * 3. Scale note display — shows the 7 notes of the scale with degree, note
 *    name, interval, semitone distance, and frequency in Hz
 * 4. Chord qualities — shows the triad quality (Major/Minor/Diminished) for
 *    each degree of the selected mode
 * 5. Modes comparison table — a reference table comparing all 7 modes with
 *    their interval patterns (W = whole step, H = half step)
 *
 * WHY THIS IS USEFUL:
 * Songwriters can quickly find which notes belong to a scale, producers can
 * see which chords naturally occur in a mode, and beginners can learn the
 * relationship between the 7 diatonic modes at a glance.
 *
 * DATA SOURCE:
 * All scale data comes from src/core/scaleReference.ts
 *
 * RELATED COMPONENTS:
 * - ChordsCard: chord progressions and extended chord construction
 * - EqCard: EQ frequency recommendations
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { desc } from '../i18n/desc'
import {
  getScale,
  getChordQualities,
  ALL_KEYS,
  MODES,
  MODE_INTERVALS,
  type ScaleNote
} from '../../../core/scaleReference'

import Card from './Card'

/**
 * Mode-to-i18n-key mapping.
 * The MODES array uses English mode names; we translate them via i18n.
 *
 * 调式名称到 i18n 键的映射。
 */
const MODE_I18N_MAP: Record<string, string> = {
  Ionian: 'major',
  Dorian: 'dorian',
  Phrygian: 'phrygian',
  Lydian: 'lydian',
  Mixolydian: 'mixolydian',
  Aeolian: 'naturalMinor',
  Locrian: 'locrian'
}

/**
 * Mode mood description (non-i18n — used directly for the modes comparison table).
 * Each mode's unique emotional character helps songwriters choose the right
 * scale for their desired vibe.
 *
 * 调式情绪描述（非 i18n — 用于调式对比表）。
 */
const MODE_MOOD: Record<string, string> = {
  Ionian: 'Happy, bright, stable — the standard major scale',
  Dorian: 'Jazzy, bluesy, soulful — minor with a raised 6th',
  Phrygian: 'Exotic, Spanish, dark — minor with a flat 2nd',
  Lydian: 'Dreamy, floating, ethereal — major with a raised 4th',
  Mixolydian: 'Bluesy, rocking, dominant — major with a flat 7th',
  Aeolian: 'Sad, somber, emotional — the natural minor scale',
  Locrian: 'Unstable, tense, dissonant — diminished tonic'
}

/**
 * Set of note indices that are "white keys" on a piano keyboard.
 * Used to style the root note selector like piano keys.
 *
 * 钢琴白键在 ALL_KEYS 中的索引。
 */
const WHITE_KEY_INDICES: Set<number> = new Set([0, 2, 4, 5, 7, 9, 11])

/**
 * Step-pattern display helpers: maps interval step values (1 or 2 semitones)
 * to W (whole step) / H (half step) labels.
 *
 * 音阶步进模式显示：2 → 'W'（全音），1 → 'H'（半音）。
 */
function stepLabel(step: number): string {
  return step === 2 ? 'W' : 'H'
}

/**
 * Determine whether a scale note is the tonic (degree 1).
 * The tonic is highlighted differently in the note list.
 *
 * 判断是否为调式主音（第1级），主音会以不同样式高亮。
 */
function isTonic(degree: number): boolean {
  return degree === 1
}

function ScalesCard(): JSX.Element {
  const { t } = useTranslation()

  // ============================================================================
  // State
  // ============================================================================
  // Currently selected root note (tonic of the scale)
  const [selectedRoot, setSelectedRoot] = useState<string>('C')
  // Currently selected mode (e.g., 'Ionian', 'Dorian')
  const [selectedMode, setSelectedMode] = useState<string>(MODES[0] ?? 'Ionian')

  // ============================================================================
  // Derived data (memoized)
  // ============================================================================

  /**
   * Scale notes for the selected root + mode.
   * Returns 7 ScaleNote objects, or an empty array if key/mode is invalid.
   *
   * 根据选定的根音和调式生成音阶音符。
   */
  const scaleNotes: ScaleNote[] = useMemo(
    () => getScale(selectedRoot, selectedMode),
    [selectedRoot, selectedMode]
  )

  /**
   * Diatonic chord qualities for the selected mode.
   * Returns 7 strings: 'Major', 'Minor', or 'Diminished'.
   *
   * 选定调式的自然三和弦性质。
   */
  const chordQualities: string[] = useMemo(
    () => getChordQualities(selectedMode),
    [selectedMode]
  )

  /**
   * Mode buttons data: each mode paired with its translated label.
   */
  const modeButtons = useMemo(
    () =>
      MODES.map((mode) => ({
        value: mode,
        label: t(`scales.types.${MODE_I18N_MAP[mode] ?? mode.toLowerCase()}`)
      })),
    [t]
  )

  /**
   * Intervals pattern for the currently selected mode, displayed as W/H labels.
   *
   * 当前调式的步进模式（W=全音 H=半音）。
   */
  const currentPattern: string[] = useMemo(() => {
    const intervals = MODE_INTERVALS[selectedMode]
    if (!intervals) return []
    return intervals.map(stepLabel)
  }, [selectedMode])

  /**
   * Modes comparison data: for every mode, show the interval pattern as W/H.
   * Used in the modes comparison table at the bottom.
   *
   * 所有调式的步进模式对比数据。
   */
  const modesComparison = useMemo(
    () =>
      MODES.map((mode) => {
        const intervals = MODE_INTERVALS[mode]
        return {
          mode,
          steps: intervals ? intervals.map(stepLabel) : [],
          mood: MODE_MOOD[mode] ?? ''
        }
      }),
    []
  )

  // ============================================================================
  // Event handlers
  // ============================================================================

  /**
   * Handle root note button click: set the tonic of the scale.
   */
  const handleRootChange = useCallback((root: string) => {
    setSelectedRoot(root)
  }, [])

  /**
   * Handle mode pill click: switch to the selected mode.
   */
  const handleModeChange = useCallback((mode: string) => {
    setSelectedMode(mode)
  }, [])

  /**
   * Determine if a note index is a "white key" for piano-key styling.
   */
  const isWhiteKey = useCallback((idx: number): boolean => WHITE_KEY_INDICES.has(idx), [])

  return (
    <Card title={t('scales.title')} subtitle={t('scales.subtitle')}>
      {/* ===================================================================== */}
      {/* SECTION 1: Root Note Selector (Piano-Key Style)                      */}
      {/* ===================================================================== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          {t('scales.root')}
        </label>

        {/* 
         * Piano-key root note selector.
         * Renders 12 note buttons arranged like a piano octave:
         * white keys (C, D, E, F, G, A, B) are taller and light,
         * black keys (C#, D#, F#, G#, A#) are shorter and dark,
         * positioned slightly above the white key row.
         *
         * 钢琴键风格的根音选择器。
         * 12个按键排列成一个八度：白键高亮，黑键深色且偏高。
         */}
        <div style={{ position: 'relative', height: '56px', display: 'flex', alignItems: 'flex-end' }}>
          {ALL_KEYS.map((key, idx) => {
            const isActive = selectedRoot === key
            const isWhite = isWhiteKey(idx)

            // White key styling — full height, light background
            // 白键样式 — 全高，浅色背景
            const whiteStyle: React.CSSProperties = {
              width: '36px',
              height: '52px',
              border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '0 0 4px 4px',
              backgroundColor: isActive
                ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
                : isTonic(idx + 1)
                  ? 'var(--surface-1)'
                  : 'var(--bg-base)',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: isActive ? 700 : 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: '4px',
              transition: 'all var(--duration-hover) var(--ease-default)',
              position: 'relative',
              zIndex: 1,
              marginRight: '2px'
            }

            // Black key styling — shorter, elevated, dark background
            // 黑键样式 — 较短，抬高，深色背景
            const blackStyle: React.CSSProperties = {
              width: '28px',
              height: '34px',
              border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
              borderRadius: '0 0 4px 4px',
              backgroundColor: isActive
                ? 'color-mix(in srgb, var(--accent) 25%, transparent)'
                : '#2a2a3a',
              color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
              cursor: 'pointer',
              fontSize: '9px',
              fontFamily: 'var(--font-mono)',
              fontWeight: isActive ? 700 : 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: '2px',
              transition: 'all var(--duration-hover) var(--ease-default)',
              position: 'relative',
              zIndex: 2,
              marginRight: '2px',
              marginBottom: '18px'
            }

            const style = isWhite ? whiteStyle : blackStyle

            return (
              <button
                key={key}
                onClick={() => handleRootChange(key)}
                style={style}
                title={`${key} — ${t('scales.selectRoot')}`}
              >
                {key}
              </button>
            )
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 2: Mode Selector Pills                                       */}
      {/* ===================================================================== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          {t('scales.scale')}
        </label>

        {/* Mode pills — one button per mode */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {modeButtons.map((mode) => {
            const isActive = selectedMode === mode.value
            return (
              <button
                key={mode.value}
                onClick={() => handleModeChange(mode.value)}
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
                {mode.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 3: Scale Notes Display                                       */}
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
          {t('scales.notes')}
        </label>

        {scaleNotes.length > 0 ? (
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
                gridTemplateColumns: '50px 80px 100px 1fr 80px',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--surface-1)',
                borderBottom: '1px solid var(--border)',
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              <span>{t('scales.degree')}</span>
              <span>{t('scales.note')}</span>
              <span>{t('scales.interval')}</span>
              <span>{t('scales.pattern')}</span>
              <span style={{ textAlign: 'right' }}>{t('scales.frequency')}</span>
            </div>

            {/* Data Rows — one per scale degree */}
            {scaleNotes.map((note) => {
              const isFirst = isTonic(note.degree)
              return (
                <div
                  key={note.degree}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '50px 80px 100px 1fr 80px',
                    padding: 'var(--space-2) var(--space-4)',
                    borderBottom: note.degree < 7 ? '1px solid var(--border)' : 'none',
                    fontSize: '13px',
                    alignItems: 'center',
                    backgroundColor:
                      note.degree === 1
                        ? 'color-mix(in srgb, var(--accent) 4%, transparent)'
                        : 'var(--bg-base)'
                  }}
                >
                  {/* Degree number (tonic highlighted) */}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: isFirst ? 700 : 400,
                      color: isFirst ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: '12px'
                    }}
                  >
                    {note.degree}
                    {isFirst ? '°' : ''}
                  </span>

                  {/* Note name (e.g., C3, D3) */}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: isFirst ? 700 : 500,
                      color: isFirst ? 'var(--accent)' : 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                  >
                    {note.note}
                  </span>

                  {/* Interval name (e.g., Unison, Major 2nd) */}
                  <span
                    style={{
                      fontSize: '12px',
                      color: isFirst ? 'var(--accent)' : 'var(--text-secondary)'
                    }}
                  >
                    {desc(t, note.interval)}
                  </span>

                  {/* Step pattern display: shows W (whole) / H (half) and semitone */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {/* W/H step indicator */}
                    {note.degree > 1 && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '1px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                          backgroundColor:
                            currentPattern[note.degree - 2] === 'W'
                              ? 'color-mix(in srgb, var(--accent) 10%, transparent)'
                              : 'color-mix(in srgb, var(--warning) 10%, transparent)',
                          color:
                            currentPattern[note.degree - 2] === 'W'
                              ? 'var(--accent)'
                              : '#FFA500'
                        }}
                      >
                        {currentPattern[note.degree - 2] ?? ''}
                      </span>
                    )}
                    {/* Semitone distance from root */}
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--text-tertiary)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {note.semitoneFromRoot > 0 ? `+${note.semitoneFromRoot}` : '0'} st
                    </span>
                  </div>

                  {/* Frequency in Hz */}
                  <span
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: isFirst ? 'var(--accent)' : 'var(--text-tertiary)'
                    }}
                  >
                    {note.frequency} Hz
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
            {t('scales.noData')}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* SECTION 4: Diatonic Chord Qualities                                  */}
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
          {t('scales.chords')}
        </label>

        {chordQualities.length > 0 ? (
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {chordQualities.map((quality, idx) => {
                // Color the quality pill based on chord type
                const colorMap: Record<string, string> = {
                  Major: 'var(--accent)',
                  Minor: 'var(--success)',
                  Diminished: 'var(--error)'
                }
                const qualityColor = colorMap[quality] ?? 'var(--text-secondary)'

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--space-1)',
                      padding: 'var(--space-2) var(--space-2)',
                      minWidth: '36px'
                    }}
                  >
                    {/* Roman numeral for the degree (i, ii, iii, etc.) */}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: qualityColor,
                        fontWeight: 600
                      }}
                    >
                      {romanNumeral(idx + 1, quality)}
                    </span>
                    {/* Quality name */}
                    <span
                      style={{
                        fontSize: '9px',
                        color: qualityColor,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: `${qualityColor}15`,
                        whiteSpace: 'nowrap',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}
                    >
                      {quality === 'Diminished' ? 'dim' : desc(t, quality)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {t('scales.noData')}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* SECTION 5: Mood & Modes Comparison Table                             */}
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
          {t('scales.modes')}
        </label>

        <div
          style={{
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            overflow: 'auto'
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 200px repeat(7, 36px)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--surface-1)',
              borderBottom: '1px solid var(--border)',
              fontSize: '10px',
              color: 'var(--text-tertiary)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              minWidth: '600px'
            }}
          >
            <span>{t('scales.mode')}</span>
            <span>{t('scales.mood')}</span>
            {[1, 2, 3, 4, 5, 6, 7].map((deg) => (
              <span key={deg} style={{ textAlign: 'center' }}>
                {t('scales.degreeShort')}{deg}
              </span>
            ))}
          </div>

          {/* Data rows — one per mode */}
          {modesComparison.map((item, idx) => {
            const isSelected = selectedMode === item.mode
            return (
              <div
                key={item.mode}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 200px repeat(7, 36px)',
                  padding: 'var(--space-2) var(--space-4)',
                  borderBottom: idx < modesComparison.length - 1 ? '1px solid var(--border)' : 'none',
                  fontSize: '12px',
                  alignItems: 'center',
                  backgroundColor: isSelected
                    ? 'color-mix(in srgb, var(--accent) 4%, transparent)'
                    : 'var(--bg-base)',
                  minWidth: '600px',
                  cursor: 'pointer',
                  transition: 'background-color var(--duration-hover) var(--ease-default)'
                }}
                onClick={() => handleModeChange(item.mode)}
              >
                {/* Mode name (highlighted if currently selected) */}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                    fontWeight: isSelected ? 700 : 400,
                    fontSize: '11px'
                  }}
                >
                  {desc(t, item.mode)}
                </span>

                {/* Mood description */}
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  {desc(t, item.mood)}
                </span>

                {/* Step pattern: W/H for each degree */}
                {item.steps.map((step, sIdx) => (
                  <span
                    key={sIdx}
                    style={{
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 600,
                      color:
                        step === 'W'
                          ? 'var(--accent)'
                          : '#FFA500'
                    }}
                  >
                    {step}
                  </span>
                ))}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-2)',
            fontSize: '10px',
            color: 'var(--text-tertiary)'
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>W</span>
          <span>= {t('scales.wholeStep')}</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#FFA500', fontWeight: 600 }}>H</span>
          <span>= {t('scales.halfStep')}</span>
        </div>
      </div>
    </Card>
  )
}

/**
 * Convert a scale degree (1-based) and chord quality into a Roman numeral.
 * Uppercase = Major, lowercase = minor, lowercase+° = diminished.
 *
 * @param degree — Scale degree (1–7)
 * @param quality — Chord quality: 'Major', 'Minor', or 'Diminished'
 * @returns Roman numeral string (e.g., 'I', 'ii', 'vii°')
 *
 * 将音级和和弦性质转换为罗马数字表示。
 * 大写=大三和弦，小写=小三和弦，小写+°=减三和弦。
 */
function romanNumeral(degree: number, quality: string): string {
  const romanNumerals: string[] = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
  const idx = degree - 1
  if (idx < 0 || idx >= romanNumerals.length) return '?'

  const roman = romanNumerals[idx]

  if (quality === 'Diminished') {
    return roman.toLowerCase() + '°'
  }
  if (quality === 'Minor') {
    return roman.toLowerCase()
  }
  // Major
  return roman
}

export default ScalesCard
