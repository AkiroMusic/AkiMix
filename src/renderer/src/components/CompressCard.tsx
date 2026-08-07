/**
 * AkiMix
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * Compressor release time calculator.
 */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { getCompressReleaseTimes } from '../../../core/bpmCalculator'
import Card from './Card'

function CompressCard(): JSX.Element {
  const { t } = useTranslation()
  const bpm = useAppStore((s) => s.bpm)

  const releaseTimes = useMemo(() => getCompressReleaseTimes(bpm), [bpm])

  return (
    <Card title={t('compress.title')} headerAction={<span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--accent)' }}>{bpm} BPM</span>}>

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
            gridTemplateColumns: '1fr 1fr 1fr',
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
          <span>{t('compress.division')}</span>
          <span>{t('compress.time')}</span>
          <span>{t('compress.warning')}</span>
        </div>

        {/* Rows */}
        {releaseTimes.map((row) => (
          <div
            key={row.division}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: '1px solid var(--border)',
              fontSize: '14px',
              alignItems: 'center',
              backgroundColor: 'var(--bg-base)'
            }}
          >
            <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {row.division}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
              {row.ms} ms
            </span>
            <span
              style={{
                color: row.warning === 'low' ? 'var(--error)' : row.warning === 'high' ? '#FFA500' : 'var(--text-tertiary)',
                fontSize: '12px'
              }}
            >
              {row.warning === 'low' ? t('compress.warningLow') : row.warning === 'high' ? t('compress.warningHigh') : '—'}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default CompressCard
