/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sukabaca: {
          blue: '#3b82f6',
          cyan: '#0284c7',
          purple: '#9333ea',
          magenta: '#c026d3',
          dark: '#1e293b',
          card: '#707070',
          inputBg: '#ffffff',
          bodyBg: '#e5e7eb',
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
