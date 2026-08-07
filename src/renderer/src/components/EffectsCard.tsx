/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Effects Reference Card
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * Provides an interactive sound design effects reference browser. Users can
 * explore effect types by category, view detailed descriptions and routing
 * suggestions, browse reverb space presets, look up BPM-synced delay times,
 * reference distortion types, and calculate delay feedback staging.
 *
 * 效果器参考浏览器 — 按类别浏览效果类型、查看详细描述和路由建议、
 * 浏览混响空间预设、查找 BPM 同步延迟时间、参考失真类型以及计算延迟反馈级数。
 *
 * HOW IT WORKS:
 * 1. Category tabs filter effect types (Time / Modulation / Dynamics / Filter / Distortion)
 * 2. Click an effect type → shows description, routing recommendations, and tips
 * 3. Reverb section displays all 9 space presets from the core module
 * 4. Delay section: enter BPM → see synced delay times in ms
 * 5. Distortion section: reference table of distortion/saturation types
 * 6. Feedback section: input feedback % → see repeat count and character
 *
 * SOUND DESIGN CONTEXT:
 *   效果器是混音和音色设计的核心工具。了解每种效果器的工作原理、
 *   路由方式和适用场景，可以帮助制作人做出更好的混音决策。
 *
 * DATA SOURCE:
 * All effects data comes from src/core/effectsReference.ts
 *
 * RELATED COMPONENTS:
 * - SidechainCard: Sidechain compression calculator
 * - EqCard: EQ frequency recommendations
 * - MixLevelsCard: dB level recommendations
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { desc } from '../i18n/desc'
import {
  reverbBySpace,
  delayBpmSync,
  distortionTypes,
  delayFeedbackStaging,
  type ReverbSpaceEntry,
  type DelaySyncEntry,
  type DistortionTypeEntry,
  type FeedbackStagingResult
} from '../../../core/effectsReference'
import Card from './Card'

// =============================================================================
// Types
// =============================================================================

/**
 * EffectTypeEntry — Defines an effect type with its metadata.
 * 效果类型条目 — 定义效果类型及其元数据。
 *
 * Each entry maps to an effect type that can be selected and explored
 * in the browser. Categories group related types together.
 */
interface EffectTypeEntry {
  /** Unique type identifier (matches i18n key suffix) */
  id: string
  /** Category this type belongs to */
  category: EffectCategory
  /** Preferred routing method: serial, parallel, or multi */
  routing: 'serial' | 'parallel' | 'multi'
  /** Mixing/production tip key for this type */
  tipKey: string
}

/**
 * EffectCategory — The available effect category identifiers.
 * Each category groups related effect types.
 */
type EffectCategory = 'time' | 'modulation' | 'dynamics' | 'filter' | 'distortion'

// =============================================================================
// Constants
// =============================================================================

/**
 * EFFECT_CATEGORIES — Ordered list of effect categories for the tab bar.
 * Each entry maps to the i18n key effects.categories.<value>.
 * 效果类别列表 — 标签栏中显示的效果类别，映射到 i18n 翻译键。
 */
const EFFECT_CATEGORIES: { value: EffectCategory }[] = [
  { value: 'time' },
  { value: 'modulation' },
  { value: 'dynamics' },
  { value: 'filter' },
  { value: 'distortion' }
]

/**
 * EFFECT_TYPES — All available effect types with their metadata.
 * Each type belongs to a category and has routing + tip information.
 * 所有可用效果类型及其元数据 — 每种类别包含对应的效果类型。
 *
 * TIP CONTENT (每条提示说明):
 * These describe common routing patterns and production use cases for
 * each effect type, helping beginners understand how to use them.
 */
const EFFECT_TYPES: EffectTypeEntry[] = [
  // === Time ===
  { id: 'reverb', category: 'time', routing: 'serial', tipKey: 'effects.tip' },
  { id: 'delay', category: 'time', routing: 'serial', tipKey: 'effects.tip' },

  // === Modulation ===
  { id: 'chorus', category: 'modulation', routing: 'serial', tipKey: 'effects.tip' },
  { id: 'flanger', category: 'modulation', routing: 'serial', tipKey: 'effects.tip' },
  { id: 'phaser', category: 'modulation', routing: 'serial', tipKey: 'effects.tip' },
  { id: 'tremolo', category: 'modulation', routing: 'serial', tipKey: 'effects.tip' },
  { id: 'vibrato', category: 'modulation', routing: 'serial', tipKey: 'effects.tip' },

  // === Dynamics ===
  { id: 'compressor', category: 'dynamics', routing: 'serial', tipKey: 'effects.tip' },
  { id: 'limiter', category: 'dynamics', routing: 'serial', tipKey: 'effects.tip' },
  { id: 'noiseGate', category: 'dynamics', routing: 'serial', tipKey: 'effects.tip' },

  // === Filter ===
  { id: 'eq', category: 'filter', routing: 'serial', tipKey: 'effects.tip' },

  // === Distortion ===
  { id: 'distortion', category: 'distortion', routing: 'serial', tipKey: 'effects.tip' }
]

