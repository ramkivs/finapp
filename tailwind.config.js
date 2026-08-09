/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finGreen: '#15803d',
        finGreenHover: '#166534',
        finGreenLight: '#f0fdf4',
        finCyan: '#0891b2',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
