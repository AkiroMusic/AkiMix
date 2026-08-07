/**
 * AkiMix
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * Delay time grid with Normal, Dotted, Triplet and 1-click copy.
 */

import { useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { getNormalDelays, getDottedDelays, getTripletDelays } from '../../../core/bpmCalculator'
import Card from './Card'

const DIVISIONS = ['1/1', '1/2', '1/4', '1/8', '1/16', '1/32', '1/64']

function DelayCard(): JSX.Element {
  const { t } = useTranslation()
  const bpm = useAppStore((s) => s.bpm)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const normal = useMemo(() => getNormalDelays(bpm), [bpm])
  const dotted = useMemo(() => getDottedDelays(bpm), [bpm])
  const triplet = useMemo(() => getTripletDelays(bpm), [bpm])

  const handleCopy = useCallback(async (value: number, key: string) => {
    try {
      await navigator.clipboard.writeText(String(value))
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    } catch {
      // clipboard may not be available
    }
  }, [])

  const columns = [
    { label: t('delay.normal'), data: normal },
    { label: t('delay.dotted'), data: dotted },
    { label: t('delay.triplet'), data: triplet }
  ]

  return (
    <Card title={t('delay.title')} headerAction={<span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--accent)' }}>{bpm} BPM</span>}>

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
            gridTemplateColumns: '80px repeat(3, 1fr)',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--surface-1)',
            borderBottom: '1px solid var(--border)',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          <span>{t('delay.division')}</span>
          {columns.map((col) => (
            <span key={col.label}>{col.label}</span>
          ))}
        </div>

        {/* Rows */}
        {DIVISIONS.map((div) => (
          <div
            key={div}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px repeat(3, 1fr)',
              padding: 'var(--space-2) var(--space-4)',
              borderBottom: '1px solid var(--border)',
              fontSize: '13px',
              alignItems: 'center',
              backgroundColor: 'var(--bg-base)'
            }}
          >
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              {div}
            </span>
            {columns.map((col) => {
              const ms = col.data[div]
              const key = `${div}-${col.label}`
              // Guard: skip cell if the division is missing from this column's data
              if (typeof ms !== 'number' || !isFinite(ms)) return null
              return (
                <div
                  key={key}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                    {ms.toFixed(1).replace(/\.0$/, '')} ms
                  </span>
                  <button
                    onClick={() => handleCopy(ms, key)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      color: copiedKey === key ? 'var(--success)' : 'var(--text-tertiary)',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontFamily: 'inherit',
                      transition: 'all var(--duration-hover) var(--ease-default)',
                      whiteSpace: 'nowrap'
                    }}
                    title={t('delay.copy')}
                  >
                    {copiedKey === key ? t('delay.copied') : t('delay.copy')}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </Card>
  )
}

export default DelayCard
