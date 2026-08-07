/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Oscillator Calculator Card
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * Provides interactive synthesizer oscillator calculations for sound design.
 * This helps synth programmers quickly compute detune offsets, unison voice
 * distributions, FM synthesis sidebands, and sub-oscillator frequencies.
 *
 * HOW IT WORKS:
 * 1. Click a waveform button (sine/sawtooth/square/triangle/noise) to see
 *    its description and harmonic characteristics
 * 2. Use the Detune section: input a base frequency + cents → get Hz offset
 * 3. Use the Unison section: input freq, voice count, spread → see each
 *    voice's detune and resulting frequency (the "supersaw" effect)
 * 4. Use the FM section: input carrier ratio + modulator ratio → see
 *    carrier, modulator, and sideband frequencies
 * 5. Use the Sub section: input a frequency → see pitches 1-3 octaves below
 *
 * WHY THIS IS USEFUL:
 * Synthesizer programming involves precise frequency math that most producers
 * do by feel. These calculators give exact numbers for:
 * - Fine-tuning oscillators (detune in cents → exact Hz)
 * - Creating thick unison stacks (voice spread → individual voice freqs)
 * - FM sound design (ratio pairs → harmonic spectrum sidebands)
 * - Bass reinforcement (sub frequencies below the main oscillator)
 *
 * DATA SOURCE:
 * All calculation functions come from src/core/oscillatorCalculator.ts
 *
 * RELATED COMPONENTS:
 * - FilterCard: filter cutoff→note and Q→resonance calculations
 * - ModulationCard: LFO rates, modulation routing, ADSR envelopes
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { desc } from '../i18n/desc'
import {
  detuneToHz,
  unisonVoices,
  fmRatio,
  subOscillator,
  type FmParams
} from '../../../core/oscillatorCalculator'
import Card from './Card'

/**
 * Waveform configuration for the reference table.
 * Each waveform has an i18n key and a description key.
 */
interface WaveformEntry {
  key: string
  i18nKey: string
  descKey: string
}

/** Available oscillator waveforms and their i18n keys */
const WAVEFORMS: WaveformEntry[] = [
  { key: 'sine', i18nKey: 'oscillator.waveforms.sine', descKey: 'Sine' },
  { key: 'sawtooth', i18nKey: 'oscillator.waveforms.sawtooth', descKey: 'Sawtooth' },
  { key: 'square', i18nKey: 'oscillator.waveforms.square', descKey: 'Square' },
  { key: 'triangle', i18nKey: 'oscillator.waveforms.triangle', descKey: 'Triangle' },
  { key: 'noise', i18nKey: 'oscillator.waveforms.noise', descKey: 'Noise' }
]

