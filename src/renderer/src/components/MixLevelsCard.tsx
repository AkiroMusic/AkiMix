/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Mix Element Levels Card
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * Displays recommended dB level ranges for each element in a mix (kick, snare,
 * vocals, bass, etc.). Elements are grouped by category (Drums, Bass, Vocals,
 * Instruments, FX, Master) for easy reference.
 *
 * HOW IT WORKS:
 * 1. User selects a genre from the dropdown
 * 2. The component displays a table of all mix elements with their dB ranges
 * 3. Each element shows: name, min dB, max dB, priority, and mixing tip
 * 4. Genre adjustments shift the levels up/down (e.g., hip-hop = louder bass)
 *
 * dB LEVEL GUIDE:
 *   -  0dB  = Absolute maximum (never go above except on master with limiter)
 *   - -6dB  = Standard kick drum peak level (good mix foundation)
 *   - -12dB = Average instrument level
 *   - -18dB = Background/ambient level
 *   - -24dB = Very quiet, subtle texture
 *   - -inf  = Silence
 *
 * DATA SOURCE:
 * All level data comes from src/core/mixLevels.ts
 *
 * RELATED COMPONENTS:
 * - EqCard: EQ frequency recommendations
 * - LoudnessCard: LUFS loudness standards
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { desc } from '../i18n/desc'
import { getMixLevels, MIX_GROUPS, type MixGroup } from '../../../core/mixLevels'
import Card from './Card'

/**
 * Color mapping for element priority.
 * Critical = red/accent, Important = yellow, Supplementary = subtle
 */
const PRIORITY_COLORS: Record<string, string> = {
  critical: 'var(--accent)',
  important: '#FFA500',
  supplementary: 'var(--text-tertiary)'
}

