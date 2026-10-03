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
        navyBlue: '#001b3a', // The Navigators Deep Blue
        navyDark: '#000c1a', // Darkest navy
        navyLight: '#003a7a', // Lighter navy accent
        primaryCyan: '#00a8e8', // The Navigators Bright Blue/Cyan
        secondaryCyan: '#0085ba',
        accentGold: '#FFC107',
        accentOrange: '#ff6b00',
        steelGray: '#4A5568',
        lightBg: '#000c1a', // Dark background to match logo theme
        borderGray: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px -15px rgba(2,12,27,0.1)',
        cardHover: '0 20px 40px -15px rgba(2,12,27,0.25)',
        glow: '0 0 25px rgba(0, 168, 232, 0.4)', // Updated to cyan glow
      },
    },
  },
  plugins: [],
}
