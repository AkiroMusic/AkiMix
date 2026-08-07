/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * App — Root Component
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 *   This is the ROOT React component. It manages:
 *   1. LAYOUT: The full app shell (title bar, sidebar, content area, footer)
 *   2. NAVIGATION: Routes between different tool views using the Zustand store
 *   3. THEMING: Loads and applies dark/light/system theme on startup
 *   4. SETTINGS: Loads persisted settings from Electron's main process
 *   5. I18N: Sets the language on first load from saved settings
 *
 * COMPONENT HIERARCHY:
 *   <App>                              ← You are here
 *     <StarBackground />              ← Animated star field in background
 *     <TitleBar />                    ← Custom window title bar (drag, controls)
 *     <Sidebar />                     ← Icon-based navigation (left side)
 *     <main>                          ← Tool content (center, fills remaining space)
 *       <BpmInputBar />               ← If currentView === 'bpm'
 *       <CompressCard />              ← If currentView === 'compress'
 *       ...etc...
 *     </main>
 *     <footer>                        ← Bottom bar with copyright + links
 *
 * STATE MANAGEMENT (Zustand):
 *   The app state lives in useAppStore (Zustand, like Redux but simpler).
 *   Components access global state via hooks:
 *     const currentView = useAppStore((s) => s.currentView)
 *     const setView = useAppStore((s) => s.setView)
 *
 * THEME SYSTEM:
 *   Three modes: 'dark', 'light', 'system'
 *   Themes use CSS custom properties (var(--xxx)) defined in tokens.css.
 *   The theme is applied by setting data-theme on <html>.
 *   'system' mode listens for OS theme changes and updates automatically.
 *
 * @see src/renderer/src/store/useAppStore.ts — Zustand store
 * @see src/renderer/src/styles/tokens.css — CSS theme variables
 * @see src/renderer/src/i18n.ts — Internationalization setup
 */

import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from './i18n'
import { useAppStore, type ViewType } from './store/useAppStore'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import BpmInputBar from './components/BpmInputBar'
import CompressCard from './components/CompressCard'
import ReverbCard from './components/ReverbCard'
import DelayCard from './components/DelayCard'
import FrequencyPitchCard from './components/FrequencyPitchCard'
import SamplesCard from './components/SamplesCard'
import EqCard from './components/EqCard'
import MixLevelsCard from './components/MixLevelsCard'
import LoudnessCard from './components/LoudnessCard'
// ===== Direction 1: Sound Design Cards =====
import OscillatorCard from './components/OscillatorCard'
import FilterCard from './components/FilterCard'
import ModulationCard from './components/ModulationCard'
import SidechainCard from './components/SidechainCard'
import EffectsCard from './components/EffectsCard'
// ===== Direction 2: Arrangement & Composition Cards =====
import ChordsCard from './components/ChordsCard'
import ScalesCard from './components/ScalesCard'
import SongStructureCard from './components/SongStructureCard'
import DrumPatternCard from './components/DrumPatternCard'
import SettingsPanel from './components/SettingsPanel'
import StarBackground from './components/StarBackground'
import './i18n'
import './styles/tokens.css'

