/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * LUFS Loudness Standards Card
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * Displays loudness standards (LUFS / True Peak) for different streaming
 * platforms and delivery formats. Includes:
 *   - Integrated LUFS targets per platform
 *   - True Peak limits
 *   - Short-term LUFS ranges
 *   - Loudness Range (LRA) values
 *   - Genre-specific loudness recommendations
 *
 * WHY THIS IS USEFUL:
 * Different platforms normalize audio to different loudness levels. A track
 * that sounds great in your DAW may be too quiet on Spotify or distorted on
 * YouTube. Use this reference to target the right loudness for each platform.
 *
 * KEY CONCEPT — LOUDNESS NORMALIZATION:
 * Streaming services like Spotify and YouTube don't play your file at its
 * original volume. They measure the average loudness (LUFS) and adjust
 * playback gain so all songs sound equally loud. If you master too loud,
 * your track gets turned DOWN and may distort. If too quiet, it gets turned
 * UP and may reveal noise floor issues.
 *
 * RULE OF THUMB:
 *   - Master to -14 LUFS integrated = works everywhere
 *   - True peak should NEVER exceed -1dBTP
 *   - For EDM/electronic: -8 to -10 LUFS (expect louder)
 *   - For classical/jazz: -18 to -22 LUFS (expect quieter)
 *
 * DATA SOURCE:
 * All loudness data comes from src/core/loudnessStandards.ts
 *
 * RELATED COMPONENTS:
 * - EqCard: EQ frequency recommendations
 * - MixLevelsCard: dB level recommendations for mix balance
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { desc } from '../i18n/desc'
import {
  getAllTargets,
  getGenreLoudnessRecommendation,
  LOUDNESS_CATEGORIES,
  type Platform
} from '../../../core/loudnessStandards'
import Card from './Card'

/**
 * Color bar component showing a visual LUFS scale.
 * The darker the color, the louder the target.
 */
function LufsBar({ value, maxValue = -8 }: { value: number; maxValue?: number }): JSX.Element {
  // Calculate fill percentage (more negative = less fill)
  const min = -30
  const percent = ((value - min) / (maxValue - min)) * 100
  const clampedPercent = Math.max(0, Math.min(100, percent))

  return (
    <div
      style={{
        width: '100%',
        height: '6px',
        backgroundColor: 'var(--surface-2)',
        borderRadius: '3px',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: `${clampedPercent}%`,
          height: '100%',
          borderRadius: '3px',
          background: value >= -10
            ? 'var(--error)'
            : value >= -14
              ? 'var(--accent)'
              : value >= -18
                ? 'var(--success)'
                : 'var(--text-tertiary)',
          transition: 'width 200ms ease'
        }}
      />
    </div>
  )
}

