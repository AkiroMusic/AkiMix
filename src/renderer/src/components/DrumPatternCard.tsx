/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Drum Pattern Generator Card
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * Displays genre-specific drum patterns as a visual grid (step sequencer).
 * Each row is a drum part (Kick, Snare, Hi-Hat, etc.), and each column is
 * a 16th-note step in a single 4/4 bar. Hits appear as filled circles, rests
 * as empty circles. A swing slider modifies the timing feel in real-time.
 *
 * HOW IT WORKS:
 * 1. User selects a genre from the pill buttons at the top.
 * 2. The drum grid renders a 10-row × 16-column matrix where:
 *    - Filled accent-colored circles = hit (drum sounds here)
 *    - Empty muted circles = rest (silent)
 *    - Orange-tinted circles = swung hit (timing shifted by swing amount)
 * 3. The swing slider (0-100%) calls applySwing() on the pattern's grid,
 *    marking offbeat 16th-note hits as swung.
 * 4. A legend explains the visual symbols.
 * 5. Metadata (BPM, swing%, ghost note chance) is displayed below the grid.
 *
 * GRID LAYOUT (10 rows × 16 columns):
 *   Each column = one 16th note in 4/4 time.
 *   Columns 0-3 = beat 1, 4-7 = beat 2, 8-11 = beat 3, 12-15 = beat 4.
 *   Row order: Kick, Snare, Hi-Hat, Open Hat, Clap, Rim, Tom, Crash, Ride, Percussion
 *
 * WHY THIS IS USEFUL:
 *   - Producers need visual reference for genre-typical drum patterns
 *   - The step-sequencer format maps directly to drum machines and DAW piano rolls
 *   - Swing visualization helps understand groove timing concepts
 *   - Beginners can see exactly "what makes a House beat vs a DnB beat"
 *
 * DATA SOURCE:
 * All drum pattern data comes from src/core/drumPatternGenerator.ts
 *   - getPattern(genre) → DrumPattern with 10×16 grid, velocity, BPM, swing, etc.
 *   - applySwing(grid, percent) → modifies odd-column hits to mark swing offset
 *   - GENRES → 16 supported genre names
 *   - DRUM_PARTS → 10 drum part names in grid row order
 *
 * RELATED COMPONENTS:
 * - SongStructureCard: arrangement structure reference
 * - BpmInputBar: tempo calculator and tap-tempo tool
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getPattern,
  applySwing,
  GENRES,
  DRUM_PARTS,
  type DrumPattern
} from '../../../core/drumPatternGenerator'
import {
  SUPERGENRE_ORDER,
  SUPERGENRE_I18N_KEY,
  type SuperGenre
} from '../../../core/genreTaxonomy'
import { getGenreLabel } from '../utils/genreLabel'
import Card from './Card'

// =============================================================================
// Drum Part Name → i18n Key Mapping
// =============================================================================
// Maps the 10 DRUM_PARTS names to their i18n translation key suffixes.
// 鼓部件名称与 i18n 键后缀映射。
// =============================================================================
const PART_I18N_MAP: Record<string, string> = {
  Kick: 'kick',
  Snare: 'snare',
  'Hi-Hat': 'hihat',
  'Open Hat': 'openHat',
  Clap: 'clap',
  Rim: 'rim',
  Tom: 'tom',
  Crash: 'crash',
  Ride: 'ride',
  Percussion: 'perc'
}

// =============================================================================
// Beat Marker Configuration
// =============================================================================
// 16th-note columns in a 4/4 bar. Used to render beat-number labels above the
// grid (显示每拍编号) so users can read patterns in musical time.
// =============================================================================
const BEAT_LABELS = ['1', 'e', '&', 'a', '2', 'e', '&', 'a', '3', 'e', '&', 'a', '4', 'e', '&', 'a']

/**
 * DrumPatternCard — Interactive drum pattern step-sequencer visualizer.
 *
 * Renders genre pills, a 10×16 drum grid with hit/rest/swung circles,
 * a swing slider that transforms the grid in real-time, pattern metadata,
 * and a legend. All state is local (no props, no external store).
 *
 * @returns JSX element with the drum pattern card UI
 *
 * @example
 *   // In the parent view router:
 *   {activeView === 'drumPattern' && <DrumPatternCard />}
 */
