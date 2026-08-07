/**
 * AkiMix
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * Reverb calculator — pre-delay and RT60.
 */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { getReverbPreDelay, getReverbRt60, REVERB_PRE_DELAY_RANGES, type ReverbType } from '../../../core/bpmCalculator'
import Card from './Card'

function ReverbCard(): JSX.Element {
  const { t } = useTranslation()
  const bpm = useAppStore((s) => s.bpm)

  const preDelays = useMemo(() => {
    const divisions = [4, 8, 16, 32]
    return divisions.map((div) => ({
      division: `1/${div}`,
      ms: getReverbPreDelay(bpm, div)
    }))
  }, [bpm])

  const rt60 = useMemo(() => getReverbRt60(bpm), [bpm])

  const reverbTypes: ReverbType[] = ['room', 'hall', 'plate', 'chamber']

  return (
    <Card
      title={t('reverb.title')}
      headerAction={
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--accent)' }}>{bpm} BPM</span>
      }
    >

      {/* Pre-Delay Section */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: 'var(--space-3)', fontWeight: 500 }}>
          {t('reverb.preDelay')}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
          {t('reverb.preDelayDesc')}
        </p>

        {/* Pre-delay table */}
        <div
          style={{
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            marginBottom: 'var(--space-4)'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
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
            {preDelays.map((pd) => (
              <span key={pd.division}>{pd.division}</span>
            ))}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              padding: 'var(--space-3) var(--space-4)',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent)'
            }}
          >
            {preDelays.map((pd) => (
              <span key={pd.division}>{pd.ms} ms</span>
            ))}
          </div>
        </div>

        {/* Reverb type ranges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
          {reverbTypes.map((type) => {
            const range = REVERB_PRE_DELAY_RANGES[type]
            // Suggest division based on midpoint
            const midMs = (range.min + range.max) / 2
            const allPreDelays = [4, 8, 16, 32].map((d) => ({
              div: d,
              ms: getReverbPreDelay(bpm, d)
            }))
            const closest = allPreDelays.reduce((a, b) =>
              Math.abs(a.ms - midMs) < Math.abs(b.ms - midMs) ? a : b
            )
            return (
              <div
                key={type}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                  {t(`reverb.${type}`)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {range.min}–{range.max} ms
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginTop: 'var(--space-1)' }}>
                  ≈ {closest.division} = {closest.ms}ms
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RT60 Section */}
      <div>
        <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: 'var(--space-3)', fontWeight: 500 }}>
          {t('reverb.rt60')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
          {[
            { key: 'short', label: 'reverb.short', ms: rt60.short },
            { key: 'medium', label: 'reverb.medium', ms: rt60.medium },
            { key: 'long', label: 'reverb.long', ms: rt60.long }
          ].map((item) => (
            <div
              key={item.key}
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
                {t(item.label)}
              </div>
              <div style={{ fontSize: '22px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                {item.ms} <span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default ReverbCard
