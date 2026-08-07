/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * EQ Recommendations Card
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * Displays EQ (equalizer) frequency band recommendations for different mix
 * elements (kick, snare, vocals, etc.) across music genres. This helps
 * beginners know which frequencies to cut or boost when EQ'ing their mix.
 *
 * HOW IT WORKS:
 * 1. User selects a music genre from the dropdown (pop, rock, electronic, etc.)
 * 2. User clicks a mix element in the table (kick, snare, vocals, etc.)
 * 3. The component shows EQ band recommendations for that element in that genre
 * 4. Each band shows: frequency (Hz), gain (dB), Q-factor, and type (cut/boost)
 *
 * WHY THIS IS USEFUL:
 * EQ is the most common mixing tool, but beginners struggle to know which
 * frequencies to adjust. These presets provide a professional starting point
 * that can be refined by ear.
 *
 * DATA SOURCE:
 * All EQ data comes from src/core/eqRecommendations.ts
 *
 * RELATED COMPONENTS:
 * - MixLevelsCard: dB level recommendations (balance)
 * - LoudnessCard: LUFS loudness standards
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { desc } from '../i18n/desc'
import {
  GENRES,
  getGenreMixRecommendations,
  type Genre,
  type MixElement as EqMixElement
} from '../../../core/eqRecommendations'
import { getGenreLabel } from '../utils/genreLabel'
import Card from './Card'

function EqCard(): JSX.Element {
  const { t } = useTranslation()

  // State: currently selected genre and mix element
  const [selectedGenre, setSelectedGenre] = useState<Genre>('pop')
  const [selectedElement, setSelectedElement] = useState<EqMixElement>('kick')
  const [expandedElement, setExpandedElement] = useState<string | null>('kick')

  /**
   * Get the full genre mix data from the core module.
   * This is recalculated whenever the genre changes.
   */
  const genreMix = useMemo(
    () => getGenreMixRecommendations(selectedGenre),
    [selectedGenre]
  )

  /**
   * Get the specific EQ recommendation for the selected element.
   */
  const currentEq = useMemo(() => {
    if (!genreMix) return null
    return genreMix.elements.find((e) => e.element === selectedElement) ?? null
  }, [genreMix, selectedElement])

  /**
   * Handle genre selection change
   */
  const handleGenreChange = useCallback((genre: Genre) => {
    setSelectedGenre(genre)
    // Reset selection to first element when genre changes
    const mix = getGenreMixRecommendations(genre)
    if (mix && mix.elements.length > 0) {
      setSelectedElement(mix.elements[0].element)
      setExpandedElement(mix.elements[0].element)
    }
  }, [])

  /**
   * Handle element click in the table
   */
  const handleElementClick = useCallback((element: EqMixElement) => {
    setSelectedElement(element)
    setExpandedElement((prev) => (prev === element ? null : element))
  }, [])

  return (
    <Card title={t('eq.title')} subtitle={t('eq.subtitle')}>
      {/* ===== Genre Selector ===== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          {t('eq.selectGenre')}
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {GENRES.map((genre) => {
            const isActive = selectedGenre === genre.value
            return (
              <button
                key={genre.value}
                onClick={() => handleGenreChange(genre.value)}
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
                {getGenreLabel(t, genre.label)}
              </button>
            )
          })}
        </div>
      </div>

      {/* ===== EQ Recommendations Table ===== */}
      {genreMix && genreMix.elements.length > 0 ? (
        <div
          style={{
            borderRadius: 'var(--radius-md)',
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
            <span>{t('eq.element')}</span>
            <span>{t('eq.description')}</span>
          </div>

          {/* Table Rows — one per mix element */}
          {genreMix.elements.map((item) => {
            const isExpanded = expandedElement === item.element
            return (
              <div key={item.element}>
                {/* Clickable element row */}
                <div
                  onClick={() => handleElementClick(item.element)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? 'var(--surface-1)' : 'var(--bg-base)',
                    transition: 'background-color var(--duration-hover) var(--ease-default)'
                  }}
                >
                  <span
                    style={{
                      color: isExpanded ? 'var(--accent)' : 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: isExpanded ? 600 : 400
                    }}
                  >
                    {t(`eq.elements.${item.element}`)}
                  </span>
                  <span
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {desc(t, item.description)}
                  </span>
                </div>

                {/* Expanded EQ band details */}
                {isExpanded && (
                  <div
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      backgroundColor: 'var(--surface-2)',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    {/* EQ Band sub-header */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 60px 50px 60px',
                        gap: 'var(--space-2)',
                        padding: '0 0 var(--space-2) 0',
                        fontSize: '10px',
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 600
                      }}
                    >
                      <span>{t('eq.frequency')}</span>
                      <span>{t('eq.gain')}</span>
                      <span>Q</span>
                      <span>{t('eq.type')}</span>
                    </div>

                    {/* Individual EQ bands */}
                    {item.bands.map((band, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '80px 60px 50px 60px',
                          gap: 'var(--space-2)',
                          padding: 'var(--space-1) 0',
                          fontSize: '12px',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                          {band.frequency} Hz
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            color: band.gain > 0 ? 'var(--success)' : 'var(--error)'
                          }}
                        >
                          {band.gain > 0 ? '+' : ''}{band.gain} dB
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {band.q}
                        </span>
                        <span
                          style={{
                            color: band.type === 'boost' ? 'var(--success)' : band.type === 'cut' ? 'var(--error)' : 'var(--text-secondary)'
                          }}
                        >
                          {t(`eq.${band.type}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* Fallback when no data is available */
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
          {t('eq.noData')}
        </div>
      )}
    </Card>
  )
}

export default EqCard
