/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        clinical: {
          navy: '#0f172a',
          slate: '#334155',
          muted: '#64748b',
          border: '#e2e8f0',
          bg: '#f8fafc',
          card: '#ffffff',
        },
        urgency: {
          routine: {
            bg: '#f1f5f9',
            text: '#475569',
            border: '#cbd5e1',
          },
          attention: {
            bg: '#fffbebfb',
            text: '#b45309',
            border: '#fde68a',
          },
          high: {
            bg: '#fff7ed',
            text: '#c2410c',
            border: '#ffedd5',
          },
          immediate: {
            bg: '#fef2f2',
            text: '#dc2626',
            border: '#fecaca',
          },
        },
        confidence: {
          high: {
            bg: '#f0fdf4',
            text: '#15803d',
            border: '#bbf7d0',
          },
          medium: {
            bg: '#fefce8',
            text: '#a16207',
            border: '#fef08a',
          },
          low: {
            bg: '#f5f3ff',
            text: '#6d28d9',
            border: '#ddd6fe',
          },
        },
        evidence: {
          patient: '#0284c7',
          extracted: '#0d9488',
          document: '#4f46e5',
          verified: '#16a34a',
          unverified: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'dropdown': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'modal': '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
      },
      borderRadius: {
        'subtle': '6px',
        'clinical': '10px',
        'kiosk': '16px',
      }
    },
  },
  plugins: [],
}
