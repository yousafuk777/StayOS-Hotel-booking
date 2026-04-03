import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Redefining legacy colors to new Primary to automatically port hundreds of old classes
        blue: {
          50: '#E1F5EE', // Light Tint for badges
          100: '#C2EADF',
          200: '#FFF8F0', // Light BG used in gradients locally
          300: '#85D5C0',
          400: '#66CBB0',
          500: '#0F6E56', // Base Primary
          600: '#1D9E75', // Primary Hover
          700: '#157557',
          800: '#1A2E2B', // Dark Text mapped to deep legacy colors
          900: '#073024',
        },
        indigo: {
          50: '#E1F5EE', 100: '#C2EADF', 200: '#A3E0CF', 300: '#85D5C0', 400: '#66CBB0',
          500: '#0F6E56', 600: '#1D9E75', 700: '#157557', 800: '#1A2E2B', 900: '#073024',
        },
        purple: {
          50: '#E1F5EE', 100: '#C2EADF', 200: '#A3E0CF', 300: '#85D5C0', 400: '#66CBB0',
          500: '#0F6E56', 600: '#1D9E75', 700: '#157557', 800: '#1A2E2B', 900: '#073024',
        },
        primary: {
          50: '#E1F5EE',
          100: '#C2EADF',
          200: '#FFF8F0', // Light BG
          300: '#85D5C0',
          400: '#66CBB0',
          500: '#0F6E56', // Base Primary
          600: '#1D9E75', // Primary Hover
          700: '#157557',
          800: '#1A2E2B', // Dark Text
          900: '#073024',
        },
        accent: {
          DEFAULT: '#C8941A',
          hover: '#A67A14',
        },
        lightBg: '#FFF8F0',
        darkText: '#1A2E2B',
        mutedText: '#4A6B63',
        brandBorder: '#D6EAE4',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F9FAFB',
        },
        text: {
          primary: '#1A2E2B',
          secondary: '#4A6B63',
        },
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
