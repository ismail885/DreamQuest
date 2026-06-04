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
      borderRadius: {
        card: '10px',
        'card-lg': '12px',
        'card-xl': '16px',
      },
      boxShadow: {
        glow: '0px 10px 15px -3px rgba(6,182,212,0.5)',
        'glow-lg': '0px 15px 25px -3px rgba(6,182,212,0.6)',
      },
      backgroundImage: {
        'btn-primary': 'linear-gradient(to right, #00d4ff, #3b82f6)',
      },
      backdropBlur: {
        card: '10px',
      },
      scale: {
        '102': '1.02',
        '98': '0.98',
      },
      transitionTimingFunction: {
        'bounce-sm': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'card-enter': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      animation: {
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