function OscillatorCard(): JSX.Element {
  const { t } = useTranslation()

  // ===== Waveform selection =====
  // Which waveform is currently selected for detail display
  const [selectedWaveform, setSelectedWaveform] = useState<string | null>(null)

  // ===== Detune calculator inputs =====
  const [detuneFreq, setDetuneFreq] = useState(440)
  const [detuneCents, setDetuneCents] = useState(0)

  // ===== Unison voices inputs =====
  const [unisonFreq, setUnisonFreq] = useState(440)
  const [unisonCount, setUnisonCount] = useState(3)
  const [unisonSpread, setUnisonSpread] = useState(20)

  // ===== FM synthesis inputs =====
  const [fmCarrier, setFmCarrier] = useState(440)
  const [fmModRatio, setFmModRatio] = useState(1)
  const [fmModIndex, setFmModIndex] = useState(1)

  // ===== Sub oscillator input =====
  const [subFreq, setSubFreq] = useState(440)

  // ===== Collapsible sections =====
  // Tracks which collapsible section is currently open
  const [openSection, setOpenSection] = useState<string | null>(null)

  /**
   * Calculated detune offset.
   * Recalculated whenever detuneFreq or detuneCents changes.
   */
  const detuneOffset = useMemo(
    () => detuneToHz(detuneFreq, detuneCents),
    [detuneFreq, detuneCents]
  )

  /**
   * Calculated unison voice distribution.
   * Recalculated when unison inputs change.
   */
  const voices = useMemo(
    () => unisonVoices(unisonCount, unisonSpread),
    [unisonCount, unisonSpread]
  )

  /**
   * Calculated FM synthesis parameters.
   * Recalculated when FM inputs change.
   */
  const fmResult: FmParams = useMemo(
    () => fmRatio(fmCarrier, fmModRatio, fmModIndex),
    [fmCarrier, fmModRatio, fmModIndex]
  )

  /**
   * Calculated sub-oscillator frequencies.
   * Shows 1, 2, and 3 octaves below the fundamental.
   */
  const subOctaves = useMemo(() => {
    const oct1 = subOscillator(subFreq, 1)
    const oct2 = subOscillator(subFreq, 2)
    const oct3 = subOscillator(subFreq, 3)
    return { oct1, oct2, oct3 }
  }, [subFreq])

  /**
   * Toggle a collapsible section open/closed.
   * Passing the same section again closes it.
   */
  const toggleSection = useCallback((section: string) => {
    setOpenSection((prev) => (prev === section ? null : section))
  }, [])

  /**
   * Handle waveform button click.
   * Toggles the waveform detail display.
   */
  const handleWaveformClick = useCallback((key: string) => {
    setSelectedWaveform((prev) => (prev === key ? null : key))
  }, [])

  return (
    <Card title={t('oscillator.title')} subtitle={t('oscillator.subtitle')}>

      {/* ===== Waveform Reference Table ===== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          {t('oscillator.waveform')}
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {WAVEFORMS.map((wf) => {
            const isActive = selectedWaveform === wf.key
            return (
              <button
                key={wf.key}
                onClick={() => handleWaveformClick(wf.key)}
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
                {desc(t, wf.descKey)}
              </button>
            )
          })}
        </div>
        {/* Waveform detail description — shown when a waveform is selected */}
        {selectedWaveform && (
          <div
            style={{
              marginTop: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--surface-2)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '13px',
              color: 'var(--text-primary)',
              lineHeight: 1.5
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginRight: 'var(--space-2)' }}>
              {desc(t, WAVEFORMS.find((w) => w.key === selectedWaveform)?.descKey ?? '')}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {t(`oscillator.waveforms.${selectedWaveform}`)}
            </span>
          </div>
        )}
      </div>

      {/* ===== Collapsible Section: Detune Calculator ===== */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button
          onClick={() => toggleSection('detune')}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: openSection === 'detune' ? 'var(--surface-1)' : 'transparent',
            color: openSection === 'detune' ? 'var(--accent)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            textAlign: 'left',
            transition: 'all var(--duration-spring) var(--ease-spring)'
          }}
        >
          {openSection === 'detune' ? '▼ ' : '▶ '}
          {t('oscillator.detune')}
        </button>
        {openSection === 'detune' && (
          <div
            style={{
              padding: 'var(--space-4)',
              border: '1px solid var(--border)',
              borderTop: 'none',
              borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
              backgroundColor: 'var(--surface-1)'
            }}
          >
            {/* Detune calculator: base frequency + cents → offset Hz */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  {t('oscillator.frequency')}
                </label>
                <input
                  type="number"
                  value={detuneFreq}
                  onChange={(e) => setDetuneFreq(Number(e.target.value))}
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
                  {t('oscillator.detune')}
                </label>
                <input
                  type="number"
                  value={detuneCents}
                  onChange={(e) => setDetuneCents(Number(e.target.value))}
                  min={-1200}
                  max={1200}
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
                  {t('oscillator.offset')}
                </label>
                <div
                  style={{
                    padding: '6px 10px',
                    backgroundColor: 'var(--surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)',
                    fontSize: '13px',
                    minWidth: '100px'
                  }}
                >
                  {detuneOffset >= 0 ? '+' : ''}{detuneOffset.toFixed(2)} Hz
                </div>
              </div>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              {detuneFreq} Hz × ({detuneCents > 0 ? '+' : ''}{detuneCents}¢) → {detuneFreq + detuneOffset > 0 ? (detuneFreq + detuneOffset).toFixed(2) : '0.00'} Hz
            </p>
          </div>
        )}
      </div>

      {/* ===== Collapsible Section: Unison Voices ===== */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button
          onClick={() => toggleSection('unison')}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: openSection === 'unison' ? 'var(--surface-1)' : 'transparent',
            color: openSection === 'unison' ? 'var(--accent)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            textAlign: 'left',
            transition: 'all var(--duration-spring) var(--ease-spring)'
          }}
        >
          {openSection === 'unison' ? '▼ ' : '▶ '}
          {t('oscillator.unison')}
        </button>
        {openSection === 'unison' && (
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
              {t('oscillator.unison.info')}
            </p>

            {/* Unison input controls */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  {t('oscillator.frequency')}
                </label>
                <input
                  type="number"
                  value={unisonFreq}
                  onChange={(e) => setUnisonFreq(Number(e.target.value))}
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
                  {t('oscillator.voices')}
                </label>
                <input
                  type="number"
                  value={unisonCount}
                  onChange={(e) => setUnisonCount(Number(e.target.value))}
                  min={1}
                  max={16}
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
                  {t('oscillator.spread')}
                </label>
                <input
                  type="number"
                  value={unisonSpread}
                  onChange={(e) => setUnisonSpread(Number(e.target.value))}
                  min={0}
                  max={100}
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
            </div>

            {/* Unison voice distribution table */}
            {voices.length > 0 && (
              <div style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {/* Table header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 1fr',
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
                  <span>{t('oscillator.note')}</span>
                  <span>{t('oscillator.detune')}</span>
                  <span>{t('oscillator.frequency')}</span>
                </div>
                {/* Voice rows */}
                {voices.map((voice) => (
                  <div
                    key={voice.voice}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 1fr',
                      padding: 'var(--space-2) var(--space-3)',
                      borderBottom: '1px solid var(--border)',
                      fontSize: '12px',
                      backgroundColor: voice.detuneCents === 0 ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'transparent'
                    }}
                  >
                    <span style={{ color: 'var(--text-primary)' }}>#{voice.voice}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                      {voice.detuneCents >= 0 ? '+' : ''}{voice.detuneCents.toFixed(1)}¢
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {voice.frequency.toFixed(2)} Hz
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Collapsible Section: FM Synthesis ===== */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button
          onClick={() => toggleSection('fm')}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: openSection === 'fm' ? 'var(--surface-1)' : 'transparent',
            color: openSection === 'fm' ? 'var(--accent)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            textAlign: 'left',
            transition: 'all var(--duration-spring) var(--ease-spring)'
          }}
        >
          {openSection === 'fm' ? '▼ ' : '▶ '}
          {t('oscillator.fm')}
        </button>
        {openSection === 'fm' && (
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
              {t('oscillator.fm.info')}
            </p>

            {/* FM input controls */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  {t('oscillator.frequency')}
                </label>
                <input
                  type="number"
                  value={fmCarrier}
                  onChange={(e) => setFmCarrier(Number(e.target.value))}
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
                  {t('oscillator.fm.carrier')}
                </label>
                <input
                  type="number"
                  value={fmModRatio}
                  onChange={(e) => setFmModRatio(Number(e.target.value))}
                  min={0.1}
                  max={8}
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
                  {t('oscillator.ratio')}
                </label>
                <input
                  type="number"
                  value={fmModIndex}
                  onChange={(e) => setFmModIndex(Number(e.target.value))}
                  min={0}
                  max={10}
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
            </div>

            {/* FM result display */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  {t('oscillator.carrier', { defaultValue: 'Carrier' })}
                </label>
                <div
                  style={{
                    padding: '6px 10px',
                    backgroundColor: 'var(--surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                >
                  {fmResult.carrier.toFixed(2)} Hz
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  {t('oscillator.modulator', { defaultValue: 'Modulator' })}
                </label>
                <div
                  style={{
                    padding: '6px 10px',
                    backgroundColor: 'var(--surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                >
                  {fmResult.modulator.toFixed(2)} Hz
                </div>
              </div>
            </div>

            {/* Sidebands display */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                {t('oscillator.fm.sidebands')}
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {fmResult.sidebands.length > 0 ? (
                  fmResult.sidebands.map((sb, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--surface-2)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent)',
                        fontSize: '12px'
                      }}
                    >
                      {sb.toFixed(1)} Hz
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    — {t('oscillator.fm.sidebands')} &lt; 20 Hz
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== Collapsible Section: Sub Oscillator ===== */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button
          onClick={() => toggleSection('sub')}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: openSection === 'sub' ? 'var(--surface-1)' : 'transparent',
            color: openSection === 'sub' ? 'var(--accent)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            textAlign: 'left',
            transition: 'all var(--duration-spring) var(--ease-spring)'
          }}
        >
          {openSection === 'sub' ? '▼ ' : '▶ '}
          {t('oscillator.sub')}
        </button>
        {openSection === 'sub' && (
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
              {t('oscillator.sub.info')}
            </p>

            {/* Sub oscillator input */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  {t('oscillator.frequency')}
                </label>
                <input
                  type="number"
                  value={subFreq}
                  onChange={(e) => setSubFreq(Number(e.target.value))}
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
            </div>

            {/* Sub-octave frequency results table */}
            <div style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
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
                <span style={{ textAlign: 'center' }}>-1 {t('oscillator.octave', { defaultValue: 'Oct' })}</span>
                <span style={{ textAlign: 'center' }}>-2 {t('oscillator.octave', { defaultValue: 'Oct' })}</span>
                <span style={{ textAlign: 'center' }}>-3 {t('oscillator.octave', { defaultValue: 'Oct' })}</span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-base)'
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', textAlign: 'center' }}>
                  {subOctaves.oct1 > 0 ? `${subOctaves.oct1.toFixed(2)} Hz` : '—'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', textAlign: 'center' }}>
                  {subOctaves.oct2 > 0 ? `${subOctaves.oct2.toFixed(2)} Hz` : '—'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', textAlign: 'center' }}>
                  {subOctaves.oct3 > 0 ? `${subOctaves.oct3.toFixed(2)} Hz` : '—'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default OscillatorCard
