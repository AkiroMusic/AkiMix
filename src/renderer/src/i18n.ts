/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Internationalization (i18n) Setup — Bilingual Chinese Mode
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 *   Initializes the i18next library for multi-language support.
 *   Supports English (en-US) and Chinese (zh-CN) with bilingual mode.
 *
 * BILINGUAL ZH-CN MODE:
 *   When the language is set to zh-CN, the app shows both the Chinese
 *   translation AND the original English term in parentheses.
 *   This is especially helpful for professional audio terminology where
 *   the English original (e.g., "Plate", "Low-Pass", "Sidechain") is
 *   widely recognized and helps users search / communicate with others.
 *
 *   Example display:
 *     EN:  "Plate"
 *     CN:  "Plate（板式混响）"
 *
 *   This is implemented at the resource level — every zh-CN value is
 *   pre-processed at load time to prepend the English source. NO changes
 *   are needed in individual components — they keep using `t('key')` as
 *   before.
 *
 * HOW I18N WORKS (for beginners):
 *   1. Translation JSON files are stored in src/renderer/src/locales/
 *   2. Each locale file is a flat object: { "key": "value" }
 *   3. In React components, use:
 *        import { useTranslation } from 'react-i18next'
 *        const { t } = useTranslation()
 *        t('sidebar.dashboard')  // → "Dashboard（仪表盘）" (zh-CN) or "Dashboard" (en-US)
 *   4. Switch languages via: i18n.changeLanguage('zh-CN')
 *
 * INTERPOLATION SYNTAX:
 *   Instead of the default {{variable}} syntax, we use {variable} to avoid
 *   conflicts with React's JSX curly braces. Example:
 *     JSON: "greeting": "Hello, {name}!"
 *     Code: t('greeting', { name: 'Alice' })  // → "Hello, Alice!"
 *
 * KEY FILES:
 *   src/renderer/src/i18n.ts         — This file (initialization)
 *   src/renderer/src/locales/en-US.json — English translations
 *   src/renderer/src/locales/zh-CN.json — Chinese translations
 *   src/renderer/src/components/     — Components that use useTranslation()
 *
 * @see https://www.i18next.com/ — Official i18next documentation
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCNRaw from './locales/zh-CN.json'
import enUS from './locales/en-US.json'

/**
 * =============================================================================
 * Bilingual Resource Builder
 * =============================================================================
 *
 * WHY:
 *   Professional audio terms (Plate, Sidechain, Low-Pass, etc.) are universally
 *   used in English even in Chinese-speaking production environments. Showing
 *   both languages helps users learn the terminology and communicate with
 *   international collaborators.
 *
 * WHAT IT DOES:
 *   For EVERY key in zh-CN.json, if the Chinese value differs from the English
 *   source, we prepend the English original with Chinese in parentheses:
 *     "Plate（板式混响）"
 *     "Low-Pass（低通滤波器）"
 *     "Sidechain Compression（侧链压缩）"
 *
 *   If the value is identical in both languages (e.g. "BPM" → "BPM"), or if
 *   a key only exists in Chinese, no duplication occurs — the value is used
 *   as-is.
 *
 * INTERPOLATION SAFETY:
 *   Placeholders like {ms} or {variable} are preserved in both the Chinese
 *   and English strings. i18next will still interpolate them correctly when
 *   `t()` is called with options.
 *
 * PERFORMANCE:
 *   This runs ONCE at module load time (~0.01ms for 400 keys). No runtime
 *   overhead during rendering.
 */
const zhCN: Record<string, string> = {}
for (const key in zhCNRaw) {
  const cn = (zhCNRaw as Record<string, string>)[key]
  const en = (enUS as Record<string, string>)[key]
  // English-first bilingual display: professional audio terms are written in
  // English by convention (Plate Reverb, Sidechain, Low-Pass), so the English
  // original comes first with the Chinese translation after as an aid:
  //   "Plate（板式混响）"
  //   "Low-Pass（低通滤波器）"
  // Only append Chinese when a real English source exists AND it differs
  // (avoids redundant "BPM（BPM）" style display).
  if (en && en !== cn) {
    zhCN[key] = `${en}（${cn}）`
  } else {
    zhCN[key] = cn
  }
}

/**
 * Initialize i18next with the react-i18next adapter.
 *
 * RESOURCES:
 *   Each locale is loaded as a JSON file under its BCP 47 language tag.
 *   The key 'translation' holds all the key-value pairs for that language.
 *   Structure: { [locale]: { translation: { [key]: string } } }
 *
 * LANGUAGES:
 *   - en-US: English (default) — clean, no modifications
 *   - zh-CN: Chinese (Simplified) — bilingual: Chinese + (English)
 *
 * FALLBACK:
 *   If a translation key is missing in the current language, it falls back
 *   to en-US. This way, incomplete translations don't show blank text.
 *
 * INTERPOLATION:
 *   prefix: '{' , suffix: '}' — Enables t('key', { variable: 'value' }) syntax.
 *   escapeValue: false — React already handles XSS prevention via JSX.
 */
i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    'en-US': { translation: enUS }
  },
  lng: 'en-US',
  fallbackLng: 'en-US',
  interpolation: {
    prefix: '{',
    suffix: '}',
    escapeValue: false
  }
})

export default i18n
