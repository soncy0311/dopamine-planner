/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-pretendard)',
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'sans-serif',
        ],
      },
      colors: {
        priority: {
          high: { DEFAULT: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
          medium: { DEFAULT: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
          low: { DEFAULT: '#6B7280', bg: '#F2F2F2' },
        },
        purple: {
          100: '#D7AEF2',
          200: '#C599F2',
          300: '#B87EF2',
          500: '#9755D9',
          700: '#8A63BF',
        },
        periwinkle: {
          100: '#D2D3FF',
          200: '#BFCEFF',
          300: '#BAC3FF',
          400: '#9DABE8',
          500: '#9DA3E8',
        },
        indigo: {
          600: '#7578BF',
        },
        'lavender-gray': {
          300: '#B8BAD9',
        },
        gray: {
          50: '#F2F2F2',
        },
        white: '#FFFFFF',
        'black-900': '#000000',
        red: {
          500: '#EF4444',
        },
        green: {
          500: '#22C55E',
        },
        yellow: {
          500: '#F59E0B',
        },
        blue: {
          500: '#3B82F6',
        },
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        full: '9999px',
      },
      transitionDuration: {
        fast: '100ms',
        normal: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        enter: 'cubic-bezier(0, 0, 0.2, 1)',
        exit: 'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
  plugins: [],
};
