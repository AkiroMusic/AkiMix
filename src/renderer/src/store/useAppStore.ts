/**
 * AkiMix
 * Copyright (c) 2026 Akiro. All rights reserved.
 */

import { create } from 'zustand'

/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Global App State (Zustand Store)
 * =============================================================================
 *
 * WHAT THIS STORE DOES:
 * Central state management for the entire app using Zustand. All components
 * read from and write to this store instead of passing props through multiple
 * levels (prop drilling). Think of it as the app's "single source of truth."
 *
 * WHY ZUSTAND:
 * Zustand is a tiny (~1KB), simple state manager that doesn't need providers
 * or context wrappers. Components can subscribe to specific slices (e.g.,
 * just the BPM value) and won't re-render when unrelated state changes.
 *
 * HOW TO USE IN A COMPONENT:
 *   import { useAppStore } from '../store/useAppStore'
 *
 *   // Subscribe to a single value (component only re-renders when THIS changes)
 *   const bpm = useAppStore((s) => s.bpm)
 *
 *   // Get an action to update state
 *   const setBpm = useAppStore((s) => s.setBpm)
 *   setBpm(128) // Updates BPM, clamps to 1-999
 */

/** All available views/pages in the app. Add new views here to make them navigable. */
export type ViewType =
  | 'bpm'            // BPM input + tap tempo
  | 'compress'       // Compressor release times
  | 'reverb'         // Reverb pre-delay + RT60
  | 'delay'          // Delay time grid
  | 'frequency'      // Frequency chart + pitch shift
  | 'samples'        // Samples converter
  | 'eq'             // EQ recommendations
  | 'levels'         // Mix element dB levels
  | 'loudness'       // LUFS loudness standards
  // ===== Direction 1: Sound Design Tools =====
  | 'oscillator'     // Oscillator Calculator — detune, unison, FM, sub-osc
  | 'filter'         // Filter Calculator — cutoff→note, Q→resonance, slopes
  | 'modulation'     // Modulation Planner — LFO shapes, routing matrix
  | 'sidechain'      // Sidechain Calculator — ducking curves, timing
  | 'effects'        // Effects Reference — types, routing, wet/dry
  // ===== Direction 2: Arrangement & Composition Tools =====
  | 'chords'         // Chord Progressions — types, voicings, progressions
  | 'scales'         // Scale Reference — modes, intervals, note maps
  | 'songStructure'  // Song Structure — 22 genre arrangement templates
  | 'drumPattern'    // Drum Pattern Generator — 16 genre beat templates
  | 'settings'       // App settings

/**
 * User-adjustable app settings. Persisted via Electron's simpleStore.
 * When changing settings, call both setSettings() and window.akiMix.setSettings()
 * to persist to disk.
 */
export interface AppSettings {
  /** UI language (e.g., 'en-US', 'zh-CN') */
  language: string
  /** Active theme name (dark, light, sepia, forest, ocean, lavender, system) */
  theme: string
}

/**
 * Complete app state interface.
 * Each field represents a piece of state that any component can subscribe to.
 */
interface AppState {
  /** Which view/page is currently shown in the main content area */
  currentView: ViewType
  /** Current BPM value (1-999). Default 120. */
  bpm: number
  /** User settings object (language, theme) */
  settings: AppSettings
  /** Stored tap intervals in ms. Used by Tap Tempo to calculate BPM. */
  tapIntervals: number[]

  // ===== Actions (functions that modify state) =====

  /** Navigate to a different view */
  setView: (view: ViewType) => void
  /** Set BPM value. Automatically clamped to 1-999. */
  setBpm: (bpm: number) => void
  /** Update settings (partial merge). Pass only the keys you want to change. */
  setSettings: (settings: Partial<AppSettings>) => void
  /** Replace all tap intervals (used by tap tempo) */
  setTapIntervals: (intervals: number[]) => void
  /** Add a single tap interval. Keeps last 8 entries to prevent memory buildup. */
  addTapInterval: (interval: number) => void
  /** Clear all tap intervals (reset tap tempo detection) */
  resetTap: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'bpm',
  bpm: 120,
  settings: {
    language: 'en-US',
    theme: 'dark'
  },
  tapIntervals: [],

  setView: (view) => set({ currentView: view }),

  setBpm: (bpm) =>
    set({ bpm: Math.max(1, Math.min(999, bpm)) }),

  setSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings }
    })),

  setTapIntervals: (intervals) => set({ tapIntervals: intervals }),

  addTapInterval: (interval) =>
    set((state) => ({
      tapIntervals: [...state.tapIntervals, interval].slice(-8)
    })),

  resetTap: () => set({ tapIntervals: [] })
}))
