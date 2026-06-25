/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C3FC5',
          light:   '#8B5CF6',
          dark:    '#4C1D95',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light:   '#FCD34D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
