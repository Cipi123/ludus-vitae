/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void': '#020617',
        'void-light': '#0f172a',
        'gold': '#3b82f6', // Solo Leveling Blue replcing Gold
        'gold-dim': '#1d4ed8',
        'system-blue': '#3b82f6',
        'system-red': '#ef4444',
        'sanctuary': '#2dd4bf',
        'sanctuary-dark': '#134e4a',
        'str': '#ef4444',
        'dex': '#3b82f6',
        'int': '#a855f7',
        'cha': '#ec4899',
        'con': '#22c55e',
      },
      fontFamily: {
        sans: ['Rajdhani', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      boxShadow: {
        'system': '0 0 15px rgba(59, 130, 246, 0.3), inset 0 0 10px rgba(59, 130, 246, 0.1)',
        'system-hover': '0 0 25px rgba(59, 130, 246, 0.6), inset 0 0 15px rgba(59, 130, 246, 0.2)',
      }
    },
  },
  plugins: [],
}