/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fc-charcoal': '#1a1a1a',
        'fc-charcoal-light': '#2d2d2d',
        'fc-charcoal-dark': '#0f0f0f',
        'fc-warm-white': '#f5f5f0',
        'fc-emerald': '#059669', // Emerald 600
        'fc-teal': '#0d9488', // Teal 600
        'fc-teal-light': '#14b8a6', // Teal 500
        'fc-gold': '#fbbf24', // Amber 400
        'fc-gold-soft': '#fcd34d', // Amber 300
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(to right, #1a1a1a, #2d2d2d)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}