function MixLevelsCard(): JSX.Element {
  const { t } = useTranslation()
  const [selectedGroup, setSelectedGroup] = useState<MixGroup | 'all'>('all')

  /**
   * Genre options for the selector.
   * Matches the same genres used by the EQ module.
   */
  const genres = useMemo(
    () => [
      { value: 'pop', label: t('levels.genres.pop') },
      { value: 'rock', label: t('levels.genres.rock') },
      { value: 'electronic', label: t('levels.genres.electronic') },
      { value: 'hiphop', label: t('levels.genres.hiphop') },
      { value: 'jazz', label: t('levels.genres.jazz') },
      { value: 'classical', label: t('levels.genres.classical') },
      { value: 'metal', label: t('levels.genres.metal') },
      { value: 'rnb', label: t('levels.genres.rnb') },
      { value: 'country', label: t('levels.genres.country') },
      { value: 'latin', label: t('levels.genres.latin') }
    ],
    [t]
  )

  const [selectedGenre, setSelectedGenre] = useState('pop')

  /**
   * Fetch mix levels from the core module.
   * Automatically recalculates when genre changes.
   */
  const levels = useMemo(() => getMixLevels(selectedGenre), [selectedGenre])

  /**
   * Filter elements by the selected group.
   * When 'all' is selected, show everything.
   */
  const filteredElements = useMemo(() => {
    if (selectedGroup === 'all') return levels.all
    return levels.all.filter((e) => e.group === selectedGroup)
  }, [levels, selectedGroup])

  /**
   * Get the "level bar" visual representation.
   * Returns a percentage position within the -30 to 0dB range.
   */
  const getLevelPosition = useCallback((db: number): number => {
    // Map dB range (-30 to 0) to 0-100%
    const clamped = Math.max(-30, Math.min(0, db))
    return ((clamped + 30) / 30) * 100
  }, [])

  return (
    <Card title={t('levels.title')} subtitle={t('levels.subtitle')}>

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
          {t('levels.selectGenre')}
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {genres.map((genre) => {
            const isActive = selectedGenre === genre.value
            return (
              <button
                key={genre.value}
                onClick={() => setSelectedGenre(genre.value)}
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
                {genre.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ===== Group Filter Tabs ===== */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {/* "All" tab */}
        <button
          onClick={() => setSelectedGroup('all')}
          style={{
            padding: '4px 10px',
            border: `1px solid ${selectedGroup === 'all' ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: selectedGroup === 'all' ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
            color: selectedGroup === 'all' ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit'
          }}
        >
          {t('levels.all')}
        </button>

        {/* Individual group tabs */}
        {MIX_GROUPS.map((group) => {
          const isActive = selectedGroup === group.value
          return (
            <button
              key={group.value}
              onClick={() => setSelectedGroup(group.value as MixGroup)}
              style={{
                padding: '4px 10px',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'inherit'
              }}
            >
              {t(`levels.groups.${group.value}`)}
            </button>
          )
        })}
      </div>

      {/* ===== dB Legend Scale Bar ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 var(--space-4) var(--space-1) var(--space-4)',
          fontSize: '9px',
          color: 'var(--text-tertiary)',
          letterSpacing: '0.3px'
        }}
      >
        <span>-30 dB</span>
        <span>-20 dB</span>
        <span>-10 dB</span>
        <span>0 dB</span>
      </div>
      <div
        style={{
          height: '4px',
          borderRadius: '2px',
          marginBottom: 'var(--space-4)',
          background: 'linear-gradient(to right, var(--text-tertiary), var(--success), var(--accent), var(--error))',
          opacity: 0.3
        }}
      />

      {/* ===== Levels Table ===== */}
      {filteredElements.length > 0 ? (
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
              gridTemplateColumns: '120px 60px 60px 1fr',
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
            <span>{t('levels.element')}</span>
            <span>{t('levels.minDb')}</span>
            <span>{t('levels.maxDb')}</span>
            <span>{t('levels.tip')}</span>
          </div>

          {/* Data rows */}
          {filteredElements.map((entry) => (
            <div
              key={entry.element}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 60px 60px 1fr',
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: '1px solid var(--border)',
                fontSize: '13px',
                alignItems: 'center',
                backgroundColor: 'var(--bg-base)',
                position: 'relative'
              }}
            >
              {/* Element name with priority color indicator */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
              >
                {t(`levels.elements.${entry.element}`)}
              </span>

              {/* Minimum dB value */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  color: entry.minDb < -20 ? 'var(--text-tertiary)' : entry.minDb < -10 ? 'var(--text-secondary)' : 'var(--accent)',
                  fontWeight: entry.minDb >= -10 ? 600 : 400
                }}
              >
                {entry.minDb} dB
              </span>

              {/* Maximum dB value */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  color: entry.maxDb < -10 ? 'var(--text-secondary)' : entry.maxDb < -3 ? 'var(--accent)' : 'var(--error)',
                  fontWeight: entry.maxDb >= -6 ? 600 : 400
                }}
              >
                {entry.maxDb} dB
              </span>

              {/* Mixing tip column */}
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {desc(t, entry.description)}
                </span>
                {/* Priority badge */}
                <span
                  style={{
                    display: 'inline-block',
                    marginLeft: 'var(--space-2)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    backgroundColor: `${PRIORITY_COLORS[entry.priority]}20`,
                    color: PRIORITY_COLORS[entry.priority],
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t(`levels.priority.${entry.priority}`)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
          {t('levels.noData')}
        </div>
      )}

      {/* ===== dB Reference Guide ===== */}
      <div
        style={{
          marginTop: 'var(--space-6)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--border)',
          fontSize: '12px',
          lineHeight: 1.6
        }}
      >
        <div
          style={{
            marginBottom: 'var(--space-2)',
            color: 'var(--text-secondary)',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {t('levels.quickGuide')}
        </div>
        <div style={{ color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>0 dB</span>
          <span style={{ color: 'var(--text-secondary)' }}> = {t('levels.guide.zero')}</span>
          <br />
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>-6 dB</span>
          <span style={{ color: 'var(--text-secondary)' }}> = {t('levels.guide.six')}</span>
          <br />
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>-12 dB</span>
          <span style={{ color: 'var(--text-secondary)' }}> = {t('levels.guide.twelve')}</span>
          <br />
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>-18 dB</span>
          <span style={{ color: 'var(--text-secondary)' }}> = {t('levels.guide.eighteen')}</span>
          <br />
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>-24 dB</span>
          <span style={{ color: 'var(--text-secondary)' }}> = {t('levels.guide.twentyfour')}</span>
        </div>
      </div>
    </Card>
  )
}

export default MixLevelsCard
