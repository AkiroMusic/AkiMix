/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Electron Main Process
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 * This is the ENTRY POINT for the Electron app. It runs in Node.js (not in
 * the browser). It's responsible for:
 *   - Creating the application window
 *   - Handling IPC (Inter-Process Communication) between main and renderer
 *   - Managing persistent settings storage (SimpleStore)
 *   - Setting up the macOS menu
 *   - Handling window lifecycle (minimize, maximize, close, fullscreen)
 *
 * HOW ELECTRON WORKS (for beginners):
 *   Electron apps have TWO processes:
 *   1. MAIN process (this file) — runs Node.js, creates windows, has file
 *      system access, can run shell commands. NEVER put UI code here.
 *   2. RENDERER process (React code) — runs Chromium, shows the UI, has
 *      DOM access. NEVER put Node.js code here.
 *
 *   The PRELOAD script (see src/preload/index.ts) is the BRIDGE between them.
 *   The renderer calls window.akiMix.something() → preload sends IPC →
 *   main process executes → returns result to renderer.
 *
 * HOW IPC WORKS:
 *   ipcMain.handle('channel:name', handler) — Main listens for requests
 *   ipcRenderer.invoke('channel:name', args) — Renderer sends requests
 *   ipcMain.on('channel:name') — Alternative pattern for one-way messages
 *
 * KEY FILES:
 *   src/main/index.ts     ← You are here (main process entry)
 *   src/main/window.ts    ← Window creation logic
 *   src/main/simpleStore.ts ← Persistent key-value storage
 *   src/preload/index.ts  ← Bridge between main and renderer
 */

import { app, BrowserWindow, ipcMain, Menu, nativeTheme } from 'electron'
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createWindow } from './window'
import { SimpleStore } from './simpleStore'

/**
 * Reference to the main browser window. We keep this reference so we can
 * call methods on it (minimize, maximize, etc.) from IPC handlers.
 * It starts as null because the window doesn't exist until app.whenReady().
 */
let mainWindow: BrowserWindow | null = null

/**
 * Helper function to safely get the main window reference.
 * Returns null if the window doesn't exist or was destroyed.
 */
function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

/**
 * Persistent settings store using electron's app.getPath('userData').
 * Settings are saved as JSON in:
 *   - Windows: %APPDATA%/AkiMix/akimix-settings.json
 *   - macOS: ~/Library/Application Support/AkiMix/akimix-settings.json
 *   - Linux: ~/.config/AkiMix/akimix-settings.json
 *
 * Default values:
 *   theme: 'dark'        — App starts in dark mode
 *   language: 'en-US'    — Default language is English
 */
export const settingsStore = new SimpleStore({
  defaults: {
    theme: 'dark',
    language: 'en-US'
  },
  name: 'akimix-settings'
})

/**
 * app.whenReady() is the Electron equivalent of DOMContentLoaded.
 * This is where we set up everything that requires the app to be ready:
 *   1. Register app ID (for Windows taskbar)
 *   2. Set up window shortcut optimizer (F11 fullscreen, etc.)
 *   3. Register IPC handlers (settings, window controls, theme)
 *   4. Create the main window
 *   5. Set up macOS menu (if on macOS)
 *   6. Handle macOS re-activate (clicking dock icon)
 */
app.whenReady().then(async () => {
  // ===== 1. Set Windows app user model ID (for notifications, taskbar) =====
  electronApp.setAppUserModelId('com.akiro.aki-mix')

  // ===== 2. Watch for window shortcuts =====
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // ===== 3. Register IPC Handlers =====
  // These handlers allow the renderer (React UI) to control the window and
  // access settings. The renderer calls these via window.akiMix.XXX().

  // --- Window Control IPC ---

  /** Minimize the window to taskbar */
  ipcMain.handle('window:minimize', (): void => {
    mainWindow?.minimize()
  })

  /** Toggle maximize/restore */
  ipcMain.handle('window:maximize', (): void => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  /** Check if window is currently maximized */
  ipcMain.handle('window:isMaximized', (): boolean => {
    return mainWindow?.isMaximized() ?? false
  })

  /** Toggle fullscreen mode */
  ipcMain.handle('window:fullscreen', (): void => {
    const isFullScreen = mainWindow?.isFullScreen() ?? false
    mainWindow?.setFullScreen(!isFullScreen)
  })

  /** Change the window title (used by i18n) */
  ipcMain.handle('window:setTitle', (_event, title: string): void => {
    mainWindow?.setTitle(title || 'AkiMix')
  })

  // --- Settings IPC ---
  // SimpleStore provides persistent key-value storage
  // Settings are automatically loaded on app start

  /** Get all settings as a plain object */
  ipcMain.handle('settings:get', (): Record<string, unknown> => {
    return settingsStore.store
  })

  /** Update settings. Pass a partial object — only specified keys are changed. */
  ipcMain.handle('settings:set', (_event, patch: Record<string, unknown>): void => {
    for (const [key, value] of Object.entries(patch)) {
      settingsStore.set(key, value)
    }
  })

  // --- Theme IPC ---

  /** Get the OS-level theme preference (dark or light) */
  ipcMain.handle('theme:getSystemTheme', async (): Promise<'dark' | 'light'> => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  })

  /**
   * Listen for OS theme changes (e.g., user switches from dark to light mode
   * in system settings). When detected, notify the renderer so it can
   * update the app theme if "system" mode is selected.
   */
  nativeTheme.on('updated', (): void => {
    const win = getMainWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send('theme:systemChanged', nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
    }
  })

  // ===== 4. Create the main application window =====
  mainWindow = createWindow()

  // ===== 5. Forward window state events to renderer =====

  /** Notify renderer when window is maximized (for restore button state) */
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximizeChanged', true)
  })

  /** Notify renderer when window is restored from maximized */
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximizeChanged', false)
  })

  // ===== 6. macOS Application Menu =====
  // On macOS, the menu bar is at the top of the screen, not inside the window.
  // We need to provide a minimal menu for standard operations (quit, copy, etc.).
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        },
        {
          label: 'File',
          submenu: [{ role: 'close' }]
        },
        {
          label: 'Edit',
          submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'selectAll' }
          ]
        },
        {
          label: 'View',
          submenu: [
            { role: 'reload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
          ]
        },
        {
          label: 'Window',
          submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' }
          ]
        }
      ])
    )
  }

  // ===== 7. macOS: Re-create window on dock click =====
  // On macOS, the app stays running even when all windows are closed.
  // Clicking the dock icon should re-create the window.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
    }
  })
})

/**
 * Window lifecycle handler.
 * On Windows and Linux, closing all windows should quit the app.
 * On macOS, the app stays running (handled above).
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
