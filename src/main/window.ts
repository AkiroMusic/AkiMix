/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Electron Window Creator
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 *   Creates and configures the main BrowserWindow for AkiMix.
 *   Called from src/main/index.ts once the app is ready.
 *
 * KEY CONCEPT — Electron Window Anatomy:
 *   - BrowserWindow is a desktop window (like Chrome, VSCode, etc.)
 *   - frame: false — removes the default OS title bar so we can draw a
 *     custom one (the drag-handle area in our React sidebar header).
 *   - show: false — window starts hidden, shown only when content is ready
 *     (prevents the "white flash" on startup).
 *
 * CUSTOM TITLE BAR REQUIREMENTS:
 *   - The React component must handle: window drag, minimize, maximize,
 *     close, fullscreen, and maximize/restore button state.
 *   - CSS -webkit-app-region: drag on the title bar area makes it draggable.
 *   - -webkit-app-region: no-drag on buttons inside the drag area so they
 *     are clickable (not treated as drag targets).
 *
 * DEVELOPMENT vs PRODUCTION:
 *   - Dev: loadURL('http://localhost:5173') — Vite dev server with HMR
 *   - Production: loadFile('out/renderer/index.html') — prebuilt static files
 */

import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

/**
 * Creates and returns the main application window.
 * @returns {BrowserWindow} A fully configured, ready-to-use window instance
 */
export function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    // ===== Size Constraints =====
    width: 1020,           // Default width in pixels
    height: 760,           // Default height in pixels
    minWidth: 960,         // Can't resize smaller than this
    minHeight: 680,        // Can't resize smaller than this

    // ===== Window Behavior =====
    show: false,           // Don't show until ready (prevents white flash)
    backgroundColor: '#0E1016', // Match the renderer dark base — no flash on launch
    frame: false,          // Remove OS title bar — we draw our own
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',

    // ===== Security & Integration =====
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // Bridge script path
      contextIsolation: true,  // Security: separate renderer from preload
      nodeIntegration: false,  // Security: no Node.js in renderer
      sandbox: false           // Required for contextBridge
    }
  })

  /**
   * ready-to-show: Fires when the initial HTML is fully loaded.
   * We show the window here to avoid the startup "white flash."
   */
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  /**
   * External link handler.
   * When the user clicks an <a target="_blank"> or window.open() is called,
   * instead of opening a new Electron window, we open the link in the user's
   * default system browser. This is the expected UX for "external links."
   */
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // ===== Load Content =====
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // DEVELOPMENT: Connect to Vite dev server for hot reload
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // PRODUCTION: Load the prebuilt HTML file from disk
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}
