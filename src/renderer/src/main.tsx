/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Renderer Entry Point (React)
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 *   This is the ENTRY POINT for the React renderer process. It mounts the
 *   root <App /> component into the DOM. Think of it as the "main() function"
 *   for the UI side of the application.
 *
 * HOW ELECTRON + REACT WORKS:
 *   1. Electron creates a BrowserWindow (see src/main/window.ts)
 *   2. Electron loads index.html (which contains <div id="root">)
 *   3. This script creates a React root and mounts <App /> into #root
 *   4. React takes over from here — all UI is managed by React components
 *
 * WHAT IS StrictMode?
 *   React.StrictMode is a development-only wrapper that:
 *     - Highlights potential problems (deprecated APIs, side effects)
 *     - Double-invokes certain functions to detect impure code
 *     - Has no effect in production builds
 *   It DOES NOT affect the UI rendering — it's purely a dev tool.
 *
 * FILE STRUCTURE:
 *   main.tsx          ← You are here (entry point, just mounting)
 *   App.tsx           ← Root component (navigation, layout)
 *   components/       ← UI components (cards, sidebar, etc.)
 *   store/            ← Zustand state management
 *   locales/          ← i18n translation files
 *   styles/           ← CSS files
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

/**
 * ReactDOM.createRoot() creates a React root using the new React 18 API.
 * This replaced ReactDOM.render() in React 18.
 *
 * The exclamation mark (!) after getElementById is a TypeScript non-null
 * assertion — it tells TypeScript "I promise this element exists in the HTML."
 * The element exists because it's defined in the index.html file.
 *
 * @see https://react.dev/reference/react-dom/client/createRoot
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
