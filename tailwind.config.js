/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        yolk: {
          50: '#fff9eb',
          100: '#ffefc2',
          200: '#ffe499',
          300: '#ffd970',
          400: '#ffcf47',
          500: '#ffc51e',
          600: '#e6ac00',
          700: '#cc9200',
          800: '#b37800',
          900: '#995e00',
        },
      },
    },
  },
  plugins: [],
};