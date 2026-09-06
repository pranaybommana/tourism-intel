/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#020617',
          900: '#0a192f',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
        },
        cyanGlow: {
          DEFAULT: '#00f2fe',
          light: '#38bdf8',
          accent: '#06b6d4',
          dark: '#0891b2',
        },
        safety: {
          safe: '#10b981',
          moderate: '#f59e0b',
          caution: '#f97316',
          danger: '#ef4444',
        }
      },
      boxShadow: {
        'cyan-glow': '0 0 20px -5px rgba(6, 182, 212, 0.5)',
        'cyan-glow-lg': '0 0 35px -5px rgba(6, 182, 212, 0.6)',
        'glass-edge': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
