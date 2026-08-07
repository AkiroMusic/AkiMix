/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Modulation Planner Card
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * Provides interactive modulation planning tools for synthesizer sound design.
 * This helps producers understand LFO shapes, sync LFO rates to tempo,
 * visualize modulation routing, and design ADSR envelope shapes.
 *
 * HOW IT WORKS:
 * 1. Click an LFO waveform (sine/triangle/sawtooth/square/S&H) to see its
 *    description, harmonic character, and typical rate range
 * 2. View BPM-synced LFO rate divisions with ms and Hz values (reads BPM
 *    from the global app store)
 * 3. Select a modulation source → see its available routing destinations
 *    in a modulation matrix display
 * 4. Adjust ADSR envelope parameters → see a visual representation of the
 *    envelope shape
 *
 * WHY THIS IS USEFUL:
 * Modulation is what makes synthesizers feel alive. These tools help:
 * - Choose the right LFO waveform for vibrato, tremolo, filter sweeps, etc.
 * - Sync modulation to the track tempo for rhythmic effects
 * - Understand modulation routing (source → destination patching)
 * - Design envelope shapes that shape how a sound evolves over time
 *
 * DATA SOURCE:
 * All modulation functions come from src/core/modulationPlanner.ts
 * BPM state comes from src/renderer/src/store/useAppStore.ts
 *
 * RELATED COMPONENTS:
 * - OscillatorCard: detune, unison, FM, sub-oscillator calculations
 * - FilterCard: filter cutoff→note, Q→resonance, slopes, envelope
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { desc } from '../i18n/desc'
import {
  lfoRateSync,
  adsrValidate,
  modulationMatrix,
  lfoWaveforms,
  type LfoRateEntry,
  type LfoWaveformInfo,
  type ModulationRoute
} from '../../../core/modulationPlanner'
import { useAppStore } from '../store/useAppStore'
import Card from './Card'

/**
 * Mapping from DEFAULT_TARGETS values to their i18n keys.
 * The modulationPlanner uses canonical names but the UI needs
 * localized display names via react-i18next.
 */
const TARGET_I18N_MAP: Record<string, string> = {
  'Pitch': 'modulation.destinations.oscPitch',
  'Filter Cutoff': 'modulation.destinations.filterCutoff',
  'Volume': 'modulation.destinations.amp',
  'Pan': 'modulation.destinations.pan',
  'Wavetable Position': 'modulation.destinations.wavePosition',
  'FM Amount': 'modulation.destinations.pulseWidth'
}

