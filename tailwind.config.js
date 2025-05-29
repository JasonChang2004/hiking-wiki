/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        wiki: ['"Noto Serif TC"', 'Georgia', 'serif'],
      },
      colors: {
        wiki: {
          bg: '#f9f9f9',
          text: '#202122',
          link: '#0645ad',
          border: '#a2a9b1',
          bgLight: '#f6f6f6',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
  darkMode: 'class'
}