function LoudnessCard(): JSX.Element {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [lufsInput, setLufsInput] = useState('-14')
  const [loudnessGenre, setLoudnessGenre] = useState('pop')

  /**
   * Get all platform targets from the core module.
   */
  const allTargets = useMemo(() => getAllTargets(), [])

  /**
   * Filter targets by selected category.
   */
  const filteredTargets = useMemo(() => {
    if (selectedCategory === 'all') return allTargets.all
    return allTargets.all.filter(
      (p) => p.category === selectedCategory
    )
  }, [allTargets, selectedCategory])

  /**
   * Get genre-specific loudness recommendation.
   */
  const genreRec = useMemo(
    () => getGenreLoudnessRecommendation(loudnessGenre),
    [loudnessGenre]
  )

  return (
    <Card title={t('loudness.title')} subtitle={t('loudness.subtitle')}>

      {/* ===== Category Filter ===== */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '4px 10px',
            border: `1px solid ${selectedCategory === 'all' ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: selectedCategory === 'all' ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
            color: selectedCategory === 'all' ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit'
          }}
        >
          {t('loudness.all')}
        </button>
        {LOUDNESS_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.value
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
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
              {t(`loudness.categories.${cat.value}`)}
            </button>
          )
        })}
      </div>

      {/* ===== Platform Targets Table ===== */}
      <div
        style={{
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          marginBottom: 'var(--space-6)'
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 80px 80px 80px 1fr',
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
          <span>{t('loudness.platform')}</span>
          <span>{t('loudness.integrated')}</span>
          <span>{t('loudness.truePeak')}</span>
          <span>{t('loudness.shortTerm')}</span>
          <span>{t('loudness.description')}</span>
        </div>

        {/* Data Rows */}
        {filteredTargets.map((target) => (
          <div
            key={target.platform}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 80px 80px 80px 1fr',
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: '1px solid var(--border)',
              fontSize: '12px',
              alignItems: 'center',
              backgroundColor: 'var(--bg-base)'
            }}
          >
            {/* Platform name */}
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '13px' }}>
              {target.label}
            </span>

            {/* Integrated LUFS with visual bar */}
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  color: target.integratedLufs >= -10 ? 'var(--error)' : target.integratedLufs >= -14 ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  display: 'block'
                }}
              >
                {target.integratedLufs} LUFS
              </span>
              <LufsBar value={target.integratedLufs} />
            </div>

            {/* True Peak */}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color: target.truePeak > -1 ? 'var(--error)' : 'var(--text-secondary)',
                fontSize: '12px'
              }}
            >
              {target.truePeak} dBTP
            </span>

            {/* Short-term LUFS */}
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '11px' }}>
              {target.shortTermLufs}
            </span>

            {/* Description */}
            <span style={{ color: 'var(--text-tertiary)', fontSize: '11px', lineHeight: 1.4 }}>
              {desc(t, target.description)}
            </span>
          </div>
        ))}
      </div>

      {/* ===== Genre-Specific Loudness Recommendations ===== */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--border)',
          marginBottom: 'var(--space-6)'
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-3)',
            fontWeight: 500
          }}
        >
          {t('loudness.genreRec')}
        </h3>

        {/* Genre selector for loudness */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          {['pop', 'rock', 'electronic', 'hiphop', 'jazz', 'classical', 'metal', 'rnb', 'country', 'latin'].map(
            (genre) => {
              const isActive = loudnessGenre === genre
              return (
                <button
                  key={genre}
                  onClick={() => setLoudnessGenre(genre)}
                  style={{
                    padding: '3px 10px',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'inherit',
                    textTransform: 'capitalize'
                  }}
                >
                  {t(`loudness.genres.${genre}`, { defaultValue: genre })}
                </button>
              )
            }
          )}
        </div>

        {/* Recommendation display */}
        <div
          style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {t('loudness.target')}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '24px',
                color: 'var(--accent)',
                fontWeight: 700
              }}
            >
              {genreRec.recommendedLufs} LUFS
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              ({t('loudness.range')}: {genreRec.range})
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {desc(t, genreRec.description)}
          </div>
        </div>
      </div>

      {/* ===== Simple LUFS Check Tool ===== */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--border)'
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-3)',
            fontWeight: 500
          }}
        >
          {t('loudness.checkTitle')}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
          {t('loudness.checkDesc')}
        </p>

        {/* Input: LUFS value + Platform selector */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <input
              type="number"
              value={lufsInput}
              onChange={(e) => setLufsInput(e.target.value)}
              step={0.1}
              min={-30}
              max={0}
              style={{
                width: '80px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontFamily: 'var(--font-mono)',
                textAlign: 'center',
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>LUFS</span>
          </div>

          {/* Results for major platforms */}
          {['spotify', 'appleMusic', 'youtube', 'broadcastTV'].map((platform) => {
            const numLufs = parseFloat(lufsInput)
            const isClose = !isNaN(numLufs)
            const target = allTargets.all.find(
              (t) => t.platform === (platform as Platform)
            )
            if (!target) return null

            const diff = isClose ? numLufs - target.integratedLufs : 0
            const isGood = isClose && Math.abs(diff) <= 1.5

            return (
              <div
                key={platform}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isNaN(numLufs) ? 'var(--surface-2)' : isGood ? 'rgba(79, 174, 138, 0.1)' : 'rgba(217, 105, 95, 0.1)',
                  border: `1px solid ${isNaN(numLufs) ? 'var(--border)' : isGood ? 'var(--success)' : 'var(--error)'}`,
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {target.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {target.integratedLufs} LUFS
                </div>
                {isClose && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: isGood ? 'var(--success)' : 'var(--error)',
                      marginTop: '2px'
                    }}
                  >
                    {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} dB
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

export default LoudnessCard