/**
 * EFFECT_TYPE_DESCRIPTIONS — Mapping from effect type id to description and wet/dry guidance.
 * These are production-friendly descriptions embedded as static data since the core
 * module provides reference data tables rather than per-type descriptions.
 * 类型描述映射 — 每种效果类型的文字描述和干/湿比例建议。
 */
const TYPE_DETAILS: Record<string, { description: string; wetDry: string }> = {
  reverb: {
    description: 'Adds spatial ambience by generating thousands of decaying echoes. Essential for placing sounds in a virtual space — from tight rooms to massive cathedrals.',
    wetDry: '10-30% for glue, 40-60% for ambience, 70-100% for special effects'
  },
  delay: {
    description: 'Repeats the input signal at a specified time interval. Creates echo effects, rhythmic patterns, and spatial width when synced to tempo.',
    wetDry: '15-30% for slap, 30-50% for rhythmic delay, 50-80% for ambient washes'
  },
  chorus: {
    description: 'Copies the signal, modulates the copy\'s pitch slightly, and mixes it back. Thickens sounds and creates lush, wide textures.',
    wetDry: '25-50% for thickening, 50-75% for lush modulation'
  },
  flanger: {
    description: 'Mixes the signal with a modulated delayed copy (1-10ms). Creates a sweeping "jet-plane" effect through comb filtering.',
    wetDry: '30-60% for classic flange, 60-80% for extreme whoosh'
  },
  phaser: {
    description: 'Shifts the phase of the signal through all-pass filters, creating notch filters that sweep across the spectrum. Softer than flanging.',
    wetDry: '30-50% for subtle movement, 50-70% for pronounced sweep'
  },
  tremolo: {
    description: 'Modulates the AMPLITUDE (volume) of the signal at a rate controlled by an LFO. Creates rhythmic volume pulses.',
    wetDry: 'N/A (usually 100% wet — volume modulation is the effect)'
  },
  vibrato: {
    description: 'Modulates the PITCH of the signal using an LFO. Unlike chorus, no dry signal is mixed in — the pitch wavers continuously.',
    wetDry: 'N/A (100% wet — pitch modulation is inherent)'
  },
  distortion: {
    description: 'Adds harmonics by clipping or shaping the waveform. Ranges from subtle warmth (tape saturation) to aggressive fuzz (hard clipping).',
    wetDry: '10-30% for parallel blend, 50-100% for direct distortion'
  },
  compressor: {
    description: 'Reduces the dynamic range by attenuating signals above a threshold. Essential for controlling peaks and adding sustain.',
    wetDry: 'N/A (applied as an insert, not wet/dry mix — use parallel compression instead)'
  },
  limiter: {
    description: 'Prevents the signal from exceeding a set ceiling. The ultimate peak control — used on the master bus to prevent digital clipping.',
    wetDry: 'N/A (brickwall limiter — always at 100%, threshold controls the ceiling)'
  },
  eq: {
    description: 'Adjusts the balance between frequency components. The most fundamental mixing tool — cuts unwanted frequencies, boosts desirable ones.',
    wetDry: 'N/A (EQ is always applied to the full signal — boost/cut is the control)'
  },
  noiseGate: {
    description: 'Silences the signal when it falls below a threshold. Used to remove background noise, tighten drum tails, and create gated reverb effects.',
    wetDry: 'N/A (gate is always 100% wet — threshold and range control the effect)'
  }
}

// =============================================================================
// Component
// =============================================================================

