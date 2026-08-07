/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Sidechain Calculator Card
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * Provides an interactive sidechain compression calculator showing pump timing
 * based on BPM, release curve shapes, threshold/ratio reference guides, and
 * multi-band crossover frequencies. This helps producers dial in sidechain
 * settings that lock to the track's tempo and groove.
 *
 * 侧链压缩计算器 — 根据 BPM 计算泵送时序、显示释放曲线数据、
 * 提供阈值/比率参考指南以及多频段分频频率表。
 *
 * HOW IT WORKS:
 * 1. User adjusts BPM → pump timing table updates in real time
 * 2. User selects note division → see attack/hold/release ms values
 * 3. User picks curve type → see gain recovery curve data (linear/log/exponential)
 * 4. Reference tables show threshold/ratio best practices
 * 5. Band count selector → see crossover frequencies for split-band sidechain
 *
 * SIDECHAIN CONTEXT:
 * 侧链是电子音乐中最具标志性的混音技术 — 当一个信号（如底鼓）
 * 触发压缩器时，另一个信号（如铺底）的音量被"闪避"，产生标志性的
 * "泵送"效果。将侧链时序与 BPM 对齐，可以使 pumping 听起来更有音乐性。
 *
 * DATA SOURCE:
 * All calculations come from src/core/sidechainCalculator.ts
 *
 * RELATED COMPONENTS:
 * - EffectsCard: Effects reference (reverb, delay, distortion)
 * - CompressorCard: Standard compressor settings
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  pumpTiming,
  releaseCurve,
  multibandCrossovers,
  kickLengthMs
} from '../../../core/sidechainCalculator'

import Card from './Card'

// =============================================================================
// Constants
// =============================================================================

/**
 * NOTE_DIVISIONS — Note division options for the pump timing calculator.
 * Each entry maps to the noteValue parameter used by kickLengthMs().
 * 音符时值选项 — 用于泵送时序计算的音符划分选择。
 */
const NOTE_DIVISIONS = [
  { value: 'quarter', factor: 1 },
  { value: '8th', factor: 0.5 },
  { value: '16th', factor: 0.25 },
  { value: '8th triplet', factor: 1 / 3 }
] as const

/**
 * DIVISION_I18N_KEYS — Maps note division values to their i18n translation keys.
 * 音符时值 i18n 键映射。
 */
const DIVISION_I18N_KEYS: Record<string, string> = {
  quarter: 'sidechain.division.quarter',
  '8th': 'sidechain.division.eighth',
  '16th': 'sidechain.division.sixteenth',
  '8th triplet': 'sidechain.division.triplet'
}

/**
 * CURVE_TYPES — The three release curve shapes available for sidechain pumping.
 * 释放曲线类型 — 三种可用的侧链泵送曲线形状。
 */
const CURVE_TYPES = ['linear', 'logarithmic', 'exponential'] as const

/**
 * CURVE_POINTS_VISIBLE — Number of points to display from the release curve.
 * 用于显示释放曲线的采样点数。
 */
const CURVE_POINTS_VISIBLE = 10

/**
 * THRESHOLD_RATIO_GUIDE — Quick reference table for threshold and ratio settings.
 * Maps use-case descriptions to typical threshold, ratio, and character values.
 * 阈值/比率参考指南 — 将使用场景映射到典型的阈值、比率和听感描述。
 */
const THRESHOLD_RATIO_GUIDE: {
  labelKey: string
  descKey: string
  thresholdDb: string
  ratio: string
}[] = [
  { labelKey: 'sidechain.ratio.light', descKey: 'sidechain.thresholdGuide.subtle', thresholdDb: '-12 to -6', ratio: '2:1 - 4:1' },
  { labelKey: 'sidechain.ratio.medium', descKey: 'sidechain.thresholdGuide.moderate', thresholdDb: '-24 to -12', ratio: '4:1 - 8:1' },
  { labelKey: 'sidechain.ratio.heavy', descKey: 'sidechain.thresholdGuide.aggressive', thresholdDb: '-30 to -18', ratio: '8:1 - 20:1' }
]

/**
 * CURVE_COLORS — Color map for each curve type in the visual display.
 * 曲线颜色映射 — 每种曲线类型的显示颜色。
 */
const CURVE_COLORS: Record<string, string> = {
  linear: 'var(--accent)',
  logarithmic: 'var(--success)',
  exponential: 'var(--error)'
}

// =============================================================================
// Component
// =============================================================================

/**
 * SidechainCard — Interactive sidechain compression calculator.
 *
 * 侧链压缩计算器主组件。
 *
 * Features:
 * - BPM-synced pump envelope timing (attack/hold/release)
 * - Release curve shape visualization (linear/log/exponential)
 * - Threshold and ratio reference guide table
 * - Multi-band crossover frequency table
 *
 * @returns JSX element with the complete sidechain calculator UI
 */
