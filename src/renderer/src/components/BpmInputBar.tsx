/**
 * AkiMix
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * BPM input with Tap Tempo and speed multiplier.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { calculateTapTempo, applySpeedMultiplier, getNormalDelays } from '../../../core/bpmCalculator'
import Card from './Card'

function BpmInputBar(): JSX.Element {
  const { t } = useTranslation()
  const bpm = useAppStore((s) => s.bpm)
  const setBpm = useAppStore((s) => s.setBpm)
  const tapIntervals = useAppStore((s) => s.tapIntervals)
  const addTapInterval = useAppStore((s) => s.addTapInterval)
  const resetTap = useAppStore((s) => s.resetTap)

  const [inputValue, setInputValue] = useState(String(bpm))
  const [tapDetecting, setTapDetecting] = useState(false)
  const lastTapRef = useRef<number>(0)
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleBpmChange = useCallback((value: string) => {
    setInputValue(value)
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 1 && num <= 999) {
      setBpm(num)
    }
  }, [setBpm])

  const handleTap = useCallback(() => {
    const now = Date.now()
    if (lastTapRef.current > 0) {
      const interval = now - lastTapRef.current
      if (interval > 100 && interval < 3000) {
        addTapInterval(interval)
        const newIntervals = [...tapIntervals, interval]
        const calculatedBpm = calculateTapTempo(newIntervals)
        if (calculatedBpm > 0) {
          setBpm(calculatedBpm)
          setInputValue(String(calculatedBpm))
        }
      } else if (interval >= 3000) {
        resetTap()
        addTapInterval(0) // restart
      }
    }
    lastTapRef.current = now
    setTapDetecting(true)

    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current)
    tapTimeoutRef.current = setTimeout(() => {
      setTapDetecting(false)
    }, 2000)
  }, [tapIntervals, addTapInterval, resetTap, setBpm])

  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        handleTap()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleTap])

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current)
    }
  }, [])

  const handleSpeedMultiplier = useCallback((mult: number) => {
    const newBpm = applySpeedMultiplier(bpm, mult)
    setBpm(newBpm)
    setInputValue(String(newBpm))
    if (mult !== 1) resetTap()
  }, [bpm, setBpm, resetTap])

  const handleReset = useCallback(() => {
    setInputValue('120')
    setBpm(120)
    resetTap()
    lastTapRef.current = 0
  }, [setBpm, resetTap])

  const delays = getNormalDelays(bpm)

  return (
    <Card title={t('bpm.title')}>
      {/* BPM Input Row */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {t('bpm.label')}
          </label>
          <input
            type="number"
            min={1}
            max={999}
            value={inputValue}
            onChange={(e) => handleBpmChange(e.target.value)}
            style={{
              width: '100px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: '20px',
              fontFamily: 'var(--font-mono)',
              textAlign: 'center',
              outline: 'none',
              fontWeight: 600,
              transition: 'border-color var(--duration-hover) var(--ease-default)'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />
        </div>

        {/* Tap button */}
        <button
          onClick={handleTap}
          style={{
            padding: '8px 24px',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${tapDetecting ? 'var(--accent)' : 'var(--border)'}`,
            backgroundColor: tapDetecting ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--surface-2)',
            color: tapDetecting ? 'var(--accent)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '15px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            transition: 'all var(--duration-spring) var(--ease-spring)',
            boxShadow: tapDetecting ? 'var(--shadow-accent)' : 'none'
          }}
          title={t('bpm.tapHint')}
        >
          ♪ {t('bpm.tap')}
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'inherit',
            transition: 'color var(--duration-hover) var(--ease-default), border-color var(--duration-hover) var(--ease-default)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--text-tertiary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          {t('bpm.reset', { defaultValue: 'Reset' })}
        </button>
      </div>

      {/* Speed Multiplier */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
          {t('bpm.speed')}
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {[0.5, 1, 2, 3].map((mult) => (
            <button
              key={mult}
              onClick={() => handleSpeedMultiplier(mult)}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                transition: 'all var(--duration-spring) var(--ease-spring)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent)'
                e.currentTarget.style.borderColor = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              {mult}x
            </button>
          ))}
        </div>
      </div>

      {/* Quick reference — note delay preview */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--surface-2)',
          border: '1px solid var(--border)',
          fontSize: '13px',
          lineHeight: 1.6
        }}
      >
        <div style={{ marginBottom: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: '12px' }}>
          {t('bpm.quickReference', { defaultValue: 'Quick Reference — Note Delays' })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
          {Object.entries(delays).map(([div, ms]) => (
            <div key={div} style={{ color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>{div} </span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{ms}ms</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default BpmInputBar
