/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Preload API TypeScript Type Definitions
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 *   Declares the TypeScript types for window.akiMix — the API bridge between
 *   Electron's main process and the React renderer.
 *
 * WHY THIS IS NEEDED:
 *   Without this file, TypeScript would throw errors when the renderer code
 *   calls window.akiMix.getSettings() because akiMix doesn't exist on the
 *   standard Window interface. This file AUGMENTS the Window interface to
 *   add our custom property.
 *
 * HOW IT WORKS:
 *   1. We define an AkiMixAPI interface with all available methods
 *   2. We use "declare global { interface Window { akiMix: AkiMixAPI } }"
 *      to add akiMix to the global Window type
 *   3. Now TypeScript knows window.akiMix exists and can type-check calls
 *
 * @see src/preload/index.ts — The actual implementation of these methods
 */

/**
 * AkiMixAPI — Methods exposed to the renderer via contextBridge.
 *
 * Each method corresponds to an IPC handler in the main process or a
 * Web API wrapper in the preload script. The renderer calls these as:
 *   const result = await window.akiMix.someMethod(args)
 *
 * CLEANUP PATTERN for event listeners:
 *   Methods that subscribe to events (onMaximizeChange, onSystemThemeChanged)
 *   return a cleanup function. Use with React useEffect:
 *     useEffect(() => window.akiMix.onMaximizeChange(handler), [])
 */
export interface AkiMixAPI {
  // ===== Settings =====
  /** Get all persisted settings as a plain key-value object */
  getSettings: () => Promise<Record<string, unknown>>
  /** Update one or more settings (partial patch) */
  setSettings: (patch: Record<string, unknown>) => Promise<void>

  // ===== Window Controls =====
  /** Minimize the main window to the taskbar */
  minimizeWindow: () => Promise<void>
  /** Toggle between maximized and restored state */
  toggleMaximize: () => Promise<void>
  /** Check if window is currently maximized */
  isMaximized: () => Promise<boolean>
  /** Toggle fullscreen mode */
  toggleFullscreen: () => Promise<void>
  /** Subscribe to maximize/restore events; returns unsubscribe function */
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void
  /** Update the window title text */
  setWindowTitle: (title: string) => Promise<void>

  // ===== Theme =====
  /** Get the OS-level dark/light mode preference */
  getSystemTheme: () => Promise<'dark' | 'light'>
  /** Subscribe to OS theme changes; returns unsubscribe function */
  onSystemThemeChanged: (callback: (theme: 'dark' | 'light') => void) => () => void

  // ===== Clipboard =====
  /** Copy text to the system clipboard */
  copyToClipboard: (text: string) => Promise<void>
}

/**
 * Global Window Augmentation.
 * This adds the `akiMix` property to the Window interface so that
 * window.akiMix.X is type-safe everywhere in the renderer code.
 */
declare global {
  interface Window {
    akiMix: AkiMixAPI
  }
}
