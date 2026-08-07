/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Sidebar — Google-Style Navigation Rail (Material 3 inspired)
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 *   Renders a slim vertical navigation rail on the left side of the app.
 *   Each tool has an icon + label in the rail. When clicked, it switches the
 *   main content area to that tool's view.
 *
 * DESIGN (Google / Material 3 Navigation Rail):
 *   - ~78px wide, icon stacked over a 10px label
 *   - Active item: soft accent-tinted pill + accent-colored icon/label
 *   - Inactive items: muted tertiary color, brighten on hover
 *   - Groups separated by subtle 1px dividers
 *   - Settings pinned to the bottom with a divider above it
 *   - Scrollable (hidden scrollbar) so all 19 tools remain reachable
 *
 * NAVIGATION FLOW:
 *   Sidebar button click → onNavigate(viewType) → App.tsx setView() →
 *   Zustand store update → currentView changes → App.tsx renderContent()
 *   switches to the corresponding component
 *
 * @see src/renderer/src/store/useAppStore.ts — ViewType definition
 * @see src/renderer/src/App.tsx — The view routing logic
 */

import { useTranslation } from 'react-i18next'
import type { ViewType } from '../store/useAppStore'

/**
 * Props for the Sidebar component.
 *
 * @property currentView — Which view is currently active (for highlight)
 * @property onNavigate — Callback fired when user clicks a nav button
 */
interface SidebarProps {
  currentView: ViewType
  onNavigate: (view: ViewType) => void
}

/**
 * Navigation item definitions.
 * Each item has:
 *   - id: Matches the ViewType from the store (also the key into icons)
 *   - labelKey: i18n key for the label text
 *
 * GROUPS: Arranged by workflow — mixing core first, then sound design,
 * composition, and settings last (pinned to the bottom).
 */
const NAV_GROUPS: { id: ViewType; labelKey: string }[][] = [
  // Core mixing
  [
    { id: 'bpm', labelKey: 'sidebar.bpm' },
    { id: 'compress', labelKey: 'sidebar.compress' },
    { id: 'reverb', labelKey: 'sidebar.reverb' },
    { id: 'delay', labelKey: 'sidebar.delay' },
    { id: 'frequency', labelKey: 'sidebar.frequency' },
    { id: 'samples', labelKey: 'sidebar.samples' },
    { id: 'eq', labelKey: 'sidebar.eq' },
    { id: 'levels', labelKey: 'sidebar.levels' },
    { id: 'loudness', labelKey: 'sidebar.loudness' }
  ],
  // Direction 1: Sound Design
  [
    { id: 'oscillator', labelKey: 'sidebar.oscillator' },
    { id: 'filter', labelKey: 'sidebar.filter' },
    { id: 'modulation', labelKey: 'sidebar.modulation' },
    { id: 'sidechain', labelKey: 'sidebar.sidechain' },
    { id: 'effects', labelKey: 'sidebar.effects' }
  ],
  // Direction 2: Arrangement & Composition
  [
    { id: 'chords', labelKey: 'sidebar.chords' },
    { id: 'scales', labelKey: 'sidebar.scales' },
    { id: 'songStructure', labelKey: 'sidebar.songStructure' },
    { id: 'drumPattern', labelKey: 'sidebar.drumPattern' }
  ]
]

const SETTINGS_ITEM: { id: ViewType; labelKey: string } = {
  id: 'settings',
  labelKey: 'sidebar.settings'
}

/**
 * icons — SVG icon components for each nav item.
 *
 * Each icon is an inline SVG element (no external dependencies).
 * All icons use currentColor so they inherit the rail's text color
 * (var(--accent) when active, var(--text-tertiary) when inactive).
 *
 * SVG ATTRIBUTES EXPLAINED:
 *   viewBox="0 0 24 24" — Coordinate system. 24x24 is the standard
 *                          size for Feather-style icons.
 *   fill="none" — We use strokes (lines) not fills (solid shapes)
 *   stroke="currentColor" — Inherits the CSS color property
 *   strokeWidth="1.7" — Light, premium line weight
 *   strokeLinecap/strokeLinejoin="round" — Rounded line ends/corners
 */
