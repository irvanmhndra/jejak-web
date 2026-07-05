/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fff3ed',
          100: '#ffe4d5',
          200: '#ffc7aa',
          300: '#ffa274',
          400: '#ff6a36',
          500: '#fc4c02',
          600: '#ed3d00',
          700: '#c42f06',
          800: '#9c290c',
          900: '#7e260d',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
      },
    },
  },
  plugins: [],
}
