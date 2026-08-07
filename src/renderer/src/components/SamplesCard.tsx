/**
 * AkiMix
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * Samples converter — ms to samples at various sample rates.
 */

import { useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { getAllSampleCounts, formatSampleCount, SAMPLE_RATES } from '../../../core/sampleConverter'
import Card from './Card'

function SamplesCard(): JSX.Element {
  const { t } = useTranslation()
  const [msInput, setMsInput] = useState('100')

  const ms = parseFloat(msInput) || 0
  const counts = useMemo(() => getAllSampleCounts(ms), [ms])

  const handleMsChange = useCallback((value: string) => {
    // Allow empty for editing
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMsInput(value)
    }
  }, [])

  return (
    <Card title={t('samples.title')}>

      {/* MS Input */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
          {t('samples.msLabel')}
        </label>
        <input
          type="text"
          value={msInput}
          onChange={(e) => handleMsChange(e.target.value)}
          placeholder={t('samples.placeholder')}
          style={{
            width: '200px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontSize: '20px',
            fontFamily: 'var(--font-mono)',
            textAlign: 'center',
            outline: 'none',
            fontWeight: 600
          }}
        />
        <span style={{ marginLeft: 'var(--space-2)', fontSize: '14px', color: 'var(--text-tertiary)' }}>ms</span>
      </div>

      {/* Results Table */}
      <div
        style={{
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--surface-1)',
            borderBottom: '1px solid var(--border)',
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          <span>{t('samples.sampleRate')}</span>
          <span>{t('samples.samples')}</span>
        </div>

        {/* Rows */}
        {SAMPLE_RATES.map((rate) => (
          <div
            key={rate}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: '1px solid var(--border)',
              fontSize: '14px',
              alignItems: 'center',
              backgroundColor: 'var(--bg-base)'
            }}
          >
            <span style={{ color: 'var(--text-primary)' }}>
              {rate.toLocaleString()} Hz
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '16px', fontWeight: 600 }}>
              {formatSampleCount(counts[rate])}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default SamplesCard
