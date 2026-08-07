/**
 * AkiMix
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * Frameless title bar with window controls.
 */

import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import LanguageSwitcher from './LanguageSwitcher'
import AppIcon from './AppIcon'

function TitleBar(): JSX.Element {
  const { t } = useTranslation()
  const settings = useAppStore((s) => s.settings)
  const setSettings = useAppStore((s) => s.setSettings)
  const [platform, setPlatform] = useState<'win32' | 'darwin' | 'other'>('other')
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('win')) setPlatform('win32')
    else if (ua.includes('mac')) setPlatform('darwin')
    else setPlatform('other')
  }, [])

  useEffect(() => {
    window.akiMix?.isMaximized().then(setIsMaximized)
    const unsub = window.akiMix?.onMaximizeChange(setIsMaximized)

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'F11') {
        e.preventDefault()
        window.akiMix?.toggleFullscreen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      unsub?.()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [])

  const handleToggleTheme = useCallback((): void => {
    const themes = ['dark', 'light', 'sepia', 'forest', 'ocean', 'lavender']
    const currentIndex = themes.indexOf(settings.theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setSettings({ theme: nextTheme })
    document.documentElement.dataset.theme = nextTheme
    window.akiMix?.setSettings({ theme: nextTheme })
  }, [settings.theme, setSettings])

  const handleMinimize = (): void => {
    window.akiMix?.minimizeWindow()
  }

  const handleClose = (): void => {
    window.close()
  }

  return (
    <div
      className="glass-surface"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '40px',
        borderBottom: '1px solid var(--glass-border)',
        WebkitAppRegion: 'drag',
        WebkitUserSelect: 'none',
        flexShrink: 0,
        position: 'relative'
      }}
    >
      {platform === 'darwin' && <div style={{ width: '78px', flexShrink: 0 }} />}

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', gap: '8px' }}>
        <AppIcon size={20} />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            color: 'var(--accent)',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap'
          }}
        >
          {t('app.title')}
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          WebkitAppRegion: 'no-drag'
        }}
      >
        <LanguageSwitcher />

        {/* Theme toggle */}
        <button
          onClick={handleToggleTheme}
          style={{
            width: '36px',
            height: '36px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            borderRadius: 'var(--radius-sm)',
            transition: 'color var(--duration-hover) var(--ease-default), background-color var(--duration-hover) var(--ease-default)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--text-primary) 6%, transparent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent' }}
          title={t('settings.theme')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </button>

        {/* Windows window controls */}
        {platform === 'win32' && (
          <>
            <button
              onClick={handleMinimize}
              style={{
                width: '46px',
                height: '36px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                transition: 'color var(--duration-hover) var(--ease-default), background-color var(--duration-hover) var(--ease-default)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--text-primary) 6%, transparent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent' }}
              title={t('titlebar.minimize')}
            >
              ─
            </button>
            <button
              onClick={() => window.akiMix?.toggleMaximize()}
              style={{
                width: '46px',
                height: '36px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                transition: 'color var(--duration-hover) var(--ease-default), background-color var(--duration-hover) var(--ease-default)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--text-primary) 6%, transparent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent' }}
              title={t(isMaximized ? 'titlebar.restore' : 'titlebar.maximize')}
            >
              {isMaximized ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="10" height="8" rx="1" />
                  <path d="M4 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" />
                </svg>
              )}
            </button>
            <button
              onClick={handleClose}
              style={{
                width: '46px',
                height: '36px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                transition: 'background-color var(--duration-hover) var(--ease-default)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e81123'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              title={t('titlebar.close')}
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default TitleBar
