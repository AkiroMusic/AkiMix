/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Filter Calculator Card
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * Provides interactive synthesizer filter calculations for sound design.
 * This helps producers dial in filter settings by converting between cutoff
 * frequencies and musical notes, calculating Q resonance, exploring filter
 * slopes, and visualizing filter envelope shapes.
 *
 * HOW IT WORKS:
 * 1. Cutoff → Note Converter: input a cutoff frequency in Hz → see the
 *    nearest musical note name and MIDI note number
 * 2. Q → Resonance: input a Q factor → see the resonance boost in dB at
 *    the cutoff frequency
 * 3. Slope Info Table: compare 6dB/12dB/24dB/48dB per-octave slopes with
 *    pole count and descriptions
 * 4. Filter Envelope Visualizer: adjust ADSR sliders → see the envelope
 *    shape as a visual bar chart
 *
 * WHY THIS IS USEFUL:
 * Synth filter design is central to subtractive synthesis. These tools help:
 * - Set filter cutoff to a specific musical key for melodic resonance sweeps
 * - Understand Q factor / resonance relationships (Butterworth, TB-303, etc.)
 * - Choose the right filter slope for the desired character
 * - Design filter envelope shapes visually
 *
 * DATA SOURCE:
 * All calculation functions come from src/core/filterCalculator.ts
 *
 * RELATED COMPONENTS:
 * - OscillatorCard: detune, unison, FM, sub-oscillator calculations
 * - ModulationCard: LFO rates, modulation routing, ADSR envelopes
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { desc } from '../i18n/desc'
import {
  cutoffToNote,
  qToResonance,
  slopeInfo,
  filterEnvelopePoints
} from '../../../core/filterCalculator'
import Card from './Card'

/**
 * Filter slope types — the four standard attenuation rates used in
 * analog and digital synthesizer filters. Each doubles the steepness
 * by adding more filter poles.
 */
const SLOPE_TYPES: Array<'6dB' | '12dB' | '24dB' | '48dB'> = ['6dB', '12dB', '24dB', '48dB']

/**
 * Filter type definitions for the reference table.
 * Each describes a classic filter response curve.
 */
const FILTER_TYPES: Array<{ key: string; i18nKey: string }> = [
  { key: 'lowPass', i18nKey: 'filter.types.lowPass' },
  { key: 'highPass', i18nKey: 'filter.types.highPass' },
  { key: 'bandPass', i18nKey: 'filter.types.bandPass' },
  { key: 'notch', i18nKey: 'filter.types.notch' },
  { key: 'peak', i18nKey: 'filter.types.peak' },
  { key: 'allPass', i18nKey: 'filter.types.allPass' }
]

