/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./main.js",
    "./src/**/*.{js,ts,jsx,tsx,svelte}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'quicksand': ['Quicksand', 'serif', 'system-ui'],
        'quicksand-bold': ['QuicksandBold', 'serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
