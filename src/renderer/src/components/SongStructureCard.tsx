/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Song Structure Templates Card
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * Displays song arrangement (编曲) structure templates for 22 music genres.
 * Each genre has a proven arrangement blueprint with section order, bar counts,
 * energy levels, BPM ranges, and suggested sonic elements for each section.
 *
 * HOW IT WORKS:
 * 1. User clicks a genre pill button at the top (pop, rock, house, techno, etc.)
 * 2. An overview panel shows the genre's BPM range, total bars, and typical
 *    duration in minutes.
 * 3. A sections table lists every arrangement section (Intro, Verse, Drop,
 *    Breakdown, etc.) with its bar count, energy level (1-10), description,
 *    and suggested production elements.
 * 4. An energy map at the bottom visualizes how energy rises/falls across the
 *    track as colored bars — green (low) → yellow (mid) → red (high).
 *
 * WHY THIS IS USEFUL:
 * Beginners often struggle with song arrangement — where to put the drop, how
 * long the breakdown should be, what elements to include in each section. This
 * component gives a proven structural blueprint for each genre that can be used
 * as a starting point for production.
 * 编曲是音乐制作中最具挑战性的环节之一。本组件为22种音乐风格提供标准化的
 * 编曲模板，帮助初学者快速理解并搭建完整的歌曲框架。
 *
 * DATA SOURCE:
 * All structure data comes from src/core/songStructure.ts
 *   - getStructure(genre) → SongStructure with sections, totalBars, bpmRange
 *   - getEnergyMap(genre) → EnergyMapEntry[] with per-section energy levels
 *
 * RELATED COMPONENTS:
 * - DrumPatternCard: drum pattern grid visualizer (rhythm foundation)
 * - ChordProgressionsCard: harmonic structure reference
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { desc } from '../i18n/desc'
import {
  getStructure,
  getEnergyMap,
  GENRES,
  type SongStructure,
  type EnergyMapEntry
} from '../../../core/songStructure'
import {
  SUPERGENRE_ORDER,
  SUPERGENRE_I18N_KEY,
  type SuperGenre
} from '../../../core/genreTaxonomy'
import { getGenreLabel } from '../utils/genreLabel'
import Card from './Card'

/**
 * Helper: map energy level (1-10) to a CSS color string.
 * Low energy (1-3) → green tones
 * Medium energy (4-7) → yellow/amber tones
 * High energy (8-10) → red tones
 *
 * This creates a visually intuitive heat-map effect so users can immediately
 * see which sections have the most intensity.
 *
 * @param energy - Energy level from 1 (lowest) to 10 (highest)
 * @returns CSS color string (e.g. 'rgb(25, 230, 80)')
 */
function getEnergyColor(energy: number): string {
  // Normalize energy to 0-1 range
  const ratio = Math.max(0, Math.min(1, (energy - 1) / 9))
  // Interpolate: green (0,255,80) → yellow (255,255,80) → red (255,50,50)
  const r = Math.round(ratio * 255)
  const g = Math.round((1 - ratio) * 200 + 55)
  return `rgb(${r}, ${g}, 80)`
}

// =============================================================================
// SongStructureCard Component
// =============================================================================

/**
 * SongStructureCard — Interactive song arrangement structure reference.
 *
 * Renders genre selector pills, a structure overview panel, a section table
 * with bar counts and energy bars, and a colored energy-map strip showing
 * how intensity evolves across the track.
 *
 * @returns JSX element with the full song structure card UI
 *
 * @example
 *   // In the parent view router:
 *   {activeView === 'songStructure' && <SongStructureCard />}
 */
