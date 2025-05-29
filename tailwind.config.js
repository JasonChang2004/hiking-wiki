module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wiki-bg': '#f9fafb',
        'wiki-border-light': '#e5e7eb',
        'wiki-link': '#2563eb',
        'wiki-bg-light': '#f3f4f6',
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