const icons: Record<string, JSX.Element> = {
  bpm: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  compress: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16" />
      <path d="M4 4h16" />
      <rect x="6" y="8" width="4" height="8" rx="1" />
      <rect x="14" y="6" width="4" height="12" rx="1" />
    </svg>
  ),
  reverb: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 0 0-9 9" />
      <path d="M12 7a5 5 0 0 0-5 5" />
      <path d="M12 11a1 1 0 0 0-1 1" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  delay: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  frequency: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 18 7 15 17 9 7 6 17 2 7" />
    </svg>
  ),
  samples: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  eq: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <line x1="8" y1="9" x2="8" y2="15" />
      <line x1="12" y1="7" x2="12" y2="17" />
      <line x1="16" y1="11" x2="16" y2="13" />
    </svg>
  ),
  levels: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10" width="6" height="10" rx="1" />
      <rect x="9" y="6" width="6" height="14" rx="1" />
      <rect x="16" y="2" width="6" height="18" rx="1" />
    </svg>
  ),
  loudness: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a11 11 0 0 0-11 11" />
      <path d="M12 5a7 7 0 0 0-7 7" />
      <path d="M12 9a3 3 0 0 0-3 3" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <path d="M19 7.5a11 11 0 0 1 0 9" />
      <path d="M16.5 9.5a7 7 0 0 1 0 5" />
    </svg>
  ),
  settings: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  // ===== Direction 1 Icons =====
  oscillator: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12 Q6 3 9 12 Q12 21 15 12 Q18 3 21 12" />
    </svg>
  ),
  filter: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18" />
      <path d="M3 19h18" />
      <path d="M7 5v14" />
      <path d="M17 5v14" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  ),
  modulation: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 17 7 7 11 17 15 7 19 17 21 12" />
    </svg>
  ),
  sidechain: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18 Q8 14 12 18 Q16 14 21 18" />
      <path d="M3 6 Q8 10 12 6 Q16 10 21 6" />
      <path d="M3 12h18" />
    </svg>
  ),
  effects: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="3" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="18" cy="12" r="3" />
      <line x1="9" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="15" y2="12" />
    </svg>
  ),
  // ===== Direction 2 Icons =====
  chords: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="2" rx="1" />
      <rect x="4" y="12" width="16" height="2" rx="1" />
      <rect x="4" y="16" width="10" height="2" rx="1" />
    </svg>
  ),
  scales: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="4" height="14" rx="1" />
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="10" y="6" width="4" height="14" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
      <rect x="18" y="6" width="4" height="14" rx="1" />
    </svg>
  ),
  songStructure: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="5" height="16" rx="1" />
      <rect x="9" y="4" width="6" height="16" rx="1" />
      <rect x="17" y="4" width="5" height="8" rx="1" />
      <rect x="17" y="14" width="5" height="6" rx="1" />
    </svg>
  ),
  drumPattern: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="4" cy="4" r="2" fill="currentColor" />
      <circle cx="12" cy="4" r="2" fill="currentColor" />
      <circle cx="20" cy="4" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="20" cy="12" r="2" fill="currentColor" />
      <circle cx="4" cy="20" r="2" fill="currentColor" />
      <circle cx="12" cy="20" r="2" fill="currentColor" />
      <circle cx="20" cy="20" r="2" fill="currentColor" />
    </svg>
  )
}

/**
 * NavButton — single rail item (icon + label + active pill).
 */
interface NavButtonProps {
  id: ViewType
  label: string
  active: boolean
  onClick: () => void
}

function NavButton({ id, label, active, onClick }: NavButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        position: 'relative',
        width: 'calc(100% - 16px)',
        height: '52px',
        margin: '1px 8px',
        border: 'none',
        borderRadius: '14px',
        background: active ? 'color-mix(in srgb, var(--accent) 13%, transparent)' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        color: active ? 'var(--accent)' : 'var(--text-tertiary)',
        transition:
          'background var(--duration-hover) var(--ease-default), color var(--duration-hover) var(--ease-default), transform var(--duration-spring) var(--ease-spring)'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'color-mix(in srgb, var(--text-primary) 6%, transparent)'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-tertiary)'
        }
      }}
    >
      {icons[id]}
      <span
        style={{
          fontSize: '10px',
          lineHeight: 1,
          letterSpacing: '0.02em',
          maxWidth: '62px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {label}
      </span>
    </button>
  )
}

function Sidebar({ currentView, onNavigate }: SidebarProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <nav
      className="flex flex-col"
      style={{
        width: '80px',
        minWidth: '80px',
        backgroundColor: 'var(--surface-1)',
        borderRight: '1px solid var(--border)',
        flexShrink: 0,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '10px 0',
          scrollbarWidth: 'none'
        }}
        className="no-scrollbar"
      >
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && (
              <div
                style={{
                  height: '1px',
                  margin: '8px 16px',
                  backgroundColor: 'var(--border)',
                  opacity: 0.6
                }}
              />
            )}
            {group.map((item) => (
              <NavButton
                key={item.id}
                id={item.id}
                label={t(item.labelKey)}
                active={currentView === item.id}
                onClick={() => onNavigate(item.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Settings — pinned to the bottom */}
      <div
        style={{
          height: '1px',
          margin: '0 16px',
          backgroundColor: 'var(--border)',
          opacity: 0.6,
          flexShrink: 0
        }}
      />
      <div style={{ padding: '6px 0 12px', flexShrink: 0 }}>
        <NavButton
          id={SETTINGS_ITEM.id}
          label={t(SETTINGS_ITEM.labelKey)}
          active={currentView === SETTINGS_ITEM.id}
          onClick={() => onNavigate(SETTINGS_ITEM.id)}
        />
      </div>
    </nav>
  )
}

export default Sidebar