function SongStructureCard(): JSX.Element {
  const { t } = useTranslation()

  // Currently selected genre — defaults to the first genre in the GENRES array
  // 当前选中的音乐风格，默认为 genres 数组的第一个
  const [selectedGenre, setSelectedGenre] = useState<string>(GENRES[0]?.name ?? 'House')

  /**
   * Group genres by super-genre family for hierarchical pill display.
   * Uses the canonical SUPERGENRE_ORDER for deterministic group ordering.
   * 按超类流派分组展示曲风标签，使用标准的超类顺序排列。
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
   * Fetch the full arrangement structure for the selected genre.
   * Returns sections with bar lengths, energy levels, descriptions, and elements.
   * Recomputes whenever selectedGenre changes.
   */
  const structure: SongStructure = useMemo(
    () => getStructure(selectedGenre),
    [selectedGenre]
  )

  /**
   * Fetch the energy map — an array of { section, barRange, energy } entries
   * used to render the energy visualization strip at the bottom.
   * Bar ranges are cumulative (e.g. '1-32', '33-48').
   */
  const energyMap: EnergyMapEntry[] = useMemo(
    () => getEnergyMap(selectedGenre),
    [selectedGenre]
  )

  return (
    <Card title={t('songStructure.title')} subtitle={t('songStructure.subtitle')}>
      {/* ===== Genre Selector Pills ===== */}
      {/* 风格选择器 — 使用标签（pill）样式按钮排列所有风格 */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          {t('songStructure.selectGenre')}
        </label>
        {/* Grouped genre pills by super-genre family */}
        {/* 按超类流派分组展示曲风标签 */}
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
                    onClick={() => setSelectedGenre(entry.name)}
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

      {/* ===== Main Content: Show structure data when available ===== */}
      {/* 主要内容区：当有结构数据时展示详细信息 */}
      {structure.sections.length > 0 ? (
        <>
          {/* ===== Section 1: Structure Overview ===== */}
          {/* 结构化概览 — 显示曲风名称、BPM 范围、总小节数和总时长 */}
          <div
            style={{
              marginBottom: 'var(--space-4)'
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              {t('songStructure.overview')}
            </label>
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                flexWrap: 'wrap'
              }}
            >
              {/* Genre Name */}
              <div style={{ flex: '1 1 120px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    marginBottom: 'var(--space-1)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {t('songStructure.genre')}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}
                >
                  {getGenreLabel(t, selectedGenre)}
                </div>
              </div>

              {/* BPM Range */}
              <div style={{ flex: '1 1 100px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    marginBottom: 'var(--space-1)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {t('songStructure.bpm')}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                >
                  {structure.bpmRange || '—'}
                </div>
              </div>

              {/* Total Bars */}
              <div style={{ flex: '1 1 80px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    marginBottom: 'var(--space-1)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {t('songStructure.bars')}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                >
                  {structure.totalBars > 0 ? structure.totalBars : '—'}
                </div>
              </div>

              {/* Typical Duration */}
              <div style={{ flex: '1 1 100px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    marginBottom: 'var(--space-1)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {t('songStructure.duration')}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                >
                  {structure.typicalTotalMinutes || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* ===== Section 2: Sections Table ===== */}
          {/* 段落表格 — 显示每个段落的名称、小节数、能量条和配器建议 */}
          <div
            style={{
              marginBottom: 'var(--space-4)'
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              {t('songStructure.sections')}
            </label>
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
                  gridTemplateColumns: '100px 50px 60px 1fr',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--surface-1)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '10px',
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  alignItems: 'center'
                }}
              >
                <span>{t('songStructure.section')}</span>
                <span>{t('songStructure.bars')}</span>
                <span>{t('songStructure.energy')}</span>
                <span>{t('songStructure.description')}</span>
              </div>

              {/* Table Rows — one per arrangement section */}
              {structure.sections.map((section, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 50px 60px 1fr',
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom:
                      idx < structure.sections.length - 1
                        ? '1px solid var(--border)'
                        : 'none',
                    fontSize: '12px',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-base)',
                    transition: 'background-color 100ms ease'
                  }}
                >
                  {/* Section Name */}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent)',
                      fontWeight: 500,
                      fontSize: '12px'
                    }}
                  >
                    {desc(t, section.name)}
                  </span>

                  {/* Bar Count (0 means variable length, e.g. Classical) */}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                      fontSize: '12px'
                    }}
                  >
                    {section.bars > 0 ? section.bars : '—'}
                  </span>

                  {/* Energy Bar — visual indicator 1-10 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-1)'
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '6px',
                        borderRadius: '3px',
                        backgroundColor: 'var(--surface-2)',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                    >
                      <div
                        style={{
                          width: `${(section.energy / 10) * 100}%`,
                          height: '100%',
                          borderRadius: '3px',
                          backgroundColor: getEnergyColor(section.energy),
                          transition: 'width 300ms ease'
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--text-tertiary)'
                      }}
                    >
                      {section.energy}/10
                    </span>
                  </div>

                  {/* Description + suggested elements */}
                  <div>
                    <span
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        lineHeight: 1.4,
                        display: 'block'
                      }}
                    >
                      {desc(t, section.description)}
                    </span>
                    {/* Show suggested elements as small tag-style text */}
                    {section.elements.length > 0 && (
                      <span
                        style={{
                          color: 'var(--text-tertiary)',
                          fontSize: '10px',
                          fontStyle: 'italic',
                          display: 'block',
                          marginTop: '2px'
                        }}
                      >
                        {/* Key elements like "Kick · Hi-hats · Filtered pad" */}
                        {section.elements.map((el) => desc(t, el)).join(' · ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== Section 3: Energy Map Visualization ===== */}
          {/* 能量映射可视化 — 用彩色条带展示能量在全曲中的变化趋势 */}
          <div
            style={{
              marginBottom: 'var(--space-4)'
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              {t('songStructure.energyMap')}
            </label>

            {/* Energy bar strip — each segment is one section */}
            <div
              style={{
                display: 'flex',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '1px solid var(--border)'
              }}
            >
              {energyMap.map((entry, idx) => {
                // Each section gets equal visual space in the strip,
                // labeled with its energy number (1-10)
                const widthPercent = 100 / energyMap.length
                const bgColor = getEnergyColor(entry.energy)
                return (
                  <div
                    key={idx}
                    style={{
                      flex: `${widthPercent} 0 auto`,
                      width: `${widthPercent}%`,
                      backgroundColor: bgColor,
                      opacity: 0.85,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: entry.energy > 5 ? '#fff' : 'var(--text-primary)',
                      borderRight:
                        idx < energyMap.length - 1
                          ? '1px solid rgba(0,0,0,0.15)'
                          : 'none',
                      transition: 'background-color 300ms ease'
                    }}
                    title={`${desc(t, entry.section)}: Energy ${entry.energy}/10 (${entry.barRange})`}
                  >
                    {entry.energy}
                  </div>
                )
              })}
            </div>

            {/* Section labels below the energy bar */}
            <div
              style={{
                display: 'flex',
                marginTop: '4px',
                fontSize: '9px',
                color: 'var(--text-tertiary)'
              }}
            >
              {energyMap.map((entry, idx) => (
                <span
                  key={idx}
                  style={{
                    flex: `${100 / energyMap.length} 0 auto`,
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    padding: '0 2px'
                  }}
                  title={desc(t, entry.section)}
                >
                  {desc(t, entry.section)}
                </span>
              ))}
            </div>

            {/* Bar range labels (e.g. 1-32, 33-48) */}
            <div
              style={{
                display: 'flex',
                marginTop: '2px',
                fontSize: '8px',
                color: 'var(--text-tertiary)',
                opacity: 0.7
              }}
            >
              {energyMap.map((entry, idx) => (
                <span
                  key={idx}
                  style={{
                    flex: `${100 / energyMap.length} 0 auto`,
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    padding: '0 2px',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {entry.barRange}
                </span>
              ))}
            </div>

            {/* Energy scale reference */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 'var(--space-2)',
                fontSize: '9px',
                color: 'var(--text-tertiary)',
                padding: '0 2px'
              }}
            >
              <span style={{ color: getEnergyColor(1) }}>● {t('songStructure.energyLow')} (1)</span>
              <span style={{ color: getEnergyColor(5) }}>● {t('songStructure.energyMid')} (5)</span>
              <span style={{ color: getEnergyColor(10) }}>● {t('songStructure.energyHigh')} (10)</span>
            </div>
          </div>
        </>
      ) : (
        /* ===== Fallback: No data available ===== */
        /* 后备展示 — 当所选风格没有结构数据时显示提示信息 */
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

export default SongStructureCard
