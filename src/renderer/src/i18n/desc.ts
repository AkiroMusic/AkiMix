/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * desc — Core Data Description Translator
 * =============================================================================
 *
 * WHAT THIS DOES:
 *   The core modules (src/core/*.ts) ship reference data with English
 *   `description` strings baked in. Those strings are asserted verbatim by
 *   the test suite, so they cannot be replaced with i18n keys at the source.
 *   Instead, we translate them at the render layer: each English description
 *   is used AS an i18n key. zh-CN.json maps it to Chinese; if a key is
 *   missing (untranslated), i18next falls back to returning the key itself —
 *   i.e. the original English text. Zero risk of breaking core tests.
 *
 * WHY keySeparator: false:
 *   i18next's default key separator is '.' — English sentences contain
 *   periods, so a naive t(text) would try to resolve nested keys and fail.
 *   Disabling the separator for these calls fixes that.
 *
 * USAGE:
 *   const { t } = useTranslation()
 *   {desc(t, item.description)}
 *
 * @see src/renderer/src/locales/zh-CN.json — keys are the English originals
 */

import type { TFunction } from 'i18next'

/**
 * Translate a core-module description string via i18next.
 * Falls back to the original English text when no translation exists.
 */
export function desc(t: TFunction, text: string): string {
  if (!text) return text
  return t(text, { keySeparator: false })
}
