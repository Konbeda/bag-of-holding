const { colors } = require('./src/theme/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  // Each Inter weight is its own font family, so font-medium and friends must only set the family
  corePlugins: { fontWeight: false },
  theme: {
    fontFamily: {
      sans: ['Inter_400Regular'],
      medium: ['Inter_500Medium'],
      semibold: ['Inter_600SemiBold'],
      bold: ['Inter_700Bold'],
    },
    extend: { colors },
  },
  plugins: [],
};