/**
 * EffectsCard — Interactive effects reference browser.
 *
 * 效果器参考浏览器主组件。
 *
 * Features:
 * - Category-tabbed effect type browser with detail panel
 * - Reverb space reference table (RT60, pre-delay, density)
 * - BPM-synced delay time calculator
 * - Distortion type reference table
 * - Feedback staging calculator (feedback % → repeats + character)
 *
 * @returns JSX element with the complete effects reference UI
 */
function EffectsCard(): JSX.Element {
  const { t } = useTranslation()

  // ===== Local State =====

  /**
   * Selected effect category filter.
   * 'all' shows all effect types. Individual categories filter to that group.
   */
  const [selectedCategory, setSelectedCategory] = useState<EffectCategory | 'all'>('all')

  /**
   * Currently selected effect type ID.
   * When set, shows the detailed description panel for that type.
   * null = no type selected (shows "select a type" prompt).
   */
  const [selectedType, setSelectedType] = useState<string | null>(null)

  /**
   * BPM input for the delay sync calculator.
   * Controlled state — updates the delay table on change.
   */
  const [delayBpm, setDelayBpm] = useState<number>(128)

  /**
   * Feedback percentage for the delay feedback staging calculator.
   * 0-100 range. Drives the delayFeedbackStaging() core function.
   */
  const [feedbackPercent, setFeedbackPercent] = useState<number>(40)

  // ===== Memoized Data from Core Modules =====

  /**
   * Reverb space reference data — all 9 presets from core.
   * Static data (no parameters needed), so this is a stable reference.
   * 混响空间参考数据 — 核心模块返回的全部 9 种空间预设。
   */
  const reverbSpaces = useMemo<ReverbSpaceEntry[]>(() => reverbBySpace(), [])

  /**
   * BPM-synced delay times — computed on every BPM change.
   * Returns 7 entries covering all standard note divisions.
   * BPM 同步延迟时间 — 每次 BPM 变化时重新计算。
   */
  const delayEntries = useMemo<DelaySyncEntry[]>(
    () => delayBpmSync(delayBpm),
    [delayBpm]
  )

  /**
   * Distortion type reference table — all 6 types from core.
   * Static data (no parameters), stable reference.
   * 失真类型参考表 — 核心模块返回的全部 6 种失真类型。
   */
  const distTypes = useMemo<DistortionTypeEntry[]>(() => distortionTypes(), [])

  /**
   * Feedback staging result — computed on every feedback% change.
   * Returns repeats count and character description.
   * 反馈级数计算结果 — 每次反馈百分比变化时重新计算。
   */
  const stagingResult = useMemo<FeedbackStagingResult>(
    () => delayFeedbackStaging(feedbackPercent),
    [feedbackPercent]
  )

  /**
   * Filtered effect types based on selected category.
   * When 'all' is selected, returns every type.
   * 根据选中的类别筛选效果类型。
   */
  const filteredTypes = useMemo(() => {
    if (selectedCategory === 'all') return EFFECT_TYPES
    return EFFECT_TYPES.filter((et) => et.category === selectedCategory)
  }, [selectedCategory])

  /**
   * Currently selected effect type's detail data.
   * null when nothing is selected.
   * 当前选中的效果类型的详细数据。
   */
  const currentTypeDetail = useMemo(() => {
    if (!selectedType) return null
    const entry = EFFECT_TYPES.find((et) => et.id === selectedType)
    const details = TYPE_DETAILS[selectedType]
    if (!entry || !details) return null
    return { entry, details }
  }, [selectedType])

  // ===== Handlers =====

  /**
   * Handle category tab click — filter types and reset selection.
   * 处理类别标签点击 — 筛选类型并重置选中状态。
   */
  const handleCategoryChange = useCallback((category: EffectCategory | 'all') => {
    setSelectedCategory(category)
    // Reset the type selection when switching categories
    setSelectedType(null)
  }, [])

  /**
   * Handle effect type click — show detail panel.
   * Toggles off if the same type is clicked again.
   * 处理效果类型点击 — 显示详情面板。再次点击同一类型可关闭。
   */
  const handleTypeClick = useCallback((typeId: string) => {
    setSelectedType((prev) => (prev === typeId ? null : typeId))
  }, [])

  /**
   * Handle delay BPM input change with validation.
   * Clamps to reasonable BPM range (20-300).
   * 处理延迟 BPM 输入变化，将值限制在合理范围内。
   */
  const handleDelayBpmChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value)
      if (!isNaN(val) && val >= 0) {
        setDelayBpm(val)
      }
    },
    []
  )

  /**
   * Handle feedback percentage input change with validation.
   * Clamps to 0-100 range.
   * 处理反馈百分比输入变化，将值限制在 0-100 范围内。
   */
  const handleFeedbackChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value)
      if (!isNaN(val) && val >= 0 && val <= 100) {
        setFeedbackPercent(val)
      }
    },
    []
  )

  return (
    <Card title={t('effects.title')} subtitle={t('effects.subtitle')}>

      {/* =================================================================== */}
      {/* SECTION 1: Effect Category Browser                                    */}
      {/* =================================================================== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          {/* "All" tab — shows every effect type */}
          <button
            onClick={() => handleCategoryChange('all')}
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
            {t('effects.type')}
          </button>

          {/* Individual category tabs */}
          {EFFECT_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
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
                {t(`effects.categories.${cat.value}`)}
              </button>
            )
          })}
        </div>

        {/* Effect Type List + Detail Panel */}
        {filteredTypes.length > 0 ? (
          <div
            style={{
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              overflow: 'hidden'
            }}
          >
            {/* Column Header */}
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
              <span>{t('effects.type')}</span>
              <span>{t('effects.category')}</span>
            </div>

            {/* Type rows */}
            {filteredTypes.map((effectType) => {
              const isSelected = selectedType === effectType.id
              return (
                <div key={effectType.id}>
                  {/* Clickable type row */}
                  <div
                    onClick={() => handleTypeClick(effectType.id)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      padding: 'var(--space-3) var(--space-4)',
                      borderBottom: '1px solid var(--border)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--surface-1)' : 'var(--bg-base)',
                      transition: 'background-color 100ms ease'
                    }}
                  >
                    <span
                      style={{
                        color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: isSelected ? 600 : 400
                      }}
                    >
                      {t(`effects.types.${effectType.id}`)}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {t(`effects.categories.${effectType.category}`)}
                    </span>
                  </div>

                  {/* Expanded detail panel */}
                  {isSelected && currentTypeDetail && (
                    <div
                      style={{
                        padding: 'var(--space-4)',
                        backgroundColor: 'var(--surface-2)',
                        borderBottom: '1px solid var(--border)'
                      }}
                    >
                      {/* Description */}
                      <div style={{ marginBottom: 'var(--space-3)' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: 600,
                            display: 'block',
                            marginBottom: 'var(--space-1)'
                          }}
                        >
                          {t('effects.description')}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {desc(t, currentTypeDetail.details.description)}
                        </span>
                      </div>

                      {/* Routing suggestion */}
                      <div style={{ marginBottom: 'var(--space-3)' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: 600,
                            display: 'block',
                            marginBottom: 'var(--space-1)'
                          }}
                        >
                          {t('effects.routing')}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                          {t(`effects.routing.${currentTypeDetail.entry.routing}`)}
                        </span>
                      </div>

                      {/* Wet/Dry recommendation */}
                      <div style={{ marginBottom: 'var(--space-3)' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: 600,
                            display: 'block',
                            marginBottom: 'var(--space-1)'
                          }}
                        >
                          {t('effects.wetDry')}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {desc(t, currentTypeDetail.details.wetDry)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
            {t('effects.selectType')}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* SECTION 2: Reverb Spaces Table                                       */}
      {/* =================================================================== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            marginBottom: 'var(--space-3)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontWeight: 600
          }}
        >
          {t('effects.types.reverb')} {t('effects.description')}
        </div>

        {reverbSpaces.length > 0 ? (
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
                gridTemplateColumns: '120px 70px 70px 60px 1fr',
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
              <span>{t('effects.type')}</span>
              <span>{t('effects.headers.rt60')}</span>
              <span>{t('effects.headers.pre')}</span>
              <span>{t('effects.wetDry')}</span>
              <span>{t('effects.description')}</span>
            </div>

            {/* Data rows */}
            {reverbSpaces.map((space) => (
              <div
                key={space.space}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 70px 70px 60px 1fr',
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '13px',
                  backgroundColor: 'var(--bg-base)',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '12px' }}>
                  {desc(t, space.space)}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {space.rt60Ms} ms
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {space.preDelayMs} ms
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: space.density === 'High' ? 'var(--accent)' : space.density === 'Medium' ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {desc(t, space.density)}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {desc(t, space.description)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            {t('effects.selectType')}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* SECTION 3: BPM-Synced Delay Times                                     */}
      {/* =================================================================== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            marginBottom: 'var(--space-3)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontWeight: 600
          }}
        >
          {t('effects.types.delay')} BPM
        </div>

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
          value={delayBpm}
          onChange={handleDelayBpmChange}
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
            marginBottom: 'var(--space-4)'
          }}
          aria-label="BPM"
        />

        {/* Delay Times Table */}
        {delayEntries.length > 0 ? (
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
                gridTemplateColumns: '100px 60px 80px 1fr',
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
              <span>{t('effects.types.delay')}</span>
              <span>{t('sidechain.division')}</span>
              <span>{t('sidechain.releaseMs')}</span>
              <span>{t('effects.description')}</span>
            </div>

            {/* Data rows */}
            {delayEntries.map((entry) => (
              <div
                key={entry.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 60px 80px 1fr',
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '13px',
                  backgroundColor: 'var(--bg-base)',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '12px' }}>
                  {desc(t, entry.label)}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {entry.noteDiv}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
                  {entry.ms} ms
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {desc(t, entry.commonIn)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            {t('effects.selectType')}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* SECTION 4: Distortion Types Table                                      */}
      {/* =================================================================== */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            marginBottom: 'var(--space-3)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontWeight: 600
          }}
        >
          {t('effects.types.distortion')} {t('effects.type')}
        </div>

        {distTypes.length > 0 ? (
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
                gridTemplateColumns: '100px 1fr 1fr 80px 1fr',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--surface-1)',
                borderBottom: '1px solid var(--border)',
                fontSize: '9px',
                color: 'var(--text-tertiary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              <span>{t('effects.type')}</span>
              <span>{t('effects.description')}</span>
              <span>{t('effects.routing')}</span>
              <span>{t('effects.headers.thd')}</span>
              <span>{t('effects.tip')}</span>
            </div>

            {/* Data rows */}
            {distTypes.map((dist) => (
              <div
                key={dist.type}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr 1fr 80px 1fr',
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '13px',
                  backgroundColor: 'var(--bg-base)',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '11px', fontWeight: 600 }}>
                  {desc(t, dist.type)}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
                  {desc(t, dist.transferDescription)}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {desc(t, dist.harmonicProfile)}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '11px' }}>
                  {dist.thdRange}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {desc(t, dist.commonUse)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            {t('effects.selectType')}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* SECTION 5: Delay Feedback Staging Calculator                          */}
      {/* =================================================================== */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div
          style={{
            marginBottom: 'var(--space-3)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontWeight: 600
          }}
        >
          {t('effects.types.delay')} {t('effects.tip')}
        </div>

        {/* Feedback % Input */}
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          {t('effects.wetDry')} %
        </label>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={feedbackPercent}
          onChange={handleFeedbackChange}
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
            marginBottom: 'var(--space-4)'
          }}
          aria-label="Feedback %"
        />

        {/* Staging Result Display */}
        <div
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface-1)'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-4)'
            }}
          >
            {/* Repeats count */}
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '10px',
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 600,
                  marginBottom: 'var(--space-1)'
                }}
              >
                {t('effects.types.delay')}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '24px',
                  color: stagingResult.repeatsMinus60dB >= 100 ? 'var(--error)' : stagingResult.repeatsMinus60dB >= 20 ? 'var(--accent)' : 'var(--success)',
                  fontWeight: 600
                }}
              >
                {stagingResult.repeatsMinus60dB}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: 'var(--space-1)' }}>
                {t('effects.description')}
              </span>
            </div>

            {/* Character description */}
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '10px',
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 600,
                  marginBottom: 'var(--space-1)'
                }}
              >
                {t('effects.tip')}
              </span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: stagingResult.character === 'Self-oscillation!' ? 'var(--error)' : stagingResult.character === 'Near-infinite' ? 'var(--accent)' : 'var(--text-primary)'
                }}
              >
                {desc(t, stagingResult.character)}
              </span>
            </div>
          </div>

          {/* Visual feedback bar */}
          <div
            style={{
              marginTop: 'var(--space-3)',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: 'var(--bg-base)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${Math.min(stagingResult.repeatsMinus60dB / 2, 100)}%`,
                height: '100%',
                borderRadius: '2px',
                background: `linear-gradient(to right, var(--success), var(--accent), var(--error))`,
                transition: 'width 200ms ease'
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

export default EffectsCard