function FilterCard(): JSX.Element {
  const { t } = useTranslation()

  // ===== Cutoff → Note input =====
  const [cutoffHz, setCutoffHz] = useState(440)

  // ===== Q → Resonance input =====
  const [qFactor, setQFactor] = useState(0.707)

  // ===== Envelope ADSR inputs =====
  const [envAttack, setEnvAttack] = useState(50)
  const [envDecay, setEnvDecay] = useState(200)
  const [envSustain, setEnvSustain] = useState(50)
  const [envRelease, setEnvRelease] = useState(300)

  // ===== Collapsible sections =====
  const [openSection, setOpenSection] = useState<string | null>(null)

  /**
   * Result of cutoff to note conversion.
   * Shows nearest note name, MIDI number, and the input frequency.
   */
  const noteResult = useMemo(() => cutoffToNote(cutoffHz), [cutoffHz])

  /**
   * Result of Q to resonance conversion.
   * Shows the dB boost at the filter cutoff frequency.
   */
  const resonanceDb = useMemo(() => qToResonance(qFactor), [qFactor])

  /**
   * Envelope point values for visual bar chart.
   * Generates 20 points for a smooth-enough envelope curve.
   */
  const envelopePoints = useMemo(
    () => filterEnvelopePoints(envAttack, envDecay, envSustain / 100, envRelease, 20),
    [envAttack, envDecay, envSustain, envRelease]
  )

  /**
   * Toggle a collapsible section open/closed.
   */
  const toggleSection = useCallback((section: string) => {
    setOpenSection((prev) => (prev === section ? null : section))
  }, [])

  return (
    <Card title={t('filter.title')} subtitle={t('filter.subtitle')}>

      {/* ===== Cutoff → Note Converter ===== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          {t('filter.cutoffToNote')}
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              {t('filter.cutoff')}
            </label>
            <input
              type="number"
              value={cutoffHz}
              onChange={(e) => setCutoffHz(Number(e.target.value))}
              min={1}
              max={20000}
              style={{
                width: '100px',
                padding: '6px 10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                outline: 'none',
                fontSize: '13px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              {t('filter.note')}
            </label>
            <div
              style={{
                padding: '6px 10px',
                backgroundColor: 'var(--surface-2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                fontSize: '16px',
                fontWeight: 600,
                minWidth: '60px',
                textAlign: 'center'
              }}
            >
              {noteResult.note}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              {t('filter.midi')}
            </label>
            <div
              style={{
                padding: '6px 10px',
                backgroundColor: 'var(--surface-2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                minWidth: '60px',
                textAlign: 'center'
              }}
            >
              {noteResult.midi >= 0 ? noteResult.midi : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Q → Resonance Converter ===== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          {t('filter.qToResonance')}
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              {t('filter.q')}
            </label>
            <input
              type="number"
              value={qFactor}
              onChange={(e) => setQFactor(Number(e.target.value))}
              min={0}
              max={100}
              step={0.1}
              style={{
                width: '100px',
                padding: '6px 10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                outline: 'none',
                fontSize: '13px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              {t('filter.resonance')}
            </label>
            <div
              style={{
                padding: '6px 10px',
                backgroundColor: 'var(--surface-2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
                color: resonanceDb > 0 ? 'var(--accent)' : 'var(--text-tertiary)',
                fontSize: '13px',
                minWidth: '100px',
                textAlign: 'center'
              }}
            >
              {resonanceDb > 0 ? `+${resonanceDb.toFixed(2)} dB` : '0 dB (flat)'}
            </div>
          </div>
        </div>
        {/* Q reference hints */}
        <div style={{ marginTop: 'var(--space-2)', fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
          <span>Q=0.707 (Butterworth) → 0 dB &nbsp;|&nbsp; Q=1.0 → ~3 dB &nbsp;|&nbsp; Q=1.3 (TB-303) → ~4.3 dB &nbsp;|&nbsp; Q=10 → ~20 dB</span>
        </div>
      </div>

      {/* ===== Section: Slope Info ===== */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button
          onClick={() => toggleSection('slope')}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: openSection === 'slope' ? 'var(--surface-1)' : 'transparent',
            color: openSection === 'slope' ? 'var(--accent)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            textAlign: 'left',
            transition: 'all var(--duration-spring) var(--ease-spring)'
          }}
        >
          {openSection === 'slope' ? '▼ ' : '▶ '}
          {t('filter.slope')}
        </button>
        {openSection === 'slope' && (
          <div
            style={{
              padding: 'var(--space-4)',
              border: '1px solid var(--border)',
              borderTop: 'none',
              borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
              backgroundColor: 'var(--surface-1)'
            }}
          >
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
              {t('filter.slopeInfo')}
            </p>
            {/* Slope characteristics table */}
            <div style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 60px 1fr',
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--surface-2)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <span>{t('filter.slope')}</span>
                <span>{t('filter.attenuation')}</span>
                <span>{t('filter.description')}</span>
              </div>
              {SLOPE_TYPES.map((type) => {
                const info = slopeInfo(type)
                return (
                  <div
                    key={type}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '70px 60px 1fr',
                      padding: 'var(--space-2) var(--space-3)',
                      borderBottom: '1px solid var(--border)',
                      fontSize: '12px',
                      backgroundColor: 'var(--bg-base)'
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                      {type}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {info.dbPerOctave} dB/oct
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                      {desc(t, info.description)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== Section: Filter Types Reference ===== */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button
          onClick={() => toggleSection('types')}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: openSection === 'types' ? 'var(--surface-1)' : 'transparent',
            color: openSection === 'types' ? 'var(--accent)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            textAlign: 'left',
            transition: 'all var(--duration-spring) var(--ease-spring)'
          }}
        >
          {openSection === 'types' ? '▼ ' : '▶ '}
          {t('filter.type')}
        </button>
        {openSection === 'types' && (
          <div
            style={{
              padding: 'var(--space-4)',
              border: '1px solid var(--border)',
              borderTop: 'none',
              borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
              backgroundColor: 'var(--surface-1)'
            }}
          >
            {/* Filter types table */}
            <div style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--surface-2)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <span>{t('filter.type')}</span>
                <span>{t('filter.description')}</span>
              </div>
              {FILTER_TYPES.map((ft) => (
                <div
                  key={ft.key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    padding: 'var(--space-2) var(--space-3)',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '12px',
                    backgroundColor: 'var(--bg-base)'
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                    {t(`filter.typeNames.${ft.key}`)}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                    {t(ft.i18nKey)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== Section: Filter Envelope ===== */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button
          onClick={() => toggleSection('envelope')}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: openSection === 'envelope' ? 'var(--surface-1)' : 'transparent',
            color: openSection === 'envelope' ? 'var(--accent)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            textAlign: 'left',
            transition: 'all var(--duration-spring) var(--ease-spring)'
          }}
        >
          {openSection === 'envelope' ? '▼ ' : '▶ '}
          {t('filter.envelope')}
        </button>
        {openSection === 'envelope' && (
          <div
            style={{
              padding: 'var(--space-4)',
              border: '1px solid var(--border)',
              borderTop: 'none',
              borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
              backgroundColor: 'var(--surface-1)'
            }}
          >
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
              {t('filter.envelope.info')}
            </p>

            {/* ADSR Input Controls */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  {t('filter.attack')}
                </label>
                <input
                  type="number"
                  value={envAttack}                  onChange={(e) => setEnvAttack(Number(e.target.value))}
                  min={0}
                  max={30000}
                  style={{
                    width: '80px',
                    padding: '6px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  {t('filter.decay')}
                </label>
                <input
                  type="number"
                  value={envDecay}
                  onChange={(e) => setEnvDecay(Number(e.target.value))}
                  min={0}
                  max={30000}
                  style={{
                    width: '80px',
                    padding: '6px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  {t('filter.sustain')}
                </label>
                <input
                  type="number"
                  value={envSustain}
                  onChange={(e) => setEnvSustain(Number(e.target.value))}
                  min={0}
                  max={100}
                  style={{
                    width: '80px',
                    padding: '6px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  {t('filter.release')}
                </label>
                <input
                  type="number"
                  value={envRelease}
                  onChange={(e) => setEnvRelease(Number(e.target.value))}
                  min={0}
                  max={60000}
                  style={{
                    width: '80px',
                    padding: '6px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* Envelope visualization bar chart */}
            <div style={{ marginTop: 'var(--space-3)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '2px',
                  height: '80px',
                  padding: 'var(--space-2)',
                  backgroundColor: 'var(--bg-base)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)'
                }}
              >
                {envelopePoints.map((value, idx) => (
                  <div
                    key={idx}
                    title={`${t('filter.point')} ${idx + 1}: ${(value * 100).toFixed(0)}%`}
                    style={{
                      flex: 1,
                      height: `${Math.max(2, value * 100)}%`,
                      backgroundColor: idx < 5
                        ? 'var(--accent)'      // Attack phase — accent color
                        : idx < 12
                          ? 'var(--success)'    // Decay → Sustain — green
                          : 'var(--warning)',   // Release phase — amber
                      borderRadius: '1px',
                      opacity: 0.85,
                      transition: 'height 100ms ease',
                      minHeight: '2px'
                    }}
                  />
                ))}
              </div>
              {/* Envelope phase labels */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: 'var(--text-tertiary)',
                  marginTop: 'var(--space-1)',
                  padding: '0 var(--space-1)'
                }}
              >
                <span style={{ color: 'var(--accent)' }}>A ({envAttack}ms)</span>
                <span style={{ color: 'var(--success)' }}>D ({envDecay}ms)</span>
                <span>S ({envSustain}%)</span>
                <span style={{ color: 'var(--warning)' }}>R ({envRelease}ms)</span>
              </div>
            </div>

            {/* Envelope time info */}
            <div style={{ marginTop: 'var(--space-3)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {t('filter.totalEnvelope')}: {envAttack + envDecay + envRelease} ms &nbsp;|&nbsp;
              {t('filter.sustainLevel')}: {envSustain}%
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default FilterCard
