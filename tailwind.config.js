import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      colors: {
        elkawera: {
          black: 'var(--bg-primary)',
          dark: 'var(--bg-secondary)',
          green: '#002a23',
          lightGreen: '#004d40',
          accent: '#00ff9d',
        }
      },
      fontFamily: {
        sans: ['Roboto Condensed', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
      },
      backgroundImage: {
        'mesh': 'var(--bg-mesh)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'shimmer-fast': 'shimmer 1.5s infinite linear',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'platinum-glow': 'platinumGlow 3s infinite alternate',
        'gold-pulse': 'goldPulse 4s ease-in-out infinite',
        'sheen-slide': 'sheenSlide 4s ease-in-out infinite',
        'gradient-x': 'gradientX 8s ease infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'rotate-slow': 'rotate 15s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glitch': 'glitch 1s linear infinite',
        'energy-flow': 'energyFlow 5s linear infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-150%) skewX(12deg)' },
          '100%': { transform: 'translateX(350%) skewX(12deg)' },
        },
        platinumGlow: {
          '0%': { boxShadow: '0 0 10px rgba(56,189,248,0.3), inset 0 0 5px rgba(56,189,248,0.1)', borderColor: '#bae6fd' },
          '100%': { boxShadow: '0 0 25px rgba(56,189,248,0.8), inset 0 0 15px rgba(56,189,248,0.4)', borderColor: '#7dd3fc' },
        },
        goldPulse: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        },
        sheenSlide: {
          '0%': { transform: 'translateX(-100%) skewX(-20deg)', opacity: '0' },
          '20%': { opacity: '0.4' },
          '50%': { transform: 'translateX(200%) skewX(-20deg)', opacity: '0' },
          '100%': { transform: 'translateX(200%) skewX(-20deg)', opacity: '0' }
        },
        gradientX: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)', clipPath: 'inset(0 0 0 0)' },
          '20%': { transform: 'translate(-2px, 2px)', clipPath: 'inset(20% 0 50% 0)' },
          '40%': { transform: 'translate(2px, -2px)', clipPath: 'inset(40% 0 10% 0)' },
          '60%': { transform: 'translate(-1px, 1px)', clipPath: 'inset(60% 0 30% 0)' },
          '80%': { transform: 'translate(1px, -1px)', clipPath: 'inset(10% 0 70% 0)' },
        },
        energyFlow: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        }
      }
    },
  },
  plugins: [],
}
