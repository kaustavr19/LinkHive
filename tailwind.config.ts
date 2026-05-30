import type { Config } from 'tailwindcss';

// ─────────────────────────────────────────────────────────────────────────────
// CENTRALIZED THEME
// All color is driven by CSS variables defined in src/index.css (light + .dark).
// Variables are stored as space-separated RGB channels (e.g. "249 249 249") so
// Tailwind's <alpha-value> mechanism works — that's what powers the per-category
// tints (bg-category-jobs/10) without hardcoding rgba anywhere in components.
// Category accent hues are functional and identical across themes (per the
// design spec); only the neutral surfaces flip between light and dark.
// ─────────────────────────────────────────────────────────────────────────────
const withAlpha = (cssVar: string) => `rgb(var(${cssVar}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neutral surfaces (flip light/dark)
        canvas: withAlpha('--c-canvas'),
        surface: withAlpha('--c-surface'),
        'surface-alt': withAlpha('--c-surface-alt'),
        sidebar: withAlpha('--c-sidebar'),
        ink: withAlpha('--c-ink'),
        'ink-muted': withAlpha('--c-ink-muted'),
        line: withAlpha('--c-line'),
        primary: withAlpha('--c-primary'),
        'on-primary': withAlpha('--c-on-primary'),

        // Category accents (functional, stable across themes)
        category: {
          jobs: withAlpha('--c-jobs'),
          socials: withAlpha('--c-socials'),
          videos: withAlpha('--c-videos'),
          articles: withAlpha('--c-articles'),
          uncategorized: withAlpha('--c-uncategorized'),
        },

        // Job status accents
        status: {
          applied: withAlpha('--c-status-applied'),
          'not-applied': withAlpha('--c-status-not-applied'),
          rejected: withAlpha('--c-status-rejected'),
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // From DESIGN.md type scale (Inter, weight-led hierarchy)
        'display-hero': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-md': ['18px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'card-title': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'body-base': ['14px', { lineHeight: '20px' }],
        'body-medium': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-xs': ['11px', { lineHeight: '14px', letterSpacing: '0.02em' }],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      maxWidth: {
        container: '1440px',
      },
      spacing: {
        sidebar: '240px',
      },
      boxShadow: {
        card: '0px 4px 20px rgba(0, 0, 0, 0.04)',
        'card-hover': '0px 8px 30px rgba(0, 0, 0, 0.08)',
        fab: '0px 6px 24px rgba(0, 0, 0, 0.18)',
      },
    },
  },
  plugins: [],
} satisfies Config;
