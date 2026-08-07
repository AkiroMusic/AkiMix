/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--bg-base)',
          surface1: 'var(--surface-1)',
          surface2: 'var(--surface-2)'
        },
        border: 'var(--border)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)'
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)'
        },
        success: 'var(--success)',
        error: 'var(--error)'
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace']
      },
      borderRadius: {
        sm: '10px',
        md: '16px',
        lg: '24px',
        full: '999px'
      },
      boxShadow: {
        '1': 'var(--shadow-1)',
        '2': 'var(--shadow-2)',
        '3': 'var(--shadow-3)',
        accent: 'var(--shadow-accent)'
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px'
      }
    }
  },
  plugins: []
}