function DrumPatternCard(): JSX.Element {
  const { t } = useTranslation()

  // Currently selected genre — defaults to the first entry in array
  // 当前选中的节奏风格，默认为第一个曲风
  const [selectedGenre, setSelectedGenre] = useState<string>(GENRES[0]?.name ?? 'House')

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

  // Swing amount: 0 (straight/直拍) to 100 (maximum shuffle/最大摇摆)
  // Drives applySwing() to mark odd-column hits for timing offset
  const [swingAmount, setSwingAmount] = useState<number>(0)

  /**
   * Fetch the drum pattern for the selected genre.
   * Returns a full DrumPattern object with grid, velocity, parts, BPM, etc.
   * If the genre is invalid, getPattern returns null.
   */
  const pattern: DrumPattern | null = useMemo(
    () => getPattern(selectedGenre),
    [selectedGenre]
  )

  /**
   * Apply swing to the grid based on the slider value.
   * swingAmount=0 → no swing (返回原始网格)
   * swingAmount=50 → half the odd columns are marked
   * swingAmount=100 → all odd columns marked
   *
   * Swung hits are represented with value 2 in the grid, distinguishing them
   * from regular hits (value 1) and rests (value 0).
   */
  const displayGrid: number[][] | null = useMemo(() => {
    if (!pattern) return null
    return applySwing(pattern.grid, swingAmount)
  }, [pattern, swingAmount])

  /**
   * Handle genre pill click — resets swing amount to 0 for the new genre
   * so the user starts with the straight (uns swung) pattern.
   * 切换风格时重置摇摆量，让用户从直拍开始了解该风格的原始节奏。
   */
  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenre(genre)
    setSwingAmount(0)
  }, [])

  /**
   * Handle swing slider change — updates swing amount as user drags.
   * 用户拖动滑块时实时更新摇摆量。
   */
  const handleSwingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSwingAmount(Number(e.target.value))
    },
    []
  )

  return (
    <Card title={t('drumPattern.title')} subtitle={t('drumPattern.subtitle')}>
      {/* ===== Genre Selector Pills ===== */}
      {/* 风格选择器 — 标签样式排列所有节奏风格 */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          {t('drumPattern.selectGenre')}
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
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {genres.map((entry) => {
                const isActive = selectedGenre === entry.name
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
                    {getGenreLabel(t, entry.name)}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ===== Main Content: Pattern Grid ===== */}
      {/* 主体内容区：显示鼓节奏网格 */}
      {pattern && displayGrid ? (
        <>
          {/* ===== Pattern Metadata Header ===== */}
          {/* 节奏元数据 — BPM、摇摆量、鬼音符概率 */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              flexWrap: 'wrap'
            }}
          >
            {/* BPM */}
            <div>
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '2px'
                }}
              >
                BPM
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                {pattern.bpm}
              </span>
            </div>

            {/* Swing (from pattern default) */}
            <div>
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '2px'
                }}
              >
                {t('drumPattern.swing')}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                {swingAmount}%
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 400 }}>
                  {' '}({t('drumPattern.default', { defaultValue: 'default' })}: {pattern.swing}%)
                </span>
              </span>
            </div>

            {/* Ghost Note Chance */}
            <div>
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '2px'
                }}
              >
                {t('drumPattern.ghostNotes', { defaultValue: 'Ghost Notes' })}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                {pattern.ghostNoteChance}%
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 400 }}>
                  {' '}{t('drumPattern.chance', { defaultValue: 'chance' })}
                </span>
              </span>
            </div>
          </div>

          {/* ===== Drum Grid Container (scrollable) ===== */}
          {/* 鼓节奏网格 — 10行 × 16列的矩阵，水平可滚动 */}
          <div
            style={{
              marginBottom: 'var(--space-4)',
              overflowX: 'auto',
              overflowY: 'visible'
            }}
          >
            {/* Beat Number Labels Row */}
            {/* 节拍号 — 显示每拍的编号：1 e & a 2 e & a ... */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '90px repeat(16, 28px)',
                gap: '1px',
                marginBottom: '2px'
              }}
            >
              {/* Empty corner cell above row labels */}
              <div style={{ width: '90px' }} />
              {/* 16 columns for each 16th note */}
              {BEAT_LABELS.map((label, colIdx) => (
                <div
                  key={colIdx}
                  style={{
                    width: '28px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    color: colIdx % 4 === 0 ? 'var(--accent)' : 'var(--text-tertiary)',
                    fontWeight: colIdx % 4 === 0 ? 700 : 400,
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Drum Grid — rows for each drum part */}
            {/* 鼓节奏网格主体 — 每行代表一个鼓部件 */}
            {DRUM_PARTS.map((part, rowIdx) => {
              const partI18nKey = PART_I18N_MAP[part]
              const rowLabel = partI18nKey
                ? t(`drumPattern.elements.${partI18nKey}`)
                : part
              const gridRow = displayGrid[rowIdx]

              return (
                <div
                  key={part}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '90px repeat(16, 28px)',
                    gap: '1px',
                    marginBottom: '2px',
                    alignItems: 'center'
                  }}
                >
                  {/* Row label — drum part name */}
                  {/* 行标签 — 鼓部件名称 */}
                  <div
                    style={{
                      width: '90px',
                      paddingRight: 'var(--space-2)',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={part}
                  >
                    {rowLabel}
                  </div>

                  {/* 16 step cells for this drum part */}
                  {/* 该鼓部件对应的16个步进格子 */}
                  {gridRow.map((cellValue, colIdx) => {
                    // cellValue: 0 = rest (休止), 1 = hit (击打), 2 = swung hit (摇摆击打)
                    const isHit = cellValue === 1 || cellValue === 2
                    const isSwung = cellValue === 2
                    return (
                      <div
                        key={colIdx}
                        style={{
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor:
                            colIdx % 4 === 0
                              ? 'var(--surface-1)'
                              : 'var(--bg-base)',
                          border: '1px solid var(--border)',
                          transition: 'all var(--duration-hover) var(--ease-default)'
                        }}
                        title={`${part} — ${t('drumPattern.step', { defaultValue: 'Step' })} ${colIdx + 1}: ${isHit ? (isSwung ? t('drumPattern.swungHit', { defaultValue: 'Swung Hit' }) : t('drumPattern.hitName', { defaultValue: 'Hit' })) : t('drumPattern.restName', { defaultValue: 'Rest' })}`}
                      >
                        {isHit ? (
                          /* Filled circle for hits (击打用实心圆) */
                          <div
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: isSwung
                                ? 'var(--warning)' // Orange for swung hits (摇摆音用橙色)
                                : 'var(--accent)', // Blue/accent for regular hits (常规音用蓝色)
                              transition: 'background-color 150ms ease'
                            }}
                          />
                        ) : (
                          /* Empty circle for rests (休止用空心圆) */
                          <div
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              border: '1px solid var(--text-tertiary)',
                              opacity: 0.4
                            }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* ===== Swing Slider ===== */}
          {/* 摇摆滑块 — 控制摇摆量 (0-100%) */}
          <div
            style={{
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-2)'
              }}
            >
              <label
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}
              >
                {t('drumPattern.swing')}
              </label>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  color: 'var(--accent)',
                  fontWeight: 600
                }}
              >
                {swingAmount}%
              </span>
            </div>

            {/* Swing range slider — styled with CSS variable accent color */}
            {/* 范围滑块 — 使用 accent 色作为主题色 */}
            <input
              type="range"
              min={0}
              max={100}
              value={swingAmount}
              onChange={handleSwingChange}
              style={{
                width: '100%',
                accentColor: 'var(--accent)',
                cursor: 'pointer',
                height: '4px'
              }}
              aria-label={t('drumPattern.swing')}
            />

            {/* Slider endpoint labels */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '9px',
                color: 'var(--text-tertiary)',
                marginTop: '2px'
              }}
            >
              <span>0% — {t('drumPattern.straight', { defaultValue: 'Straight' })} (直拍)</span>
              <span>100% — {t('drumPattern.fullSwing', { defaultValue: 'Full Swing' })} (全摇摆)</span>
            </div>
          </div>

          {/* ===== Legend ===== */}
          {/* 图例 — 解释符号含义 */}
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              marginBottom: 'var(--space-4)'
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 'var(--space-2)'
              }}
            >
              {t('drumPattern.legend')}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}
            >
              {/* Hit (solid accent circle) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)'
                  }}
                />
                <span style={{ color: 'var(--text-primary)', fontSize: '11px' }}>
                  {t('drumPattern.hit')}
                </span>
              </div>

              {/* Swung hit (solid orange circle) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--warning)'
                  }}
                />
                <span style={{ color: 'var(--text-primary)', fontSize: '11px' }}>
                  {t('drumPattern.hit')} ({t('drumPattern.swung', { defaultValue: 'swung' })})
                </span>
              </div>

              {/* Rest (empty circle) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: '1px solid var(--text-tertiary)',
                    opacity: 0.4
                  }}
                />
                <span style={{ color: 'var(--text-primary)', fontSize: '11px' }}>
                  {t('drumPattern.rest')}
                </span>
              </div>
            </div>

            {/* Grid reading guide */}
            {/* 网格阅读指南 */}
            <div
              style={{
                marginTop: 'var(--space-2)',
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                lineHeight: 1.5,
                borderTop: '1px solid var(--border)',
                paddingTop: 'var(--space-2)'
              }}
            >
              {t('drumPattern.gridGuide', { defaultValue: 'Each column = one 16th note in 4/4 time.' })}{' '}
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                | 1 . . . | 2 . . . | 3 . . . | 4 . . . |
              </span>
            </div>
          </div>
        </>
      ) : (
        /* ===== Fallback: No pattern data available ===== */
        /* 后备展示 — 当没有节奏数据时显示提示信息 */
        <div
          style={{
            padding: 'var(--space-6)',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-tertiary)'
          }}
        >
          {t('eq.noData')}
        </div>
      )}
    </Card>
  )
}

export default DrumPatternCard