function ModulationCard(): JSX.Element {
  const { t } = useTranslation()

  // ===== Read BPM from global app store =====
  // The app's central BPM state is used for tempo-synced LFO rate calculations
  const bpm = useAppStore((s) => s.bpm)

  // ===== LFO waveform selection =====
  // Which waveform is currently selected for detail display
  const [selectedWaveform, setSelectedWaveform] = useState<string | null>(null)

  // ===== Modulation matrix source filter =====
  // When a source is selected, only routes from that source are shown
  const [selectedSource, setSelectedSource] = useState<string>('LFO 1')

  // ===== ADSR envelope inputs =====
  const [envAttack, setEnvAttack] = useState(10)
  const [envDecay, setEnvDecay] = useState(100)
  const [envSustain, setEnvSustain] = useState(50)
  const [envRelease, setEnvRelease] = useState(200)

  // ===== Collapsible sections =====
  const [openSection, setOpenSection] = useState<string | null>(null)

  /**
   * LFO waveforms reference data from the core module.
   * This is static data — no inputs needed, no recalculation.
   */
  const waveforms: LfoWaveformInfo[] = useMemo(() => lfoWaveforms(), [])

  /**
   * BPM-synced LFO rate table.
   * Recalculated whenever the BPM changes (subscribes to global store).
   */
  const lfoRates: LfoRateEntry[] = useMemo(() => lfoRateSync(bpm), [bpm])

  /**
   * All possible modulation routes from the core module.
   * Full 8×6 matrix minus self-modulation = 46+ routes.
   */
  const allRoutes: ModulationRoute[] = useMemo(() => modulationMatrix(), [])

  /**
   * Filtered modulation routes — only those from the selected source.
   * Makes the matrix manageable and focused for the user.
   */
  const filteredRoutes: ModulationRoute[] = useMemo(
    () => allRoutes.filter((r) => r.source === selectedSource),
    [allRoutes, selectedSource]
  )

  /**
   * Get unique source names from the full route list for the source selector.
   */
  const sourceNames: string[] = useMemo(
    () => [...new Set(allRoutes.map((r) => r.source))],
    [allRoutes]
  )

  /**
   * Validated ADSR parameters using the core module's clamp function.
   * Ensures values stay within musical/technical ranges.
   */
  const validatedAdsr = useMemo(
    () => adsrValidate({
      attackMs: envAttack,
      decayMs: envDecay,
      sustainPercent: envSustain,
      releaseMs: envRelease
    }),
    [envAttack, envDecay, envSustain, envRelease]
  )

  /**
   * Generate simple envelope visualization points from ADSR values.
   * Creates a 4-segment visual: attack ramp up, decay ramp down,
   * sustain hold, release fade to 0.
   */
  const envelopeSegments = useMemo(() => {
    const total = validatedAdsr.attackMs + validatedAdsr.decayMs + validatedAdsr.releaseMs
    if (total <= 0) return [0, 0, 0, 0, 0]

    const sustainVal = validatedAdsr.sustainPercent / 100
    // Generate 5 key points of the envelope shape
    return [
      0,                                              // Start (silence)
      1,                                              // Peak (end of attack)
      sustainVal,                                     // Sustain (end of decay, begin sustain)
      sustainVal,                                     // End of sustain (before release)
      0                                               // End (silence after release)
    ]
  }, [validatedAdsr])

  /**
   * Toggle a collapsible section open/closed.
   */
  const toggleSection = useCallback((section: string) => {
    setOpenSection((prev) => (prev === section ? null : section))
  }, [])

  /**
   * Handle waveform button click.
   * Toggles the waveform detail display.
   */
  const handleWaveformClick = useCallback((type: string) => {
    setSelectedWaveform((prev) => (prev === type ? null : type))
  }, [])

  /**
   * Get the rate range info for a waveform type.
   */
  const getRateRange = (waveformType: string): string => {
    if (['Sine', 'Triangle'].includes(waveformType)) {
      return t('modulation.rateRange.slow')
    }
    if (['Saw Up', 'Saw Down', 'Square'].includes(waveformType)) {
      return t('modulation.rateRange.medium')
    }
    return t('modulation.rateRange.fast')
  }

  return (
    <Card title={t('modulation.title')} subtitle={t('modulation.subtitle')}>

      {/* ===== LFO Waveform Reference ===== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          {t('modulation.waveform')}
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
          {waveforms.map((wf) => {
            const isActive = selectedWaveform === wf.type
            return (
              <button
                key={wf.type}
                onClick={() => handleWaveformClick(wf.type)}
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
                {desc(t, wf.type)}
              </button>
            )
          })}
        </div>

        {/* Waveform detail card */}
        {selectedWaveform && (() => {
          const wfInfo = waveforms.find((w) => w.type === selectedWaveform)
          if (!wfInfo) return null
          return (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--surface-2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ marginBottom: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '14px', fontWeight: 600 }}>
                  {desc(t, wfInfo.type)}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: 'var(--space-1)', lineHeight: 1.5 }}>
                {desc(t, wfInfo.description)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                {t('modulation.harmonics')}: {wfInfo.harmonics}
              </div>
              <div style={{ marginTop: 'var(--space-2)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {t('modulation.rateRange')}: {getRateRange(wfInfo.type)}
              </div>
            </div>
          )
        })()}
      </div>

      {/* ===== Section: BPM-Synced LFO Rates ===== */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button
          onClick={() => toggleSection('lfoRates')}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: openSection === 'lfoRates' ? 'var(--surface-1)' : 'transparent',
            color: openSection === 'lfoRates' ? 'var(--accent)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            textAlign: 'left',
            transition: 'all var(--duration-spring) var(--ease-spring)'
          }}
        >
          {openSection === 'lfoRates' ? '▼ ' : '▶ '}
          {t('modulation.bpmSync')} (BPM: {bpm})
        </button>
        {openSection === 'lfoRates' && (
          <div
            style={{
              padding: 'var(--space-4)',
              border: '1px solid var(--border)',
              borderTop: 'none',
              borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
              backgroundColor: 'var(--surface-1)'
            }}
          >
            {/* LFO rate table */}
            {lfoRates.length > 0 ? (
              <div style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {/* Table header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 60px 70px',
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
                  <span>{t('modulation.shape')}</span>
                  <span>{t('modulation.period')}</span>
                  <span>{t('modulation.rate')}</span>
                </div>
                {/* Rate rows */}
                {lfoRates.map((rate) => (
                  <div
                    key={rate.label}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 60px 70px',
                      padding: 'var(--space-2) var(--space-3)',
                      borderBottom: '1px solid var(--border)',
                      fontSize: '12px',
                      backgroundColor: 'var(--bg-base)'
                    }}
                  >
                    <span style={{ color: 'var(--text-primary)' }}>{desc(t, rate.label)}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                      {rate.ms} ms
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {rate.hz} Hz
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 'var(--space-3)', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                {t('modulation.noRateData')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Section: Modulation Routing Matrix ===== */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button
          onClick={() => toggleSection('matrix')}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: openSection === 'matrix' ? 'var(--surface-1)' : 'transparent',
            color: openSection === 'matrix' ? 'var(--accent)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            textAlign: 'left',
            transition: 'all var(--duration-spring) var(--ease-spring)'
          }}
        >
          {openSection === 'matrix' ? '▼ ' : '▶ '}
          {t('modulation.source')} → {t('modulation.destination')}
        </button>
        {openSection === 'matrix' && (
          <div
            style={{
              padding: 'var(--space-4)',
              border: '1px solid var(--border)',
              borderTop: 'none',
              borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
              backgroundColor: 'var(--surface-1)'
            }}
          >
            {/* Source selector */}
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              {t('modulation.source')}
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              {sourceNames.map((src) => {
                const isActive = selectedSource === src
                return (
                  <button
                    key={src}
                    onClick={() => setSelectedSource(src)}
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
                    {desc(t, src)}
                  </button>
                )
              })}
            </div>

            {/* Routing destinations for the selected source */}
            {filteredRoutes.length > 0 ? (
              <div style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 70px',
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
                  <span>{t('modulation.destination')}</span>
                  <span>{t('modulation.depth')}</span>
                </div>
                {filteredRoutes.map((route, idx) => {
                  const destI18nKey = TARGET_I18N_MAP[route.target]
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 70px',
                        padding: 'var(--space-2) var(--space-3)',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '12px',
                        backgroundColor: 'var(--bg-base)'
                      }}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>
                        {destI18nKey ? t(destI18nKey) : route.target}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                        {route.depth}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: 'var(--space-3)', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                {t('modulation.noRoutes')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Section: ADSR Envelope Visualizer ===== */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button
          onClick={() => toggleSection('adsr')}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: openSection === 'adsr' ? 'var(--surface-1)' : 'transparent',
            color: openSection === 'adsr' ? 'var(--accent)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            textAlign: 'left',
            transition: 'all var(--duration-spring) var(--ease-spring)'
          }}
        >
          {openSection === 'adsr' ? '▼ ' : '▶ '}
          {t('modulation.adsr')}
        </button>
        {openSection === 'adsr' && (
          <div
            style={{
              padding: 'var(--space-4)',
              border: '1px solid var(--border)',
              borderTop: 'none',
              borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
              backgroundColor: 'var(--surface-1)'
            }}
          >
            {/* ADSR Input Controls */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  {t('modulation.attack')}
                </label>
                <input
                  type="number"
                  value={envAttack}
                  onChange={(e) => setEnvAttack(Number(e.target.value))}
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
                  {t('modulation.decay')}
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
                  {t('modulation.sustain')}
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
                  {t('modulation.release')}
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

            {/* ADSR curve visualization */}
            <div
              style={{
                position: 'relative',
                height: '100px',
                backgroundColor: 'var(--bg-base)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                marginBottom: 'var(--space-2)',
                overflow: 'hidden'
              }}
            >
              {/* SVG envelope curve */}
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 200 80"
                preserveAspectRatio="none"
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                {/* Background grid line at sustain level */}
                <line
                  x1="0"
                  y1={80 - validatedAdsr.sustainPercent * 0.8}
                  x2="200"
                  y2={80 - validatedAdsr.sustainPercent * 0.8}
                  stroke="var(--border)"
                  strokeWidth="0.5"
                  strokeDasharray="4 2"
                />

                {/* ADSR envelope line */}
                <polyline
                  points={getAdsrPolylinePoints(
                    validatedAdsr.attackMs,
                    validatedAdsr.decayMs,
                    validatedAdsr.sustainPercent,
                    validatedAdsr.releaseMs
                  )}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* Phase dots */}
                {getAdsrPoints(
                  validatedAdsr.attackMs,
                  validatedAdsr.decayMs,
                  validatedAdsr.sustainPercent,
                  validatedAdsr.releaseMs
                ).map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r="3"
                    fill={
                      idx === 0 ? 'var(--accent)' :
                      idx === 1 ? 'var(--success)' :
                      idx === 2 ? 'var(--warning)' :
                      idx === 3 ? 'var(--warning)' :
                      'var(--error)'
                    }
                    stroke="var(--bg-base)"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            </div>

            {/* Phase labels */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                marginBottom: 'var(--space-3)',
                padding: '0 var(--space-1)'
              }}
            >
              <span style={{ color: 'var(--accent)' }}>
                A: {validatedAdsr.attackMs}ms
              </span>
              <span style={{ color: 'var(--success)' }}>
                D: {validatedAdsr.decayMs}ms
              </span>
              <span style={{ color: 'var(--warning)' }}>
                S: {validatedAdsr.sustainPercent}%
              </span>
              <span style={{ color: 'var(--error)' }}>
                R: {validatedAdsr.releaseMs}ms
              </span>
            </div>

            {/* Total duration */}
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {t('modulation.total')}: {validatedAdsr.attackMs + validatedAdsr.decayMs + validatedAdsr.releaseMs} ms
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

/**
 * Generate SVG polyline points string for the ADSR envelope curve.
 *
 * Maps the ADSR timings to a 200×80 viewBox coordinate space:
 * - X-axis: total time mapped to 200 width
 * - Y-axis: envelope level (0-100) mapped to 80-0 height (inverted)
 *
 * @param attackMs — Attack time in ms
 * @param decayMs — Decay time in ms
 * @param sustainPercent — Sustain level in percent (0-100)
 * @param releaseMs — Release time in ms
 * @returns SVG polyline points string like "0,80 50,0 100,40 150,40 200,80"
 */
function getAdsrPolylinePoints(
  attackMs: number,
  decayMs: number,
  sustainPercent: number,
  releaseMs: number
): string {
  const total = attackMs + decayMs + releaseMs
  if (total <= 0) return '0,80 200,80'

  const sustainY = 80 - (sustainPercent / 100) * 80

  const x1 = 0
  const x2 = (attackMs / total) * 200
  const x3 = ((attackMs + decayMs) / total) * 200
  const x4 = x3 // sustain point (same x as end of decay in this simplified view)
  const x5 = 200

  // Ensure x-coordinates are strictly increasing (handle zero-length phases)
  const p2x = Math.max(x1 + 1, Math.min(x2, 200))
  const p3x = Math.max(p2x + 1, Math.min(x3, 200))
  const p4x = Math.max(p3x, Math.min(x4, 200))

  return `0,80 ${p2x},0 ${p3x},${sustainY} ${p4x},${sustainY} ${x5},80`
}

/**
 * Generate ADSR envelope key points for SVG circles.
 * Returns 5 points: start, attack peak, decay end/sustain start,
 * sustain end, release end.
 */
function getAdsrPoints(
  attackMs: number,
  decayMs: number,
  sustainPercent: number,
  releaseMs: number
): Array<{ x: number; y: number }> {
  const total = attackMs + decayMs + releaseMs
  if (total <= 0) {
    return [
      { x: 0, y: 80 },
      { x: 0, y: 80 },
      { x: 0, y: 80 },
      { x: 0, y: 80 },
      { x: 200, y: 80 }
    ]
  }

  const sustainY = 80 - (sustainPercent / 100) * 80

  const p2x = Math.max(1, (attackMs / total) * 200)
  const p3x = Math.max(p2x + 1, ((attackMs + decayMs) / total) * 200)

  return [
    { x: 0, y: 80 },
    { x: p2x, y: 0 },
    { x: p3x, y: sustainY },
    { x: p3x, y: sustainY },
    { x: 200, y: 80 }
  ]
}

export default ModulationCard
