/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      },
      colors: {
        academic: {
          canvas: '#FFFFFF',
          surface: '#F8FAFC',
          card: '#FFFFFF',
          input: '#FFFFFF',
          border: '#E2E8F0',
          borderDark: '#0F172A',
          inputBorder: '#CBD5E1',
          primary: '#0593C6',
          primaryHover: '#0479A4',
          accent: '#D83995',
          heading: '#0F172A',
          body: '#334155',
          muted: '#64748B',
          dim: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      boxShadow: {
        none: 'none',
        hard: '2px 2px 0px #0F172A',
        'hard-sm': '1px 1px 0px #0F172A',
        'hard-primary': '2px 2px 0px #0593C6',
        'hard-accent': '2px 2px 0px #D83995',
        subtle: '0 1px 2px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
