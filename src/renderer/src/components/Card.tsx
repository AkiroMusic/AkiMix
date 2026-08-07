/**
 * AkiMix — Audio Mixing Assistant
 * Copyright (c) 2026 Akiro. All rights reserved.
 *
 * =============================================================================
 * Card — Shared Double-Bezel Card Shell
 * =============================================================================
 *
 * WHAT THIS COMPONENT DOES:
 *   Provides a single premium card frame used by every tool view. It encodes
 *   the "double-bezel" pattern: an outer hairline border + a recessed inner
 *   frame, soft tinted shadow, spring hover lift, and an optional header row
 *   (Fraunces display title + subtitle).
 *
 * WHY SHARED:
 *   Previously each card duplicated its own h2/p/box styles inline. Centralizing
 *   the shell keeps visual rhythm consistent across all 19 tools and makes the
 *   design system evolvable from one place.
 *
 * USAGE:
 *   <Card title={t('eq.title')} subtitle={t('eq.subtitle')}>
 *     ...card body...
 *   </Card>
 *
 * @see src/renderer/src/styles/tokens.css — tokens (.double-bezel, .spring-in)
 */

import type { ReactNode } from 'react'

interface CardProps {
  /** Fraunces display title (translated string, rendered as-is) */
  title?: string
  /** Small muted subtitle under the title */
  subtitle?: string
  /** Optional right-aligned header action (e.g. a reset button) */
  headerAction?: ReactNode
  /** Card body content */
  children: ReactNode
  /** Extra inline styles merged onto the outer shell */
  style?: React.CSSProperties
  /** Optional key used to re-trigger the spring-in entry animation on change */
  springKey?: string
}

function Card({ title, subtitle, headerAction, children, style, springKey }: CardProps): JSX.Element {
  return (
    <div
      key={springKey}
      className="double-bezel spring-in"
      style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', ...style }}
    >
      {(title || headerAction) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            marginBottom: subtitle ? 'var(--space-2)' : 'var(--space-6)'
          }}
        >
          <div>
            {title && (
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  lineHeight: 1.25,
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  margin: 0,
                  letterSpacing: '-0.01em'
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '12px',
                  lineHeight: 1.5,
                  color: 'var(--text-tertiary)',
                  margin: 'var(--space-1) 0 0'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div style={{ flexShrink: 0 }}>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card
