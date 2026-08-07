/**
 * AkiMix
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * Frequency & Pitch lookup — note chart + pitch shift converter.
 */

import { useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { generateFrequencyChart, semitonesToSpeed } from '../../../core/frequencyChart'
import Card from './Card'

function FrequencyPitchCard(): JSX.Element {
  const { t } = useTranslation()
  const [semitones, setSemitones] = useState(0)
  const [cents, setCents] = useState(0)

  const chart = useMemo(() => generateFrequencyChart(), [])

  const semitonesSpeed = useMemo(() => semitonesToSpeed(semitones), [semitones])
  const centsSpeed = useMemo(() => {
    return parseFloat(semitonesToSpeed(cents / 100).toFixed(4))
  }, [cents])

  const handleSemitonesChange = useCallback((value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      setSemitones(Math.max(-24, Math.min(24, num)))
    }
  }, [])

  const handleCentsChange = useCallback((value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      setCents(Math.max(-2400, Math.min(2400, num)))
    }
  }, [])

  // Compute pitch names for efficient chart display
  // Show only C octaves as markers, then render full rows
  return (
    <Card title={t('frequency.title')} subtitle={t('frequency.a4')}>

      {/* Pitch Shift Section */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--border)',
          marginBottom: 'var(--space-6)'
        }}
      >
        <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: 'var(--space-3)', fontWeight: 500 }}>
          {t('frequency.pitchShift')}
        </h3>

        {/* Semitones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', minWidth: '90px' }}>
            {t('frequency.semitones')}
          </label>
          <input
            type="range"
            min={-24}
            max={24}
            step={1}
            value={semitones}
            onChange={(e) => setSemitones(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--accent)', height: '6px', cursor: 'pointer' }}
          />
          <input
            type="number"
            value={semitones}
            onChange={(e) => handleSemitonesChange(e.target.value)}
            style={{
              width: '70px',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              textAlign: 'center',
              outline: 'none'
            }}
          />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            st
          </span>
        </div>

        {/* Cents */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', minWidth: '90px' }}>
            {t('frequency.cents')}
          </label>
          <input
            type="range"
            min={-2400}
            max={2400}
            step={10}
            value={cents}
            onChange={(e) => setCents(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--accent)', height: '6px', cursor: 'pointer' }}
          />
          <input
            type="number"
            value={cents}
            onChange={(e) => handleCentsChange(e.target.value)}
            style={{
              width: '70px',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              textAlign: 'center',
              outline: 'none'
            }}
          />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            ct
          </span>
        </div>

        {/* Speed Result */}
        <div
          style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {t('frequency.speed')}
          </span>
          <span style={{ fontSize: '18px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
            {semitones !== 0 ? (
              <>{semitonesSpeed.toFixed(4)}x <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>({semitones > 0 ? '+' : ''}{semitones}st)</span></>
            ) : cents !== 0 ? (
              <>{centsSpeed.toFixed(4)}x <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>({cents > 0 ? '+' : ''}{cents}ct)</span></>
            ) : (
              '1.0000x'
            )}
          </span>
        </div>
      </div>

      {/* Frequency Chart */}
      <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: 'var(--space-3)', fontWeight: 500 }}>
        {t('frequency.chart')}
      </h3>
      <div
        style={{
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          maxHeight: '400px',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '70px 70px 1fr',
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: 'var(--surface-1)',
            borderBottom: '1px solid var(--border)',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            position: 'sticky',
            top: 0
          }}
        >
          <span>{t('frequency.note')}</span>
          <span>{t('frequency.midi')}</span>
          <span>{t('frequency.frequency')}</span>
        </div>

        {/* Chart rows — show C's as section markers */}
        {chart.map((note) => {
          const isC = note.note.startsWith('C')
          return (
            <div
              key={note.midi}
              style={{
                display: 'grid',
                gridTemplateColumns: '70px 70px 1fr',
                padding: '2px var(--space-3)',
                borderBottom: '1px solid var(--border)',
                fontSize: isC ? '13px' : '12px',
                backgroundColor: isC ? 'color-mix(in srgb, var(--accent) 3%, transparent)' : 'transparent',
                color: isC ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              <span style={{ fontWeight: isC ? 600 : 400, fontFamily: 'var(--font-mono)' }}>
                {note.note}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                {note.midi}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: isC ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {note.frequency} Hz
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default FrequencyPitchCard
