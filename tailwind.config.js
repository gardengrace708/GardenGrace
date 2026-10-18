/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Wood tones
        wood: '#8B5A2B',
        'wood-light': '#A0522D',
        'wood-dark': '#6B4423',
        'wood-accent': '#D2691E',
        'wood-pale': '#DEB887',
        'wood-warm': '#CD853F',
        // Black and white
        black: '#000000',
        white: '#FFFFFF',
        offwhite: '#F5F5F5',
        charcoal: '#1A1A1A',
        ivory: '#F5F0E8',
        obsidian: '#0A0A0A',
        surface: '#141414',
        'surface-elevated': '#1C1C1C',
        muted: '#888880'
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        body: ['var(--font-body)', 'DM Sans', 'sans-serif']
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        kenburns: { '0%': { transform: 'scale(1)' }, '100%': { transform: 'scale(1.08)' } }
      },
      animation: {
        marquee: 'marquee 24s linear infinite',
        kenburns: 'kenburns 5s ease-out forwards'
      },
      boxShadow: { luxury: '0 24px 80px rgba(139,90,43,0.14)' }
    }
  },
  plugins: []
};