function SidechainCard(): JSX.Element {
  const { t } = useTranslation()

  // ===== Local State =====
  // BPM state: local to this card, not from a global store
  // User can type any reasonable tempo value
  const [bpm, setBpm] = useState<number>(128)

  // Currently selected note division for timing calculations
  const [noteDivision, setNoteDivision] = useState<string>('quarter')

  // Selected release curve type for the curve visualization
  const [curveType, setCurveType] = useState<string>('linear')

  // Number of bands for the multi-band crossover table
  const [bandCount, setBandCount] = useState<number>(2)

  // ===== Computed Values =====

  /**
   * Current note division factor based on selection.
   * Derived from NOTE_DIVISIONS lookup.
   */
  const currentFactor = useMemo(() => {
    const found = NOTE_DIVISIONS.find((n) => n.value === noteDivision)
    return found ? found.factor : 1
  }, [noteDivision])

  /**
   * Pump timing result from the core module.
   * Recalculated whenever BPM or note division changes.
   * 从核心模块获取的泵送时序数据。
   */
  const timing = useMemo(
    () => pumpTiming(bpm, currentFactor),
    [bpm, currentFactor]
  )

  /**
   * Release curve data from the core module.
   * Returns an array of gain values from 0 (ducked) to 1 (recovered).
   * 从核心模块获取的释放曲线数据（增益值数组）。
   */
  const curveData = useMemo(
    () => releaseCurve(timing.releaseMs, curveType as 'linear' | 'logarithmic' | 'exponential', CURVE_POINTS_VISIBLE),
    [timing.releaseMs, curveType]
  )

  /**
   * Multi-band crossover frequencies from the core module.
   * 从核心模块获取的多频段分频频率。
   */
  const crossovers = useMemo(
    () => multibandCrossovers(bandCount),
    [bandCount]
  )

  /**
   * Kick length for the current selection, as a helpful reference.
   * Shows how long the kick tail is at this BPM and note division.
   * 当前设置下的底鼓长度参考值。
   */
  const kickLen = useMemo(
    () => kickLengthMs(bpm, noteDivision),
    [bpm, noteDivision]
  )

  // ===== Handlers =====

  /**
   * Handle BPM input change with validation.
   * Clamps value to a reasonable production range.
   * 处理 BPM 输入变化，将值限制在合理的制作范围内。
   */
  const handleBpmChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value)
      if (!isNaN(val) && val >= 0) {
        setBpm(val)
      }
    },
    []
  )

  return (
    <Card title={t('sidechain.title')} subtitle={t('sidechain.subtitle')}>

      {/* ===== BPM & Note Division Controls ===== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        {/* BPM Input */}
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          BPM
        </label>
        <input
          type="number"
          min={20}
          max={300}
          step={1}
          value={bpm}
          onChange={handleBpmChange}
          style={{
            width: '100px',
            padding: '6px 10px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-base)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            outline: 'none',
            marginBottom: 'var(--space-3)'
          }}
          aria-label="BPM"
        />

        {/* Note Division Selector */}
        <div style={{ marginTop: 'var(--space-3)' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-2)'
            }}
          >
            {t('sidechain.division')}
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {NOTE_DIVISIONS.map((div) => {
              const isActive = noteDivision === div.value
              return (
                <button
                  key={div.value}
                  onClick={() => setNoteDivision(div.value)}
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
                  {t(DIVISION_I18N_KEYS[div.value] ?? div.value, { defaultValue: div.value })}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== Pump Timing Table ===== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            marginBottom: 'var(--space-3)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontWeight: 600
          }}
        >
          {t('sidechain.timing')}
        </div>

        {timing.totalMs > 0 ? (
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
                gridTemplateColumns: '120px 1fr 1fr',
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
              <span>{t('sidechain.timing')}</span>
              <span>{t('sidechain.attack')}</span>
              <span>{t('sidechain.release')}</span>
            </div>

            {/* Single data row: total | attack+hold | release */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 1fr',
                padding: 'var(--space-3) var(--space-4)',
                fontSize: '13px',
                backgroundColor: 'var(--bg-base)',
                alignItems: 'center'
              }}
            >
              {/* Total cycle time */}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                {timing.totalMs} ms
              </span>
              {/* Attack + Hold combined visual (short phases) */}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {timing.attackMs} / {timing.holdMs} ms
              </span>
              {/* Release (longest phase) */}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--error)' }}>
                {timing.releaseMs} ms
              </span>
            </div>

            {/* Visual Pump Envelope Bar */}
            <div
              style={{
                display: 'grid',
                // A/H/R split: 10% attack / 20% hold / 70% release (club-standard)
                gridTemplateColumns: '10% 20% 70%',
                height: '8px'
              }}
            >
              <div style={{ backgroundColor: 'var(--accent)', opacity: 0.6 }} />
              <div style={{ backgroundColor: 'var(--text-tertiary)', opacity: 0.4 }} />
              <div
                style={{
                  background: `linear-gradient(to right, ${curveType === 'linear' ? 'var(--accent)' : curveType === 'logarithmic' ? 'var(--success)' : 'var(--error)'}, var(--bg-base))`,
                  opacity: 0.5
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            {t('sidechain.description')}
          </div>
        )}

        {/* Kick Length Reference */}
        <div style={{ marginTop: 'var(--space-3)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
          {t('sidechain.description')}:{' '}
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            {kickLen} ms
          </span>
        </div>
      </div>

      {/* ===== Release Curve Visualization ===== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            marginBottom: 'var(--space-3)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontWeight: 600
          }}
        >
          {t('sidechain.curve')}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
          {t('sidechain.curveDescription')}
        </p>

        {/* Curve Type Selector */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          {CURVE_TYPES.map((type) => {
            const isActive = curveType === type
            return (
              <button
                key={type}
                onClick={() => setCurveType(type)}
                style={{
                  padding: '4px 12px',
                  border: `1px solid ${isActive ? CURVE_COLORS[type] : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? `${CURVE_COLORS[type]}18` : 'transparent',
                  color: isActive ? CURVE_COLORS[type] : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  transition: 'all var(--duration-spring) var(--ease-spring)'
                }}
              >
                {t(`sidechain.release.${type === 'linear' ? 'short' : type === 'logarithmic' ? 'medium' : 'long'}`)}
              </button>
            )
          })}
        </div>

        {/* Curve Data Visualization */}
        {curveData.length > 0 && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-1)'
            }}
          >
            {/* Curve Bar Chart — each bar represents a gain sample point */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '4px',
                height: '120px',
                marginBottom: 'var(--space-3)'
              }}
            >
              {curveData.map((gain, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: `${Math.max(gain * 100, 2)}%`,
                    backgroundColor: CURVE_COLORS[curveType] ?? 'var(--accent)',
                    borderRadius: '2px 2px 0 0',
                    opacity: 0.3 + gain * 0.7,
                    transition: 'height 200ms ease, opacity 200ms ease',
                    minHeight: '2px'
                  }}
                  title={`${(gain * 100).toFixed(0)}%`}
                />
              ))}
            </div>

            {/* Curve Data Labels (first, middle, last) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <span>0%</span>
              <span>{(curveData[Math.floor(curveData.length / 2)] * 100).toFixed(0)}%</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </div>

      {/* ===== Threshold / Ratio Guide ===== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            marginBottom: 'var(--space-3)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontWeight: 600
          }}
        >
          {t('sidechain.thresholdGuide')}
        </div>
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
              gridTemplateColumns: '80px 1fr 80px 80px',
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
            <span>{t('sidechain.ratio')}</span>
            <span>{t('sidechain.description')}</span>
            <span>{t('sidechain.threshold')}</span>
            <span>{t('sidechain.ratio')}</span>
          </div>

          {/* Data Rows */}
          {THRESHOLD_RATIO_GUIDE.map((row, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 80px 80px',
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: idx < THRESHOLD_RATIO_GUIDE.length - 1 ? '1px solid var(--border)' : 'none',
                fontSize: '13px',
                backgroundColor: 'var(--bg-base)'
              }}
            >
              <span style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 600 }}>
                {t(row.labelKey)}
              </span>
              <span style={{ color: 'var(--text-primary)', fontSize: '11px' }}>
                {t(row.descKey)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                {row.thresholdDb}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                {row.ratio}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== BPM Sync Info ===== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
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
            {t('sidechain.bpmSync')}
          </div>
          <div style={{ color: 'var(--text-primary)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
              {timing.totalMs} ms
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {' '}= {t('sidechain.bpmSync.info')}
            </span>
            <br />
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
              {bpm} BPM
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {' '}/ {t(DIVISION_I18N_KEYS[noteDivision] ?? noteDivision, { defaultValue: noteDivision })}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Multi-Band Crossover Table ===== */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div
          style={{
            marginBottom: 'var(--space-3)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontWeight: 600
          }}
        >
          {t('sidechain.visualization')}
        </div>

        {/* Band Count Selector */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          {[2, 3, 4].map((count) => {
            const isActive = bandCount === count
            return (
              <button
                key={count}
                onClick={() => setBandCount(count)}
                style={{
                  padding: '4px 12px',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'inherit'
                }}
              >
                {count} {t('sidechain.bands', { defaultValue: 'Bands' })}
              </button>
            )
          })}
        </div>

        {/* Crossover Table */}
        {crossovers.length > 0 ? (
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
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              <span>{t('sidechain.bands', { defaultValue: 'Bands' })}</span>
              <span>{t('sidechain.description')}</span>
            </div>

            {/* Data Rows */}
            {crossovers.map((crossover) => (
              <div
                key={crossover.band}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '13px',
                  backgroundColor: 'var(--bg-base)'
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                  {crossover.band}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  {crossover.crossoverHz} Hz
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            {t('sidechain.description')}
          </div>
        )}
      </div>
    </Card>
  )
}

export default SidechainCard
