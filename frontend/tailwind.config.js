/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support toggling dark mode via class
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0b0f19',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#2ebb78', // Sage HSL(152, 60%, 45%)
          600: '#229e63',
          700: '#1c7e4f',
          800: '#18633f',
          900: '#155235',
          950: '#0b2e1d',
        },
        life: {
          sand: '#FAF6F0',
          cocoa: '#2E1A16',
          vermilion: '#FF5B37',
        },
        obsidian: '#050507',
        crimson: '#FF1E27',
      },
      fontFamily: {
        sans: ['Onest', 'Outfit', 'Inter', 'system-ui', 'sans-serif'],
        geom: ['Space Grotesk', 'Chacra Petch', 'sans-serif'],
        wide: ['Syncopate', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
