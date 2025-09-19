/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#b7d7ff',
          300: '#89beff',
          400: '#5aa5ff',
          500: '#2d8cff',
          600: '#1173e6',
          700: '#0b5bb8',
          800: '#094a95',
          900: '#0a3c78'
        }
      },
      borderRadius: {
        '2xl': '1.25rem'
      }
    }
  },
  plugins: [],
}
