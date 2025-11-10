import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
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
      },
      animation: {
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
