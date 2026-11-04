/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#4C1D95', hover: '#5B21B6', soft: '#F3EEFC' },
        ink: { DEFAULT: '#18181B', muted: '#71717A' },
        line: '#E4E4E7',
        surface: '#FAFAFA',
      },
    },
  },
  plugins: [],
};