function App(): JSX.Element {
  const { t } = useTranslation()
  const currentView = useAppStore((s) => s.currentView)
  const setView = useAppStore((s) => s.setView)
  const settings = useAppStore((s) => s.settings)
  const setSettings = useAppStore((s) => s.setSettings)

  // ===========================================================================
  // EFFECT 1: Load saved settings on mount
  // ===========================================================================
  // When the app starts, this effect runs once to load settings from the
  // Electron main process (which reads from a JSON file on disk).
  // The settings include: theme preference, language selection.
  //
  // Why optional chaining (window.akiMix?.):
  //   During development with strict sandbox or testing, window.akiMix
  //   might not exist. The ?. gracefully handles this.
  useEffect(() => {
    window.akiMix?.getSettings().then((s) => {
      setSettings(s as { language?: string; theme?: string })
      if (s.language) {
        i18n.changeLanguage(s.language as string)
      }
    }).catch(() => {})
  }, [])

  // ===========================================================================
  // EFFECT 2: Apply theme to <html> when settings change
  // ===========================================================================

  /**
   * resolveSystemTheme — Check OS-level dark/light preference.
   * First tries Electron's nativeTheme API, falls back to CSS media query.
   */
  const resolveSystemTheme = useCallback(async (): Promise<'dark' | 'light'> => {
    try {
      return await window.akiMix.getSystemTheme()
    } catch {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
  }, [])

  /**
   * Apply theme by setting data-theme on the <html> element.
   * CSS selectors like [data-theme="dark"] control which variables are used.
   */
  useEffect(() => {
    const apply = async (): Promise<void> => {
      let theme = settings.theme
      // 'system' mode: resolve to actual dark/light from OS
      if (theme === 'system') {
        theme = await resolveSystemTheme()
      }
      document.documentElement.dataset.theme = theme
    }
    apply()
  }, [settings.theme, resolveSystemTheme])

  // ===========================================================================
  // EFFECT 3: Listen for OS theme changes (when in 'system' mode)
  // ===========================================================================
  // Two listeners:
  //   1. Electron nativeTheme IPC (faster, more reliable)
  //   2. CSS media query as fallback (works in browser previews)
  useEffect(() => {
    if (settings.theme !== 'system') return

    const unsub = window.akiMix?.onSystemThemeChanged((systemTheme) => {
      document.documentElement.dataset.theme = systemTheme
    })

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (): void => {
      if (settings.theme === 'system') {
        document.documentElement.dataset.theme = mq.matches ? 'dark' : 'light'
      }
    }
    mq.addEventListener('change', handler)

    return () => {
      unsub?.()
      mq.removeEventListener('change', handler)
    }
  }, [settings.theme])

  // ===========================================================================
  // VIEW ROUTER
  // ===========================================================================
  // Renders the correct tool component based on the currentView state.
  // This is a simple switch-case (not React Router — no URLs needed for
  // an Electron app).

  const renderContent = (): JSX.Element => {
    switch (currentView) {
      case 'bpm':
        return <BpmInputBar />
      case 'compress':
        return <CompressCard />
      case 'reverb':
        return <ReverbCard />
      case 'delay':
        return <DelayCard />
      case 'frequency':
        return <FrequencyPitchCard />
      case 'samples':
        return <SamplesCard />
      case 'eq':
        return <EqCard />
      case 'levels':
        return <MixLevelsCard />
      case 'loudness':
        return <LoudnessCard />
      // ===== Direction 1: Sound Design =====
      case 'oscillator':
        return <OscillatorCard />
      case 'filter':
        return <FilterCard />
      case 'modulation':
        return <ModulationCard />
      case 'sidechain':
        return <SidechainCard />
      case 'effects':
        return <EffectsCard />
      // ===== Direction 2: Arrangement & Composition =====
      case 'chords':
        return <ChordsCard />
      case 'scales':
        return <ScalesCard />
      case 'songStructure':
        return <SongStructureCard />
      case 'drumPattern':
        return <DrumPatternCard />
      case 'settings':
        return <SettingsPanel />
      default:
        return <BpmInputBar />
    }
  }

  return (
    <div className="flex flex-col w-full h-screen" style={{ backgroundColor: 'var(--bg-base)', position: 'relative' }}>
      <div className="ambient-bg" />
      <StarBackground />
      <div className="noise-overlay" />
      <TitleBar />
      <div className="flex flex-1 overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
        <Sidebar currentView={currentView} onNavigate={setView} />
        <main className="flex-1 flex flex-col overflow-hidden" style={{ maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
          <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--space-8) var(--space-6)' }}>
            {renderContent()}
          </div>
        </main>
      </div>
      {/* Footer */}
      <div
        className="glass-surface"
        style={{
          height: '28px',
          padding: '0 var(--space-4)',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          letterSpacing: '0.3px',
          userSelect: 'none'
        }}
      >
        <span>&copy; 2026 Akiro (AkiroMusic)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="https://akiromusic.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
          >
            akiromusic.com
          </a>
          <span style={{ opacity: 0.3 }}>|</span>
          <a
            href="mailto:akiromusic@qq.com"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
          >
            akiromusic@qq.com
          </a>
        </span>
      </div>
    </div>
  )
}

export default App
