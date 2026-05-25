import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        plusJakarta: ['var(--font-plus-jakarta)', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#00d4ff',
          dark: '#00a8cc',
          light: '#33ddff',
        },
        secondary: {
          DEFAULT: '#9333ea',
          dark: '#7c3aed',
        },
        surface: {
          DEFAULT: '#0c1322',
          card: '#131e35',
        },
        deep: {
          DEFAULT: '#070b15',
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
