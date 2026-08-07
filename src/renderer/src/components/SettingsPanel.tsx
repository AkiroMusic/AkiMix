/**
 * AkiMix
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * Settings panel — themes, language, export/import.
 */

import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import i18n from '../i18n'
import LanguageSwitcher from './LanguageSwitcher'
import Card from './Card'

function SettingsPanel(): JSX.Element {
  const { t } = useTranslation()
  const settings = useAppStore((s) => s.settings)
  const setSettings = useAppStore((s) => s.setSettings)
  const [message, setMessage] = useState('')

  const handleThemeChange = useCallback(
    (theme: string) => {
      setSettings({ theme })
      document.documentElement.dataset.theme = theme
      window.akiMix?.setSettings({ theme })
    },
    [setSettings]
  )

  const handleExport = useCallback(async () => {
    try {
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `akimix-settings-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMessage(t('settings.exportSuccess'))
    } catch {
      setMessage(t('settings.exportError'))
    }
    setTimeout(() => setMessage(''), 3000)
  }, [settings, t])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.theme) {
          setSettings({ theme: data.theme })
          document.documentElement.dataset.theme = data.theme
          window.akiMix?.setSettings({ theme: data.theme })
        }
        if (data.language) {
          setSettings({ language: data.language })
          i18n.changeLanguage(data.language)
          window.akiMix?.setSettings({ language: data.language })
        }
        setMessage(t('settings.importSuccess'))
      } catch {
        setMessage(t('settings.importError'))
      }
      setTimeout(() => setMessage(''), 3000)
    }
    input.click()
  }, [setSettings, t])

  const themes = [
    { value: 'system', labelKey: 'theme.system' },
    { value: 'dark', labelKey: 'theme.dark' },
    { value: 'light', labelKey: 'theme.light' },
    { value: 'sepia', labelKey: 'theme.sepia' },
    { value: 'forest', labelKey: 'theme.forest' },
    { value: 'ocean', labelKey: 'theme.ocean' },
    { value: 'lavender', labelKey: 'theme.lavender' }
  ]

  return (
    <Card title={t('settings.title')}>

      {/* Theme Selection */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
          {t('settings.theme')}
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {themes.map((opt) => {
            const isActive = settings.theme === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleThemeChange(opt.value)}
                style={{
                  padding: '4px 10px',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'inherit'
                }}
              >
                {t(opt.labelKey)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Language */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
          {t('settings.language')}
        </label>
        <LanguageSwitcher />
      </div>

      {/* Export/Import */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleExport}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'inherit'
            }}
          >
            {t('settings.exportSettings')}
          </button>
          <button
            onClick={handleImport}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'inherit'
            }}
          >
            {t('settings.importSettings')}
          </button>
        </div>
        {message && (
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
            {message}
          </div>
        )}
      </div>
    </Card>
  )
}

export default SettingsPanel
