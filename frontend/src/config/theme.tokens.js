/**
 * Single source of truth for Design System Tokens
 * Conforms with the high-trust academic design language in new/
 */

export const THEME_TOKENS = {
  colors: {
    canvas: '#FCFFFF',
    surface: '#F4F8FA',
    card: '#FCFFFF',
    input: '#FCFFFF',
    border: '#E2E8F0',
    borderInput: '#CBD5E1',
    primary: '#0593C6',
    primaryHover: '#0479A4',
    primaryLight: 'rgba(5, 147, 198, 0.08)',
    primaryBorder: 'rgba(5, 147, 198, 0.25)',
    accent: '#D83995',
    accentLight: 'rgba(216, 57, 149, 0.08)',
    accentBorder: 'rgba(216, 57, 149, 0.25)',
    heading: '#0F172A',
    body: '#334155',
    muted: '#64748B',
    dim: '#94A3B8',
  },
  fonts: {
    sans: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Space Mono", ui-monospace, monospace',
  },
  shadows: {
    subtle: '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
    card: '0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03)',
    dropdown: '0 4px 16px -2px rgba(15, 23, 42, 0.08)',
  }
};
