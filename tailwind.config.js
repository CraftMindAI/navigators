/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core luxury midnight & ocean tones
        midnight: '#060d17',
        midnightLight: '#0d1a2d',
        midnightCard: '#11223b',
        midnightElevated: '#172c4c',
        midnightBorder: '#1e385e',

        // Legacy compatibility
        navyDark: '#060d17',
        navyBlue: '#0b1c36',
        navyLight: '#132c52',
        lightBg: '#060d17',
        borderGray: '#1e385e',
        steelGray: '#94a3b8',

        // Vibrant brand cyan & sapphire
        primaryCyan: '#00a8e8',
        secondaryCyan: '#0085ba',
        cyanGlow: 'rgba(0, 168, 232, 0.35)',

        // Champagne Gold accents for high-end luxury feel
        accentGold: '#E5A93C',
        gold: {
          light: '#F8D179',
          DEFAULT: '#E5A93C',
          dark: '#B97D1A',
        },

        // Warm sands and neutrals
        sand: '#f8f5ef',
        sandMuted: '#e5ded1',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'Cinzel', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        cardHover: '0 25px 50px -12px rgba(0, 168, 232, 0.15)',
        glow: '0 0 30px rgba(0, 168, 232, 0.35)',
        goldGlow: '0 0 30px rgba(229, 169, 60, 0.35)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
