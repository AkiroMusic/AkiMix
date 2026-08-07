/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Simple JSON File-Based Settings Store
 * =============================================================================
 *
 * WHAT THIS DOES:
 *   A minimal, typed key-value store that persists data as a JSON file.
 *   Unlike localStorage (browser-only), this runs in the MAIN process where
 *   we have direct filesystem access via Node.js APIs.
 *
 * WHY A CUSTOM STORE INSTEAD OF electron-store:
 *   - Zero dependencies — no npm package needed
 *   - Full type safety via TypeScript generics
 *   - Simple API: get(), set(), store (readonly snapshot)
 *   - Automatic file creation and directory creation
 *
 * WHERE FILES ARE SAVED (OS-specific):
 *   - Windows: %APPDATA%/AkiMix/akimix-settings.json
 *   - macOS:   ~/Library/Application Support/AkiMix/akimix-settings.json
 *   - Linux:   ~/.config/AkiMix/akimix-settings.json
 *
 * USAGE:
 *   const store = new SimpleStore({ defaults: { theme: 'dark' }, name: 'settings' })
 *   store.get('theme')       // → 'dark'
 *   store.set('theme', 'light')
 *   store.store              // → { theme: 'light' }
 *
 * @template T — A type that extends { [key: string]: unknown }
 */

import { app } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

/**
 * Base interface for stored data.
 * Any object shape is allowed as long as keys are strings.
 */
interface StoredData {
  [key: string]: unknown
}

/**
 * A persistent, JSON-file-backed key-value store.
 * @template T — The shape of the stored data (e.g., { theme: string; language: string })
 */
export class SimpleStore<T extends StoredData> {
  /** In-memory cache of the stored data (always in sync with the file) */
  private data: T
  /** Full path to the JSON file on disk */
  private filePath: string

  /**
   * Creates or loads a persistent store.
   * @param options.defaults — Default values used when no file exists yet
   * @param options.name — Filename (without .json). Defaults to 'config.json'
   */
  constructor(private readonly options: { defaults: T; name?: string }) {
    // app.getPath('userData') returns an OS-specific directory for app data
    const userDataPath = app.getPath('userData')
    const fileName = options.name ? `${options.name}.json` : 'config.json'
    this.filePath = join(userDataPath, fileName)

    // Ensure the userData directory exists (first launch)
    if (!existsSync(userDataPath)) {
      mkdirSync(userDataPath, { recursive: true })
    }

    // Load existing data or initialize with defaults
    this.data = this.load()
  }

  /**
   * Loads data from disk, merging with defaults.
   * If the file doesn't exist or is corrupted, returns a copy of defaults.
   * @returns Merged data (defaults overridden by saved values)
   */
  private load(): T {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8')
        // Spread: defaults first, then saved values override them
        // This handles the case where new keys were added after the file was saved
        return { ...this.options.defaults, ...JSON.parse(raw) }
      }
    } catch {
      // JSON.parse failed — file is corrupted. Fall back to defaults.
    }
    return { ...this.options.defaults }
  }

  /**
   * Writes the current data to disk as JSON.
   * Called automatically whenever `set()` is used.
   * Errors are caught and logged (silent failure — app keeps working).
   */
  private save(): void {
    try {
      const dir = dirname(this.filePath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (err) {
      console.error('SimpleStore: failed to save', err)
    }
  }

  /**
   * Returns a SHALLOW COPY of all stored data.
   * The copy prevents external code from mutating the internal store directly.
   */
  get store(): T {
    return { ...this.data }
  }

  /**
   * Gets a single value by key.
   * @param key — The key to look up
   * @returns The stored value (or the default if never set)
   */
  get<K extends keyof T>(key: K): T[K] {
    return this.data[key]
  }

  /**
   * Sets a single value and persists to disk immediately.
   * @param key — The key to update
   * @param value — The new value (must match the type signature)
   */
  set<K extends keyof T>(key: K, value: T[K]): void {
    this.data[key] = value
    this.save()
  }
}
