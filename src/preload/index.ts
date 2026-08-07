/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Preload Script — Bridge Between Main & Renderer
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 *   In Electron, the MAIN process (Node.js) and RENDERER process (React/Chrome)
 *   run in completely separate contexts. They CANNOT directly access each other's
 *   APIs. This preload script is the BRIDGE between them.
 *
 * HOW IT WORKS:
 *   1. This script runs in a privileged context (can use ipcRenderer)
 *   2. It uses contextBridge.exposeInMainWorld() to safely expose an API object
 *      (window.akiMix) to the renderer
 *   3. The renderer calls window.akiMix.someMethod() → preload sends IPC message
 *      → main process handles it → returns result
 *
 * SECURITY — contextIsolation:
 *   Without contextBridge, the renderer would have full Node.js access (bad!).
 *   With contextBridge, we expose ONLY what's explicitly listed below.
 *   The renderer cannot access: fs, path, process.env, child_process, etc.
 *
 * PATTERN — ipcRenderer.invoke + ipcMain.handle:
 *   This is the modern Electron IPC pattern. It returns a Promise, making it
 *   feel like a normal async function call.
 *
 * PATTERN — ipcRenderer.on + return cleanup function:
 *   For "push" notifications (main → renderer), we use event listeners.
 *   The returned cleanup function allows React useEffect to unsubscribe.
 *   Example: useEffect(() => window.akiMix.onMaximizeChange(setter), [])
 *
 * TYPE DEFINITIONS:
 *   See src/preload/index.d.ts for the AkiMixAPI interface and Window type
 *   augmentation. This is what gives TypeScript type checking for
 *   window.akiMix.* calls in the renderer.
 */

import { contextBridge, ipcRenderer } from 'electron'

/**
 * The API object exposed to the renderer as window.akiMix.
 * Each method uses one of two IPC patterns:
 *   - invoke/handle: For request-response (returns a Promise)
 *   - on/removeListener: For event subscriptions (push notifications)
 */
const akiMixAPI = {
  // ===========================================================================
  // SETTINGS — Persistent key-value storage
  // ===========================================================================
  // The SimpleStore in main process saves JSON to app.getPath('userData').
  // Settings survive app restarts and are shared across all windows.

  /** Get ALL settings as a plain object */
  getSettings: (): Promise<Record<string, unknown>> =>
    ipcRenderer.invoke('settings:get'),

  /**
   * Update one or more settings.
   * @param patch — Partial settings object: { theme: 'light' }
   *               Only specified keys are changed; others keep their values.
   */
  setSettings: (patch: Record<string, unknown>): Promise<void> =>
    ipcRenderer.invoke('settings:set', patch),

  // ===========================================================================
  // WINDOW CONTROLS — Custom title bar operations
  // ===========================================================================
  // Since we use frame: false (no OS title bar), the React UI must handle
  // window controls. These methods call the main process to do the actual
  // window management since the renderer can't directly manipulate windows.

  /** Minimize the window to taskbar */
  minimizeWindow: (): Promise<void> =>
    ipcRenderer.invoke('window:minimize'),

  /** Toggle between maximized and normal state */
  toggleMaximize: (): Promise<void> =>
    ipcRenderer.invoke('window:maximize'),

  /** Check if the window is currently maximized (for restore button icon) */
  isMaximized: (): Promise<boolean> =>
    ipcRenderer.invoke('window:isMaximized'),

  /** Toggle fullscreen mode (F11) */
  toggleFullscreen: (): Promise<void> =>
    ipcRenderer.invoke('window:fullscreen'),

  /**
   * Listen for maximize/restore events (triggered by keyboard shortcuts,
   * double-click title bar, etc.).
   * @param callback — Called with true when maximized, false when restored
   * @returns A cleanup function to unsubscribe (for React useEffect)
   *
   * USAGE:
   *   useEffect(() => window.akiMix.onMaximizeChange(setIsMaximized), [])
   */
  onMaximizeChange: (
    callback: (isMaximized: boolean) => void
  ): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean) =>
      callback(isMaximized)
    ipcRenderer.on('window:maximizeChanged', handler)
    return () => ipcRenderer.removeListener('window:maximizeChanged', handler)
  },

  /** Update the window title text (used when switching languages) */
  setWindowTitle: (title: string): Promise<void> =>
    ipcRenderer.invoke('window:setTitle', title),

  // ===========================================================================
  // THEME — System theme detection
  // ===========================================================================
  // Detects the OS-level color scheme preference (dark/light mode).
  // Used for "follow system" theme setting.

  /** Get the current OS theme preference */
  getSystemTheme: (): Promise<'dark' | 'light'> =>
    ipcRenderer.invoke('theme:getSystemTheme'),

  /**
   * Listen for OS theme changes while the app is running
   * (e.g., user switches from dark to light mode in system settings).
   * @param callback — Called with 'dark' or 'light'
   * @returns A cleanup function to unsubscribe
   */
  onSystemThemeChanged: (
    callback: (theme: 'dark' | 'light') => void
  ): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, theme: 'dark' | 'light') =>
      callback(theme)
    ipcRenderer.on('theme:systemChanged', handler)
    return () => ipcRenderer.removeListener('theme:systemChanged', handler)
  },

  // ===========================================================================
  // CLIPBOARD — Text copy helper
  // ===========================================================================
  // Uses the Web API (navigator.clipboard) — available in the renderer,
  // so no IPC needed. Included here for convenience and consistency.

  /** Copy text to system clipboard */
  copyToClipboard: (text: string): Promise<void> =>
    navigator.clipboard.writeText(text)
}

/**
 * contextBridge.exposeInMainWorld() makes the akiMixAPI object available
 * as window.akiMix in the renderer process.
 *
 * The renderer code can then call:
 *   await window.akiMix.getSettings()
 *   await window.akiMix.toggleMaximize()
 *   useEffect(() => window.akiMix.onMaximizeChange(handler), [])
 *
 * TypeScript types for window.akiMix are declared in index.d.ts
 */
contextBridge.exposeInMainWorld('akiMix', akiMixAPI)
